from datetime import date, datetime
from typing import Any, List, Dict, Optional
import uuid

from pydantic import BaseModel, IPvAnyNetwork, PositiveInt

class IPAttributeBaseSchema(BaseModel):
    """Common properties"""
    data_value: IPvAnyNetwork
    comment: Optional[str] = ""
    date_first_seen: Optional[date] = "1970-01-01"
    date_last_seen: Optional[date] = "1970-01-01"
    enable_correlation: bool = True
    event_id: PositiveInt = 1
    is_deleted: bool = False


'''
node = {
            "id": current.objuuid,
            "parent": current.object["parent"],
            "text": current.object["name"],
            "type": current.object["type"]
        }

        if "icon" in current.object:
            node["icon"] = current.object["icon"]

'''

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
    type: str = ""
    parent: str = ""
    children: List[str] = []
    name: str = ""
    context: Dict[str, ContextMenuItem] = {}
    icon: str = ""
    objuuid: str = ""
    coluuid: str = ""
    body: Optional[str] = None
    language: Optional[str] = None
    size: Optional[int] = None
    sha1sum: Optional[str] = None
    sequuid: Optional[str] = None

