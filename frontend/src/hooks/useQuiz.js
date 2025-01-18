import { useState } from "react";

const useQuiz = () => {
  const [quiz, setQuiz] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateQuiz = async (content) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:8000/generate_quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: content }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate quiz");
      }

      const data = await response.json();
      //   console.log(data, "DATA", response);
      setQuiz(data.questions);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState(null);
  const [score, setScore] = useState(0);

  const handleAnswer = () => {
    const selectedOption = quiz[currentQuestionIndex].options.findIndex(
      (option) => option === userAnswer
    );
    const opt =
      selectedOption === 0
        ? "a"
        : selectedOption === 1
        ? "b"
        : selectedOption === 2
        ? "c"
        : "d";
    if (opt === quiz[currentQuestionIndex].correct_answer) {
      setScore(score + 1);
    }
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer(null);
    } else {
      alert(`Quiz finished! Your score: ${score + 1}/${quiz.length}`);
      resetQuiz();
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswer(null);
  };

  const handleQuizStart = () => {
    generateQuiz(content);
  };

  return [
    {
      quiz,
      loading,
      error,
      currentQuestionIndex,
      userAnswer,
      score,
    },
    {
      handleQuizStart,
      handleAnswer,
    },
  ];
};

export default useQuiz;
