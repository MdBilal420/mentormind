import os
from deepgram import DeepgramClient, PrerecordedOptions
from fastapi import HTTPException
from config.settings import DEEPGRAM_API_KEY

class TranscriptionService:
    def __init__(self):
        self.deepgram_api_key = DEEPGRAM_API_KEY

    async def transcribe_audio(self, file_path: str):
        """Transcribe audio file using Deepgram API"""
        if not self.deepgram_api_key:
            # Return mock transcription with timestamps for development
            return {
                "transcript": "This is a mock transcription for development purposes. Please set the DEEPGRAM_API_KEY environment variable for actual transcription.",
                "words": [
                    {"word": "This", "start": 0.0, "end": 0.3},
                    {"word": "is", "start": 0.3, "end": 0.5},
                    {"word": "a", "start": 0.5, "end": 0.6},
                    {"word": "mock", "start": 0.6, "end": 0.9},
                    {"word": "transcription", "start": 0.9, "end": 1.5},
                    {"word": "for", "start": 1.5, "end": 1.8},
                    {"word": "development", "start": 1.8, "end": 2.5},
                    {"word": "purposes", "start": 2.5, "end": 3.1}
                ]
            }
        
        try:
            # Initialize the Deepgram client
            deepgram = DeepgramClient(self.deepgram_api_key)
            
            # Open the audio file
            with open(file_path, 'rb') as buffer_data:
                # Configure transcription options
                payload = { 'buffer': buffer_data }
                options = PrerecordedOptions(
                    smart_format=True,
                    model="nova-2",
                    language="en-US",
                    utterances=True,  # Enable utterances to get paragraph breaks
                    detect_topics=True,  # Detect topic changes
                    punctuate=True,
                    diarize=True,  # Speaker diarization if multiple speakers
                )
                
                # Send the audio to Deepgram and get the response
                response = deepgram.listen.prerecorded.v("1").transcribe_file(payload, options)
                
                # Extract full transcript
                transcript = response.results.channels[0].alternatives[0].transcript
                
                # Extract sentences with timestamps            
                paragraphs = response.results.channels[0].alternatives[0].paragraphs.paragraphs

                # Format word timestamps
                formatted_sentences = []

                for paragraph in paragraphs:
                    for sentence in paragraph.sentences:
                        formatted_sentences.append({
                            "text": sentence.text,
                            "start": sentence.start,
                            "end": sentence.end
                        })
                
                return {
                    "transcript": transcript,
                    "sentences": formatted_sentences
                }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error during transcription: {str(e)}") 