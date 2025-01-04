"""This module registers the inventory endpoint functions as endpoints."""
import io
from typing import Dict, List, Annotated
from zipfile import ZipFile

from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import StreamingResponse

from ctrlpy.audit import logging
from ctrlpy.dao import Collection

from ctrlpy.controller import (
    get_child_tree_nodes,
    set_parent_objuuid,
    copy_object,
    create_container,
    create_task,
    create_text_file,
    create_host,
    delete_node,
    get_context_menu,
    export_objects_zip,
    export_files_zip,
    import_objects_zip,
    load_file_from_io,
    load_zip
)

from ctrlpy.schema.inventory import (
    ContextMenuItem,
    JsTreeNode
)

from ctrlpy.schema.inventory import InventoryObject

router = APIRouter()

@router.post("/get_child_tree_nodes", response_model=List[JsTreeNode])
def get_child_tree_nodes_endpoint(objuuid: Annotated[str, Form()]) -> List[JsTreeNode]:
    """This function registers the endpoint that retrieves a list of jstree
    child nodes beginning at the specified UUID in the inventory.

    Args:
        objuuid:
            The UUID to discover nodes from.

    Returns:
        JSON string of list of jstree nodes.
    """
    return get_child_tree_nodes(objuuid)

@router.post("/move_object")
def move_object_endpoint(objuuid: Annotated[str, Form()], parent_objuuid: Annotated[str, Form()]):
    """This function moves an object to a new location in the invnentory by
    changing which object is its parent.

    Args:
        objuuid:
            The UUID of the object to move.

        parent_object:
            The UUID of the object's new parent.
    """
    set_parent_objuuid(objuuid, parent_objuuid)

@router.post("/copy_object", response_model=InventoryObject)
def copy_object_endpoint(objuuid: Annotated[str, Form()]) -> InventoryObject:
    """This function registers the endpoint that copies an object and its
    children in the inventory.

    Args:
        objuuid:
            The UUID of the object to copy.

    Returns:
        JSON string of the newly created inventory object.
    """
    return copy_object(objuuid).object

@router.post("/create_container", response_model=InventoryObject)
def create_container_endpoint(objuuid: Annotated[str, Form()]) -> InventoryObject:
    """This function registers the endpoint that creates a container
    object in the inventory.

    Args:
        objuuid:
            The UUID of the container's parent object.

    Returns:
        JSON string of the newly created inventory object.
    """
    return create_container(objuuid, "New Container").object

@router.post("/create_task", response_model=InventoryObject)
def create_task_endpoint(objuuid: Annotated[str, Form()]) -> InventoryObject:
    """This function registers the endpoint that creates a task
    object in the inventory.

    Args:
        objuuid:
            The UUID of the task's parent object.

    Returns:
        JSON string of the newly created inventory object.
    """
    return create_task(objuuid, "New Task").object

@router.post("/create_text_file", response_model=InventoryObject)
def create_text_file_endpoint(objuuid: Annotated[str, Form()]) -> InventoryObject:
    """This function registers the endpoint that creates a text file
    object in the inventory.

    Args:
        objuuid:
            The UUID of the text file's parent object.

    Returns:
        JSON string of the newly created inventory object.
    """
    return create_text_file(objuuid, "New Text File.txt").object

@router.post("/create_host", response_model=InventoryObject)
def create_host_endpoint(objuuid: Annotated[str, Form()]) -> InventoryObject:
    """This function registers the endpoint that creates a host
    object in the inventory.

    Args:
        objuuid:
            The UUID of the host's parent object.

    Returns:
        JSON string of the newly created inventory object.
    """
    return create_host(objuuid, "New Host").object

'''



@router.post("/create_procedure")
def create_procedure_endpoint(*, objuuid: str) -> Object:
    """This function registers the endpoint that creates a procedure
    object in the inventory.

    Args:
        objuuid:
            The UUID of the procedure's parent object.

    Returns:
        JSON string of the newly created inventory object.
    """
    return create_procedure(objuuid, "New Procedure").object

'''

@router.post("/delete")
def delete_endpoint(objuuid: Annotated[str, Form()]) -> Dict:
    """This function registers the endpoint that deletes an object and
    its children in the inventory.

    Args:
        objuuid:
            The UUID of the object to delete.

    Returns:
        JSON string of the id just deleted.
    """
    delete_node(objuuid)
    return {"id": objuuid}

