#!/usr/bin/python3
"""This module implements the flag routes used to
signal the UI to take some action on a flag being changed."""

from typing import Annotated

from fastapi import APIRouter, Form
from fastapi.responses import JSONResponse

from ctrlpy.dao import cache
from ctrlpy.schema.flags import KeyValue

router = APIRouter()

@router.post("/set", response_model=KeyValue)
def set_endpoint(key: Annotated[str, Form()], value: Annotated[str, Form()]) -> JSONResponse:
    """This function sets the value of a flag and returns the key and value.

    Args:
        key:
            Key name of the flag.

        value:
            Value to set the flag to.

    Returns:
        JSON response of the flag's key and value.
    """
    return JSONResponse(
        {
            "key" : key,
            "value" : cache.set(key, value)
        }
    )

@router.post("/get", response_model=KeyValue)
def get_endpoint(key: Annotated[str, Form()]) -> JSONResponse:
    """This function gets the value of a flag and returns the key and value.

    Args:
        key:
            Key name of the flag.

    Returns:
        JSON response of the flag's key and value.
    """
    return JSONResponse(
        {
            "key" : key,
            "value" : cache.get(key)
        }
    )

@router.post("/touch", response_model=KeyValue)
def touch_endpoint(key: Annotated[str, Form()]) -> JSONResponse:
    """This function touches the value of a flag and returns the key and value.

    Args:
        key:
            Key name of the flag.

    Returns:
        JSON response of the flag's key and value.
    """
    return JSONResponse(
        {
            "key" : key,
            "value" : cache.touch(key)
        }
    )
