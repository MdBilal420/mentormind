import { motion } from "framer-motion";
import { AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import AudioPlayer from "./AudioPlayer";
import TimestampedTranscription from "./TimestampedTranscription";

export default function TranscriptionTab({ data, onRetry }) {
	const [currentTime, setCurrentTime] = useState(0);

	const handleTimestampClick = (time) => {
		setCurrentTime(time);
	};

	const handleTimeUpdate = (time) => {
		setCurrentTime(time);
	};

	// Reset currentTime when audio changes
	useEffect(() => {
		setCurrentTime(0);
	}, [data.audioUrl]);

	// Error state
	if (data.error) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='bg-white/50 rounded-lg p-6 h-full flex flex-col items-center justify-center text-center'
			>
				<div className='w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4'>
					<AlertCircle className='h-8 w-8 text-red-500' />
				</div>
				<h3 className='text-lg font-medium text-red-800 mb-2'>
					Transcription Failed
				</h3>
				<p className='text-red-600 mb-6 max-w-md'>
					{data.error ||
						"We couldn't transcribe your audio. Please try again or use a different file."}
				</p>
				{onRetry && (
					<button
						onClick={onRetry}
						className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2'
					>
						<RefreshCw className='h-4 w-4' />
						Try Again
					</button>
				)}
			</motion.div>
		);
	}

	// Empty state
	if (!data.transcription && !data.loading) {
		return (
			<div className='flex flex-col items-center justify-center h-full text-center'>
				<div className='w-12 h-12 md:w-16 md:h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4'>
					<Loader2 className='h-6 w-6 md:h-8 md:w-8 text-emerald-500' />
				</div>
				<p className='text-emerald-800 font-medium'>
					No content to transcribe yet
				</p>
				<p className='text-xs md:text-sm text-emerald-600 mt-2'>
					Upload audio, a PDF, or provide a YouTube URL to get started
				</p>
			</div>
		);
	}

	// Loading state
	if (data.loading) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className='bg-white/50 rounded-lg p-6 h-full flex flex-col items-center justify-center'
			>
				<Loader2 className='h-10 w-10 animate-spin text-emerald-600 mb-4' />
				<p className='text-emerald-700'>Processing your audio...</p>
				<p className='text-xs text-emerald-500 mt-2'>
					This may take a minute depending on the file size
				</p>
			</motion.div>
		);
	}

	// Content state
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='bg-white/50 rounded-lg p-3 md:p-4 h-full flex flex-col'
		>
			{data.audioUrl && (
				<div className='mb-4'>
					<AudioPlayer
						audioUrl={data.audioUrl}
						onTimeUpdate={handleTimeUpdate}
						currentTime={currentTime}
						onSeek={handleTimeUpdate}
					/>
				</div>
			)}

			<div className='flex-grow overflow-y-auto'>
				{data.sentences && data.sentences.length > 0 ? (
					<TimestampedTranscription
						sentences={data.sentences}
						currentTime={currentTime}
						onTimestampClick={handleTimestampClick}
					/>
				) : (
					<div className='p-4'>
						<p className='text-sm md:text-base text-emerald-900 whitespace-pre-line'>
							{data.transcription}
						</p>
					</div>
				)}
			</div>
		</motion.div>
	);
}
