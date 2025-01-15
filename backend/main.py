from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import json
from groq import Groq
import os
import yt_dlp
import fitz  # PyMuPDF for PDF processing
from dotenv import load_dotenv
from youtube_transcript_api import YouTubeTranscriptApi
import re

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

print("")

class ChatMessage(BaseModel):
    session_id: str
    message: str
    resource_id: Optional[str] = None

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str  # This will now hold 'a', 'b', 'c', or 'd'

class Resource(BaseModel):
    resource_type: str  # 'pdf' or 'youtube'
    url: str
    content: Optional[str] = None

class TranscriptRequest(BaseModel):
    video_id: str

# Define a response model
class TranscriptResponse(BaseModel):
    transcript: str 

class TopicRequest(BaseModel):
    text: str

class GenerateResponse(BaseModel):
    explanation: str
    questions: List[QuizQuestion]

@app.post("/fetch-transcript", response_model=TranscriptResponse)
async def fetch_transcript(request: TranscriptRequest):
    """
    Endpoint to fetch the transcript of a YouTube video given its video ID.
    """
    try:
        # Fetch the transcript using YouTubeTranscriptApi
        transcript = YouTubeTranscriptApi.get_transcript(request.video_id)
        full_text = " ".join([entry['text'] for entry in transcript])
        return {"transcript": full_text}
    except Exception as e:
        # Handle errors and return an appropriate HTTP exception
        raise HTTPException(status_code=400, detail=str(e))

# In-memory session storage
session_store = {}

@app.post("/chat")
async def chat_endpoint(chat_message: ChatMessage):
    # Get session context from in-memory store
    context = session_store.get(chat_message.session_id, {"history": []})
    
    # Prepare message for LLM
    messages = [
        {"role": "system", "content": "You are a helpful training assistant. Guide the user through their learning material and help them understand the content."},
        *[{"role": "user" if i % 2 == 0 else "assistant", "content": msg} 
          for i, msg in enumerate(context["history"])],
        {"role": "user", "content": chat_message.message}
    ]
    
    # Get response from Groq
    response = groq_client.chat.completions.create(
        model="mixtral-8x7b-32768",
        messages=messages,
        temperature=0.7,
        max_tokens=1000
    )
    
    # Update session history
    context["history"].extend([chat_message.message, response.choices[0].message.content])
    session_store[chat_message.session_id] = context  # Update in-memory store
    content = response.choices[0].message.content

    prompt = f"""
    Generate 5 multiple choice questions based on the following content:
    {content.response[:2000]}  # Limiting content length
    
    Format each question with 4 options and mark the correct answer.
    """
    
    response = groq_client.chat.completions.create(
        model="mixtral-8x7b-32768",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    
    return {"response": response}

@app.post("/upload/pdf")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        # Save PDF temporarily
        content = await file.read()
        pdf_path = f"temp_{file.filename}"
        with open(pdf_path, "wb") as f:
            f.write(content)
        
        # Extract text from PDF
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        
        # Clean up
        doc.close()
        os.remove(pdf_path)
        
        return {"content": text}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/generate-quiz")
async def generate_quiz(resource: Resource):
    # Use Groq to generate quiz questions based on content
    prompt = f"""
    Generate 5 multiple choice questions based on the following content:
    {resource.content[:2000]}  # Limiting content length
    
    Format each question with 4 options and mark the correct answer.
    """
    
    response   =    groq_client.chat.completions.create(
        model="mixtral-8x7b-32768",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    print("RESPONSE",response)
    # Parse and structure the quiz questions
    # (You'd need to implement proper parsing of the LLM response)
    questions = []  # Parse response into QuizQuestion objects
    
    return {"questions": questions}

def find_correct_option(options):
    return next((option[0] for option in options if "(Correct)" in option[1]), None)

@app.post("/generate_quiz", response_model=GenerateResponse)
async def generate_content(request: TopicRequest):

    # Determine the subject from the provided text
    subject_prompt = f"""
    Determine the subject of the following text: {request.text}.
    If the {request.text} is too vague or ambiguous, then return "invalid" as the subject.
    """
    subject_response = groq_client.chat.completions.create(
        model="mixtral-8x7b-32768",
        messages=[{"role": "user", "content": subject_prompt}],
        temperature=0,
        max_tokens=1000
    )
    subject = subject_response.choices[0].message.content.strip()
    print("SUBJECT",subject)

    # Check if the subject was determined
    if subject.lower() == "invalid":
        raise HTTPException(status_code=400, detail="Could not determine the subject from the provided text. Please try again with more specific instructions.")

    # Generate explanation about the topic
    explanation_prompt = f"Explain the following topic in detail: {subject} with markdown formatting."
    explanation_response = groq_client.chat.completions.create(
        model="mixtral-8x7b-32768",
        messages=[{"role": "user", "content": explanation_prompt}],
        temperature=0.1,
        max_tokens=1000
    )
    explanation = explanation_response.choices[0].message.content

    # Generate quiz questions about the topic
    quiz_prompt = f"""
    Generate 5 multiple choice questions based on the following topic:
    {subject}
    
    Format each question with 4 options and mark the correct option as (Correct).
    """
    quiz_response = groq_client.chat.completions.create(
        model="mixtral-8x7b-32768",
        messages=[{"role": "user", "content": quiz_prompt}],
        temperature=0.7,
        max_tokens=1000
    )
    
    # Parse and structure the quiz questions
    quiz_content = quiz_response.choices[0].message.content
    questions = []
    question_blocks = quiz_content.split("\n\n")
    for block in question_blocks:
        question_match = re.match(r"^\d+\.\s(.+?)\n", block)
        options_match = re.findall(r"([a-d])\)\s(.+)", block)
        correct_answer_match = next((option[0] for option in options_match if "(Correct)" in option[1]), None)
        if question_match and options_match and correct_answer_match:
            question_text = question_match.group(1)
            options = [option[1].replace(" (Correct)", "") for option in options_match]
            correct_answer = correct_answer_match
            questions.append(QuizQuestion(question=question_text, options=options, correct_answer=correct_answer))
    
    return {"explanation": explanation, "questions": questions}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)