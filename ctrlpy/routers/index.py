#!/usr/bin/python3
"""The module implements the templating functions for serving HTML."""
import os

from fastapi import APIRouter
from fastapi.responses import HTMLResponse
import jinja2

from ctrlpy.controller.config import get_config

router = APIRouter()

@router.get("/")
def index() -> HTMLResponse:
    """This function interpolates the index HTML.

    Returns:
        HTML response.
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    templates_path = os.path.join(current_dir, '../templates')
    loader = jinja2.FileSystemLoader(searchpath=templates_path)
    environent = jinja2.Environment(loader=loader)
    template = environent.get_template('index.html')
    return HTMLResponse(template.render(brand=get_config()["brand"]))
