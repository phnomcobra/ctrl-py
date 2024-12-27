#!/usr/bin/python3
"""This module sets and exposes the default values for configuration and templates."""
from typing import Dict

from ctrlpy.dao import Collection, Object
from ctrlpy.dao import get_uuid_str_from_str

CONFIG_OBJUUID = get_uuid_str_from_str('configuration')
TASK_PROTO_OBJUUID = get_uuid_str_from_str('task template')
CONSOLE_PROTO_OBJUUID = get_uuid_str_from_str('console template')
SETTINGS_CONTAINER_OBJUUID = get_uuid_str_from_str('settings container')

CONSOLE_PROTO_BODY = '''#!/usr/bin/python3

from subprocess import Popen, PIPE

class Console:
    def get_remote_host(self):
        return "127.0.0.1"

    def system(self, command, return_tuple=False, sudo_command=True):
        process = Popen(command, shell=True, stdout=PIPE, stderr=PIPE)
        output_buffer, stderr_buffer = process.communicate()
        status = process.returncode

        if return_tuple:
            return status, output_buffer, stderr_buffer
        elif 0 != int(status):
            return f'{output_buffer}<font color="red"><br>{stderr_buffer}</font><br>'
        else:
            return output_buffer
'''

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
        "concurrency" : 20,
        "brand" : "valarie",
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

def get_console_template() -> str:
    """This function gets the console template.

    Returns:
        String of the console template.
    """
    return Collection("inventory").get_object(CONSOLE_PROTO_OBJUUID).object["body"]

def create_console_template() -> Object:
    """This function creates and returns the console template object
    in the inventory using the default console body.

    Returns:
        The document object for the console.
    """
    inventory = Collection("inventory")

    console = inventory.get_object(CONSOLE_PROTO_OBJUUID)

    console.object = {
        "type" : "console",
        "parent" : SETTINGS_CONTAINER_OBJUUID,
        "body" : CONSOLE_PROTO_BODY,
        "children" : [],
        "name" : "Console Template",
        "icon" : "/images/config_icon.png",
        "concurrency" : 1,
        "context" : {
            "edit" : {
                "label" : "Edit",
                "action" : {
                    "method" : "edit console",
                    "route" : "inventory/get_object",
                    "params" : {
                        "objuuid" : CONSOLE_PROTO_OBJUUID
                    }
                }
            }
        }
    }

    console.set()

    return console

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
            CONSOLE_PROTO_OBJUUID,
            SETTINGS_CONTAINER_OBJUUID
        ],
        "name" : "Settings",
        "icon" : "images/tree_icon.png",
        "context" : {
        }
    }

    container.set()

    return container
