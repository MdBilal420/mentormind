import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function LoadingSteps({ currentStep }) {
	const steps = [
		{ id: 1, title: "Processing Content" },
		{ id: 2, title: "Analyzing Material" },
		{ id: 3, title: "Generating Results" },
	];

	return (
		<div className='space-y-4 max-w-md mx-auto'>
			{steps.map((step, index) => {
				const isActive = index === currentStep;
				const isCompleted = index < currentStep;

				return (
					<motion.div
						key={step.id}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.2 }}
						className={`flex items-center gap-3 p-3 rounded-lg ${
							isActive ? "bg-emerald-50/50" : "bg-white/50"
						}`}
					>
						<div className='flex-shrink-0'>
							{isCompleted ? (
								<CheckCircle2 className='w-5 h-5 text-emerald-500' />
							) : isActive ? (
								<Loader2 className='w-5 h-5 text-emerald-500 animate-spin' />
							) : (
								<div className='w-5 h-5 rounded-full border-2 border-gray-300' />
							)}
						</div>
						<span
							className={`text-sm ${
								isActive
									? "text-emerald-700 font-medium"
									: isCompleted
									? "text-emerald-600"
									: "text-gray-500"
							}`}
						>
							{step.title}
						</span>
					</motion.div>
				);
			})}
		</div>
	);
}
