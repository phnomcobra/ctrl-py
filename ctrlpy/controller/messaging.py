#!/usr/bin/python3
"""This module implements functions for adding and getting messages."""
from time import sleep
from typing import List

from ctrlpy.dao import cache

def lock():
    """This function blocks execution until the message lock key in
    the key value store is set to false. Upon sensing false, set the lock
    key to true and return.
    """
    while cache.get('message lock', default=False) is True:
        sleep(1)
    cache.set('message lock', True)

def unlock():
    """This function sets the message lock key ro false in the key value store."""
    cache.set('message lock', False)

def add_message(message: str):
    """This is a function used to add a message to the messages key in
    the key-value store collection. The message list is capped and
    roles over at a length of 50.

    Args:
        message:
            A message string.
    """
    try:
        lock()
        messages = cache.get("messages", [])
        messages = [message] + messages[:49]
        cache.set("messages", messages)
    finally:
        unlock()

def get_messages() -> List[str]:
    """This is a function used to retrieve the messages from key value store.

    Returns:
        A list of message dictionaries.
    """
    return cache.get("messages", [])
