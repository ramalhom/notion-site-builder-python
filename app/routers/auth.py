from fastapi import APIRouter, Request, Depends, Form, HTTPException, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlmodel import Session, select
from ..database import get_session
from ..models import User
from ..auth import get_password_hash, verify_password, create_access_token, COOKIE_NAME, get_current_user
from datetime import timedelta

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

@router.get("/setup", response_class=HTMLResponse)
async def setup_page(request: Request, db: Session = Depends(get_session)):
    # Only allow setup if no users exist
    user_count = db.exec(select(User)).first()
    if user_count:
        return RedirectResponse(url="/login")
    return templates.TemplateResponse("auth/setup.html", {"request": request})

@router.post("/setup")
async def process_setup(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_session)
):
    user_exists = db.exec(select(User)).first()
    if user_exists:
        return RedirectResponse(url="/login")
    
    hashed_password = get_password_hash(password)
    new_user = User(username=username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    
    return RedirectResponse(url="/login", status_code=303)

@router.get("/login", response_class=HTMLResponse)
async def login_page(request: Request, db: Session = Depends(get_session)):
    # If no users, go to setup
    user_exists = db.exec(select(User)).first()
    if not user_exists:
        return RedirectResponse(url="/setup")
    
    # If already logged in, go to admin
    current_user = await get_current_user(request, db)
    if current_user:
        return RedirectResponse(url="/admin")
        
    return templates.TemplateResponse("auth/login.html", {"request": request})

@router.post("/login")
async def process_login(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_session)
):
    user = db.exec(select(User).where(User.username == username)).first()
    if not user or not verify_password(password, user.hashed_password):
        return templates.TemplateResponse("auth/login.html", {
            "request": request,
            "error": "Identifiants invalides"
        })
    
    access_token = create_access_token(data={"sub": user.username})
    response = RedirectResponse(url="/admin", status_code=303)
    response.set_cookie(
        key=COOKIE_NAME, 
        value=access_token, 
        httponly=True, 
        max_age=60*60*24*7, # 1 week
        samesite="lax"
    )
    return response

@router.get("/logout")
async def logout():
    response = RedirectResponse(url="/login")
    response.delete_cookie(COOKIE_NAME)
    return response
