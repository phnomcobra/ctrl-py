#!/usr/bin/python3
"""This module configures and starts the web server."""
import logging
from logging.handlers import TimedRotatingFileHandler
import os
from multiprocessing import set_start_method

from ctrlpy.dao import Collection
from ctrlpy.controller import logging as app_logger

def init_collections():
    """Initialize the collections and default inventory objects."""
    datastore = Collection("datastore")
    datastore.create_attribute("type", "/type")

def start():
    """This function configures and starts the web server."""
    current_dir = os.path.dirname(os.path.abspath(__file__))

    set_start_method('spawn')
    init_collections()

    logfile_path = os.path.join(current_dir, './log')
    os.makedirs(logfile_path, exist_ok=True)

    app_handler = TimedRotatingFileHandler(
        os.path.join(logfile_path, 'application.log'),
        when="D",
        backupCount=30
    )
    logger = logging.getLogger('app')
    logger.addHandler(app_handler)
    logger.setLevel(logging.DEBUG)

    app_logger.info('startup completed')
