import { motion } from "framer-motion";
import {
	BookOpen,
	ClipboardCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import LoadingSteps from "./LoadingSteps";
import SummaryView from "./SummaryView.jsx";
import EvaluateNotes from "./EvaluateNotes.jsx";

export default function SummaryTab({ data }) {
	const [loadingStep, setLoadingStep] = useState(0);
	const [activeView, setActiveView] = useState(null); // null, 'summary', or 'evaluate'

	// change loading step every 5 seconds and stay on 3 after 30 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			setLoadingStep((prev) => (prev + 1) % 3);
		}, 5000);
		return () => clearInterval(interval);
	}, []);

	if (data.loading) {
		return (
			<div className='flex flex-col items-center justify-center h-full'>
				<LoadingSteps currentStep={loadingStep} />
				<p className='text-emerald-600 text-sm mt-6'>
					Generating comprehensive summary...
				</p>
			</div>
		);
	}

	// If a view is active, show that view
	if (activeView === 'summary') {
		return <SummaryView data={data} onBack={() => setActiveView(null)} />;
	}

	if (activeView === 'evaluate') {
		return <EvaluateNotes 
			onBack={() => setActiveView(null)} 
			transcription={data.transcription}
		/>;
	}

	// Show the two cards
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='h-full p-4 flex items-center justify-center'
		>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full'>
				{/* View Summary Card */}
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className='bg-white/70 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer'
					onClick={() => setActiveView('summary')}
				>
					<div className='flex flex-col items-center text-center'>
						<div className='w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3'>
							<BookOpen className='h-6 w-6 text-emerald-600' />
						</div>
						<h3 className='text-lg font-semibold text-emerald-800 mb-2'>
							View Summary
						</h3>
						<p className='text-sm text-emerald-600'>
							Review the comprehensive summary of your lecture content
						</p>
					</div>
				</motion.div>

				{/* Evaluate Notes Card */}
				<motion.div
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className='bg-white/70 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer'
					onClick={() => setActiveView('evaluate')}
				>
					<div className='flex flex-col items-center text-center'>
						<div className='w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3'>
							<ClipboardCheck className='h-6 w-6 text-emerald-600' />
						</div>
						<h3 className='text-lg font-semibold text-emerald-800 mb-2'>
							Extract Text from Notes
						</h3>
						<p className='text-sm text-emerald-600'>
							Upload handwritten notes and convert them to digital text
						</p>
					</div>
				</motion.div>
			</div>
		</motion.div>
	);
}
