import { useEffect } from "react";
import AskTutorTab from "./AskTutorTab";
import QuizTab from "./QuizTab";
import SummaryTab from "./SummaryTab";
import TranscriptionTab from "./TranscriptionTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

// Helper function to format time in MM:SS format
const formatTime = (seconds) => {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins.toString().padStart(2, "0")}:${secs
		.toString()
		.padStart(2, "0")}`;
};

export default function OutputSection({
	data,
	activeTab,
	setActiveTab,
	onRetry,
	chatMessages,
	setChatMessages,
	inputType,
}) {
	// If we're switching away from transcription tab and input is PDF, go to summary
	useEffect(() => {
		if (inputType === "pdf" && activeTab === "transcription") {
			setActiveTab("summary");
		}
	}, [inputType, activeTab, setActiveTab]);

	return (
		<div className='h-full flex flex-col'>
			<div className='mb-4'>
				<h2 className='text-xl md:text-2xl font-semibold text-emerald-800 mb-4'>
					Lecture Analysis
				</h2>

				<div className='w-full overflow-x-auto pb-2'>
					<Tabs
						defaultValue={activeTab}
						value={activeTab}
						onValueChange={setActiveTab}
					>
						<TabsList className='w-full'>
							{inputType !== "pdf" && (
								<TabsTrigger
									value='transcription'
									className='flex-1 text-xs md:text-sm whitespace-nowrap'
								>
									Transcription
								</TabsTrigger>
							)}
							<TabsTrigger
								value='summary'
								className='flex-1 text-xs md:text-sm whitespace-nowrap'
							>
								Summary
							</TabsTrigger>
							<TabsTrigger
								value='quiz'
								className='flex-1 text-xs md:text-sm whitespace-nowrap'
							>
								Test Knowledge
							</TabsTrigger>
							<TabsTrigger
								value='ask'
								className='flex-1 text-xs md:text-sm whitespace-nowrap'
							>
								Ask Tutor
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>

			<div className='flex-1 bg-white/30 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-3 md:p-6 border border-white/40'>
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className='h-full flex flex-col'
				>
					<div className='sr-only'>
						<TabsList>
							{inputType !== "pdf" && (
								<TabsTrigger value='transcription'>Transcription</TabsTrigger>
							)}
							<TabsTrigger value='summary'>Summary</TabsTrigger>
							<TabsTrigger value='quiz'>Test Knowledge</TabsTrigger>
							<TabsTrigger value='ask'>Ask Tutor</TabsTrigger>
						</TabsList>
					</div>

					<div className='flex-1'>
						{inputType !== "pdf" && (
							<TabsContent value='transcription' className='h-full'>
								<TranscriptionTab data={data} onRetry={onRetry} />
							</TabsContent>
						)}

						<TabsContent value='summary' className='h-full'>
							<SummaryTab data={data} />
						</TabsContent>

						<TabsContent value='quiz' className='h-full'>
							<QuizTab data={data} />
						</TabsContent>

						<TabsContent value='ask' className='h-full'>
							<AskTutorTab
								data={data}
								messages={chatMessages}
								setMessages={setChatMessages}
							/>
						</TabsContent>
					</div>
				</Tabs>
			</div>
		</div>
	);
}
