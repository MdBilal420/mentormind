from fastapi import APIRouter, HTTPException
from models.summary_models import SummaryRequest, SummaryResponse
from services.summary_service import SummaryService
from utils.text_utils import truncate_transcript

router = APIRouter(prefix="/api", tags=["summary"])

summary_service = SummaryService()

@router.post("/generate-summary", response_model=SummaryResponse)
async def generate_summary_endpoint(request: SummaryRequest):
    """
    Endpoint to generate a bullet-point summary from a transcript
    """
    try:
        if not request.transcript:
            raise HTTPException(status_code=400, detail="Transcript is required")
            
        # Truncate very long transcripts to prevent API limits
        truncated_transcript = truncate_transcript(request.transcript)
        
        summary = summary_service.generate_bullet_summary(truncated_transcript)
        
        return {
            "success": True,
            "summary": summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating summary: {str(e)}") 