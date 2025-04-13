MentorMind is an AI-powered assistant that transcribes lectures, generates structured notes, and creates quizzes to improve the online learning experience. 
It efficiently converts audio recordings and YouTube videos into comprehensive lecture notes and formulates quizzes to assess students' understanding.

## 🌟 Features

- **Audio Transcription**: Upload audio recordings and get accurate transcriptions with timestamps
- **YouTube Processing**: Generate transcripts and educational content from YouTube videos
- **AI-Generated Summaries**: Create concise, bullet-point summaries of lectures
- **Interactive Quizzes**: Test knowledge with automatically generated multiple-choice questions
- **Ask Tutor**: Get answers to questions about lecture content using Consversational AI Agent

## 🛠️ Technologies Used

### Backend
- [FastAPI](https://fastapi.tiangolo.com/) - High-performance Python web framework
- [Deepgram](https://deepgram.com/) - AI-powered speech recognition
- [Groq](https://groq.com/) - Ultra-fast LLM inference API
- [LLama 3.3](https://ai.meta.com/llama/) - Open-source large language model
- [Python](https://www.python.org/) - Programming language

### Frontend
- [Next.js](https://nextjs.org/) - React framework for production
- [React](https://reactjs.org/) - JavaScript library for building user interfaces
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library for React

## 📋 Installation

### Prerequisites
- Node.js (v18 or newer)
- Python (v3.9 or newer)
- API keys for Deepgram and Groq

### Backend Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/MentorMind.git
   cd MentorMind
   ```

2. Set up the Python virtual environment
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows, use: venv\Scripts\activate
   ```

3. Install dependencies
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory
   ```
   DEEPGRAM_API_KEY=your_deepgram_api_key
   GROQ_API_KEY=your_groq_api_key
   ```

5. Start the backend server
   ```bash
   uvicorn app:app --reload
   ```

### Frontend Setup

1. Navigate to the frontend directory
   ```bash
   cd ../frontend
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```


## 🚀 Usage

1. **Upload Content**:
   - Upload an audio file (MP3, WAV, etc.)
   - Upload a PDF document
   - Provide a YouTube URL

2. **View Transcription**:
   - See the full transcription with timestamps
   - Click on timestamps to jump to that part in the audio
   - Listen to the audio with the integrated player

3. **Read Summary**:
   - View an AI-generated bullet-point summary
   - Download the summary as text or PDF
   - Copy the summary to clipboard

4. **Test Knowledge**:
   - Take a quiz based on the lecture content
   - Get immediate feedback on your answers
   - View explanations for incorrect answers

5. **Ask Tutor**:
   - Ask questions about the lecture content
   - Get AI-generated answers based on the transcript

## 📂 Project Structure

```
MentorMind/
├── backend/
│   ├── app.py              # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── uploads/            # Temporary storage for uploads
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── app/            # Next.js app router
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── utils/          # Helper functions
│   ├── package.json        # Node.js dependencies
│   └── tailwind.config.js  # Tailwind CSS configuration
└── README.md               # Project documentation
```


## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Deepgram](https://deepgram.com/) for speech recognition technology
- [Groq](https://groq.com/) for fast LLM inference
- [Meta AI](https://ai.meta.com/) for the LLama 3.3 models
- All the open-source libraries that made this project possible
