from pydantic import BaseModel
from typing import Any, Optional, Generic, TypeVar

T = TypeVar('T')

class APIResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: Optional[T] = None

# Exemple d'utilisation : 
# return APIResponse(success=True, message="OK", data=my_chat_response)