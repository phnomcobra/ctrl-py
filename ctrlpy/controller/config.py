#!/usr/bin/python3
"""This module sets and exposes the default values for configuration and templates."""
from typing import Dict

from ctrlpy.dao import Collection, Object
from ctrlpy.dao import get_uuid_str_from_str

CONFIG_OBJUUID = get_uuid_str_from_str('configuration')
TASK_PROTO_OBJUUID = get_uuid_str_from_str('task template')
SETTINGS_CONTAINER_OBJUUID = get_uuid_str_from_str('settings container')

TASK_PROTO_BODY = '''#!/usr/bin/python3

import traceback

class Task:
    def __init__(self):
        self.output = []
        self.status = STATUS_NOT_EXECUTED

    def execute(self, cli):
        try:
            status, stdout, stderr = cli.system("whoami", return_tuple=True)
            if status:
                self.output.append(str(stderr))
                self.status = STATUS_FAILURE
            else:
                self.output.append(str(stdout))
                self.status = STATUS_SUCCESS
        except:
            self.output.append(traceback.format_exc())
            self.status = STATUS_EXCEPTION

        return self.status
'''

def get_config() -> Dict:
    """This function gets the configuration object in the inventory.

    Returns:
        A document object dictionary.
    """
    return Collection("inventory").get_object(CONFIG_OBJUUID).object

def create_config() -> Object:
    """This function creates and returns the configuration object
    in the inventory.

    Returns:
        The document object for the configuration settings.
    """
    inventory = Collection("inventory")

    config = inventory.get_object(CONFIG_OBJUUID)

    config.object = {
        "type" : "config",
        "parent" : SETTINGS_CONTAINER_OBJUUID,
        "brand" : "ctrl-py",
        "children" : [],
        "name" : "Configuration",
        "icon" : "/images/config_icon.png",
        "context" : {
            "edit" : {
                "label" : "Edit",
                "action" : {
                    "method" : "edit configuration",
                    "route" : "inventory/get_object",
                    "params" : {
                        "objuuid" : CONFIG_OBJUUID
                    }
                }
            }
        }
    }

    config.set()

    return config

def get_task_template() -> str:
    """This function gets the task template.

    Returns:
        String of the task template.
    """
    return Collection("inventory").get_object(TASK_PROTO_OBJUUID).object["body"]

def create_task_template() -> Object:
    """This function creates and returns the task template object
    in the inventory using the default task body.

    Returns:
        The document object for the task.
    """
    inventory = Collection("inventory")

    task = inventory.get_object(TASK_PROTO_OBJUUID)

    task.object = {
        "type" : "task",
        "parent" : SETTINGS_CONTAINER_OBJUUID,
        "children" : [],
        "name" : "Task Template",
        "body" : TASK_PROTO_BODY,
        "hosts" : [],
        "icon" : "/images/config_icon.png",
        "context" : {
            "edit" : {
                "label" : "Edit",
                "action" : {
                    "method" : "edit task",
                    "route" : "inventory/get_object",
                    "params" : {
                        "objuuid" : task.objuuid
                    }
                }
            }
        }
    }

    task.set()

    return task


def create_settings_container() -> Object:
    """This function creates and returns settings container for the
    inventory.

    Returns:
        The document object for the container.
    """
    inventory = Collection("inventory")

    container = inventory.get_object(SETTINGS_CONTAINER_OBJUUID)

    container.object = {
        "type" : "container",
        "parent" : "#",
        "children" : [
            TASK_PROTO_OBJUUID,
            SETTINGS_CONTAINER_OBJUUID
        ],
        "name" : "Settings",
        "icon" : "images/tree_icon.png",
        "context" : {
        }
    }

    container.set()

    return container
