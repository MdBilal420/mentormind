import subprocess
import requests
import re
import json
from supadata import Supadata
from config.settings import SUPADATA_API_KEY

class YouTubeService:
    def __init__(self):
        self.supadata = Supadata(api_key=SUPADATA_API_KEY)

    def get_youtube_subtitles(self, youtube_url: str) -> dict:
        """Get subtitles from YouTube video using yt-dlp"""
        try:
            # Run yt-dlp to get subtitles using subprocess
            result = subprocess.run(
                ["python", "-m", "yt_dlp", "--write-auto-sub", "--sub-format", "vtt", 
                 "--skip-download", "--print-json", youtube_url],
                capture_output=True, text=True
            )
            
            if result.returncode != 0:
                return f"Error: Failed to fetch subtitles. {result.stderr}"
            
            json_output = json.loads(result.stdout)
            subtitles = json_output.get("automatic_captions", {}).get("en", [])
            
            if not subtitles:
                return "Error: No subtitles found for this video"
            
            subtitle_url = subtitles[-1]["url"]
            
            response = requests.get(subtitle_url)
            if response.status_code != 200:
                return f"Error: Failed to download subtitles. Status code: {response.status_code}"
            
            vtt_content = response.text
            
            # Extract text content (no timestamps)
            pattern = r'\d{2}:\d{2}:\d{2}\.\d{3} --> \d{2}:\d{2}:\d{2}\.\d{3}\s*(.*?)(?=\n\d{2}:\d{2}:\d{2}\.\d{3}|$)'
            matches = re.findall(pattern, vtt_content, re.DOTALL)
            
            # Process and clean up the text with better formatting
            full_transcript = ""
            current_sentence = ""
            
            for text in matches:
                # Clean up the text
                clean_text = re.sub(r'align:(?:start|middle|end)\s+position:\d+%\s*', '', text)
                clean_text = re.sub(r'<[^>]+>', '', clean_text)
                clean_text = re.sub(r'\s+', ' ', clean_text).strip()
                
                if clean_text:
                    # Ensure proper spacing between segments
                    if full_transcript and not full_transcript.endswith(('.', '!', '?', '"', "'", ':', ';')):
                        full_transcript += " "
                    full_transcript += clean_text
            
            # Improve sentence capitalization and spacing
            full_transcript = re.sub(r'([.!?])\s*([a-z])', lambda m: m.group(1) + ' ' + m.group(2).upper(), full_transcript)
            
            return {
                "full_transcript": full_transcript.strip(),
                "video_title": json_output.get("title", "YouTube Video")
            }
            
        except Exception as e:
            return f"Error processing YouTube subtitles: {str(e)}"

    def extract_video_id(self, youtube_url: str) -> str:
        """Extract video ID from YouTube URL"""
        if "youtu.be/" in youtube_url:
            return youtube_url.split("youtu.be/")[1].split("?")[0]
        elif "youtube.com/watch?v=" in youtube_url:
            return youtube_url.split("v=")[1].split("&")[0]
        elif "youtube.com/v/" in youtube_url:
            return youtube_url.split("/v/")[1].split("?")[0]
        else:
            return None

    def get_transcript_via_supadata(self, video_id: str) -> str:
        """Get transcript using Supadata API"""
        try:
            text_transcript = self.supadata.youtube.transcript(
                video_id=video_id,
                text=True,
                lang="en"
            )
            return text_transcript.content
        except Exception as e:
            raise Exception(f"Error getting transcript via Supadata: {str(e)}") 