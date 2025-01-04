"""This module implements the schemas for JS tree nodes, context menus, and inventory objects."""
from typing import Any, List, Dict, Optional

from pydantic import BaseModel

class JsTreeNode(BaseModel):
    """Common properties"""
    id: str = ""
    parent: str = ""
    text: str = ""
    type: str = ""
    icon: Optional[str] = None

class ContextMenuAction(BaseModel):
    """Common properties"""
    method: str = ""
    route: str = ""
    params: Dict[str, Any] = {}

class ContextMenuItem(BaseModel):
    """Common properties"""
    label: str = ""
    action: ContextMenuAction = ContextMenuAction(method="", route="", params={})

class InventoryObject(BaseModel):
    """Common properties"""
    # inventory
    type: str = ""
    parent: str = ""
    children: List[str] = []
    name: str = ""
    context: Dict[str, ContextMenuItem] = {}
    icon: str = ""
    objuuid: str = ""
    coluuid: str = ""
    brand: Optional[str] = ""

    # files
    body: Optional[str] = None
    language: Optional[str] = None
    size: Optional[int] = None
    sha1sum: Optional[str] = None
    sequuid: Optional[str] = None

    # executor
    loglevel: Optional[str] = "20"
    runonce: Optional[bool] = False

    # scheduling
    enabled: Optional[bool] = True
    runonce: Optional[bool] = False
    seconds: Optional[str] = "*"
    minutes: Optional[str] = "*"
    hours: Optional[str] = "*"
    dayofmonth: Optional[str] = "*"
    dayofweek: Optional[str] = "*"
    year: Optional[str] = "*"
