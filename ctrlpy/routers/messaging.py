#!/usr/bin/python3
"""This module implements the routes for posting and reading messages to the
message board displayed in the UI."""
from typing import Annotated

from fastapi import APIRouter, Form
from fastapi.responses import JSONResponse

from ctrlpy.controller.messaging import add_message, get_messages

router = APIRouter()

@router.post("/add_message")
def add_message_endpoint(message: Annotated[str, Form()]) -> JSONResponse:
    """This function registers the endpoint that posts a
    message with a timestamp.

    Args:
        message:
            Message string.
    """
    add_message(message)
    return JSONResponse({})

@router.post("/get_messages")
def get_messages_endpoint() -> JSONResponse:
    """This function registers the endpoint returns a list of the messages.

    Returns:
        A JSON response of message strings.
    """
    return JSONResponse(get_messages())
