import json
from groq import Groq
from config.settings import GROQ_API_KEY, MAX_TRANSCRIPT_LENGTH

class ConceptDetectiveService:
    def __init__(self):
        self.groq_client = None
        if GROQ_API_KEY:
            try:
                self.groq_client = Groq(api_key=GROQ_API_KEY)
            except ImportError:
                print("Warning: Groq package not installed. Install with: pip install groq")

    def generate_concept_detective_game(self, transcript: str) -> dict:
        """Generate a Concept Detective game based on the transcript content"""
        try:
            if not transcript:
                raise ValueError("Transcript is required")
                
            # Truncate very long transcripts to prevent API limits
            truncated_transcript = transcript[:MAX_TRANSCRIPT_LENGTH]
            if len(transcript) > MAX_TRANSCRIPT_LENGTH:
                truncated_transcript += "\n[Transcript truncated due to length...]"
                
            # Use Groq to generate the game data
            if not GROQ_API_KEY or not self.groq_client:
                raise ValueError("GROQ_API_KEY not configured")
                
            prompt = f"""
            Create a Concept Detective game based on the following transcript.
            
            The game should:
            1. Use a creative analogy (like cookies, islands, pets, game consoles, etc.) that reflects the core idea of the transcript
            2. Have multiple levels that reflect different layers or subtopics from the material
            3. Each level should have a brief story using the analogy and 3-5 open-ended questions
            
            Format your response as a JSON object with the following structure:
            {{
              "analogy": "The creative analogy you've chosen",
              "description": "A brief description of how the analogy relates to the transcript content",
              "levels": [
                {{
                  "title": "Level 1: [Level Title]",
                  "story": "A brief story using the analogy that introduces the level",
                  "questions": [
                    {{
                      "text": "Question 1",
                      "type": "open-ended"
                    }},
                    // More questions...
                  ]
                }},
                // More levels...
              ]
            }}
            
            Make sure the questions are thought-provoking and require the user to apply or explain key ideas from the transcript.
            
            Transcript:
            {truncated_transcript}
            """
            
            response = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",  # Using Llama 3.3 70B model
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that creates educational games. You always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,  # Higher temperature for more creative analogies
                max_tokens=2048,
                response_format={"type": "json_object"}  # Ensure JSON response
            )
            
            # Extract the game data from the response
            game_data = json.loads(response.choices[0].message.content)
            
            return {
                "success": True,
                "analogy": game_data.get("analogy", ""),
                "description": game_data.get("description", ""),
                "levels": game_data.get("levels", []),
                "error": None
            }
            
        except Exception as e:
            return {
                "success": False,
                "analogy": "",
                "description": "",
                "levels": [],
                "error": str(e)
            }

    def evaluate_concept_detective_answers(self, transcript: str, answers: list) -> dict:
        """Evaluate the user's answers for the Concept Detective game"""
        try:
            if not transcript:
                raise ValueError("Transcript is required")
                
            if not answers:
                raise ValueError("Answers are required")
                
            # Truncate very long transcripts to prevent API limits
            truncated_transcript = transcript[:MAX_TRANSCRIPT_LENGTH]
            if len(transcript) > MAX_TRANSCRIPT_LENGTH:
                truncated_transcript += "\n[Transcript truncated due to length...]"
                
            # Use Groq to evaluate the answers
            if not GROQ_API_KEY or not self.groq_client:
                raise ValueError("GROQ_API_KEY not configured")
                
            # Format answers for the prompt
            formatted_answers = []
            for answer in answers:
                formatted_answers.append({
                    "levelIndex": answer.levelIndex,
                    "questionIndex": answer.questionIndex,
                    "answer": answer.answer
                })
                
            prompt = f"""
            Evaluate the following answers for a Concept Detective game based on the transcript.
            
            For each answer, provide:
            1. A score from 0-4:
               - 0: Completely incorrect or misunderstanding
               - 1: Somewhat related but mostly off
               - 2: Partial understanding with missing or confused parts
               - 3: Mostly correct with minor flaws
               - 4: Fully correct, showing clear understanding
            2. Brief feedback explaining the score and what could be improved
            
            Format your response as a JSON object with the following structure:
            {{
              "scores": {{
                "levelIndex-questionIndex": score,
                // More scores...
              }},
              "feedback": {{
                "levelIndex-questionIndex": "Feedback text",
                // More feedback...
              }}
            }}
            
            Transcript:
            {truncated_transcript}
            
            Answers to evaluate:
            {json.dumps(formatted_answers, indent=2)}
            """
            
            response = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",  # Using Llama 3.3 70B model
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that evaluates educational answers. You always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,  # Lower temperature for more consistent evaluation
                max_tokens=2048,
                response_format={"type": "json_object"}  # Ensure JSON response
            )
            
            # Extract the evaluation data from the response
            evaluation_data = json.loads(response.choices[0].message.content)
            
            return {
                "success": True,
                "scores": evaluation_data.get("scores", {}),
                "feedback": evaluation_data.get("feedback", {}),
                "error": None
            }
            
        except Exception as e:
            return {
                "success": False,
                "scores": {},
                "feedback": {},
                "error": str(e)
            } 