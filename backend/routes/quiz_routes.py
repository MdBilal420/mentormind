from fastapi import APIRouter, HTTPException
from models.quiz_models import QuizRequest, QuizResponse
from services.quiz_service import QuizService
from utils.text_utils import truncate_transcript
from config.settings import MAX_QUIZ_QUESTIONS

router = APIRouter(prefix="/api", tags=["quiz"])

quiz_service = QuizService()

@router.post("/generate-quiz", response_model=QuizResponse)
async def generate_quiz_endpoint(request: QuizRequest):
    """
    Endpoint to generate a quiz with multiple-choice questions from a transcript
    """
    try:
        if not request.transcript:
            raise HTTPException(status_code=400, detail="Transcript is required")
            
        # Truncate very long transcripts to prevent API limits
        truncated_transcript = truncate_transcript(request.transcript)
        
        # Ensure num_questions is within reasonable limits
        num_questions = max(1, min(request.num_questions, MAX_QUIZ_QUESTIONS))
        
        questions = quiz_service.generate_quiz_questions(truncated_transcript, num_questions)
        
        return {
            "success": True,
            "questions": questions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating quiz: {str(e)}") 