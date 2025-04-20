"use client";

//import { ElevenLabsClient } from "elevenlabs";
import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { useTranscription } from "../hooks/useTranscription";
import InputSidebar from "./InputSidebar";
import OutputSection from "./OutputSection";

export default function Dashboard() {
	// const client = new ElevenLabsClient({
	// 	apiKey: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
	// });

	const [activeTab, setActiveTab] = useState("transcription");
	const [outputData, setOutputData] = useState({
		transcription: "",
		sentences: [],
		summary: "",
		questions: [],
		audioUrl: "",
		loading: false,
		error: null,
	});
	const [inputType, setInputType] = useState("audio");
	const [sidebarOpen, setSidebarOpen] = useState(true);
	const [knowledgeBase, setKnowledgeBase] = useState([]);
	const {
		transcriptionData,
		processAudioFile,
		processPDF,
		clearTranscription,
		retryTranscription,
	} = useTranscription();
	const [chatMessages, setChatMessages] = useState([]);
	const [showUploadIndicator, setShowUploadIndicator] = useState(false);

	const [topic, setTopic] = useState("");

	// Close sidebar by default on mobile
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768) {
				setSidebarOpen(false);
				// Show upload indicator after a short delay on mobile
				setTimeout(() => setShowUploadIndicator(true), 1000);
			} else {
				setSidebarOpen(true);
				setShowUploadIndicator(false);
			}
		};

		// Initial check
		handleResize();

		// Listen for window resize
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Show upload indicator when sidebar is closed on mobile
	useEffect(() => {
		if (!sidebarOpen && window.innerWidth < 768) {
			// Show indicator after a short delay when sidebar is closed
			const timer = setTimeout(() => setShowUploadIndicator(true), 500);
			return () => clearTimeout(timer);
		} else {
			setShowUploadIndicator(false);
		}
	}, [sidebarOpen]);

	// When transcription data changes, update output data
	useEffect(() => {
		setOutputData((prev) => ({
			...prev,
			transcription: transcriptionData.transcription,
			sentences: transcriptionData.sentences,
			audioUrl: transcriptionData.audioUrl,
			loading: transcriptionData.loading,
			error: transcriptionData.error,
		}));
	}, [transcriptionData]);

	const handleProcessContent = async (data) => {
		// Close sidebar on mobile after processing
		if (window.innerWidth < 768) {
			setSidebarOpen(false);
		}

		try {
			// Set loading state
			setOutputData((prev) => ({ ...prev, loading: true, error: null }));

			// Handle the processed data from InputSidebar
			if (data.type === "audio") {
				// Process audio file and get transcription
				const result = await processAudioFile(data.file);

				// If successful, generate summary and quiz
				if (result) {
					// Call backend to generate summary
					const summaryResponse = await fetch(
						`${process.env.NEXT_PUBLIC_API_URL}/api/generate-summary`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								transcript: result.transcription,
							}),
						}
					);

					let summary = "";
					if (summaryResponse.ok) {
						const summaryData = await summaryResponse.json();
						summary = summaryData.success
							? summaryData.summary
							: "Failed to generate summary";
					}

					// Call backend to generate quiz questions
					const quizResponse = await fetch(
						`${process.env.NEXT_PUBLIC_API_URL}/api/generate-quiz`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								transcript: result.transcription,
								num_questions: 5, // Request 5 questions
							}),
						}
					);

					let questions = [];
					if (quizResponse.ok) {
						const quizData = await quizResponse.json();
						questions = quizData.success ? quizData.questions : [];
					}

					// Update output data with all information
					setOutputData((prev) => ({
						...prev,
						summary,
						questions,
						loading: false,
					}));
				}
			} else if (data.type === "pdf") {
				const formData = new FormData();
				formData.append("file", data.file);

				// Make the API call
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/process-pdf`,
					{
						method: "POST",
						body: formData, // Send as FormData
					}
				);

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.detail || "Failed to process PDF");
				}

				const result = await response.json();

				let summary = "";
				let questions = [];
				let transcription = "";
				if (result.success) {
					summary = result.summary;
					questions = result.questions;
					transcription = result.transcript;
				}
				setOutputData((prev) => ({
					...prev,
					summary: summary,
					questions: questions,
					transcription: transcription,
					loading: false,
				}));
			} else if (data.type === "youtube") {
				// Handle YouTube URL
				const youtubeResponse = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/youtube-transcribe`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							youtube_url: data.url,
						}),
					}
				);

				if (!youtubeResponse.ok) {
					const errorData = await youtubeResponse.json();
					throw new Error(
						errorData.detail || "Failed to fetch YouTube transcription"
					);
				}

				const youtubeData = await youtubeResponse.json();

				// If successful, generate summary and quiz from the transcription
				if (youtubeData.success) {
					// Update transcription data with just the transcription text
					setOutputData((prev) => ({
						...prev,
						transcription: youtubeData.transcription,
						sentences: [], // No sentences/timestamps for YouTube
						videoTitle: youtubeData.video_title,
						loading: true, // Still loading until summary and quiz are done
					}));

					// Call backend to generate summary
					const summaryResponse = await fetch(
						`${process.env.NEXT_PUBLIC_API_URL}/api/generate-summary`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								transcript: youtubeData.transcription,
							}),
						}
					);

					let summary = "";
					if (summaryResponse.ok) {
						const summaryData = await summaryResponse.json();
						summary = summaryData.success
							? summaryData.summary
							: "Failed to generate summary";
					}

					// Call backend to generate quiz questions
					const quizResponse = await fetch(
						`${process.env.NEXT_PUBLIC_API_URL}/api/generate-quiz`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							body: JSON.stringify({
								transcript: youtubeData.transcription,
								num_questions: 5, // Request 5 questions
							}),
						}
					);

					let questions = [];
					if (quizResponse.ok) {
						const quizData = await quizResponse.json();
						questions = quizData.success ? quizData.questions : [];
					}

					// Update output data with all information
					setOutputData((prev) => ({
						...prev,
						summary,
						questions,
						loading: false,
					}));
				}
			}
		} catch (error) {
			console.error("Error processing content:", error);
			setOutputData((prev) => ({
				...prev,
				loading: false,
				error: error.message || "An unexpected error occurred",
			}));
		}
	};

	const handleRetry = async () => {
		try {
			setActiveTab("transcription"); // Switch to transcription tab
			await retryTranscription();
		} catch (error) {
			console.error("Error retrying transcription:", error);
		}
	};

	// useEffect(() => {
	// 	const a = async () => {
	// 		const response = await client.conversationalAi.getKnowledgeBaseList();
	// 		const documents = response.documents.map((document) => ({
	// 			id: document.id,
	// 			name: document.name.replace(".pdf", "").replace(".mp3", ""),
	// 		}));
	// 		setKnowledgeBase(documents);
	// 	};
	// 	a();
	// }, []);

	// console.log(knowledgeBase);

	return (
		<div className='min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col md:flex-row'>
			{/* Sidebar for Inputs */}
			<div
				className={`
				${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} 
				transition-transform duration-300 ease-in-out
				md:w-72 lg:w-80 bg-white/30 backdrop-blur-lg border-r border-white/40 
				fixed md:static top-0 left-0 h-full z-20 md:z-0
				p-4 flex flex-col
				w-3/4 sm:w-64
			`}
			>
				<InputSidebar
					onProcessContent={handleProcessContent}
					inputType={inputType}
					setInputType={setInputType}
					error={outputData.error}
					setTopic={setTopic}
					setOutputData={setOutputData}
				/>
			</div>

			{/* Overlay for mobile */}
			{sidebarOpen && (
				<div
					className='md:hidden fixed inset-0 bg-black bg-opacity-50 z-10'
					onClick={() => setSidebarOpen(false)}
				></div>
			)}

			{/* Upload Indicator for Mobile */}
			{!sidebarOpen && showUploadIndicator && (
				<div className='md:hidden fixed bottom-6 right-3 z-30 animate-bounce'>
					<button
						onClick={() => setSidebarOpen(true)}
						className='bg-emerald-600 text-white p-3 rounded-full shadow-lg'
					>
						<Upload size={20} />
					</button>
				</div>
			)}

			{/* Main Content for Output */}
			<div className='flex-1 p-4 md:p-6 pt-4 overflow-auto'>
				<OutputSection
					data={outputData}
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					onRetry={handleRetry}
					chatMessages={chatMessages}
					setChatMessages={setChatMessages}
					inputType={inputType}
					topic={topic}
				/>
			</div>

			<Toaster
				position='top-right'
				toastOptions={{
					duration: 3000,
					className: "rounded-md shadow-md",
				}}
			/>
		</div>
	);
}
