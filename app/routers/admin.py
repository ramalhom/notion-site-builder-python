from fastapi import APIRouter, Request, Depends, Form
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlmodel import Session, select
from ..database import get_session
from ..models import SiteConfig, MenuItem, MenuHistory
import uuid

router = APIRouter(prefix="/admin")
templates = Jinja2Templates(directory="app/templates")

@router.get("", response_class=HTMLResponse)
@router.get("/", response_class=HTMLResponse)
async def admin_dashboard(request: Request, db: Session = Depends(get_session)):
    config = db.exec(select(SiteConfig)).first()
    menu_items = db.exec(select(MenuItem).order_by(MenuItem.sort_order)).all()
    return templates.TemplateResponse("admin/dashboard.html", {
        "request": request,
        "config": config,
        "menu_items": menu_items
    })

@router.get("/config", response_class=HTMLResponse)
async def config_page(request: Request, db: Session = Depends(get_session)):
    config = db.exec(select(SiteConfig)).first()
    return templates.TemplateResponse("admin/config.html", {
        "request": request,
        "config": config
    })

@router.post("/config")
async def update_config(
    request: Request,
    site_name: str = Form(...),
    logo_type: str = Form("none"),
    logo_emoji: str = Form(None),
    logo_image_url: str = Form(None),
    db: Session = Depends(get_session)
):
    config = db.exec(select(SiteConfig)).first()
    if not config:
        config = SiteConfig(site_name=site_name, logo_type=logo_type, logo_emoji=logo_emoji, logo_image_url=logo_image_url)
        db.add(config)
    else:
        config.site_name = site_name
        config.logo_type = logo_type
        config.logo_emoji = logo_emoji
        config.logo_image_url = logo_image_url
    
    db.commit()
    return RedirectResponse(url="/admin/config", status_code=303)

@router.get("/menu/add", response_class=HTMLResponse)
async def add_menu_page(request: Request, db: Session = Depends(get_session)):
    menu_items = db.exec(select(MenuItem).where(MenuItem.level == 1)).all()
    return templates.TemplateResponse("admin/menu_form.html", {
        "request": request,
        "menu_items": menu_items,
        "item": None
    })

@router.post("/menu/add")
async def create_menu_item(
    label: str = Form(...),
    notion_url: str = Form(None),
    slug: str = Form(None),
    level: int = Form(1),
    parent_id: str = Form(None),
    db: Session = Depends(get_session)
):
    p_id = uuid.UUID(parent_id) if parent_id and parent_id != "None" else None
    new_item = MenuItem(
        label=label, 
        notion_url=notion_url, 
        slug=slug, 
        level=level, 
        parent_id=p_id
    )
    db.add(new_item)
    db.commit()
    return RedirectResponse(url="/admin/", status_code=303)

@router.get("/menu/edit/{item_id}", response_class=HTMLResponse)
async def edit_menu_page(item_id: uuid.UUID, request: Request, db: Session = Depends(get_session)):
    item = db.get(MenuItem, item_id)
    menu_items = db.exec(select(MenuItem).where(MenuItem.level == 1)).all()
    return templates.TemplateResponse("admin/menu_form.html", {
        "request": request,
        "menu_items": menu_items,
        "item": item
    })

@router.post("/menu/edit/{item_id}")
async def update_menu_item(
    item_id: uuid.UUID,
    label: str = Form(...),
    notion_url: str = Form(None),
    slug: str = Form(None),
    level: int = Form(1),
    parent_id: str = Form(None),
    is_active: bool = Form(True),
    db: Session = Depends(get_session)
):
    item = db.get(MenuItem, item_id)
    if item:
        item.label = label
        item.notion_url = notion_url
        item.slug = slug
        item.level = level
        item.parent_id = uuid.UUID(parent_id) if parent_id and parent_id != "None" else None
        item.is_active = is_active
        db.add(item)
        db.commit()
    return RedirectResponse(url="/admin", status_code=303)

@router.get("/menu/delete/{item_id}")
async def delete_menu_item(item_id: uuid.UUID, db: Session = Depends(get_session)):
    item = db.get(MenuItem, item_id)
    if item:
        db.delete(item)
        db.commit()
    return RedirectResponse(url="/admin", status_code=303)
