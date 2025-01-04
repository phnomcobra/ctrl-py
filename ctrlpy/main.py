#!/usr/bin/python3
"""This module configures and starts the web server."""
import logging
from logging.handlers import TimedRotatingFileHandler
import os

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import uvicorn

from ctrlpy.audit import logging as app_logging, LOGGER
from ctrlpy.dao import Collection
from ctrlpy.controller import (
    unlock_inventory,
    create_config,
    create_settings_container,
    create_task_template,
    create_container
)
from ctrlpy.routers import (
    inventory as inventory_router,
    index,
    flags,
    messaging
)

def init_collections():
    """Initialize the collections and default inventory objects."""
    datastore = Collection("datastore")
    datastore.create_attribute("type", "/type")

    inventory = Collection("inventory")
    inventory.create_attribute("parent", "/parent")
    inventory.create_attribute("type", "/type")
    inventory.create_attribute("name", "/name")

    if not inventory.find(parent="#"):
        create_container("#", "Root")

    if not inventory.find(type="config"):
        create_config()
        create_task_template()
        create_settings_container()

    unlock_inventory()

def init_logging():
    """Initialize application and uvicorn loggers"""
    current_dir = os.path.dirname(os.path.abspath(__file__))

    logfile_path = os.path.join(current_dir, './log')
    os.makedirs(logfile_path, exist_ok=True)

    app_log_handler = TimedRotatingFileHandler(
        os.path.join(logfile_path, 'application.log'),
        when="D",
        backupCount=30
    )

    LOGGER.addHandler(app_log_handler)
    LOGGER.setLevel(logging.DEBUG)

    access_log_handler = TimedRotatingFileHandler(
        os.path.join(logfile_path, 'access.log'),
        when="D",
        backupCount=30
    )

    logger = logging.getLogger('uvicorn.access')
    logger.addHandler(access_log_handler)
    logger.setLevel(logging.DEBUG)

    error_log_handler = TimedRotatingFileHandler(
        os.path.join(logfile_path, 'error.log'),
        when="D",
        backupCount=30
    )

    logger = logging.getLogger('uvicorn.error')
    logger.addHandler(error_log_handler)
    logger.setLevel(logging.DEBUG)

def start():
    """This function configures and starts the web server."""
    init_logging()
    init_collections()

    current_dir = os.path.dirname(os.path.abspath(__file__))
    static_path = os.path.join(current_dir, 'static')

    app = FastAPI()
    app.include_router(inventory_router.router, prefix="/inventory")
    app.include_router(flags.router, prefix="/flags")
    app.include_router(messaging.router, prefix="/messaging")
    app.include_router(index.router)
    app.mount("/", StaticFiles(directory=static_path), name="static")

    app_logging.info('startup completed')

    uvicorn.run(app, host="0.0.0.0", port=8080, log_config=None)
