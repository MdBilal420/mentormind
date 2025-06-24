from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from services.transcription_service import TranscriptionService
from services.database_service import DatabaseService
from utils.file_utils import save_uploaded_file, cleanup_file
from auth import get_current_user
from typing import List, Optional

router = APIRouter(prefix="/api", tags=["transcription"])

transcription_service = TranscriptionService()
database_service = DatabaseService()

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

@router.post("/transcribe-and-save")
async def transcribe_and_save_endpoint(
    file: UploadFile = File(...),
    current_user = Depends(get_current_user)
):
    """
    Endpoint to upload an audio file, transcribe it, and save to database
    """
    # Validate file type
    if not file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    file_path = None
    try:
        # Save uploaded file
        file_path = save_uploaded_file(file)
        
        # Transcribe the audio
        transcription_result = await transcription_service.transcribe_audio(file_path)
        
        # Save to database
        transcription_id = database_service.save_transcription(
            filename=file.filename,
            transcription=transcription_result["transcript"],
            sentences=transcription_result["sentences"],
            file_type='audio',
            metadata={
                "file_size": file.size,
                "content_type": file.content_type
            }
        )
        
        # Return the transcription with database ID
        return {
            "success": True,
            "transcription_id": transcription_id,
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
        # Clean up after processing
        if file_path:
            cleanup_file(file_path)

@router.get("/transcriptions")
async def get_user_transcriptions(
    limit: int = 50,
    offset: int = 0,
    current_user = Depends(get_current_user)
):
    """
    Get all transcriptions for the current user
    """
    try:
        transcriptions = database_service.get_user_transcriptions(limit=limit, offset=offset)
        return {
            "success": True,
            "transcriptions": transcriptions,
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transcriptions/{transcription_id}")
async def get_transcription(
    transcription_id: str,
    current_user = Depends(get_current_user)
):
    """
    Get a specific transcription by ID
    """
    try:
        transcription = database_service.get_transcription(transcription_id)
        if not transcription:
            raise HTTPException(status_code=404, detail="Transcription not found")
        
        return {
            "success": True,
            "transcription": transcription
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/transcriptions/{transcription_id}")
async def delete_transcription(
    transcription_id: str,
    current_user = Depends(get_current_user)
):
    """
    Delete a transcription
    """
    try:
        success = database_service.delete_transcription(transcription_id)
        if not success:
            raise HTTPException(status_code=404, detail="Transcription not found")
        
        return {
            "success": True,
            "message": "Transcription deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transcriptions/search")
async def search_transcriptions(
    query: str,
    limit: int = 20,
    current_user = Depends(get_current_user)
):
    """
    Search transcriptions by text content
    """
    try:
        results = database_service.search_transcriptions(query=query, limit=limit)
        return {
            "success": True,
            "results": results,
            "query": query,
            "count": len(results)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/transcriptions/stats")
async def get_transcription_stats(
    current_user = Depends(get_current_user)
):
    """
    Get statistics for user's transcriptions
    """
    try:
        stats = database_service.get_transcription_stats()
        return {
            "success": True,
            "stats": stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 