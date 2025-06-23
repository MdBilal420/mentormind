from pydantic import BaseModel
from typing import List, Optional
from .quiz_models import QuizQuestion

class PDFSummaryResponse(BaseModel):
    success: bool
    summary: str
    questions: List[QuizQuestion]
    transcript: str
    error: Optional[str] = None 