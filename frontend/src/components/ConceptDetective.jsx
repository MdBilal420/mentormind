import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowLeft,
	ArrowRight,
	CheckCircle2,
	ChevronDown,
	ChevronUp,
	Lightbulb,
	RefreshCw,
	Search,
	Trophy,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import LoadingSteps from "./LoadingSteps";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Textarea } from "./ui/textarea";

export default function ConceptDetective({ data }) {
	const [currentLevel, setCurrentLevel] = useState(0);
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [userAnswers, setUserAnswers] = useState({});
	const [showResults, setShowResults] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [expandedQuestions, setExpandedQuestions] = useState({});
	const [loadingStep, setLoadingStep] = useState(0);
	const [gameData, setGameData] = useState(null);
	const [detectiveRank, setDetectiveRank] = useState("Rookie Detective");
	const [totalScore, setTotalScore] = useState(0);
	const [maxPossibleScore, setMaxPossibleScore] = useState(0);
	const [feedback, setFeedback] = useState({});
	const gameDataGeneratedRef = useRef(false);

	console.log("DATA", data);

	// Update the useEffect to simulate loading steps
	useEffect(() => {
		if (data.loading) {
			setLoadingStep(0);
			const timer1 = setTimeout(() => setLoadingStep(1), 1000);
			const timer2 = setTimeout(() => setLoadingStep(2), 2000);

			return () => {
				clearTimeout(timer1);
				clearTimeout(timer2);
			};
		}
	}, [data.loading]);

	// Initialize game data when component mounts
	useEffect(() => {
		if (
			data &&
			data.transcription &&
			!gameData &&
			!gameDataGeneratedRef.current
		) {
			gameDataGeneratedRef.current = true;
			generateGameData();
		}
	}, [data, gameData]);

	// Generate game data using the transcript
	const generateGameData = async () => {
		setIsSubmitting(true);
		try {
			// Call the backend API to generate game data
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/generate-concept-detective`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						transcript: data.transcription,
					}),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to generate game data");
			}

			const result = await response.json();

			if (!result.success) {
				throw new Error(result.error || "Failed to generate game data");
			}

			setGameData({
				analogy: result.analogy,
				description: result.description,
				levels: result.levels,
			});

			// Calculate max possible score
			const maxScore = result.levels.reduce((total, level) => {
				return total + level.questions.length * 4; // 4 points per question
			}, 0);
			setMaxPossibleScore(maxScore);
		} catch (error) {
			console.error("Error generating game data:", error);
			// Fallback to simulated data if API fails
			const simulatedGameData = {
				analogy: "Baking a Cake",
				description:
					"Understanding complex concepts is like baking a cake. You need the right ingredients (key concepts), follow the recipe (logical flow), and bake at the right temperature (depth of understanding).",
				levels: [
					{
						title: "Level 1: Gathering Ingredients",
						story:
							"Imagine you're baking a cake. The first step is gathering all the ingredients. In our topic, these are the fundamental concepts that form the foundation.",
						questions: [
							{
								text: "What are the 'main ingredients' (key concepts) mentioned in the transcript?",
								type: "open-ended",
							},
							{
								text: "How does the transcript describe the relationship between these concepts?",
								type: "open-ended",
							},
							{
								text: "What would happen if one of these 'ingredients' was missing?",
								type: "open-ended",
							},
						],
					},
					{
						title: "Level 2: Following the Recipe",
						story:
							"Now that you have your ingredients, you need to follow the recipe. This represents the logical flow and structure of the concepts in the transcript.",
						questions: [
							{
								text: "What is the 'recipe' (logical flow) described in the transcript?",
								type: "open-ended",
							},
							{
								text: "What happens if you skip a step in this 'recipe'?",
								type: "open-ended",
							},
							{
								text: "How does the transcript explain the importance of each step?",
								type: "open-ended",
							},
							{
								text: "What would be the result if the 'recipe' was followed in a different order?",
								type: "open-ended",
							},
						],
					},
					{
						title: "Level 3: Baking at the Right Temperature",
						story:
							"The final step is baking at the right temperature. This represents the depth of understanding and application of the concepts.",
						questions: [
							{
								text: "What examples or applications does the transcript provide?",
								type: "open-ended",
							},
							{
								text: "How can these concepts be applied in a real-world scenario?",
								type: "open-ended",
							},
							{
								text: "What would happen if these concepts were applied incorrectly?",
								type: "open-ended",
							},
							{
								text: "How does the transcript suggest measuring success in applying these concepts?",
								type: "open-ended",
							},
							{
								text: "What advanced applications or extensions of these concepts are mentioned?",
								type: "open-ended",
							},
						],
					},
				],
			};

			setGameData(simulatedGameData);

			// Calculate max possible score
			const maxScore = simulatedGameData.levels.reduce((total, level) => {
				return total + level.questions.length * 4; // 4 points per question
			}, 0);
			setMaxPossibleScore(maxScore);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Toggle expanded state for a question in results view
	const toggleExpandQuestion = (idx) => {
		setExpandedQuestions((prev) => ({
			...prev,
			[idx]: !prev[idx],
		}));
	};

	// Handle answer input for the current level
	const handleAnswerChange = (questionIndex, value) => {
		setUserAnswers((prev) => ({
			...prev,
			[`${currentLevel}-${questionIndex}`]: value,
		}));
	};

	// Handle moving to the next question
	const handleNextQuestion = () => {
		if (
			currentQuestionIndex <
			gameData.levels[currentLevel].questions.length - 1
		) {
			setCurrentQuestionIndex(currentQuestionIndex + 1);
		}
	};

	// Handle moving to the previous question
	const handlePrevQuestion = () => {
		if (currentQuestionIndex > 0) {
			setCurrentQuestionIndex(currentQuestionIndex - 1);
		}
	};

	// Handle moving to the next level
	const handleNextLevel = () => {
		if (currentLevel < gameData.levels.length - 1) {
			setCurrentLevel(currentLevel + 1);
			setCurrentQuestionIndex(0);
			setShowResults(false);
		}
	};

	// Handle moving to the previous level
	const handlePrevLevel = () => {
		if (currentLevel > 0) {
			setCurrentLevel(currentLevel - 1);
			setShowResults(false);
		}
	};

	// Handle submitting answers for the current level
	const handleSubmitLevel = async () => {
		setIsSubmitting(true);
		try {
			const evaluation = await evaluateAnswers(currentLevel);

			// Calculate level score from individual scores
			const levelScore = Object.values(evaluation.scores).reduce(
				(sum, score) => sum + score,
				0
			);

			// Update total score
			setTotalScore((prev) => prev + levelScore);

			// Update feedback for each question
			Object.entries(evaluation.feedback).forEach(([key, value]) => {
				setFeedback((prev) => ({
					...prev,
					[key]: value,
				}));
			});

			// Update detective rank based on new total score
			updateDetectiveRank(totalScore + levelScore);

			setShowResults(true);
		} catch (error) {
			console.error("Error submitting answers:", error);
			alert("Failed to evaluate answers. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	// Evaluate answers for a level (simulated)
	const evaluateAnswers = async (levelIndex) => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/evaluate-concept-detective`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						transcript: data.transcription,
						answers: gameData.levels[levelIndex].questions.map(
							(_, questionIndex) => ({
								levelIndex,
								questionIndex,
								answer: userAnswers[`${levelIndex}-${questionIndex}`] || "",
							})
						),
					}),
				}
			);

			if (!response.ok) {
				throw new Error("Failed to evaluate answers");
			}

			const result = await response.json();
			if (!result.success) {
				throw new Error(result.error || "Failed to evaluate answers");
			}

			return result;
		} catch (error) {
			console.error("Error evaluating answers:", error);
			// Fallback to simple evaluation based on answer length
			const level = gameData.levels[levelIndex];
			const scores = {};
			const feedback = {};

			level.questions.forEach((_, questionIndex) => {
				const answerKey = `${levelIndex}-${questionIndex}`;
				const userAnswer = userAnswers[answerKey] || "";
				const score = Math.min(4, Math.floor(userAnswer.length / 50));
				scores[answerKey] = score;
				feedback[answerKey] = `Score: ${score}/4 - ${getFeedbackForScore(
					score
				)}`;
			});

			return {
				success: true,
				scores,
				feedback,
				error: null,
			};
		}
	};

	const getFeedbackForScore = (score) => {
		switch (score) {
			case 0:
				return "Try to provide more detailed answers that directly address the question.";
			case 1:
			case 2:
				return "Good start! Try to include more examples and explain your reasoning.";
			case 3:
				return "Very good! Your answer demonstrates strong understanding with minor areas for improvement.";
			case 4:
				return "Excellent! Your answer shows complete understanding of the concept.";
			default:
				return "Please provide a more detailed answer.";
		}
	};

	// Update detective rank based on score
	const updateDetectiveRank = (score) => {
		const percentage = (score / maxPossibleScore) * 100;

		if (percentage >= 90) {
			setDetectiveRank("Master Detective");
		} else if (percentage >= 75) {
			setDetectiveRank("Senior Detective");
		} else if (percentage >= 60) {
			setDetectiveRank("Detective");
		} else if (percentage >= 40) {
			setDetectiveRank("Junior Detective");
		} else {
			setDetectiveRank("Rookie Detective");
		}
	};

	// Reset the game
	const handleResetGame = () => {
		setCurrentLevel(0);
		setCurrentQuestionIndex(0);
		setUserAnswers({});
		setShowResults(false);
		setTotalScore(0);
		setDetectiveRank("Rookie Detective");
		generateGameData();
	};

	// Get feedback for an answer (simulated)
	const getAnswerFeedback = (levelIndex, questionIndex) => {
		const answerKey = `${levelIndex}-${questionIndex}`;
		const userAnswer = userAnswers[answerKey] || "";

		// In a real implementation, this would come from the API
		// For now, we'll provide generic feedback based on answer length
		if (userAnswer.length > 100) {
			return {
				score: 4,
				feedback:
					"Excellent! You've demonstrated a deep understanding of this concept.",
			};
		} else if (userAnswer.length > 50) {
			return {
				score: 3,
				feedback:
					"Good job! You've captured the main points, but could add more detail.",
			};
		} else if (userAnswer.length > 20) {
			return {
				score: 2,
				feedback:
					"You're on the right track, but missed some key aspects of the concept.",
			};
		} else if (userAnswer.length > 0) {
			return {
				score: 1,
				feedback:
					"You've started to understand the concept, but need to explore it further.",
			};
		} else {
			return {
				score: 0,
				feedback:
					"This question wasn't answered. Try to explain your understanding of the concept.",
			};
		}
	};

	// Get level score
	const getLevelScore = (levelIndex) => {
		let score = 0;
		const level = gameData.levels[levelIndex];

		level.questions.forEach((_, questionIndex) => {
			const feedback = getAnswerFeedback(levelIndex, questionIndex);
			score += feedback.score;
		});

		return score;
	};

	// Get level max score
	const getLevelMaxScore = (levelIndex) => {
		return gameData.levels[levelIndex].questions.length * 4;
	};

	// Loading state
	if (data.loading || !gameData) {
		return (
			<div className='flex flex-col items-center justify-center p-8 space-y-4'>
				<LoadingSteps currentStep={loadingStep} />
				<p className='text-center text-muted-foreground'>
					{loadingStep === 0
						? "Preparing your detective mission..."
						: loadingStep === 1
						? "Creating an engaging analogy..."
						: "Preparing your detective mission..."}
				</p>
			</div>
		);
	}

	return (
		<div className='flex flex-col space-y-6 h-[600px] overflow-y-auto p-4'>
			{/* Game Header */}
			<div className='flex flex-col space-y-2'>
				<div className='flex items-center justify-between'>
					<h2 className='text-2xl font-bold'>Concept Detective</h2>
					<div className='flex items-center space-x-2'>
						<Search className='h-5 w-5 text-primary' />
						<span className='font-medium'>{detectiveRank}</span>
					</div>
				</div>
				<p className='text-muted-foreground'>{gameData.description}</p>
			</div>

			{/* Progress Bar */}
			<div className='space-y-2'>
				<div className='flex justify-between text-sm'>
					<span>Progress</span>
					<span>
						Level {currentLevel + 1} of {gameData.levels.length}
					</span>
				</div>
				<Progress
					value={(currentLevel / gameData.levels.length) * 100}
					className='h-2'
				/>
			</div>

			{/* Current Level */}
			<div className='rounded-lg border p-4 space-y-4'>
				<h3 className='text-xl font-semibold'>
					{gameData.levels[currentLevel].title}
				</h3>
				<p className='text-muted-foreground'>
					{gameData.levels[currentLevel].story}
				</p>

				{/* Questions */}
				<div className='space-y-6 '>
					{gameData.levels[currentLevel].questions.map(
						(question, questionIndex) => (
							<div key={questionIndex} className='space-y-2'>
								<div className='flex items-start space-x-2'>
									<Lightbulb className='h-5 w-5 text-yellow-500 mt-1' />
									<div className='flex-1'>
										<p className='font-medium'>{question.text}</p>
										{!showResults ? (
											<>
												{currentQuestionIndex === questionIndex ? (
													<div className='space-y-3'>
														<div className='relative group'>
															<Textarea
																placeholder='Share your thoughts here...'
																value={
																	userAnswers[
																		`${currentLevel}-${questionIndex}`
																	] || ""
																}
																onChange={(e) =>
																	handleAnswerChange(
																		questionIndex,
																		e.target.value
																	)
																}
																className='min-h-[100px] w-full p-3 bg-background/50 
																	backdrop-blur-sm border rounded-lg
																	shadow-sm transition-all duration-200
																	focus:border-primary focus:ring-2 focus:ring-primary/20 
																	placeholder:text-muted-foreground/60
																	hover:border-primary/50 text-sm'
																rows={3}
															/>
															<div className='absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200'>
																<Lightbulb className='h-4 w-4 text-yellow-500/80' />
															</div>
														</div>
														<div className='flex justify-between gap-3'>
															<Button
																variant='outline'
																onClick={handlePrevQuestion}
																disabled={currentQuestionIndex === 0}
																className='h-9 px-4 bg-background/50 backdrop-blur-sm
																	hover:bg-primary/10 hover:border-primary/50 transition-all duration-200
																	disabled:opacity-50 disabled:hover:bg-background/50 text-sm
																	border-primary/20 text-primary/80'
															>
																<ArrowLeft className='mr-2 h-4 w-4' />
																Previous Question
															</Button>
															<Button
																variant='outline'
																onClick={handleNextQuestion}
																disabled={
																	currentQuestionIndex ===
																	gameData.levels[currentLevel].questions
																		.length -
																		1
																}
																className='h-9 px-4 bg-background/50 backdrop-blur-sm
																	hover:bg-primary/10 hover:border-primary/50 transition-all duration-200
																	disabled:opacity-50 disabled:hover:bg-background/50 text-sm
																	border-primary/20 text-primary/80'
															>
																Next Question
																<ArrowRight className='ml-2 h-4 w-4' />
															</Button>
														</div>
													</div>
												) : (
													<div
														className='p-3 bg-muted/30 backdrop-blur-sm rounded-lg 
														border border-muted-foreground/20 hover:bg-muted/40 
														transition-colors duration-200'
													>
														{userAnswers[`${currentLevel}-${questionIndex}`] ? (
															<p className='text-sm leading-relaxed'>
																{userAnswers[`${currentLevel}-${questionIndex}`]
																	.length > 100
																	? userAnswers[
																			`${currentLevel}-${questionIndex}`
																	  ].substring(0, 100) + "..."
																	: userAnswers[
																			`${currentLevel}-${questionIndex}`
																	  ]}
															</p>
														) : (
															<p className='text-sm text-muted-foreground italic'>
																No answer provided yet
															</p>
														)}
													</div>
												)}
											</>
										) : (
											<div className='mt-2'>
												<div
													className='flex items-center justify-between cursor-pointer'
													onClick={() => toggleExpandQuestion(questionIndex)}
												>
													<span className='text-sm font-semibold text-primary/90 flex items-center gap-2'>
														<CheckCircle2 className='h-4 w-4' />
														Your Answer
													</span>
													{expandedQuestions[questionIndex] ? (
														<ChevronUp className='h-4 w-4 text-primary/70' />
													) : (
														<ChevronDown className='h-4 w-4 text-primary/70' />
													)}
												</div>
												<AnimatePresence>
													{expandedQuestions[questionIndex] && (
														<motion.div
															initial={{ height: 0, opacity: 0 }}
															animate={{ height: "auto", opacity: 1 }}
															exit={{ height: 0, opacity: 0 }}
															transition={{ duration: 0.2 }}
															className='overflow-hidden'
														>
															<div className='p-3 bg-muted/50 backdrop-blur-sm rounded-md mt-2 text-sm border border-primary/10'>
																{userAnswers[
																	`${currentLevel}-${questionIndex}`
																] || "No answer provided."}
															</div>
														</motion.div>
													)}
												</AnimatePresence>

												{/* Feedback */}
												<div className='mt-2'>
													<div
														className='flex items-center justify-between cursor-pointer'
														onClick={() =>
															toggleExpandQuestion(`feedback-${questionIndex}`)
														}
													>
														<span className='text-sm font-semibold text-primary/90 flex items-center gap-2'>
															<Lightbulb className='h-4 w-4' />
															Feedback
														</span>
														{expandedQuestions[`feedback-${questionIndex}`] ? (
															<ChevronUp className='h-4 w-4 text-primary/70' />
														) : (
															<ChevronDown className='h-4 w-4 text-primary/70' />
														)}
													</div>
													<AnimatePresence>
														{expandedQuestions[`feedback-${questionIndex}`] && (
															<motion.div
																initial={{ height: 0, opacity: 0 }}
																animate={{ height: "auto", opacity: 1 }}
																exit={{ height: 0, opacity: 0 }}
																transition={{ duration: 0.2 }}
																className='overflow-hidden'
															>
																<div className='p-3 bg-muted/50 backdrop-blur-sm rounded-md mt-2 text-sm border border-primary/10'>
																	{feedback[
																		`${currentLevel}-${questionIndex}`
																	] || "No feedback available."}
																</div>
															</motion.div>
														)}
													</AnimatePresence>
												</div>
											</div>
										)}
									</div>
								</div>
							</div>
						)
					)}
				</div>

				{/* Level Actions */}
				<div className='flex flex-col space-y-4 pt-4'>
					<div className='flex justify-between items-center gap-3'>
						<Button
							variant='outline'
							onClick={handlePrevLevel}
							disabled={currentLevel === 0}
							className='h-9 px-4 bg-background/50 backdrop-blur-sm
								hover:bg-primary/10 hover:border-primary/50 transition-all duration-200
								disabled:opacity-50 disabled:hover:bg-background/50 text-sm
								border-primary/20 text-primary/80'
						>
							<ArrowLeft className='mr-2 h-4 w-4' />
							Previous Level
						</Button>

						{!showResults ? (
							<Button
								onClick={handleSubmitLevel}
								disabled={
									isSubmitting ||
									!gameData.levels[currentLevel].questions.every((_, idx) =>
										userAnswers[`${currentLevel}-${idx}`]?.trim()
									)
								}
								className='h-9 px-4 bg-primary/90 hover:bg-primary 
									shadow-sm transition-all duration-200
									disabled:opacity-50 disabled:hover:bg-primary/90 text-sm
									text-primary-foreground'
							>
								{isSubmitting ? (
									<>
										<RefreshCw className='mr-2 h-4 w-4 animate-spin' />
										Evaluating...
									</>
								) : (
									<>
										<CheckCircle2 className='mr-2 h-4 w-4' />
										Submit Answers
									</>
								)}
							</Button>
						) : (
							<Button
								onClick={handleNextLevel}
								disabled={currentLevel === gameData.levels.length - 1}
								className='h-9 px-4 bg-primary/90 hover:bg-primary 
									shadow-sm transition-all duration-200
									disabled:opacity-50 disabled:hover:bg-primary/90 text-sm
									text-primary-foreground'
							>
								Next Level
								<ArrowRight className='ml-2 h-4 w-4' />
							</Button>
						)}
					</div>
				</div>
			</div>

			{/* Results */}
			{showResults && (
				<div className='rounded-lg border p-4 space-y-4'>
					<div className='flex items-center justify-between'>
						<h3 className='text-xl font-semibold'>Level Results</h3>
						<div className='flex items-center space-x-2'>
							<Trophy className='h-5 w-5 text-yellow-500' />
							<span className='font-medium'>
								{getLevelScore(currentLevel)} / {getLevelMaxScore(currentLevel)}{" "}
								Points
							</span>
						</div>
					</div>

					<div className='space-y-2'>
						<div className='flex justify-between text-sm'>
							<span>Overall Progress</span>
							<span>
								{totalScore} / {maxPossibleScore} Points
							</span>
						</div>
						<Progress
							value={(totalScore / maxPossibleScore) * 100}
							className='h-2'
						/>
					</div>

					<div className='pt-2'>
						{currentLevel === gameData.levels.length - 1 ? (
							<div className='text-center space-y-4'>
								<h3 className='text-xl font-semibold'>
									Congratulations, {detectiveRank}!
								</h3>
								<p>
									You've completed all levels of the Concept Detective game.
								</p>
								<Button onClick={handleResetGame}>
									<RefreshCw className='mr-2 h-4 w-4' />
									Play Again
								</Button>
							</div>
						) : (
							<p className='text-center text-muted-foreground'>
								{getLevelScore(currentLevel) >=
								getLevelMaxScore(currentLevel) * 0.7
									? "Great job! You're ready to move on to the next level."
									: "You might want to review this level before moving on."}
							</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