@router.post("/context", response_model=Dict[str, ContextMenuItem])
def context_endpoint(objuuid: Annotated[str, Form()]) -> Dict[str, ContextMenuItem]:
    """This function registers the endpoint that retrieves an inventory
    objects context menu list.

    Args:
        objuuid:
            The UUID of the inventory object.

    Returns:
        JSON string of a list of context menu items.
    """
    return get_context_menu(objuuid)

@router.post("/get_object", response_model=InventoryObject)
def get_object_endpoint(objuuid: Annotated[str, Form()]) -> InventoryObject:
    """This function registers the endpoint that retrieves an inventory
    object.

    Args:
        objuuid:
            The UUID of the inventory object.

    Returns:
        Inventory object.
    """
    return Collection("inventory").get_object(objuuid).object

@router.post("/post_object", response_model=InventoryObject)
def post_object_endpoint(posted_object: InventoryObject) -> InventoryObject:
    """This function registers the endpoint that posts an inventory
    object. An inventory object is either created or updated with the
    object that is posted.

    Returns:
        JSON string of the inventory object.
    """
    try:
        posted_object = dict(posted_object)
        logging.info(posted_object['name'])

        inventory = Collection("inventory")
        current = inventory.get_object(posted_object["objuuid"])
        current.object = posted_object
        current.set()
    except Exception as exception:
        logging.error(exception)
        raise exception

    return current.object

@router.get("/export_objects_zip")
def export_objects_zip_endpoint(objuuids: str) -> StreamingResponse:
    """This function registers the endpoint that exports inventory objects to
    a ZIP archive.

    Args:
        objuuids:
            A comma delivered list of UUIDs of the inventory objects to export.

    Returns:
        A streaming response.
    """
    try:
        logging.info(f"{len(objuuids.split(','))} objects")
        headers = {
            'Content-Type': "application/zip",
            'Content-Disposition': 'attachment; filename=export.objects.zip',
        }
        return StreamingResponse(export_objects_zip(objuuids), headers=headers)
    except Exception as exception:
        logging.error(exception)
        raise exception

@router.get("/export_files_zip")
def export_files_zip_endpoint(objuuids: str) -> StreamingResponse:
    """This function registers the endpoint that exports certain inventory
    objects to a ZIP archive. This mode of export deals exclusively with text files,
    binary files, and result objects.

    Args:
        objuuids:
            A comma delivered list of UUIDs of the inventory objects to export.

    Returns:
        A streaming response.
    """
    try:
        logging.info(f"{len(objuuids.split(','))} objects")
        headers = {
            'Content-Type': "application/x-download",
            'Content-Disposition': 'attachment; filename=export.objects.zip'
        }
        return StreamingResponse(export_files_zip(objuuids), headers=headers)
    except Exception as exception:
        logging.error(exception)
        raise exception

@router.post("/import_objects_zip")
def import_objects_zip_endpoint(file: UploadFile = File(...)) -> Dict:
    """This function registers the endpoint that imports inventory
    objects from a ZIP archive.

    Args:
        file:
            A file handle.
    """
    try:
        logging.info(file.filename)
        mem_file  = io.BytesIO()
        mem_file.write(file.file.read())
        import_objects_zip(ZipFile(mem_file, 'r'))
        return {}
    except Exception as exception:
        logging.error(exception)
        raise exception

@router.post("/import_files_zip")
def import_files_zip_endpoint(file: UploadFile = File(...)) -> Dict:
    """This function registers the endpoint that imports inventory
    objects from a ZIP archive.

    Args:
        file:
            A file handle.
    """
    try:
        logging.info(file.filename)
        mem_file  = io.BytesIO()
        mem_file.write(file.file.read())
        load_zip(ZipFile(mem_file, 'r'))
        return {}
    except Exception as exception:
        logging.error(exception)
        raise exception

@router.post("/import_file")
def import_file_endpoint(file: UploadFile = File(...)) -> Dict:
    """This function registers the endpoint that imports an individual text
    or binary file into the inventory.

    Args:
        file:
            A file handle.
    """
    try:
        logging.info(file.filename)
        mem_file  = io.BytesIO()
        mem_file.write(file.file.read())
        load_file_from_io(mem_file, file.filename)
        return {}
    except Exception as exception:
        logging.error(exception)
        raise exception
