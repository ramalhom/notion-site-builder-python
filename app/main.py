from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session
from .database import create_db_and_tables, get_session
from .models import SiteConfig, MenuItem, User
from .routers import admin, auth
from typing import List
from datetime import datetime

app = FastAPI(title="Notion Site Builder")

# Include routers
app.include_router(auth.router)
app.include_router(admin.router)

# Mount static files
import os
static_dir = "app/static"
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
else:
    print(f"Warning: Static directory '{static_dir}' not found. Skipping mount.")

# Templates
templates = Jinja2Templates(directory="app/templates")
templates.env.globals.update(now=datetime.now)

from .auth import get_current_user

@app.middleware("http")
async def add_current_user_to_request(request: Request, call_next):
    # This makes 'user' available in all templates via the request
    db = next(get_session())
    user = await get_current_user(request, db)
    request.state.user = user
    response = await call_next(request)
    return response

# Also add a context processor for templates
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    # Use a separate middleware for user to avoid dependency issues if needed,
    # but request.state is the standard way.
    return await call_next(request)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
async def index(request: Request, db: Session = Depends(get_session)):
    # Get site config
    config = db.query(SiteConfig).first()
    
    # Get menu items
    menu_items = db.query(MenuItem).filter(MenuItem.is_active == True).order_by(MenuItem.sort_order).all()
    
    # Check for home page (slug = "/")
    home_page = next((item for item in menu_items if item.slug == "/" and item.notion_url), None)
    
    if home_page:
        return templates.TemplateResponse("index.html", {
            "request": request,
            "config": config,
            "menu_items": menu_items,
            "home_page": home_page
        })
    
    return templates.TemplateResponse("welcome.html", {
        "request": request,
        "config": config,
        "menu_items": menu_items
    })

@app.get("/page/{item_id}")
async def view_page(item_id: str, request: Request, db: Session = Depends(get_session)):
    item = db.get(MenuItem, item_id)
    menu_items = db.query(MenuItem).filter(MenuItem.is_active == True).order_by(MenuItem.sort_order).all()
    config = db.query(SiteConfig).first()
    
    return templates.TemplateResponse("index.html", {
        "request": request,
        "config": config,
        "menu_items": menu_items,
        "home_page": item
    })

@app.get("/{slug}")
async def view_slug(slug: str, request: Request, db: Session = Depends(get_session)):
    # Ignore 'admin' prefix to allow the admin router to handle it
    if slug.startswith("admin"):
        raise HTTPException(status_code=404)
        
    # Try both with and without leading slash
    slug_cleaned = slug.strip("/")
    item = db.query(MenuItem).filter(
        (MenuItem.slug == slug_cleaned) | (MenuItem.slug == f"/{slug_cleaned}")
    ).first()
    
    if not item:
        # Instead of raising HTTPException, render 404 template
        config = db.query(SiteConfig).first()
        menu_items = db.query(MenuItem).filter(MenuItem.is_active == True).order_by(MenuItem.sort_order).all()
        return templates.TemplateResponse("404.html", {
            "request": request,
            "config": config,
            "menu_items": menu_items
        }, status_code=404)
        
    menu_items = db.query(MenuItem).filter(MenuItem.is_active == True).order_by(MenuItem.sort_order).all()
    config = db.query(SiteConfig).first()
    
    return templates.TemplateResponse("index.html", {
        "request": request,
        "config": config,
        "menu_items": menu_items,
        "home_page": item
    })

@app.exception_handler(404)
async def custom_404_handler(request: Request, exc: HTTPException):
    db: Session = next(get_session())
    config = db.query(SiteConfig).first()
    menu_items = db.query(MenuItem).filter(MenuItem.is_active == True).order_by(MenuItem.sort_order).all()
    return templates.TemplateResponse("404.html", {
        "request": request,
        "config": config,
        "menu_items": menu_items
    }, status_code=404)
