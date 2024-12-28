"""Module implementing semaphore schema"""
from pydantic import BaseModel

class KeyValue(BaseModel):
    """Common properties"""
    key: str = ""
    value: str = ""
