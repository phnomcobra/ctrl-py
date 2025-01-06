#!/usr/bin/python3
"""This module implements code for creating hosts."""
from ctrlpy.audit import logging
from ctrlpy.dao import Collection, Object

def create_host(
        parent_objuuid: str,
        name: str = "New Host",
        objuuid: str = None
    ) -> Object:
    """This function creates and returns a host object in the inventory.

    Args:
        parent_objuuid:
            The UUID of this host's parent inventory object.

        name:
            The name of this host object.

        objuuid:
            The UUID for this host object.

    Returns:
        The document object for this host.
    """
    logging.info(name)

    inventory = Collection("inventory")

    host = inventory.get_object(objuuid)

    host.object = {
        "type": "host",
        "parent": parent_objuuid,
        "children": [],
        "name": name,
        "url": "",
        "icon": "/images/host_icon.png",
        "enabled": True,
        "loglevel": "20",
        "seconds": "*",
        "minutes": "*",
        "hours": "*",
        "dayofmonth": "*",
        "dayofweek": "*",
        "year": "*",
        "context" : {
            "delete" : {
                "label" : "Delete",
                "action" : {
                    "method" : "delete node",
                    "route" : "inventory/delete",
                    "params" : {
                        "objuuid" : host.objuuid
                    }
                }
            },
            "edit" : {
                "label" : "Edit",
                "action" : {
                    "method" : "edit host",
                    "route" : "inventory/get_object",
                    "params" : {
                        "objuuid" : host.objuuid
                    }
                }
            },
            "wake" : {
                "label" : "Wake",
                "action" : {
                    "method" : "wake host",
                    "route" : "host/wake",
                    "params" : {
                        "objuuid" : host.objuuid
                    }
                }
            }
        }
    }

    host.set()

    parent = inventory.get_object(parent_objuuid)
    parent.object["children"] = inventory.find_objuuids(parent=parent_objuuid)
    parent.set()

    return host
