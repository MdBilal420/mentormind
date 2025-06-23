import json
from groq import Groq
from config.settings import GROQ_API_KEY, MAX_QUIZ_QUESTIONS

class QuizService:
    def __init__(self):
        self.groq_client = None
        if GROQ_API_KEY:
            try:
                self.groq_client = Groq(api_key=GROQ_API_KEY)
            except ImportError:
                print("Warning: Groq package not installed. Install with: pip install groq")

    def generate_quiz_questions(self, transcript: str, num_questions: int = 5) -> list:
        """Generate multiple-choice quiz questions based on a transcript using Groq API"""
        if not GROQ_API_KEY or not self.groq_client:
            # Return mock questions if Groq API is not available
            return [
                {
                    "question": "What is the main topic of this mock transcript?",
                    "options": [
                        "Artificial Intelligence",
                        "Machine Learning",
                        "Data Science",
                        "Mock Data"
                    ],
                    "correct_answer": 3
                },
                {
                    "question": "This is a mock question because...",
                    "options": [
                        "The GROQ_API_KEY is not set",
                        "The transcript is too short",
                        "The system is in testing mode",
                        "All of the above"
                    ],
                    "correct_answer": 0
                }
            ]
        
        try:
            # Define the prompt for generating quiz questions
            prompt = f"""
            Create a quiz with {num_questions} multiple-choice questions based on the following transcript.
            
            Requirements:
            - Generate exactly {num_questions} questions (or fewer if the transcript is very short)
            - Each question should have 4 options (A, B, C, D)
            - Only one option should be correct
            - Questions should test understanding of key concepts from the transcript
            - Questions should vary in difficulty (some easy, some moderate, some challenging)
            - Include the correct answer index (0-based, where 0 is the first option)
            
            Format your response as a JSON array of objects, with each object having:
            - "question": The question text
            - "options": An array of 4 possible answers
            - "correct_answer": The index (0-3) of the correct answer
            
            Example format:
            [
              {{
                "question": "What is the main topic discussed in the lecture?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": 2
              }},
              ...more questions...
            ]
            
            Important: Your entire response should be valid JSON that can be parsed. Do not include any explanatory text outside the JSON array.
            
            Transcript:
            {transcript}
            """
            
            # Call Groq API to generate the questions
            response = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",  # Using newer Llama 3.3 70B model
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that creates educational quizzes. You always respond with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,  # Slightly higher temperature for creative questions
                max_tokens=2048,
                response_format={"type": "json_object"}  # Ensure JSON response
            )
            
            # Extract the quiz from the response
            quiz_text = response.choices[0].message.content
            
            # Parse JSON
            try:
                quiz_data = json.loads(quiz_text)
                # If the JSON is wrapped in an object, extract the questions array
                if isinstance(quiz_data, dict) and "questions" in quiz_data:
                    questions = quiz_data["questions"]
                # If it's directly an array
                elif isinstance(quiz_data, list):
                    questions = quiz_data
                else:
                    # Try to find any array in the response
                    for key, value in quiz_data.items():
                        if isinstance(value, list) and len(value) > 0:
                            questions = value
                            break
                    else:
                        # Fallback - couldn't find a valid array
                        raise ValueError("Could not extract questions array from response")
                    
                # Validate and clean up questions
                validated_questions = []
                for q in questions:
                    if "question" in q and "options" in q and "correct_answer" in q:
                        # Ensure correct_answer is an integer
                        if isinstance(q["correct_answer"], str) and q["correct_answer"].isdigit():
                            q["correct_answer"] = int(q["correct_answer"])
                        
                        # Ensure correct_answer is within valid range
                        if not isinstance(q["correct_answer"], int) or q["correct_answer"] < 0 or q["correct_answer"] >= len(q["options"]):
                            # Default to first option if invalid
                            q["correct_answer"] = 0
                            
                        validated_questions.append(q)
                
                return validated_questions
            except Exception as e:
                return [{"question": f"Error parsing quiz questions: {str(e)}",
                        "options": ["Error", "Try again", "Check logs", "Contact support"],
                        "correct_answer": 2}]
            
        except Exception as e:
            return [{"question": f"Error generating quiz: {str(e)}",
                    "options": ["Error", "Try again", "Check API key", "Contact support"],
                    "correct_answer": 2}] 