from .transcription_routes import router as transcription_router
from .summary_routes import router as summary_router
from .quiz_routes import router as quiz_router
from .chat_routes import router as chat_router
from .youtube_routes import router as youtube_router
from .pdf_routes import router as pdf_router
from .concept_detective_routes import router as concept_detective_router
from .elevenlabs_routes import router as elevenlabs_router

__all__ = [
    'transcription_router',
    'summary_router',
    'quiz_router',
    'chat_router',
    'youtube_router',
    'pdf_router',
    'concept_detective_router',
    'elevenlabs_router'
] 