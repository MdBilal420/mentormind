import {
	CheckCircle2,
	Cog,
	Cpu,
	FileSearch,
	Monitor,
	Settings,
} from "lucide-react";
import React, { useEffect, useState } from "react";

// Loading state component
const LoadingState = () => {
	const [currentStep, setCurrentStep] = useState(0);
	const [isTransitioning, setIsTransitioning] = useState(false);

	const steps = [
		{
			text: "Spinning up preview...",
			icon: Cpu,
			className: "animate-pulse",
		},
		{
			text: "Preparing your content...",
			icon: Cog,
			className: "animate-pulse",
		},
		{
			text: "Analyzing the material...",
			icon: FileSearch,
			className: "animate-bounce",
		},
		{
			text: "Monitoring progress...",
			icon: Monitor,
			className: "animate-pulse",
		},
		{
			text: "Almost there...",
			icon: CheckCircle2,
			className: "animate-pulse",
		},
		{
			text: "Getting things ready...",
			icon: Settings,
			className: "animate-spin",
		},
	];

	useEffect(() => {
		const interval = setInterval(() => {
			setIsTransitioning(true);

			setTimeout(() => {
				setCurrentStep((prev) => (prev + 1) % steps.length);
				setIsTransitioning(false);
			}, 400);
		}, 1000);

		return () => clearInterval(interval);
	}, [currentStep]);

	return (
		<div className='flex flex-col items-center justify-center h-full py-12'>
			<h1 className='text-4xl font-bold flex items-center  text-emerald-700 font-Raleway'>
				M
			</h1>
			<p className='text-sm gap-2 mb-4 text-emerald-700 font-Raleway'>
				MentorMind
			</p>
			<div className='space-y-4 relative w-[210px]'>
				{steps.map((step, idx) => {
					const isPast = idx < currentStep;
					const isCurrent = idx === currentStep;
					const isNext = idx === currentStep + 1;

					return (
						<div
							key={idx}
							className={`text-center transform transition-all duration-500 ease-in-out flex items-center gap-3 w-full
								${isPast ? "opacity-30" : ""}
								${isCurrent && isTransitioning ? "opacity-0" : ""}
								${isCurrent && !isTransitioning ? "opacity-100" : ""}
								${isNext && isTransitioning ? "opacity-100" : ""}
								${!isPast && !isCurrent && !isNext ? "opacity-30" : ""}
							`}
						>
							<div
								className={`${
									isPast || (!isCurrent && !isNext) ? "w-4 h-4" : "w-5 h-5"
								} 
									text-emerald-700 
									${isCurrent || isNext ? step.className : ""}`}
							>
								{React.createElement(step.icon)}
							</div>
							<p
								className={`text-emerald-700 ${
									isPast || (!isCurrent && !isNext)
										? "text-sm"
										: "text-base font-medium"
								}`}
							>
								{step.text}
							</p>
						</div>
					);
				})}
			</div>
		</div>
	);
};

export default LoadingState;
