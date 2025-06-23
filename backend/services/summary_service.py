from groq import Groq
from config.settings import GROQ_API_KEY

class SummaryService:
    def __init__(self):
        self.groq_client = None
        if GROQ_API_KEY:
            try:
                self.groq_client = Groq(api_key=GROQ_API_KEY)
            except ImportError:
                print("Warning: Groq package not installed. Install with: pip install groq")

    def generate_bullet_summary(self, transcript: str) -> str:
        """Generate a bullet-point summary of a transcript using Groq API"""
        if not GROQ_API_KEY or not self.groq_client:
            # Return mock summary if Groq API is not available
            return """
            • This is a mock summary for development purposes.
            • Please set the GROQ_API_KEY environment variable for actual summary generation.
            • The real summary would extract key points from the transcript.
            • It would be organized as a bullet-point list for easy reading.
            """
            
        try:
            # Define the prompt for generating bullet point summaries
            prompt = f"""
            Create a concise and well-organized bullet point summary for the provided transcript.

            - Identify key points and important details from the transcript.
            - Summarize information in clear and concise bullet points.
            - Ensure that the bullet points capture the essence of the conversation or content.
            - Organize the bullets logically to maintain the flow of information.

            # Steps

            1. Read through the transcript to understand the main topics and key details.
            2. Identify and note down significant points, arguments, or data.
            3. Summarize these points into clear, concise bullet points.
            4. Ensure logical flow and organization of bullet points.
            5. Review the bullet points to ensure they are representative of the transcript's content.

            # Output Format

            1. Use markdown headers (#) for main sections
            2. Use bullet points (*) for key points
            3. Organize content into clear sections
            4. Include:
               - Main topics/themes
               - Key points and arguments
               - Important details and examples
               - Conclusions or takeaways

            # Examples

            ## Example Input
            [Transcript of a conversation or presentation.]

            ## Example Output
            - Introduction of the main topic
            - Key argument 1: [Summary of the argument]
            - Key argument 2: [Summary of the argument]
            - Closing remarks: [Summary of conclusions]
            (Note: In a realistic example, more detailed key points should be included.) 

            # Notes

            - Focus on clarity and brevity.
            - Avoid redundant information.
            
            Transcript:
            {transcript}
            """
            
            # Call Groq API to generate the summary
            response = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",  # Using newer Llama 3.3 70B model
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that creates concise, well-organized bullet point summaries."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,  # Lower temperature for more focused responses
                max_tokens=1024
            )
            
            # Extract the summary from the response
            summary = response.choices[0].message.content
            return summary
        except Exception as e:
            return f"Error generating summary: {str(e)}" 