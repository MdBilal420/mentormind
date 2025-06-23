from fastapi import APIRouter, UploadFile, File, HTTPException
from models.pdf_models import PDFSummaryResponse
from services.pdf_service import PDFService
from utils.file_utils import save_uploaded_file, cleanup_file

router = APIRouter(prefix="/api", tags=["pdf"])

pdf_service = PDFService()

@router.post("/process-pdf", response_model=PDFSummaryResponse)
async def process_pdf_endpoint(file: UploadFile = File(...)):
    try:
        if not file.filename.lower().endswith('.pdf'):
            raise HTTPException(status_code=400, detail="File must be a PDF")
        temp_file_path = save_uploaded_file(file)
        try:
            pdf_text = pdf_service.extract_text_from_pdf_file(temp_file_path)
            result = pdf_service.process_pdf_content(pdf_text)
            return result
        finally:
            cleanup_file(temp_file_path)
    except Exception as e:
        return {
            "success": False,
            "summary": "",
            "transcript": "",
            "questions": [],
            "error": str(e)
        } 