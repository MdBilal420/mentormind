import requests
from fastapi import HTTPException
from config.settings import ELEVENLABS_API_KEY, ELEVENLABS_AGENT_ID

class ElevenLabsService:
    def __init__(self):
        self.api_key = ELEVENLABS_API_KEY
        self.agent_id = ELEVENLABS_AGENT_ID

    async def get_signed_url(self) -> dict:
        """Get a signed URL for ElevenLabs voice agent conversation"""
        try:
            if not self.api_key:
                raise HTTPException(
                    status_code=500, 
                    detail="ELEVENLABS_API_KEY not configured"
                )

            if not self.agent_id:
                raise HTTPException(
                    status_code=500,
                    detail="ELEVENLABS_AGENT_ID not configured"
                )

            # Make request to ElevenLabs API
            response = await requests.get(
                f"https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id={self.agent_id}",
                headers={
                    "xi-api-key": self.api_key
                }
            )

            if not response.ok:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Failed to get signed URL: {response.text}"
                )

            data = response.json()
            return {"signedUrl": data["signed_url"]}

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error getting signed URL: {str(e)}"
            ) 