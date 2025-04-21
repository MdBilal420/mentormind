import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, Brain, Search } from "lucide-react";
import { useState } from "react";
import ConceptDetective from "./ConceptDetective";
import QuizTab from "./QuizTab";
import { Button } from "./ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "./ui/card";

export default function PracticeZoneTab({ data }) {
	const [selectedActivity, setSelectedActivity] = useState(null);

	const handleSelectActivity = (activity) => {
		setSelectedActivity(activity);
	};

	// Check if there's enough data to enable activities
	const hasEnoughData = () => {
		// Check if data exists and has the necessary properties
		// This is a placeholder - adjust based on your actual data structure
		return (
			data &&
			((data.questions && data.questions.length > 0) ||
				(data.transcription && data.transcription.length > 0))
		);
	};

	const renderEmptyState = () => {
		return (
			<div className='flex flex-col items-center justify-center h-full w-full max-w-4xl mx-auto p-6 text-center'>
				<div className='bg-card p-6 rounded-lg border border-border shadow-sm max-w-md'>
					<AlertCircle className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
					<h2 className='text-xl font-semibold mb-2'>No Content Available</h2>
					<p className='text-muted-foreground mb-4'>
						There isn't enough content to generate practice activities yet.
						Please add some learning materials or transcriptions first.
					</p>
				</div>
			</div>
		);
	};

	const renderActivityOptions = () => {
		return (
			<div className='flex flex-col items-center justify-center h-full w-full max-w-4xl mx-auto p-6'>
				<h1 className='text-3xl font-bold mb-4 text-center text-emerald-800'>
					Practice Zone
				</h1>
				<p className='text-lg text-muted-foreground mb-8 text-center'>
					Choose an activity to test your knowledge and enhance your learning
					experience
				</p>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-6 w-full'>
					<motion.div
						whileHover={{ scale: 1.03 }}
						whileTap={{ scale: 0.98 }}
						transition={{ type: "spring", stiffness: 400, damping: 17 }}
					>
						<Card
							className='h-full cursor-pointer hover:shadow-lg transition-shadow'
							onClick={() => handleSelectActivity("quiz")}
						>
							<CardHeader>
								<div className='flex items-center gap-2'>
									<Brain className='h-6 w-6 text-primary' />
									<CardTitle>Quiz</CardTitle>
								</div>
								<CardDescription>
									Test your knowledge with interactive questions
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p className='text-sm text-muted-foreground'>
									Challenge yourself with questions based on your learning
									materials. Get immediate feedback and explanations for each
									answer.
								</p>
							</CardContent>
							<CardFooter>
								<Button className='w-full bg-emerald-600 hover:bg-emerald-700'>
									Play Quiz
								</Button>
							</CardFooter>
						</Card>
					</motion.div>

					<motion.div
						whileHover={{ scale: 1.03 }}
						whileTap={{ scale: 0.98 }}
						transition={{ type: "spring", stiffness: 400, damping: 17 }}
					>
						<Card
							className='h-full cursor-pointer hover:shadow-lg transition-shadow'
							onClick={() => handleSelectActivity("conceptDetective")}
						>
							<CardHeader>
								<div className='flex items-center gap-2'>
									<Search className='h-6 w-6 text-primary' />
									<CardTitle>Concept Detective</CardTitle>
								</div>
								<CardDescription>
									Explore and discover key concepts in your learning materials
								</CardDescription>
							</CardHeader>
							<CardContent>
								<p className='text-sm text-muted-foreground'>
									Become a detective and search for important concepts in your
									learning materials. Enhance your understanding through
									interactive exploration.
								</p>
							</CardContent>
							<CardFooter>
								<Button className='w-full bg-emerald-600 hover:bg-emerald-700'>
									Play Concept Detective
								</Button>
							</CardFooter>
						</Card>
					</motion.div>
				</div>
			</div>
		);
	};

	// If there's no data, show the empty state
	if (!hasEnoughData()) {
		return renderEmptyState();
	}

	return (
		<div className='flex flex-col items-center justify-center h-full w-full'>
			{selectedActivity === null ? (
				renderActivityOptions()
			) : selectedActivity === "quiz" ? (
				<div className='w-full h-full'>
					<button
						onClick={() => setSelectedActivity(null)}
						className='flex items-center gap-1 px-4 py-2 rounded-md text-primary hover:bg-accent mb-4'
					>
						<ArrowLeft className='h-4 w-4' />
						<span>Back to Practice Zone</span>
					</button>
					<QuizTab data={data} />
				</div>
			) : (
				<div className='w-full h-full'>
					<button
						onClick={() => setSelectedActivity(null)}
						className='flex items-center gap-1 px-4 py-2 rounded-md text-primary hover:bg-accent mb-4'
					>
						<ArrowLeft className='h-4 w-4' />
						<span>Back to Practice Zone</span>
					</button>
					<ConceptDetective data={data} />
				</div>
			)}
		</div>
	);
}
