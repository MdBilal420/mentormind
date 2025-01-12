from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import json
import redis
from groq import Groq
import os
import yt_dlp
import fitz  # PyMuPDF for PDF processing

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Redis for session storage
redis_client = redis.Redis(host='localhost', port=6379, db=0)

# Initialize Groq client
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class ChatMessage(BaseModel):
    session_id: str
    message: str
    resource_id: Optional[str] = None

class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str

class Resource(BaseModel):
    resource_type: str  # 'pdf' or 'youtube'
    url: str
    content: Optional[str] = None

@app.post("/chat")
async def chat_endpoint(chat_message: ChatMessage):
    # Get session context from Redis
    context = redis_client.get(chat_message.session_id)
    context = json.loads(context) if context else {"history": []}
    
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
    redis_client.setex(chat_message.session_id, 3600, json.dumps(context))  # 1 hour expiry
    
    return {"response": response.choices[0].message.content}

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

@app.post("/resource/youtube")
async def process_youtube(resource: Resource):
    try:
        # Extract YouTube transcript
        ydl_opts = {
            'writesubtitles': True,
            'subtitlesformat': 'txt',
            'skip_download': True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(resource.url, download=False)
            transcript = info.get('subtitles', {}).get('en', '')
            
        return {"content": transcript}
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
    
    response = groq_client.chat.completions.create(
        model="mixtral-8x7b-32768",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7
    )
    
    # Parse and structure the quiz questions
    # (You'd need to implement proper parsing of the LLM response)
    questions = []  # Parse response into QuizQuestion objects
    
    return {"questions": questions}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)