"use client";

import { FileText, Loader2, Upload, Youtube } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function InputSection({
	onProcessContent,
	inputType,
	setInputType,
}) {
	const [audioFile, setAudioFile] = useState(null);
	const [pdfFile, setPdfFile] = useState(null);
	const [youtubeUrl, setYoutubeUrl] = useState("");
	const [loading, setLoading] = useState(false);

	console.log(inputType, "inputType", "audioFile", audioFile, "pdfFile");
	const handleSubmit = async () => {
		setLoading(true);

		// Create data object based on input type
		let data = {};

		if (inputType === "audio") {
			data = { type: "audio", file: audioFile };
			console.log(data);
		} else if (inputType === "pdf") {
			data = { type: "pdf", file: pdfFile };
		} else if (inputType === "youtube") {
			data = { type: "youtube", url: youtubeUrl };
		}

		await onProcessContent(data);
		setLoading(false);
	};

	return (
		<div>
			<h2 className='text-2xl font-semibold text-emerald-800 mb-4'>Input</h2>

			<Tabs
				defaultValue='audio'
				value={inputType}
				onValueChange={setInputType}
				className='w-full'
			>
				<TabsList className='grid grid-cols-3 mb-6'>
					<TabsTrigger value='audio' className='flex items-center gap-2'>
						<Upload size={16} />
						<span>Audio</span>
					</TabsTrigger>
					<TabsTrigger value='pdf' className='flex items-center gap-2'>
						<FileText size={16} />
						<span>PDF</span>
					</TabsTrigger>
					<TabsTrigger value='youtube' className='flex items-center gap-2'>
						<Youtube size={16} />
						<span>YouTube</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value='audio' className='space-y-4'>
					<div className='border-2 border-dashed border-emerald-200 rounded-lg p-8 text-center'>
						<Upload className='mx-auto h-12 w-12 text-emerald-400' />
						<h3 className='mt-2 text-emerald-800 font-medium'>
							Upload Audio File
						</h3>
						<p className='text-sm text-emerald-600 mt-1'>
							Drag and drop or click to upload
						</p>
						<input
							type='file'
							accept='audio/*'
							className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
							onChange={(e) => setAudioFile(e.target.files[0])}
						/>
						{audioFile && (
							<div className='mt-4 text-sm text-emerald-700'>
								Selected: {audioFile.name}
							</div>
						)}
					</div>
				</TabsContent>

				<TabsContent value='pdf' className='space-y-4'>
					<div className='border-2 border-dashed border-emerald-200 rounded-lg p-8 text-center'>
						<FileText className='mx-auto h-12 w-12 text-emerald-400' />
						<h3 className='mt-2 text-emerald-800 font-medium'>
							Upload PDF File
						</h3>
						<p className='text-sm text-emerald-600 mt-1'>
							Drag and drop or click to upload
						</p>
						<input
							type='file'
							accept='.pdf'
							className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
							onChange={(e) => setPdfFile(e.target.files[0])}
						/>
						{pdfFile && (
							<div className='mt-4 text-sm text-emerald-700'>
								Selected: {pdfFile.name}
							</div>
						)}
					</div>
				</TabsContent>

				<TabsContent value='youtube' className='space-y-4'>
					<div className='space-y-4'>
						<label className='block text-sm font-medium text-emerald-700'>
							YouTube URL
						</label>
						<Input
							type='url'
							placeholder='https://www.youtube.com/watch?v=...'
							className='w-full'
							value={youtubeUrl}
							onChange={(e) => setYoutubeUrl(e.target.value)}
						/>
					</div>
				</TabsContent>
			</Tabs>

			<div className='mt-8'>
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
