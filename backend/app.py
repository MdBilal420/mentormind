# backend/app.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.transcription_routes import router as transcription_router
from routes.summary_routes import router as summary_router
from routes.quiz_routes import router as quiz_router
from routes.chat_routes import router as chat_router
from routes.youtube_routes import router as youtube_router
from routes.pdf_routes import router as pdf_router
from routes.concept_detective_routes import router as concept_detective_router
from routes.elevenlabs_routes import router as elevenlabs_router
from auth import router as auth_router

app = FastAPI()

# Add CORS middleware to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the authentication router
app.include_router(auth_router)
app.include_router(transcription_router)
app.include_router(summary_router)
app.include_router(quiz_router)
app.include_router(chat_router)
app.include_router(youtube_router)
app.include_router(pdf_router)
app.include_router(concept_detective_router)
app.include_router(elevenlabs_router)

@app.get("/")
async def root():
    return {"message": "Hello World"}








