import { FileText, Loader2, Upload, Youtube } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function InputSidebar({
	onProcessContent,
	inputType,
	setInputType,
}) {
	const [audioFile, setAudioFile] = useState(null);
	const [pdfFile, setPdfFile] = useState(null);
	const [youtubeUrl, setYoutubeUrl] = useState("");
	const [loading, setLoading] = useState(false);

	const handleFileUpload = (event, type) => {
		const file = event.target.files[0];
		if (file) {
			if (type === "audio") {
				setAudioFile(file);
			} else if (type === "pdf") {
				setPdfFile(file);
			}
		}
	};

	const handleSubmit = async () => {
		setLoading(true);

		// Create data object based on input type
		let data = {};

		if (inputType === "audio") {
			data = { type: "audio", file: audioFile };
		} else if (inputType === "pdf") {
			data = { type: "pdf", file: pdfFile };
		} else if (inputType === "youtube") {
			data = { type: "youtube", url: youtubeUrl };
		}

		await onProcessContent(data);
		setLoading(false);
	};

	return (
		<div className='flex-1 flex flex-col'>
			<h2 className='text-lg font-semibold text-emerald-800 mb-4'>
				Upload Content
			</h2>

			<Tabs
				defaultValue='audio'
				value={inputType}
				onValueChange={setInputType}
				className='flex-1 flex flex-col'
			>
				<TabsList className='grid grid-cols-3 mb-4'>
					<TabsTrigger
						value='audio'
						className='flex items-center gap-1 text-xs'
					>
						<Upload className='h-3.5 w-3.5 md:h-4 md:w-4' />
						<span>Audio</span>
					</TabsTrigger>
					<TabsTrigger value='pdf' className='flex items-center gap-1 text-xs'>
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
							className='border-2 border-dashed border-emerald-200 rounded-lg p-3 md:p-4 text-center h-40 md:h-56 lg:h-64 flex flex-col items-center justify-center relative'
							onClick={() => document.getElementById("audio-upload").click()}
						>
							<Upload className='h-8 w-8 md:h-10 md:w-10 text-emerald-400' />
							<h3 className='mt-2 text-emerald-800 font-medium text-sm'>
								Upload Audio File
							</h3>
							<p className='text-xs text-emerald-600 mt-1'>Click to upload</p>
							<input
								id='audio-upload'
								type='file'
								accept='audio/*'
								className='hidden'
								onChange={(e) => handleFileUpload(e, "audio")}
							/>
							{audioFile && (
								<div className='mt-4 text-xs text-emerald-700 truncate max-w-full px-2'>
									Selected: {audioFile.name}
								</div>
							)}
						</div>
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
					</TabsContent>
				</div>
			</Tabs>

			<div className='mt-4 md:mt-6'>
				<Button
					onClick={handleSubmit}
					disabled={
						loading ||
						(inputType === "audio" && !audioFile) ||
						(inputType === "pdf" && !pdfFile) ||
						(inputType === "youtube" && !youtubeUrl)
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
