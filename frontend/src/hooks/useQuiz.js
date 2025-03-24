import { useEffect, useState } from "react";

const useQuiz = (content) => {
	const [quiz, setQuiz] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [userAnswer, setUserAnswer] = useState(null);

	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [score, setScore] = useState(0);
	const [isCompleted, setIsCompleted] = useState(false);

	useEffect(() => {
		if (content) {
			resetQuiz();
			setQuiz([]);
		}
	}, [content]);

	const generateQuiz = async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/generate_quiz`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ content: content }),
				}
			);

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
			setIsCompleted(true);
			const percentage = Math.round(((score + 1) / quiz.length) * 100);
			alert(`Quiz finished! Your score: ${percentage}%`);
			resetQuiz();
			setQuiz([]);
		}
	};

	const resetQuiz = () => {
		setCurrentQuestionIndex(0);
		setScore(0);
		setUserAnswer(null);
		setIsCompleted(false);
	};

	const handleQuizStart = () => {
		setIsCompleted(false);
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
			isCompleted,
		},
		{
			handleQuizStart,
			handleAnswer,
			setUserAnswer,
			resetQuiz,
		},
	];
};

export default useQuiz;
