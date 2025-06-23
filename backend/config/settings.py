import os
from dotenv import load_dotenv

load_dotenv()

# API Keys
DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
SUPADATA_API_KEY = os.getenv("SUPADATA_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_AGENT_ID = os.getenv("ELEVENLABS_AGENT_ID")

# Validation
if not DEEPGRAM_API_KEY:
    raise ValueError("Missing DEEPGRAM_API_KEY environment variable")

if not SUPADATA_API_KEY:
    raise ValueError("Missing SUPADATA_API_KEY environment variable")

if not GROQ_API_KEY:
    print("Warning: GROQ_API_KEY environment variable not set. Summary generation will be limited.")

if not ELEVENLABS_API_KEY:
    print("Warning: ELEVENLABS_API_KEY environment variable not set")

# Directories
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# API Limits
MAX_TRANSCRIPT_LENGTH = 16000
MAX_QUIZ_QUESTIONS = 10
CHUNK_SIZE = 500 