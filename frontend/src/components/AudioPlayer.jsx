import { Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatTime } from "../utils/timeUtils";

export default function AudioPlayer({
	audioUrl,
	onTimeUpdate,
	currentTime,
	onSeek,
}) {
	const [isPlaying, setIsPlaying] = useState(false);
	const [duration, setDuration] = useState(0);
	const [localCurrentTime, setLocalCurrentTime] = useState(0);
	const audioRef = useRef(null);

	// Sync with external currentTime if provided
	useEffect(() => {
		if (
			currentTime !== undefined &&
			audioRef.current &&
			Math.abs(audioRef.current.currentTime - currentTime) > 0.5
		) {
			audioRef.current.currentTime = currentTime;
			setLocalCurrentTime(currentTime);
		}
	}, [currentTime]);

	const handleLoadedMetadata = () => {
		setDuration(audioRef.current.duration);
	};

	const handleTimeUpdate = () => {
		const time = audioRef.current.currentTime;
		setLocalCurrentTime(time);
		if (onTimeUpdate) {
			onTimeUpdate(time);
		}
	};

	const handlePlayPause = () => {
		if (isPlaying) {
			audioRef.current.pause();
		} else {
			audioRef.current.play();
		}
		setIsPlaying(!isPlaying);
	};

	const handleSeek = (e) => {
		const seekTime = parseFloat(e.target.value);
		audioRef.current.currentTime = seekTime;
		setLocalCurrentTime(seekTime);
		if (onSeek) {
			onSeek(seekTime);
		}
	};

	const skipForward = () => {
		const newTime = Math.min(audioRef.current.currentTime + 10, duration);
		audioRef.current.currentTime = newTime;
		setLocalCurrentTime(newTime);
		if (onSeek) {
			onSeek(newTime);
		}
	};

	const skipBackward = () => {
		const newTime = Math.max(audioRef.current.currentTime - 10, 0);
		audioRef.current.currentTime = newTime;
		setLocalCurrentTime(newTime);
		if (onSeek) {
			onSeek(newTime);
		}
	};

	return (
		<div className='bg-white/70 rounded-lg p-3 shadow-sm'>
			<audio
				ref={audioRef}
				src={audioUrl}
				onLoadedMetadata={handleLoadedMetadata}
				onTimeUpdate={handleTimeUpdate}
				onEnded={() => setIsPlaying(false)}
				className='hidden'
			/>

			<div className='flex flex-col space-y-2'>
				<div className='flex items-center justify-between'>
					<span className='text-xs font-mono text-emerald-700'>
						{formatTime(localCurrentTime)}
					</span>
					<div className='flex items-center space-x-4'>
						<button
							onClick={skipBackward}
							className='p-1 rounded-full hover:bg-emerald-100 text-emerald-700'
							aria-label='Skip backward 10 seconds'
						>
							<SkipBack size={16} />
						</button>

						<button
							onClick={handlePlayPause}
							className='p-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700'
							aria-label={isPlaying ? "Pause" : "Play"}
						>
							{isPlaying ? <Pause size={20} /> : <Play size={20} />}
						</button>

						<button
							onClick={skipForward}
							className='p-1 rounded-full hover:bg-emerald-100 text-emerald-700'
							aria-label='Skip forward 10 seconds'
						>
							<SkipForward size={16} />
						</button>
					</div>
					<span className='text-xs font-mono text-emerald-700'>
						{formatTime(duration)}
					</span>
				</div>

				<div className='w-full'>
					<input
						type='range'
						min='0'
						max={duration || 0}
						value={localCurrentTime}
						onChange={handleSeek}
						className='w-full h-2 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600'
						aria-label='Audio progress'
					/>
				</div>
			</div>
		</div>
	);
}
