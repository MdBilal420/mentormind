from pydantic import BaseModel
from typing import List

class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    transcript: str

class ChatResponse(BaseModel):
    message: str 