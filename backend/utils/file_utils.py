import os
import shutil
import uuid
from fastapi import UploadFile, HTTPException
from config.settings import UPLOAD_DIR

def save_uploaded_file(file: UploadFile) -> str:
    """Save an uploaded file and return the file path"""
    # Create a unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save uploaded file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return file_path
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error saving file: {str(e)}")

def cleanup_file(file_path: str) -> None:
    """Clean up a file from the filesystem"""
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Warning: Could not remove file {file_path}: {str(e)}") 