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
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

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

# Add this with your other environment variables
YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

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
    content: str

class TranscriptRequest(BaseModel):
    video_id: str

# Define a response model
class TranscriptResponse(BaseModel):
    transcript: str 

class TopicRequest(BaseModel):
    session_id: str
    text: str

class GenerateResponse(BaseModel):
    explanation: str

@app.get("/fetch-transcript-video/{video_id}/{input}", response_model=TranscriptResponse)
async def fetch_transcript(video_id: str, input: str):
    try:
        # First try YouTubeTranscriptApi
        try:
            transcript = YouTubeTranscriptApi.get_transcript(video_id)
            full_text = " ".join([entry['text'] for entry in transcript])
        except Exception as transcript_error:
            # Fallback to YouTube Data API
            try:
                youtube = build('youtube', 'v3', developerKey=YOUTUBE_API_KEY)
                
                # Get captions track
                captions_response = youtube.captions().list(
                    part='snippet',
                    videoId=video_id
                ).execute()
                
                if not captions_response.get('items'):
                    raise HTTPException(
                        status_code=400,
                        detail="No captions available for this video"
                    )
                
                # Get the first English caption track or default to the first available
                caption_id = None
                for item in captions_response['items']:
                    if item['snippet']['language'] == 'en':
                        caption_id = item['id']
                        break
                if not caption_id:
                    caption_id = captions_response['items'][0]['id']
                
                # Download the caption track
                caption = youtube.captions().download(
                    id=caption_id,
                    tfmt='srt'
                ).execute()
                
                # Convert caption to text (remove timecodes and formatting)
                full_text = ' '.join(
                    line for line in caption.decode('utf-8').split('\n')
                    if not line.strip().isdigit() and 
                    not '-->' in line and 
                    line.strip()
                )
                
            except HttpError as api_error:
                raise HTTPException(
                    status_code=400,
                    detail=f"YouTube API error: {str(api_error)}"
                )

        if input == "":       
            prompt = f"Modify the following text to a markdown format: {full_text}"
        else:
            prompt = f"Generate insights from the following content: {full_text} and focus on the following topic: {input} and return the content in markdown format"
            
        response = groq_client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[{"role": "user", "content": prompt}], 
            temperature=0.7,
            max_tokens=1000
        )
        content = response.choices[0].message.content
        return TranscriptResponse(transcript=content)
        
    except Exception as e:
        print(f"Error: {str(e)}")  # Debug print
        raise HTTPException(status_code=400, detail=str(e))

# In-memory session storage
session_store = {}

@app.post("/n0-chat")
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


@app.post("/generate_quiz")
async def generate_quiz(resource: Resource):

    # Use Groq to generate quiz questions based on content
    prompt = f"""
    Generate 5 multiple choice questions based on the following content:
    {resource.content}
    
    Format your response as a JSON object with this exact structure:
    {{
        "questions": [
            {{
                "question": "Question text here",
                "options": ["(Correct) Option A", "Option B", "Option C", "Option D"]
            }}
        ]
    }}
    """
    
    quiz_response = groq_client.chat.completions.create(
        model="mixtral-8x7b-32768",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=1000
    )
    
    # Parse and structure the quiz questions
    try:
        # First, get the response content and parse it as JSON
        quiz_content = json.loads(quiz_response.choices[0].message.content)
        questions = []
        
        for q in quiz_content["questions"]:
            # Find the correct answer by looking for "(Correct)" marker
            options = [opt.replace("(Correct) ", "").replace("(Incorrect) ", "") for opt in q["options"]]
            correct_index = next(i for i, opt in enumerate(q["options"]) if "(Correct)" in opt)
            correct_answer = chr(97 + correct_index)  # Convert index to 'a', 'b', 'c', or 'd'
            
            questions.append(QuizQuestion(
                question=q["question"],
                options=options,
                correct_answer=correct_answer
            ))
        
        return {"questions": questions}
    except json.JSONDecodeError as e:
        print("Failed to parse JSON:", quiz_response.choices[0].message.content)
        raise HTTPException(status_code=500, detail="Failed to generate valid quiz questions")
    except Exception as e:
        print("Error processing quiz:", str(e))
        raise HTTPException(status_code=500, detail="Error processing quiz questions")

def find_correct_option(options):
    return next((option[0] for option in options if "(Correct)" in option[1]), None)

@app.post("/chat")
async def generate_content(request: TopicRequest):

    # Get session context from in-memory store
    context = session_store.get(request.session_id, {"history": []})

    # Prepare message for LLM
    messages = [
        {"role": "system", "content": "You are a helpful training assistant. Guide the user through their learning material and help them understand the content."},
        *[{"role": "user" if i % 2 == 0 else "assistant", "content": msg} 
          for i, msg in enumerate(context["history"])],
        {"role": "user", "content": request.text}
    ]
    
    # Get response from Groq
    response = groq_client.chat.completions.create(
        model="mixtral-8x7b-32768",
        messages=messages,
        temperature=0.7,
        max_tokens=1000
    )
    
    # Update session history
    context["history"].extend([request.text, response.choices[0].message.content])
    session_store[request.session_id] = context  # Update in-memory store
    content = response.choices[0].message.content

    # Generate explanation about the topic
    explanation_prompt = f"Explain the following topic in detail: {content[:2000]} with markdown formatting."
    explanation_response = groq_client.chat.completions.create(
        model="mixtral-8x7b-32768",
        messages=[{"role": "user", "content": explanation_prompt}],
        temperature=0.7,
        max_tokens=1000
    )
    explanation = explanation_response.choices[0].message.content
    return {"explanation": explanation}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)