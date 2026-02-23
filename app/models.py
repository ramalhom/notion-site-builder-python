from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship, Column, JSON
import uuid

class SiteConfig(SQLModel, table=True):
    __tablename__ = "site_config"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    site_name: str = Field(default="Mon Site Notion")
    logo_type: str = Field(default="none") # none, emoji, image
    logo_emoji: Optional[str] = None
    logo_image_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class MenuItem(SQLModel, table=True):
    __tablename__ = "menu_items"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    label: str
    level: int = Field(default=1)
    parent_id: Optional[uuid.UUID] = Field(default=None, foreign_key="menu_items.id")
    notion_url: Optional[str] = None
    slug: Optional[str] = None
    is_active: bool = Field(default=True)
    open_in_new_tab: bool = Field(default=False)
    sort_order: int = Field(default=0)
    emoji: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    parent: Optional["MenuItem"] = Relationship(
        back_populates="children", 
        link_model=None, 
        sa_relationship_kwargs={"remote_side": "MenuItem.id"}
    )
    children: List["MenuItem"] = Relationship(back_populates="parent")

class MenuHistory(SQLModel, table=True):
    __tablename__ = "menu_history"
    
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    menu_item_id: Optional[uuid.UUID] = Field(default=None, foreign_key="menu_items.id")
    action: str # create, update, delete, reorder
    previous_data: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    new_data: Optional[dict] = Field(default=None, sa_column=Column(JSON))
    changed_by: Optional[str] = None # User ID or name
    created_at: datetime = Field(default_factory=datetime.utcnow)
