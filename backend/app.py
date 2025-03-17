# backend/app.py

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os
import shutil
import uuid
from deepgram import DeepgramClient, PrerecordedOptions
from dotenv import load_dotenv


app = FastAPI()

# Add CORS middleware to allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()


# Get API key from environment variable
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
if not DEEPGRAM_API_KEY:
    raise ValueError("Missing DEEPGRAM_API_KEY environment variable")

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# endpoint returns hello world
@app.get("/")
async def root():
    return {"message": "Hello World"}

async def transcribe_audio(file_path):
    if not DEEPGRAM_API_KEY:
        # Return mock transcription with timestamps for development
        return {
            "transcript": "This is a mock transcription for development purposes. Please set the DEEPGRAM_API_KEY environment variable for actual transcription.",
            "words": [
                {"word": "This", "start": 0.0, "end": 0.3},
                {"word": "is", "start": 0.3, "end": 0.5},
                {"word": "a", "start": 0.5, "end": 0.6},
                {"word": "mock", "start": 0.6, "end": 0.9},
                {"word": "transcription", "start": 0.9, "end": 1.5},
                {"word": "for", "start": 1.5, "end": 1.8},
                {"word": "development", "start": 1.8, "end": 2.5},
                {"word": "purposes", "start": 2.5, "end": 3.1}
            ]
        }
    
    try:
        # Only import Deepgram if API key is available
        from deepgram import DeepgramClient, PrerecordedOptions
        
        # Initialize the Deepgram client
        deepgram = DeepgramClient(DEEPGRAM_API_KEY)
        
        # Open the audio file
        with open(file_path, 'rb') as buffer_data:
            # Configure transcription options
            payload = { 'buffer': buffer_data }
            options = PrerecordedOptions(
                smart_format=True,
                model="nova-2",
                language="en-US",
                utterances=True,  # Enable utterances to get paragraph breaks
                detect_topics=True,  # Detect topic changes
                punctuate=True,
                diarize=True,  # Speaker diarization if multiple speakers
            )
            
            # Send the audio to Deepgram and get the response
            response = deepgram.listen.prerecorded.v("1").transcribe_file(payload, options)
            
            # Extract full transcript
            transcript = response.results.channels[0].alternatives[0].transcript
            
            # Extract sentences with timestamps            
            paragraphs = response.results.channels[0].alternatives[0].paragraphs.paragraphs

            
            # Format word timestamps
            formatted_sentences = []

            for paragraph in paragraphs:
                for sentence in paragraph.sentences:
                    formatted_sentences.append({
                        "text": sentence.text,
                        "start": sentence.start,
                        "end": sentence.end
                    })
            
            return {
                "transcript": transcript,
                "sentences": formatted_sentences
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during transcription: {str(e)}")

@app.post("/api/transcribe")
async def transcribe_audio_endpoint(file: UploadFile = File(...)):
    """
    Endpoint to upload an audio file and get its transcription
    """
    # Validate file type (optional)
    if not file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    # Create a unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save uploaded file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")
    
    # Transcribe the audio
    try:
        transcription_result = await transcribe_audio(file_path)
        
        # Return the transcription with timestamps
        return {
            "success": True,
            "filename": file.filename,
            "transcription": transcription_result["transcript"],
            "sentences": transcription_result["sentences"]
        }
    except Exception as e:
        # Clean up the file in case of error
        if os.path.exists(file_path):
            os.remove(file_path)
        raise e
    finally:
        # Clean up after processing (optional - you might want to keep files)
        if os.path.exists(file_path):
            os.remove(file_path)

# Response model for generating summary
class SummaryRequest(BaseModel):
    text: str

@app.post("/api/generate-summary")
async def generate_summary(request: SummaryRequest):
    """
    Endpoint to generate a summary from transcription text
    """
    # This is a placeholder - you would integrate with an AI service
    # like OpenAI to generate the actual summary
    
    # Mock implementation
    summary = f"Summary of transcription: {request.text[:100]}..."
    
    return {
        "success": True,
        "summary": summary
    }

# Response model for generating questions
class QuizRequest(BaseModel):
    text: str
    num_questions: Optional[int] = 5

@app.post("/api/generate-quiz")
async def generate_quiz(request: QuizRequest):
    """
    Endpoint to generate quiz questions from transcription text
    """
    # Mock implementation - replace with actual AI-powered question generation
    questions = [
        {
            "question": "What is the main topic of this lecture?",
            "options": [
                "Option A from the content",
                "Option B from the content",
                "Option C from the content",
                "Option D from the content"
            ],
            "correctAnswer": 0
        },
        {
            "question": "Which concept was discussed first in the lecture?",
            "options": [
                "Concept A",
                "Concept B",
                "Concept C",
                "Concept D"
            ],
            "correctAnswer": 1
        }
    ]
    
    return {
        "success": True,
        "questions": questions
    }

# Add more endpoints for other functionalities like YouTube processing



