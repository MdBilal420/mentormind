from fastapi import APIRouter, HTTPException
from models.elevenlabs_models import SignedUrlResponse
from services.elevenlabs_service import ElevenLabsService

router = APIRouter(prefix="/api", tags=["elevenlabs"])

elevenlabs_service = ElevenLabsService()

@router.get("/get-signed-url", response_model=SignedUrlResponse)
async def get_signed_url():
    try:
        return await elevenlabs_service.get_signed_url()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting signed URL: {str(e)}") 