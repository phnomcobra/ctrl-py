#!/usr/bin/python3
"""This module implements functions for creating task objects, and retrieving
host grid data for the jsgrid controls in the frontend."""
from ctrlpy.audit import logging
from ctrlpy.controller.config import get_task_template
from ctrlpy.dao import Collection, Object

def create_task(
        parent_objuuid: str,
        name: str = "New Task",
        objuuid: str = None
    ) -> Object:
    """This is a function used to create a task object in the inventory.

    Args:
        parent_objuuid:
            Parent object UUID.

        name:
            Name of the task object.

        objuuid:
            UUID of the task object.

    Returns:
        An inventory object.
    """
    logging.info(name)

    inventory = Collection("inventory")

    task = inventory.get_object(objuuid)

    task.object = {
        "type" : "task",
        "parent" : parent_objuuid,
        "children" : [],
        "name" : name,
        "body" : get_task_template(),
        "icon" : "/images/task_icon.png",
        "context" : {
            "delete" : {
                "label" : "Delete",
                "action" : {
                    "method" : "delete node",
                    "route" : "inventory/delete",
                    "params" : {
                        "objuuid" : task.objuuid
                    }
                }
            },
            "edit" : {
                "label" : "Edit",
                "action" : {
                    "method" : "edit task",
                    "route" : "inventory/get_object",
                    "params" : {
                        "objuuid" : task.objuuid
                    }
                }
            },
            "copy" : {
                "label" : "Copy",
                "action" : {
                    "method" : "copy node",
                    "route" : "inventory/copy_object",
                    "params" : {
                        "objuuid" : task.objuuid
                    }
                }
            },
            "status" : {
                "label" : "Status",
                "action" : {
                    "method" : "status",
                    "route" : "inventory/status",
                    "params" : {
                        "objuuid" : task.objuuid
                    }
                }
            }
        }
    }

    task.set()

    parent = inventory.get_object(parent_objuuid)
    parent.object["children"] = inventory.find_objuuids(parent=parent_objuuid)
    parent.set()

    return task
