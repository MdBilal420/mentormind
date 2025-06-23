from pydantic import BaseModel
from typing import List, Optional

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: int

class QuizRequest(BaseModel):
    transcript: str
    num_questions: Optional[int] = 5

class QuizResponse(BaseModel):
    success: bool
    questions: List[QuizQuestion] 