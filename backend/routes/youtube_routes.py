from fastapi import APIRouter, HTTPException
from models.youtube_models import YouTubeRequest
from services.youtube_service import YouTubeService

router = APIRouter(prefix="/api", tags=["youtube"])

youtube_service = YouTubeService()

@router.post("/youtube-transcribe2")
async def youtube_transcribe_endpoint(request: YouTubeRequest):
    try:
        if not request.youtube_url:
            raise HTTPException(status_code=400, detail="YouTube URL is required")
        if not request.youtube_url.startswith(("https://www.youtube.com/", "https://youtu.be/")):
            raise HTTPException(status_code=400, detail="Invalid YouTube URL format")
        result = youtube_service.get_youtube_subtitles(request.youtube_url)
        if isinstance(result, str) and result.startswith("Error"):
            raise HTTPException(status_code=500, detail=result)
        return {
            "success": True,
            "video_title": result.get("video_title", "YouTube Video"),
            "transcription": result.get("full_transcript", "")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing YouTube transcription: {str(e)}")

@router.post("/youtube-transcribe")
async def youtube_transcribe_v2_endpoint(request: YouTubeRequest):
    try:
        if not request.youtube_url:
            raise HTTPException(status_code=400, detail="YouTube URL is required")
        if not request.youtube_url.startswith(("https://www.youtube.com/", "https://youtu.be/")):
            raise HTTPException(status_code=400, detail="Invalid YouTube URL format")
        video_id = youtube_service.extract_video_id(request.youtube_url)
        if not video_id:
            raise HTTPException(status_code=400, detail="Could not extract video ID from URL")
        try:
            formatted_transcript = youtube_service.get_transcript_via_supadata(video_id)
            return {
                "success": True,
                "video_title": "YouTube Video",
                "transcription": formatted_transcript
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail="Error processing YouTube transcription")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing YouTube transcription: {str(e)}") 