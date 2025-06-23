from pydantic import BaseModel

class SummaryRequest(BaseModel):
    transcript: str

class SummaryResponse(BaseModel):
    success: bool
    summary: str 