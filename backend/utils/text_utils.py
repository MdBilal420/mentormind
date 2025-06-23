from config.settings import MAX_TRANSCRIPT_LENGTH

def truncate_transcript(transcript: str, max_length: int = None) -> str:
    """Truncate transcript to prevent API limits"""
    if max_length is None:
        max_length = MAX_TRANSCRIPT_LENGTH
        
    if len(transcript) <= max_length:
        return transcript
        
    truncated = transcript[:max_length]
    truncated += "\n[Transcript truncated due to length...]"
    return truncated 