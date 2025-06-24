from typing import Dict, List, Optional, Any
from supabase_client import get_supabase_client
from fastapi import HTTPException
import json

class DatabaseService:
    def __init__(self):
        self.supabase = get_supabase_client()
    
    def save_transcription(self, 
                          filename: str, 
                          transcription: str, 
                          sentences: List[Dict], 
                          file_type: str = 'audio',
                          metadata: Optional[Dict] = None) -> str:
        """
        Save transcription data to the database
        
        Args:
            filename: Name of the file
            transcription: Full transcription text
            sentences: List of sentence objects with text, start, end
            file_type: Type of file (audio, video, youtube, pdf)
            metadata: Additional metadata
            
        Returns:
            transcription_id: UUID of the created transcription
        """
        if not self.supabase:
            raise HTTPException(status_code=503, detail="Database service not available")
        
        try:
            # Prepare sentences data for the function
            sentences_data = []
            for sentence in sentences:
                sentences_data.append({
                    "text": sentence["text"],
                    "start": sentence["start"],
                    "end": sentence["end"]
                })
            
            # Call the database function
            result = self.supabase.rpc(
                'insert_transcription_data',
                {
                    'p_filename': filename,
                    'p_file_type': file_type,
                    'p_full_transcript': transcription,
                    'p_sentences': sentences_data,
                    'p_metadata': metadata or {}
                }
            ).execute()
            
            if result.data:
                return result.data
            else:
                raise HTTPException(status_code=500, detail="Failed to save transcription")
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    def get_transcription(self, transcription_id: str) -> Optional[Dict]:
        """
        Get a transcription by ID with its sentences
        
        Args:
            transcription_id: UUID of the transcription
            
        Returns:
            Transcription data with sentences or None
        """
        if not self.supabase:
            raise HTTPException(status_code=503, detail="Database service not available")
        
        try:
            result = self.supabase.table('transcription_with_sentences').select('*').eq('id', transcription_id).execute()
            
            if result.data and len(result.data) > 0:
                return result.data[0]
            return None
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    def get_user_transcriptions(self, limit: int = 50, offset: int = 0) -> List[Dict]:
        """
        Get all transcriptions for the current user
        
        Args:
            limit: Number of records to return
            offset: Number of records to skip
            
        Returns:
            List of transcription records
        """
        if not self.supabase:
            raise HTTPException(status_code=503, detail="Database service not available")
        
        try:
            result = self.supabase.table('transcriptions').select('*').order('created_at', desc=True).range(offset, offset + limit - 1).execute()
            return result.data or []
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    def update_transcription_status(self, transcription_id: str, status: str, processed_at: Optional[str] = None) -> bool:
        """
        Update transcription status
        
        Args:
            transcription_id: UUID of the transcription
            status: New status (processing, completed, failed)
            processed_at: Timestamp when processing completed
            
        Returns:
            True if successful
        """
        if not self.supabase:
            raise HTTPException(status_code=503, detail="Database service not available")
        
        try:
            update_data = {"status": status}
            if processed_at:
                update_data["processed_at"] = processed_at
            
            result = self.supabase.table('transcriptions').update(update_data).eq('id', transcription_id).execute()
            return len(result.data) > 0
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    def delete_transcription(self, transcription_id: str) -> bool:
        """
        Delete a transcription and all related data
        
        Args:
            transcription_id: UUID of the transcription
            
        Returns:
            True if successful
        """
        if not self.supabase:
            raise HTTPException(status_code=503, detail="Database service not available")
        
        try:
            result = self.supabase.table('transcriptions').delete().eq('id', transcription_id).execute()
            return len(result.data) > 0
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    def search_transcriptions(self, query: str, limit: int = 20) -> List[Dict]:
        """
        Search transcriptions by text content
        
        Args:
            query: Search query
            limit: Number of results to return
            
        Returns:
            List of matching transcriptions
        """
        if not self.supabase:
            raise HTTPException(status_code=503, detail="Database service not available")
        
        try:
            # Search in full transcript text
            result = self.supabase.table('transcriptions').select('*').text_search('full_transcript', query).limit(limit).execute()
            return result.data or []
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    def get_transcription_stats(self) -> Dict[str, Any]:
        """
        Get statistics for the current user's transcriptions
        
        Returns:
            Dictionary with statistics
        """
        if not self.supabase:
            raise HTTPException(status_code=503, detail="Database service not available")
        
        try:
            # Get total count
            total_result = self.supabase.table('transcriptions').select('id', count='exact').execute()
            total_count = total_result.count or 0
            
            # Get count by status
            status_result = self.supabase.table('transcriptions').select('status').execute()
            status_counts = {}
            for record in status_result.data or []:
                status = record['status']
                status_counts[status] = status_counts.get(status, 0) + 1
            
            # Get total word count
            word_count_result = self.supabase.table('transcriptions').select('word_count').execute()
            total_words = sum(record.get('word_count', 0) for record in word_count_result.data or [])
            
            return {
                "total_transcriptions": total_count,
                "status_counts": status_counts,
                "total_words": total_words
            }
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Database error: {str(e)}") 