import json
import asyncio
import time
from groq import Groq
from config.settings import GROQ_API_KEY, MAX_TRANSCRIPT_LENGTH

class ChatService:
    def __init__(self):
        self.groq_client = None
        if GROQ_API_KEY:
            try:
                self.groq_client = Groq(api_key=GROQ_API_KEY)
            except ImportError:
                print("Warning: Groq package not installed. Install with: pip install groq")

    def get_socratic_system_prompt(self) -> str:
        """Create the system prompt for the Socratic tutor"""
        return """You are a Socratic tutor. Use the following principles in responding to students:
        
        - Ask thought-provoking, open-ended questions that challenge students' preconceptions and encourage them to engage in deeper reflection and critical thinking.
        - Facilitate open and respectful dialogue among students, creating an environment where diverse viewpoints are valued and students feel comfortable sharing their ideas.
        - Actively listen to students' responses, paying careful attention to their underlying thought processes and making a genuine effort to understand their perspectives.
        - Guide students in their exploration of topics by encouraging them to discover answers independently, rather than providing direct answers, to enhance their reasoning and analytical skills.
        - Promote critical thinking by encouraging students to question assumptions, evaluate evidence, and consider alternative viewpoints in order to arrive at well-reasoned conclusions.
        - Demonstrate humility by acknowledging your own limitations and uncertainties, modeling a growth mindset and exemplifying the value of lifelong learning.

        Base your responses on the following transcription content. Your goal is not to simply provide answers, but to help the student think critically about the material through Socratic questioning.

        Keep your responses concise (3-5 sentences maximum) unless elaboration is necessary to explain a complex concept.
        """

    def get_direct_system_prompt(self) -> str:
        """Create the system prompt for the direct answer mode"""
        return """You are a helpful assistant that answers questions directly and accurately.
        
        - Provide clear, concise answers to the user's questions based on the transcription content.
        - If the answer is explicitly stated in the transcription, provide it directly.
        - If the answer requires inference, make reasonable inferences based solely on the transcription content.
        - If the question cannot be answered from the transcription, politely explain that the information is not available.
        - Include relevant details from the transcription to support your answers.
        - Keep your responses informative but concise, focusing on the most relevant information.
        
        Base your responses solely on the following transcription content.
        """

    def generate_socratic_response(self, messages: list) -> str:
        """Generate a Socratic tutor response using the Groq API"""
        if not GROQ_API_KEY or not self.groq_client:
            # Return mock response if Groq API is not available
            return "I'd be happy to discuss this lecture with you! What specific aspect would you like to explore further? Is there a concept you find particularly challenging or interesting? (Note: This is a mock response as the Groq API key is not configured)"
        
        try:
            # Call Groq API to generate the response
            response = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",  # Using Llama 3.3 70B model
                messages=messages,
                temperature=0.7,  # Slightly higher temperature for more varied responses
                max_tokens=1024
            )
            
            # Extract the response text
            return response.choices[0].message.content
        except Exception as e:
            return f"I'm having trouble processing your question. Could you try asking in a different way? (Error: {str(e)})"

    def generate_direct_response(self, messages: list) -> str:
        """Generate a direct answer response using the Groq API"""
        if not GROQ_API_KEY or not self.groq_client:
            # Return mock response if Groq API is not available
            return "Based on the transcript, I can tell you that... (Note: This is a mock response as the Groq API key is not configured)"
        
        try:
            # Call Groq API to generate the response
            response = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",  # Using Llama 3.3 70B model
                messages=messages,
                temperature=0.3,  # Lower temperature for more factual responses
                max_tokens=1024
            )
            
            # Extract the response text
            return response.choices[0].message.content
        except Exception as e:
            return f"I'm having trouble processing your question. Could you try asking in a different way? (Error: {str(e)})"

    async def generate_streaming_response(self, messages: list):
        """Generate a streaming response from the model - optimized version"""
        if not GROQ_API_KEY or not self.groq_client:
            # Mock streaming for development without API key
            mock_response = "I'd be happy to discuss this lecture with you! What specific aspect would you like to explore further? Is there a concept you find particularly challenging or interesting? (Note: This is a mock response as the Groq API key is not configured)"
            
            # Stream by blocks for better performance
            blocks = mock_response.split('. ')
            for block in blocks:
                yield f"data: {json.dumps({'chunk': block + '. '})}\n\n"
                await asyncio.sleep(0.08)  # Slightly shorter delay
            
            yield f"data: {json.dumps({'done': True})}\n\n"
            return
        
        try:
            # Call Groq API with streaming enabled
            stream = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages,
                temperature=0.7,
                max_tokens=1024,
                stream=True
            )
            
            # Buffer for more efficient sending
            buffer = ""
            last_send_time = time.time()
            
            # Stream the response chunks with optimized buffering
            for chunk in stream:
                content = chunk.choices[0].delta.content
                if content:
                    buffer += content
                    
                    # Send in larger chunks or after a time threshold to reduce overhead
                    current_time = time.time()
                    should_send = (
                        len(buffer) >= 10 or  # Send if buffer has 10+ characters
                        '.' in buffer or      # Send if buffer contains sentence end
                        '\n' in buffer or     # Send if buffer contains newline
                        current_time - last_send_time > 0.2  # Send at least every 200ms
                    )
                    
                    if should_send and buffer:
                        yield f"data: {json.dumps({'chunk': buffer})}\n\n"
                        buffer = ""
                        last_send_time = current_time
            
            # Send any remaining buffered content
            if buffer:
                yield f"data: {json.dumps({'chunk': buffer})}\n\n"
            
            # Signal completion
            yield f"data: {json.dumps({'done': True})}\n\n"
        
        except Exception as e:
            error_message = f"I'm having trouble processing your question. Could you try asking in a different way? (Error: {str(e)})"
            yield f"data: {json.dumps({'chunk': error_message})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n" 