"""This module implements the data abstraction layer for cached values"""
import pickle
from typing import Any
from random import random

import redis

from ctrlpy.audit import logging

CLIENT = redis.Redis(host='localhost', port=6379, db=0, protocol=3)

def set(key: str, value: Any) -> Any: # pylint: disable=redefined-builtin
    """This function sets a key value in redis

    Args:
        key:
            key being set.

        value:
            value being set.
    """
    CLIENT.set(key, pickle.dumps(value))
    return value

def get(key: str, default: Any = None):
    """This function sets a key value in redis

    Args:
        key:
            key being retrieved.

        default:
            default value to use if key has never been set

    Returns:
            value.
    """
    value = CLIENT.get(key)
    if value is None:
        CLIENT.set(key, pickle.dumps(default))
        return default
    else:
        try:
            return pickle.loads(value)
        except (pickle.UnpicklingError, ValueError) as error:
            logging.warning(f'failed to read {key}: {error}')
            CLIENT.set(pickle.dumps(default))
            return default

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
    CLIENT.delete(name)

def publish(channel: str, message: Any):
    """Publish to a channel.

    Args:
        channel:
            Name of the channel to publish to.

        message:
            Item being published.
    """
    CLIENT.publish(channel, pickle.dumps(message))

def read(channel: str) -> Any:
    """Read from a channel.

    Args:
        channel:
            Name of the channel to read from.
    """
    pubsub = CLIENT.pubsub()
    pubsub.subscribe(channel)
    response = pubsub.get_message()

    if response is None:
        return None

    try:
        return pickle.loads(pubsub.get_message())
    except (pickle.UnpicklingError, ValueError) as error:
        logging.warning(f'failed to read {channel}: {error}')
        return None
