import {
	AlertCircle,
	CheckCircle,
	FileText,
	Loader2,
	Play,
	Upload,
	Youtube,
} from "lucide-react";
import { useState } from "react";
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
		name: "Introduction to Biology",
		description: "Basic concepts of biology",
		url: "/samples/intro-biology.pdf",
	},
	{
		id: 2,
		name: "Physics Fundamentals",
		description: "Core physics concepts explained",
		url: "/samples/physics.pdf",
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
			"Learn facts about the solar system’s genesis, plus its planets, moons, and asteroids.",
		url: "https://www.youtube.com/watch?v=libKVRa01L8",
		thumbnail: "https://img.youtube.com/vi/libKVRa01L8/mqdefault.jpg",
	},
];

export default function InputSidebar({
	onProcessContent,
	inputType,
	setInputType,
	error = null,
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

	console.log(inputType, "inputType", "audioFile", audioFile, "pdfFile");

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
			console.log("Sample file loaded:", file); // Debug log
		} catch (error) {
			console.error("Error loading sample file:", error);
			setLocalError("Failed to load sample file: " + error.message);
			setSelectedSampleId(null);
			setAudioFile(null);
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
		} catch (error) {
			console.error("Error loading sample PDF:", error);
			setLocalError("Failed to load sample PDF: " + error.message);
			setSelectedPDFSampleId(null);
			setPdfFile(null);
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
	};

	const handleFileUpload = (event, type) => {
		// Clear any previous errors
		setLocalError(null);

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
			} else if (type === "pdf") {
				setPdfFile(file);
			}
		}
	};

	const handleSubmit = async () => {
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

	// Modify the SampleFiles component to handle thumbnails
	const SampleFiles = ({ type, samples, onSelect, selectedId }) => (
		<div className='mt-6 border-t border-emerald-100 pt-4'>
			<h3 className='text-sm font-medium text-emerald-800 mb-3'>
				Sample {type} Files
			</h3>
			<div className='space-y-2'>
				{samples.map((sample) => (
					<button
						key={sample.id}
						onClick={() => onSelect(sample)}
						disabled={loadingSample}
						className={`w-full p-3 rounded-lg border transition-all flex items-start gap-3
							${
								selectedId === sample.id
									? "border-emerald-500 bg-emerald-50"
									: "border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50"
							}
							${loadingSample ? "opacity-50 cursor-not-allowed" : ""}
						`}
					>
						{type === "YouTube" ? (
							// YouTube thumbnail container
							<div className='relative flex-shrink-0 w-24 h-16 rounded-md overflow-hidden'>
								<img
									src={sample.thumbnail}
									alt={sample.name}
									className='object-cover w-full h-full'
								/>
								{loadingSample && selectedId === sample.id ? (
									<div className='absolute inset-0 bg-emerald-500/20 flex items-center justify-center'>
										<Loader2 className='h-5 w-5 text-emerald-500 animate-spin' />
									</div>
								) : (
									selectedId === sample.id && (
										<div className='absolute inset-0 bg-emerald-500/20 flex items-center justify-center'>
											<CheckCircle className='h-5 w-5 text-emerald-500' />
										</div>
									)
								)}
							</div>
						) : (
							// Icon for non-YouTube samples
							<>
								{loadingSample && selectedId === sample.id ? (
									<Loader2 className='h-5 w-5 text-emerald-500 animate-spin flex-shrink-0 mt-0.5' />
								) : selectedId === sample.id ? (
									<CheckCircle className='h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5' />
								) : type === "Audio" ? (
									<Play className='h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5' />
								) : (
									<FileText className='h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5' />
								)}
							</>
						)}
						<div className='text-left flex-1'>
							<p className='text-sm font-medium text-emerald-900'>
								{sample.name}
							</p>
							{sample.description && (
								<p className='text-xs text-emerald-600 mt-0.5'>
									{sample.description}
								</p>
							)}
						</div>
					</button>
				))}
			</div>
		</div>
	);

	return (
		<div className='flex-1 flex flex-col'>
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
				className='flex-1 flex flex-col'
			>
				<TabsList className='grid grid-cols-2 mb-4'>
					<TabsTrigger
						value='audio'
						className='flex items-center gap-1 text-xs'
					>
						<Upload className='h-3.5 w-3.5 md:h-4 md:w-4' />
						<span>Audio</span>
					</TabsTrigger>
					{/* <TabsTrigger value='pdf' className='flex items-center gap-1 text-xs'>
						<FileText className='h-3.5 w-3.5 md:h-4 md:w-4' />
						<span>PDF</span>
					</TabsTrigger> */}
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
								rounded-lg p-3 md:p-4 text-center h-40 md:h-56 lg:h-64 flex flex-col items-center 
								justify-center relative cursor-pointer hover:bg-emerald-50/50 transition-colors`}
							onClick={() => document.getElementById("audio-upload").click()}
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
								Upload Audio File
							</h3>
							<p
								className={`text-xs mt-1 ${
									localError ? "text-red-600" : "text-emerald-600"
								}`}
							>
								Click to upload (MP3, WAV, etc.)
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
						/>
					</TabsContent>

					<TabsContent value='pdf' className='h-full'>
						<div
							className='border-2 border-dashed border-emerald-200 rounded-lg p-3 md:p-4 text-center h-40 md:h-56 lg:h-64 flex flex-col items-center justify-center relative'
							onClick={() => document.getElementById("pdf-upload").click()}
						>
							<FileText className='h-8 w-8 md:h-10 md:w-10 text-emerald-400' />
							<h3 className='mt-2 text-emerald-800 font-medium text-sm'>
								Upload PDF File
							</h3>
							<p className='text-xs text-emerald-600 mt-1'>Click to upload</p>
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
								className='w-full text-sm'
								value={youtubeUrl}
								onChange={(e) => setYoutubeUrl(e.target.value)}
							/>
							<p className='text-xs text-emerald-600'>
								Enter the URL of a YouTube lecture or educational video
							</p>
						</div>

						<SampleFiles
							type='YouTube'
							samples={sampleYouTubeVideos}
							onSelect={handleSampleYouTubeSelect}
							selectedId={selectedYouTubeSampleId}
						/>
					</TabsContent>
				</div>
			</Tabs>

			{/* Show selected file info */}
			{audioFile && (
				<div className='mt-2 text-xs text-emerald-600'>
					Selected file: {audioFile.name} (
					{(audioFile.size / 1024 / 1024).toFixed(2)} MB)
				</div>
			)}

			<div className='mt-4 md:mt-6'>
				<Button
					onClick={handleSubmit}
					disabled={
						loading ||
						(inputType === "audio" && !audioFile) ||
						(inputType === "pdf" && !pdfFile) ||
						(inputType === "youtube" && !youtubeUrl) ||
						localError !== null
					}
					className='w-full bg-emerald-600 hover:bg-emerald-700'
				>
					{loading ? (
						<>
							<Loader2 className='mr-2 h-4 w-4 animate-spin' />
							Processing...
						</>
					) : (
						"Process Content"
					)}
				</Button>
			</div>
		</div>
	);
}
