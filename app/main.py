from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from sqlmodel import Session
from .database import create_db_and_tables, get_session
from .models import SiteConfig, MenuItem
from .routers import admin
from typing import List
from datetime import datetime

app = FastAPI(title="Notion Site Builder")

# Include routers
app.include_router(admin.router)

# Mount static files
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# Templates
templates = Jinja2Templates(directory="app/templates")
templates.env.globals.update(now=datetime.now)

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
