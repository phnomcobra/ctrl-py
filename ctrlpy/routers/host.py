#!/usr/bin/python3
"""This module implements the wake route for waking hosts."""
from typing import Annotated

from fastapi import APIRouter, Form
from fastapi.responses import HTMLResponse

from ctrlpy.audit import logging

router = APIRouter()

@router.post("/wake")
def wake_host_endpoint(objuuid: Annotated[str, Form()]) -> HTMLResponse:
    """This function registers the endpoint wakes a host.

    Args:
        objuuid:
            The UUID of the host's parent object.
    """
    logging.info(objuuid)
    logging.warning('controller not implemented yet')
    return HTMLResponse()