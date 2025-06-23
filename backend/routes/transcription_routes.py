from fastapi import APIRouter, UploadFile, File, HTTPException
from services.transcription_service import TranscriptionService
from utils.file_utils import save_uploaded_file, cleanup_file

router = APIRouter(prefix="/api", tags=["transcription"])

transcription_service = TranscriptionService()

@router.post("/transcribe")
async def transcribe_audio_endpoint(file: UploadFile = File(...)):
    """
    Endpoint to upload an audio file and get its transcription
    """
    # Validate file type (optional)
    if not file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    file_path = None
    try:
        # Save uploaded file
        file_path = save_uploaded_file(file)
        
        # Transcribe the audio
        transcription_result = await transcription_service.transcribe_audio(file_path)
        
        # Return the transcription with timestamps
        return {
            "success": True,
            "filename": file.filename,
            "transcription": transcription_result["transcript"],
            "sentences": transcription_result["sentences"]
        }
    except Exception as e:
        # Clean up the file in case of error
        if file_path:
            cleanup_file(file_path)
        raise e
    finally:
        # Clean up after processing (optional - you might want to keep files)
        if file_path:
            cleanup_file(file_path) 