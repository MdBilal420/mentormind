import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import useQuiz from "@/hooks/useQuiz";
import { Sparkles } from "lucide-react";
import { Button } from "../ui/button";

const Quiz = ({ content }) => {
	const [
		{
			quiz,
			loading,
			error,
			currentQuestionIndex,
			userAnswer,
			score,
			isCompleted,
		},
		{ handleQuizStart, handleAnswer, setUserAnswer, resetQuiz },
	] = useQuiz(content);

	return (
		<Card className='flex-grow flex flex-col w-full sm:w-[240px] h-[540px] sm:h-[540px] mr-4'>
			<CardHeader>
				<CardTitle>Quiz</CardTitle>
				<CardDescription>Let's have some fun with these MCQs.</CardDescription>
			</CardHeader>
			<CardContent className='flex-grow flex flex-col overflow-y-auto'>
				{quiz.length === 0 && (
					<div className='flex justify-center items-center text-center text-gray-500'>
						<Button onClick={handleQuizStart} disabled={loading || !content}>
							<Sparkles className='h-4 w-4' />
							{loading ? "Generating..." : "Generate Quiz"}
						</Button>
						{isCompleted && (
							<Button onClick={resetQuiz} disabled={!isCompleted}>
								<Sparkles className='h-4 w-4' />
								Reset Quiz
							</Button>
						)}
					</div>
				)}

				{error && <div className='text-red-500'>{error}</div>}
				{quiz.length > 0 && (
					<div className='mb-4'>
						<h3 className='font-bold mb-2'>
							{quiz[currentQuestionIndex].question}
						</h3>
						{quiz[currentQuestionIndex].options.map((option, index) => (
							<div key={index} className='mb-2 flex items-center align-middle'>
								<input
									type='radio'
									name='answer'
									value={option}
									checked={userAnswer === option}
									onChange={(e) => setUserAnswer(e.target.value)}
									className='mr-2'
								/>
								<p className='text-sm'>{option}</p>
							</div>
						))}
						<Button
							variant='secondary'
							onClick={handleAnswer}
							disabled={!userAnswer}
							className='mt-4'
						>
							Next
						</Button>
					</div>
				)}
			</CardContent>
		</Card>
	);
};

export default Quiz;
