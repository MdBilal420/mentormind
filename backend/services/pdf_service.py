import PyPDF2
from fastapi import HTTPException
from config.settings import CHUNK_SIZE
from .summary_service import SummaryService
from .quiz_service import QuizService

class PDFService:
    def __init__(self):
        self.summary_service = SummaryService()
        self.quiz_service = QuizService()

    def extract_text_from_pdf_file(self, file_path: str) -> str:
        """Extract text from a PDF file"""
        try:
            with open(file_path, 'rb') as file:
                # Create a PDF reader object
                pdf_reader = PyPDF2.PdfReader(file)
                # Join text from all pages into one string
                text = " ".join(page.extract_text() or "" for page in pdf_reader.pages)
                return text.strip()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")

    def create_chunks(self, text: str, chunk_size: int = None) -> list:
        """Break the text into chunks of roughly chunk_size characters each."""
        if chunk_size is None:
            chunk_size = CHUNK_SIZE
            
        words = text.split()
        chunks = []
        current_chunk = []
        current_length = 0
        
        for word in words:
            current_length += len(word) + 1  # +1 for space
            if current_length > chunk_size:
                chunks.append(" ".join(current_chunk))
                current_chunk = [word]
                current_length = len(word)
            else:
                current_chunk.append(word)
        if current_chunk:
            chunks.append(" ".join(current_chunk))
        return chunks

    def process_pdf_content(self, pdf_text: str) -> dict:
        """Process PDF content and generate summary and quiz questions"""
        # Create chunks
        chunks = self.create_chunks(pdf_text)
        
        if not chunks:
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")

        # Generate summary
        summary = self.summary_service.generate_bullet_summary(pdf_text)
        
        # Generate quiz questions
        questions = self.quiz_service.generate_quiz_questions(pdf_text, 5)
        
        return {
            "success": True,
            "transcript": pdf_text,
            "summary": summary,
            "questions": questions,
            "error": None
        } 