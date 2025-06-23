from fastapi import APIRouter, HTTPException
from models.concept_detective_models import (
    ConceptDetectiveRequest, ConceptDetectiveResponse,
    ConceptDetectiveEvaluationRequest, ConceptDetectiveEvaluationResponse
)
from services.concept_detective_service import ConceptDetectiveService
from utils.text_utils import truncate_transcript

router = APIRouter(prefix="/api", tags=["concept-detective"])

concept_service = ConceptDetectiveService()

@router.post("/generate-concept-detective", response_model=ConceptDetectiveResponse)
async def generate_concept_detective(request: ConceptDetectiveRequest):
    try:
        if not request.transcript:
            raise HTTPException(status_code=400, detail="Transcript is required")
        truncated_transcript = truncate_transcript(request.transcript)
        result = concept_service.generate_concept_detective_game(truncated_transcript)
        return result
    except Exception as e:
        return {
            "success": False,
            "analogy": "",
            "description": "",
            "levels": [],
            "error": str(e)
        }

@router.post("/evaluate-concept-detective", response_model=ConceptDetectiveEvaluationResponse)
async def evaluate_concept_detective(request: ConceptDetectiveEvaluationRequest):
    try:
        if not request.transcript:
            raise HTTPException(status_code=400, detail="Transcript is required")
        if not request.answers:
            raise HTTPException(status_code=400, detail="Answers are required")
        truncated_transcript = truncate_transcript(request.transcript)
        result = concept_service.evaluate_concept_detective_answers(truncated_transcript, request.answers)
        return result
    except Exception as e:
        return {
            "success": False,
            "scores": {},
            "feedback": {},
            "error": str(e)
        } 