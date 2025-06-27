import { Clock, Lock, Unlock, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { formatTime } from "../utils/timeUtils";
import SentenceDiscussion from "./SentenceDiscussion";

// Local storage key generator (same as in SentenceDiscussion)
const getStorageKey = (sentenceText) => {
	return `sentence_discussion_${btoa(sentenceText).slice(0, 20)}`;
};

// Check if a sentence has existing chat history
const hasExistingDiscussion = (sentenceText) => {
	const storageKey = getStorageKey(sentenceText);
	const savedMessages = localStorage.getItem(storageKey);
	if (savedMessages) {
		try {
			const parsedMessages = JSON.parse(savedMessages);
			return parsedMessages.length > 0;
		} catch (error) {
			return false;
		}
	}
	return false;
};

export default function TimestampedTranscription({
	sentences,
	currentTime,
	onTimestampClick,
	transcript,
}) {
	const transcriptionRef = useRef(null);
	const [userScrolling, setUserScrolling] = useState(false);
	const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
	const scrollTimeoutRef = useRef(null);
	const [openDiscussion, setOpenDiscussion] = useState(null);
	const discussionRefs = useRef({});

	// Auto-scroll to current sentence based on audio currentTime
	useEffect(() => {
		if (
			!transcriptionRef.current ||
			!currentTime ||
			!sentences?.length ||
			!autoScrollEnabled ||
			userScrolling
		)
			return;

		const currentSentenceIdx = sentences.findIndex(
			(sentence) => currentTime >= sentence.start && currentTime <= sentence.end
		);

		if (currentSentenceIdx >= 0) {
			const sentenceElements =
				transcriptionRef.current.querySelectorAll(".sentence-item");
			if (sentenceElements[currentSentenceIdx]) {
				sentenceElements[currentSentenceIdx].scrollIntoView({
					behavior: "smooth",
					block: "center",
				});
			}
		}
	}, [currentTime, sentences, autoScrollEnabled, userScrolling]);

	// Handle user scrolling
	useEffect(() => {
		const transcriptionElement = transcriptionRef.current;
		if (!transcriptionElement) return;

		const handleScroll = () => {
			// User is actively scrolling
			setUserScrolling(true);

			// Clear any existing timeout
			if (scrollTimeoutRef.current) {
				clearTimeout(scrollTimeoutRef.current);
			}

			// Set a timeout to re-enable auto-scrolling after user stops scrolling
			scrollTimeoutRef.current = setTimeout(() => {
				setUserScrolling(false);
			}, 5000); // Wait 5 seconds after last scroll before resuming auto-scroll
		};

		transcriptionElement.addEventListener("wheel", handleScroll, {
			passive: true,
		});
		transcriptionElement.addEventListener("touchmove", handleScroll, {
			passive: true,
		});
		transcriptionElement.addEventListener("scroll", handleScroll, {
			passive: true,
		});

		// Clean up event listeners
		return () => {
			transcriptionElement.removeEventListener("wheel", handleScroll);
			transcriptionElement.removeEventListener("touchmove", handleScroll);
			transcriptionElement.removeEventListener("scroll", handleScroll);

			if (scrollTimeoutRef.current) {
				clearTimeout(scrollTimeoutRef.current);
			}
		};
	}, []);

	const toggleAutoScroll = () => {
		setAutoScrollEnabled(!autoScrollEnabled);
		if (!autoScrollEnabled) {
			// If re-enabling, also reset the user scrolling state
			setUserScrolling(false);
		}
	};

	const handleDiscussionToggle = (sentenceIndex) => {
		// Prevent the outer container from scrolling when discussion is toggled
		event?.preventDefault();
		event?.stopPropagation();
		
		const newDiscussionState = openDiscussion === sentenceIndex ? null : sentenceIndex;
		setOpenDiscussion(newDiscussionState);
		
		// Scroll the discussion into view if opening
		if (newDiscussionState !== null) {
			setTimeout(() => {
				const discussionElement = discussionRefs.current[newDiscussionState];
				if (discussionElement) {
					discussionElement.scrollIntoView({
						behavior: "smooth",
						block: "center",
					});
				}
			}, 100); // Small delay to ensure the discussion component has rendered
		}
	};

	const handleSendQuestion = async (sentence, question) => {
		// This function is no longer needed as SentenceDiscussion handles API calls directly
		return "This function is deprecated";
	};

	if (!sentences || sentences.length === 0) {
		return (
			<p className='text-emerald-600 italic'>No timestamped data available</p>
		);
	}

	return (
		<div className='space-y-1 h-full flex flex-col'>
			<div className='flex items-center justify-between mb-4 text-emerald-700 text-sm'>
				<div className='flex items-center gap-2'>
					<Clock className='h-4 w-4' />
					<span>Click on timestamps to jump to that part of the audio</span>
				</div>

				<button
					onClick={toggleAutoScroll}
					className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
						autoScrollEnabled
							? "bg-emerald-100 hover:bg-emerald-200 text-emerald-700"
							: "bg-gray-200 hover:bg-gray-300 text-gray-700"
					}`}
					title={
						autoScrollEnabled ? "Disable auto-scroll" : "Enable auto-scroll"
					}
				>
					{autoScrollEnabled ? (
						<>
							<Unlock className='h-3.5 w-3.5' />
							<span className='text-xs'>Auto-scroll</span>
						</>
					) : (
						<>
							<Lock className='h-3.5 w-3.5' />
							<span className='text-xs'>Locked</span>
						</>
					)}
				</button>
			</div>

			{userScrolling && autoScrollEnabled && (
				<div className='bg-emerald-100 text-emerald-800 text-xs p-2 rounded-md mb-2 animate-fadeIn'>
					Auto-scrolling paused while you're scrolling. Will resume in a few
					seconds.
				</div>
			)}

			<div
				ref={transcriptionRef}
				className='space-y-2 flex-1 overflow-y-auto pr-2 rounded-md'
				style={{ scrollBehavior: "smooth" }}
			>
				{sentences.map((sentence, idx) => {
					const isActive =
						currentTime >= sentence.start && currentTime <= sentence.end;
					const isDiscussionOpen = openDiscussion === idx;
					const hasDiscussion = hasExistingDiscussion(sentence.text);

					return (
						<div key={idx}>
							<div
								className={`sentence-item flex group rounded-lg p-2 transition-colors ${
									isActive ? "bg-emerald-100" : "hover:bg-emerald-50/50"
								}`}
							>
								<button
									className='flex-shrink-0 w-16 text-emerald-500 hover:text-emerald-700 font-mono text-xs pt-1 text-left'
									onClick={() => onTimestampClick(sentence.start)}
								>
									{formatTime(sentence.start)}
								</button>
								<div className='flex-grow'>
									<p className='text-sm md:text-base text-emerald-900'>
										{sentence.text}
									</p>
								</div>
								<button
									onClick={(e) => {
										e.preventDefault();
										e.stopPropagation();
										handleDiscussionToggle(idx);
									}}
									className={`flex-shrink-0 h-4 w-4 ml-2 transition-all duration-200 cursor-pointer ${
										hasDiscussion 
											? "text-emerald-600 hover:text-emerald-800 hover:scale-110" 
											: "text-emerald-400 hover:text-emerald-600 hover:scale-110"
									}`}
									title={hasDiscussion ? "Continue discussion about this sentence" : "Ask questions about this sentence"}
								>
									<Sparkles className={hasDiscussion ? "fill-current" : ""} />
								</button>
							</div>
							
							{isDiscussionOpen && (
								<div
									ref={(el) => {
										if (el) {
											discussionRefs.current[idx] = el;
										}
									}}
								>
									<SentenceDiscussion
										sentence={sentence}
										isOpen={isDiscussionOpen}
										onClose={() => setOpenDiscussion(null)}
										transcript={transcript}
									/>
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}
