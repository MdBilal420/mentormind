from pydantic import BaseModel
from typing import List, Dict, Optional

class ConceptDetectiveQuestion(BaseModel):
    text: str
    type: str

class ConceptDetectiveLevel(BaseModel):
    title: str
    story: str
    questions: List[ConceptDetectiveQuestion]

class ConceptDetectiveRequest(BaseModel):
    transcript: str

class ConceptDetectiveResponse(BaseModel):
    success: bool
    analogy: str
    description: str
    levels: List[ConceptDetectiveLevel]
    error: Optional[str] = None

class ConceptDetectiveAnswer(BaseModel):
    levelIndex: int
    questionIndex: int
    answer: str

class ConceptDetectiveEvaluationRequest(BaseModel):
    transcript: str
    answers: List[ConceptDetectiveAnswer]

class ConceptDetectiveEvaluationResponse(BaseModel):
    success: bool
    scores: Dict[str, int]  # Format: "levelIndex-questionIndex": score
    feedback: Dict[str, str]  # Format: "levelIndex-questionIndex": feedback
    error: Optional[str] = None 