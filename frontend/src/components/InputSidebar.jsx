import {
	AlertCircle,
	FileText,
	Loader2,
	LogIn,
	Upload,
	Youtube,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import SampleFiles from "./SampleFiles";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

// Sample audio files data
const sampleAudioFiles = [
	{
		id: 1,
		name: "What is Photosynthesis",
		description: "Learn about the process of photosynthesis",
		url: "/samples/track1.mp3",
	},
	{
		id: 2,
		name: "What is Quantum Computing",
		description: "",
		url: "/samples/track2.mp3",
	},
];

// Add new sample data for PDFs
const samplePDFFiles = [
	{
		id: 1,
		name: "Network Effects of Tariffs",
		description: "A study on the network effects of tariffs",
		url: "/samples/doc1.pdf",
	},
	{
		id: 2,
		name: "The Water Cycle",
		description: "A guide to the water cycle",
		url: "/samples/doc3.pdf",
	},
];

// Update the YouTube samples data to include thumbnails
const sampleYouTubeVideos = [
	{
		id: 1,
		name: "What is DNA?",
		description: "Learn about DNA structure and function",
		url: "https://www.youtube.com/watch?v=S9aWBbVypeU",
		thumbnail: "https://img.youtube.com/vi/S9aWBbVypeU/mqdefault.jpg",
	},
	{
		id: 2,
		name: "Solar System 101",
		description:
			"Learn facts about the solar system's genesis, plus its planets, moons, and asteroids.",
		url: "https://www.youtube.com/watch?v=libKVRa01L8",
		thumbnail: "https://img.youtube.com/vi/libKVRa01L8/mqdefault.jpg",
	},
];

export default function InputSidebar({
	onProcessContent,
	inputType,
	setInputType,
	error = null,
	setTopic,
	setOutputData,
}) {
	const [audioFile, setAudioFile] = useState(null);
	const [pdfFile, setPdfFile] = useState(null);
	const [youtubeUrl, setYoutubeUrl] = useState(
		"https://www.youtube.com/watch?v=lt4OsgmUTGI"
	);
	const [loading, setLoading] = useState(false);
	const [localError, setLocalError] = useState(null);
	const [selectedSampleId, setSelectedSampleId] = useState(null);
	const [loadingSample, setLoadingSample] = useState(false);
	const [selectedPDFSampleId, setSelectedPDFSampleId] = useState(null);
	const [selectedYouTubeSampleId, setSelectedYouTubeSampleId] = useState(null);

	// Get auth context
	const { user, isTestAccount } = useAuth();
	const router = useRouter();

	const handleSampleSelect = async (sample) => {
		try {
			setLoadingSample(true);
			setLocalError(null);
			setSelectedSampleId(sample.id);

			// Fetch the actual audio file
			const response = await fetch(sample.url);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			// Get the audio file as a blob
			const audioBlob = await response.blob();

			// Create a proper File object with the actual audio content
			const file = new File([audioBlob], `${sample.name}.mp3`, {
				type: "audio/mpeg",
				lastModified: new Date().getTime(),
			});

			// Verify the file has content
			if (file.size === 0) {
				throw new Error("File is empty");
			}

			setAudioFile(file);
			setTopic(file.name);
			console.log("Sample file loaded:", file); // Debug log
		} catch (error) {
			console.error("Error loading sample file:", error);
			setLocalError("Failed to load sample file: " + error.message);
			setSelectedSampleId(null);
			setAudioFile(null);
			setTopic("");
		} finally {
			setLoadingSample(false);
		}
	};

	const handleSamplePDFSelect = async (sample) => {
		try {
			setLoadingSample(true);
			setLocalError(null);
			setSelectedPDFSampleId(sample.id);

			const response = await fetch(sample.url);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const pdfBlob = await response.blob();
			const file = new File([pdfBlob], `${sample.name}.pdf`, {
				type: "application/pdf",
				lastModified: new Date().getTime(),
			});

			if (file.size === 0) {
				throw new Error("File is empty");
			}

			setPdfFile(file);
			setTopic(file.name);
		} catch (error) {
			console.error("Error loading sample PDF:", error);
			setLocalError("Failed to load sample PDF: " + error.message);
			setSelectedPDFSampleId(null);
			setPdfFile(null);
			setTopic("");
		} finally {
			setLoadingSample(false);
		}
	};

	// Add a helper function to extract video ID from YouTube URL
	const getYouTubeVideoId = (url) => {
		const regExp =
			/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
		const match = url.match(regExp);
		return match && match[2].length === 11 ? match[2] : null;
	};

	// Update handleSampleYouTubeSelect to include video ID extraction
	const handleSampleYouTubeSelect = (sample) => {
		setSelectedYouTubeSampleId(sample.id);
		setYoutubeUrl(sample.url);

		// You could also update the sample data with the actual thumbnail URL
		const videoId = getYouTubeVideoId(sample.url);
		if (videoId) {
			sample.thumbnail = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
		}
		setTopic(sample.name);
	};

	const handleFileUpload = (event, type) => {
		// Check if user is signed in and not a test account
		if (!user) {
			setLocalError("Please sign in to upload content");
			return;
		}

		if (isTestAccount) {
			setLocalError(
				"Test accounts can only access sample files. Please sign in with your email to upload content."
			);
			return;
		}

		// Clear any previous errors
		setLocalError(null);
		setSelectedSampleId(null);
		setSelectedPDFSampleId(null);
		setSelectedYouTubeSampleId(null);
		setYoutubeUrl("");
		setTopic("");
		setOutputData({
			transcription: "",
			sentences: [],
			summary: "",
			questions: [],
			audioUrl: "",
			loading: false,
			error: null,
		});

		const file = event.target.files[0];
		if (file) {
			// Validate file type
			if (type === "audio" && !file.type.startsWith("audio/")) {
				setLocalError("Please select a valid audio file");
				return;
			}

			if (type === "pdf" && file.type !== "application/pdf") {
				setLocalError("Please select a valid PDF file");
				return;
			}

			// Validate file size (e.g., limit to 100MB)
			if (file.size > 100 * 1024 * 1024) {
				setLocalError("File size exceeds 100MB limit");
				return;
			}

			if (type === "audio") {
				setAudioFile(file);
				setTopic(file.name);
			} else if (type === "pdf") {
				setPdfFile(file);
				setTopic(file.name);
			}
		}
	};

	const handleSubmit = async () => {
		// Check if user is signed in and not a test account
		if (!user) {
			setLocalError("Please sign in to process content");
			return;
		}

		setLoading(true);
		setLocalError(null);

		try {
			let result;
			if (inputType === "audio" && audioFile) {
				result = { type: "audio", file: audioFile };
			} else if (inputType === "pdf" && pdfFile) {
				result = { type: "pdf", file: pdfFile };
			} else if (inputType === "youtube" && youtubeUrl) {
				// Simple validation for YouTube URL
				if (
					!youtubeUrl.includes("youtube.com/") &&
					!youtubeUrl.includes("youtu.be/")
				) {
					throw new Error("Please enter a valid YouTube URL");
				}
				result = { type: "youtube", url: youtubeUrl };
			}

			// Pass the results to the parent component
			if (result) {
				await onProcessContent(result);
			}
		} catch (error) {
			console.error("Error in input processing:", error);
			setLocalError(
				error.message || "An error occurred while processing your request"
			);
		} finally {
			setLoading(false);
		}
	};

	// Function to handle sign in redirect
	const handleSignIn = () => {
		router.push("/login");
	};

	return (
		<div className='flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden'>
			<div className='flex-none'>
				<h2 className='text-lg font-semibold text-emerald-800 mb-4'>
					Upload Content
				</h2>

				{/* Display error message if any */}
				{(localError || error) && (
					<div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2'>
						<AlertCircle className='h-4 w-4 text-red-500 mt-0.5 flex-shrink-0' />
						<p className='text-xs text-red-600'>{localError || error}</p>
					</div>
				)}

				{/* Sign in prompt for non-authenticated users */}
				{!user && (
					<div className='mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex flex-col items-center text-center'>
						<LogIn className='h-6 w-6 text-emerald-500 mb-2' />
						<h3 className='text-sm font-medium text-emerald-800 mb-1'>
							Sign in to upload content
						</h3>
						<p className='text-xs text-emerald-600 mb-3'>
							Create an account or sign in to upload and process your own
							content
						</p>
						<Button
							onClick={handleSignIn}
							className='bg-emerald-600 hover:bg-emerald-700 text-white text-xs'
						>
							Sign In
						</Button>
					</div>
				)}

				{/* Test account notice */}
				{isTestAccount && (
					<div className='mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg flex flex-col items-center text-center'>
						<AlertCircle className='h-6 w-6 text-amber-500 mb-2' />
						<h3 className='text-sm font-medium text-amber-800 mb-1'>
							Test Account Limitations
						</h3>
						<p className='text-xs text-amber-600 mb-3'>
							You are using a test account. You can only access sample files.
							Sign in with your email to upload your own content.
						</p>
						<Button
							onClick={handleSignIn}
							className='bg-amber-600 hover:bg-amber-700 text-white text-xs'
						>
							Sign In
						</Button>
					</div>
				)}
			</div>

			<div className='flex-1 overflow-y-auto'>
				<Tabs
					defaultValue='audio'
					value={inputType}
					onValueChange={(value) => {
						setInputType(value);
						setLocalError(null);
						setSelectedSampleId(null);
						setSelectedPDFSampleId(null);
						setSelectedYouTubeSampleId(null);
						setAudioFile(null);
						setPdfFile(null);
						setYoutubeUrl("");
					}}
					className='h-full flex flex-col'
				>
					<TabsList className='grid grid-cols-3 mb-4'>
						<TabsTrigger
							value='audio'
							className='flex items-center gap-1 text-xs'
						>
							<Upload className='h-3.5 w-3.5 md:h-4 md:w-4' />
							<span>Audio</span>
						</TabsTrigger>
						<TabsTrigger
							value='pdf'
							className='flex items-center gap-1 text-xs'
						>
							<FileText className='h-3.5 w-3.5 md:h-4 md:w-4' />
							<span>PDF</span>
						</TabsTrigger>
						<TabsTrigger
							value='youtube'
							className='flex items-center gap-1 text-xs'
						>
							<Youtube className='h-3.5 w-3.5 md:h-4 md:w-4' />
							<span>YouTube</span>
						</TabsTrigger>
					</TabsList>

					<div className='flex-1'>
						<TabsContent value='audio' className='h-full'>
							<div
								className={`border-2 border-dashed ${
									localError ? "border-red-300" : "border-emerald-200"
								} 
									rounded-lg p-3 md:p-4 text-center h-25 md:h-25 lg:h-25 flex flex-col items-center 
									justify-center relative cursor-pointer hover:bg-emerald-50/50 transition-colors ${
										!user || isTestAccount
											? "opacity-50 cursor-not-allowed"
											: ""
									}`}
								onClick={() => {
									if (!user) {
										setLocalError("Please sign in to upload content");
										return;
									}
									if (isTestAccount) {
										setLocalError("Test accounts can only access sample files");
										return;
									}
									document.getElementById("audio-upload").click();
								}}
							>
								<Upload
									className={`h-8 w-8 md:h-10 md:w-10 ${
										localError ? "text-red-400" : "text-emerald-400"
									}`}
								/>
								<h3
									className={`mt-2 font-medium text-sm ${
										localError ? "text-red-800" : "text-emerald-800"
									}`}
								>
									{!user
										? "Sign in to upload"
										: isTestAccount
										? "Test accounts can only use samples"
										: "Upload Audio File"}
								</h3>
								<p
									className={`text-xs mt-1 ${
										localError ? "text-red-600" : "text-emerald-600"
									}`}
								>
									{!user
										? "Create an account to upload your own content"
										: isTestAccount
										? "Please sign in with your email"
										: "Click to upload (MP3, WAV, etc.)"}
								</p>
								<input
									id='audio-upload'
									type='file'
									accept='audio/*'
									className='hidden'
									onChange={(e) => handleFileUpload(e, "audio")}
								/>
								{audioFile && !localError && (
									<div className='mt-4 text-xs text-emerald-700 truncate max-w-full px-2'>
										Selected: {audioFile.name}
									</div>
								)}
							</div>

							{/* Add the sample files section only in audio tab */}
							<SampleFiles
								type='Audio'
								samples={sampleAudioFiles}
								onSelect={handleSampleSelect}
								selectedId={selectedSampleId}
								loadingSample={loadingSample}
							/>
						</TabsContent>

						<TabsContent value='pdf' className='h-full'>
							<div
								className={`border-2 border-dashed ${
									localError ? "border-red-300" : "border-emerald-200"
								} 
									rounded-lg p-3 md:p-4 text-center h-25 md:h-25 lg:h-25 flex flex-col items-center 
									justify-center relative cursor-pointer hover:bg-emerald-50/50 transition-colors ${
										!user || isTestAccount
											? "opacity-50 cursor-not-allowed"
											: ""
									}`}
								onClick={() => {
									if (!user) {
										setLocalError("Please sign in to upload content");
										return;
									}
									if (isTestAccount) {
										setLocalError("Test accounts can only access sample files");
										return;
									}
									document.getElementById("pdf-upload").click();
								}}
							>
								<FileText className='h-8 w-8 md:h-10 md:w-10 text-emerald-400' />
								<h3 className='mt-2 text-emerald-800 font-medium text-sm'>
									{!user
										? "Sign in to upload"
										: isTestAccount
										? "Test accounts can only use samples"
										: "Upload PDF File"}
								</h3>
								<p className='text-xs text-emerald-600 mt-1'>
									{!user
										? "Create an account to upload your own content"
										: isTestAccount
										? "Please sign in with your email"
										: "Click to upload"}
								</p>
								<input
									id='pdf-upload'
									type='file'
									accept='.pdf'
									className='hidden'
									onChange={(e) => handleFileUpload(e, "pdf")}
								/>
								{pdfFile && (
									<div className='mt-4 text-xs text-emerald-700 truncate max-w-full px-2'>
										Selected: {pdfFile.name}
									</div>
								)}
							</div>

							<SampleFiles
								type='PDF'
								samples={samplePDFFiles}
								onSelect={handleSamplePDFSelect}
								selectedId={selectedPDFSampleId}
								loadingSample={loadingSample}
							/>
						</TabsContent>

						<TabsContent value='youtube' className='h-full'>
							<div className='space-y-3 mt-2 md:mt-4'>
								<label className='block text-xs font-medium text-emerald-700'>
									YouTube URL
								</label>
								<Input
									type='url'
									placeholder='https://www.youtube.com/watch?v=...'
									className={`w-full text-sm ${
										!user || isTestAccount
											? "opacity-50 cursor-not-allowed"
											: ""
									}`}
									value={youtubeUrl}
									onChange={(e) => {
										if (!user) {
											setLocalError("Please sign in to enter a YouTube URL");
											return;
										}
										if (isTestAccount) {
											setLocalError(
												"Test accounts can only access sample files"
											);
											return;
										}
										setYoutubeUrl(e.target.value);
									}}
									disabled={!user || isTestAccount}
								/>
								<p className='text-xs text-emerald-600'>
									{!user
										? "Sign in to enter a YouTube URL"
										: isTestAccount
										? "Test accounts can only use sample videos"
										: "Enter the URL of a YouTube lecture or educational video"}
								</p>
							</div>

							<SampleFiles
								type='YouTube'
								samples={sampleYouTubeVideos}
								onSelect={handleSampleYouTubeSelect}
								selectedId={selectedYouTubeSampleId}
								loadingSample={loadingSample}
							/>
						</TabsContent>
					</div>
				</Tabs>
			</div>

			{/* Show selected file info */}
			{audioFile && (
				<div className='mt-2 text-xs text-emerald-600 flex-none'>
					Selected file: {audioFile.name} (
					{(audioFile.size / 1024 / 1024).toFixed(2)} MB)
				</div>
			)}

			<div className='mt-4 md:mt-6 flex-none'>
				<Button
					onClick={handleSubmit}
					disabled={
						loading ||
						(!user &&
							!selectedSampleId &&
							!selectedPDFSampleId &&
							!selectedYouTubeSampleId) ||
						(isTestAccount &&
							!selectedSampleId &&
							!selectedPDFSampleId &&
							!selectedYouTubeSampleId) ||
						(inputType === "audio" && !audioFile && !selectedSampleId) ||
						(inputType === "pdf" && !pdfFile && !selectedPDFSampleId) ||
						(inputType === "youtube" &&
							!youtubeUrl &&
							!selectedYouTubeSampleId) ||
						localError !== null
					}
					className='w-full bg-emerald-600 hover:bg-emerald-700'
				>
					{loading ? (
						<>
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							Processing...
						</>
					) : !user &&
					  !selectedSampleId &&
					  !selectedPDFSampleId &&
					  !selectedYouTubeSampleId ? (
						"Sign in to process content"
					) : isTestAccount &&
					  !selectedSampleId &&
					  !selectedPDFSampleId &&
					  !selectedYouTubeSampleId ? (
						"Test accounts can only use samples"
					) : (
						"Process Content"
					)}
				</Button>
			</div>
		</div>
	);
}
