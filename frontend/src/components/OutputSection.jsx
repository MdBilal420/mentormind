import { BookOpen, Brain, FileText, MessageCircle, Mic } from "lucide-react";
import { useEffect } from "react";
import AskTutorTab from "./AskTutorTab";
import QuizTab from "./QuizTab";
import SummaryTab from "./SummaryTab";
import TalkToTutorMode from "./TalkToTutorMode";
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
	topic,
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
					Learning Suite
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
									<FileText className='w-4 h-4 mr-2' />
									Transcription
								</TabsTrigger>
							)}
							<TabsTrigger
								value='summary'
								className='flex-1 text-xs md:text-sm whitespace-nowrap'
							>
								<BookOpen className='w-4 h-4 mr-2' />
								Smart Notes
							</TabsTrigger>
							<TabsTrigger
								value='quiz'
								className='flex-1 text-xs md:text-sm whitespace-nowrap'
							>
								<Brain className='w-4 h-4 mr-2' />
								Practice Zone
							</TabsTrigger>
							<TabsTrigger
								value='ask'
								className='flex-1 text-xs md:text-sm whitespace-nowrap'
							>
								<MessageCircle className='w-4 h-4 mr-2' />
								Ask MentorMind
							</TabsTrigger>
							<TabsTrigger
								value='talk'
								className='flex-1 text-xs md:text-sm whitespace-nowrap'
							>
								<Mic className='w-4 h-4 mr-2' />
								Talk to Tutor
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>

			<div className='flex-1 bg-white/30 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-3 md:p-6 border border-white/40'>
				<h4 className='text-lg md:text-xl font-semibold text-emerald-800 mb-4'>
					{topic.replace(/\.pdf|\.mp3$/, "")}
				</h4>
				<Tabs
					value={activeTab}
					onValueChange={setActiveTab}
					className='h-full flex flex-col'
				>
					<div className='sr-only'>
						<TabsList>
							{inputType !== "pdf" && (
								<TabsTrigger value='transcription'>
									<FileText className='w-4 h-4 mr-2' />
									Transcription
								</TabsTrigger>
							)}
							<TabsTrigger value='summary'>
								<BookOpen className='w-4 h-4 mr-2' />
								Smart Notes
							</TabsTrigger>
							<TabsTrigger value='quiz'>
								<Brain className='w-4 h-4 mr-2' />
								Practice Zone
							</TabsTrigger>
							<TabsTrigger value='ask'>
								<MessageCircle className='w-4 h-4 mr-2' />
								Ask MentorMind
							</TabsTrigger>
							<TabsTrigger value='talk'>
								<Mic className='w-4 h-4 mr-2' />
								Talk to Tutor
							</TabsTrigger>
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

						<TabsContent value='talk' className='h-full'>
							<TalkToTutorMode
								data={data}
								topic={topic.replace(/\.pdf|\.mp3$/, "")}
							/>
						</TabsContent>
					</div>
				</Tabs>
			</div>
		</div>
	);
}
