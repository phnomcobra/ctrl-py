#!/usr/bin/python3
"""This module implements functions for getting, setting, touching,
and delete keys in the key value store."""
from random import random
from typing import Any

from ctrlpy.dao import Collection, get_uuid_str_from_str

def get(name: str, default: Any = None) -> Any:
    """This function gets the value at the key specified.

    Args:
        name:
            The name of the key being read.

        default:
            The default value if the key doesn't exist yet.
    """
    kvstore = Collection("kvstore")

    key = kvstore.get_object(get_uuid_str_from_str(name))

    try:
        return key.object["value"]
    except KeyError:
        key.object["value"] = default
        key.object["name"] = name
        key.set()
        return default

# pylint: disable=redefined-builtin
def set(name: str, value: Any):
    """This function sets a value at the key specified.

    Args:
        name:
            The name of the key being set.

        value:
            The value to set the key to.
    """
    kvstore = Collection("kvstore")

    key = kvstore.get_object(get_uuid_str_from_str(name))
    key.object["value"] = value
    key.object["name"] = name
    key.set()

def touch(key: str) -> float:
    """This function touches the key specified by setting
    it to a random float.

    Args:
        name:
            The name of the key being set.

    Returns:
        Touched value as a float.
    """
    value = random()
    set(key, value)
    return value

def delete(name: str):
    """This function deletes the key specified.

    Args:
        name:
            The name of the key being deleted.
    """
    key = Collection("kvstore").get_object(get_uuid_str_from_str(name))
    key.destroy()
