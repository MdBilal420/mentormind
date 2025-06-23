from pydantic import BaseModel

class SignedUrlResponse(BaseModel):
    signedUrl: str 