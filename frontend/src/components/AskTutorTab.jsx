import { motion } from "framer-motion";
import {
	ArrowDown,
	Bot,
	HelpCircle,
	Lightbulb,
	Loader2,
	MessageSquare,
	RefreshCw,
	Send,
	StopCircle,
	User,
} from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";

// Create a memoized version of the markdown component
const MemoizedMarkdown = memo(({ children }) => {
	return (
		<ReactMarkdown
			components={{
				p: ({ node, ...props }) => <p className='mb-2 last:mb-0' {...props} />,
				ul: ({ node, ...props }) => (
					<ul className='list-disc pl-4 mb-2' {...props} />
				),
				ol: ({ node, ...props }) => (
					<ol className='list-decimal pl-4 mb-2' {...props} />
				),
				li: ({ node, ...props }) => <li className='mb-1' {...props} />,
				h1: ({ node, ...props }) => (
					<h1 className='text-lg font-bold mb-2' {...props} />
				),
				h2: ({ node, ...props }) => (
					<h2 className='text-md font-bold mb-2' {...props} />
				),
				h3: ({ node, ...props }) => (
					<h3 className='text-sm font-bold mb-1' {...props} />
				),
				a: ({ node, ...props }) => (
					<a
						className='text-blue-600 hover:underline'
						target='_blank'
						rel='noopener noreferrer'
						{...props}
					/>
				),
				blockquote: ({ node, ...props }) => (
					<blockquote
						className='border-l-4 border-emerald-300 pl-3 italic my-2'
						{...props}
					/>
				),
				code({ node, inline, className, children, ...props }) {
					const match = /language-(\w+)/.exec(className || "");
					return !inline && match ? (
						<SyntaxHighlighter
							style={atomDark}
							language={match[1]}
							PreTag='div'
							className='rounded-md my-2 text-xs'
							{...props}
						>
							{String(children).replace(/\n$/, "")}
						</SyntaxHighlighter>
					) : (
						<code
							className={`${
								inline ? "bg-gray-100 text-emerald-700 px-1 py-0.5 rounded" : ""
							} ${className}`}
							{...props}
						>
							{children}
						</code>
					);
				},
				table: ({ node, ...props }) => (
					<div className='overflow-x-auto my-2'>
						<table
							className='border-collapse border border-emerald-200'
							{...props}
						/>
					</div>
				),
				thead: ({ node, ...props }) => (
					<thead className='bg-emerald-50' {...props} />
				),
				th: ({ node, ...props }) => (
					<th
						className='border border-emerald-200 px-2 py-1 text-left'
						{...props}
					/>
				),
				td: ({ node, ...props }) => (
					<td className='border border-emerald-200 px-2 py-1' {...props} />
				),
				hr: ({ node, ...props }) => (
					<hr className='my-2 border-emerald-200' {...props} />
				),
			}}
		>
			{children}
		</ReactMarkdown>
	);
});

export default function AskTutorTab({ data }) {
	const [messages, setMessages] = useState([]);
	const [currentMessage, setCurrentMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [isStreaming, setIsStreaming] = useState(false);
	const [error, setError] = useState(null);
	const [streamingResponse, setStreamingResponse] = useState("");
	const [chatMode, setChatMode] = useState("direct"); // "socratic" or "direct"
	const abortControllerRef = useRef(null);
	const messagesEndRef = useRef(null);
	const chatContainerRef = useRef(null);
	const [showScrollButton, setShowScrollButton] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);

	// Scroll to the bottom of the chat
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	// Handle chat container scroll
	const handleScroll = () => {
		if (!chatContainerRef.current) return;

		const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
		const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
		setShowScrollButton(!isNearBottom);
	};

	// Effect to scroll to bottom when messages change or streaming response updates
	useEffect(() => {
		scrollToBottom();
	}, [messages, streamingResponse]);

	// Add scroll event listener
	useEffect(() => {
		const container = chatContainerRef.current;
		if (container) {
			container.addEventListener("scroll", handleScroll);
			return () => container.removeEventListener("scroll", handleScroll);
		}
	}, []);

	// Clean up streaming response when unmounting
	useEffect(() => {
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, []);

	// Cancel ongoing stream
	const cancelStream = () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}

		// Finalize the current streaming response
		if (streamingResponse) {
			setMessages((prev) => {
				// Check if the last message is already the same as what we're streaming
				const lastMessage = prev[prev.length - 1];
				if (
					lastMessage?.role === "assistant" &&
					lastMessage?.content === streamingResponse
				) {
					return prev; // Already added, don't add again
				}
				return [...prev, { role: "assistant", content: streamingResponse }];
			});
			setStreamingResponse("");
		}

		setIsStreaming(false);
		setIsLoading(false);
	};

	// Send a message to the AI tutor with streaming response
	const handleSendMessage = async () => {
		// Check if already processing or no valid message
		if (!currentMessage.trim() || isLoading || isStreaming || isProcessing)
			return;

		// Set processing flag
		setIsProcessing(true);

		const userMessage = currentMessage.trim();
		setCurrentMessage("");

		// Add user message to chat
		const newMessages = [...messages, { role: "user", content: userMessage }];
		setMessages(newMessages);

		// Show loading state
		setIsLoading(true);
		setIsStreaming(true);
		setError(null);
		setStreamingResponse("");

		try {
			// Check if we have transcription data
			if (!data.transcription) {
				throw new Error(
					"Please process audio content first to generate a transcription"
				);
			}

			// Create abort controller for the fetch request
			abortControllerRef.current = new AbortController();

			// Choose endpoint based on the chat mode
			const endpoint =
				chatMode === "socratic"
					? `${process.env.NEXT_PUBLIC_API_URL}/api/chat-stream`
					: chatMode === "direct"
					? `${process.env.NEXT_PUBLIC_API_URL}/api/chat-direct-stream`
					: `${process.env.NEXT_PUBLIC_API_URL}/api/chat-talk-stream`;

			// Send request to backend with streaming
			const response = await fetch(endpoint, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					messages: newMessages.map((msg) => ({
						role: msg.role,
						content: msg.content,
					})),
					transcript: data.transcription,
				}),
				signal: abortControllerRef.current.signal,
			});

			if (!response.ok) {
				throw new Error("Failed to get response from tutor");
			}

			// Process the stream with optimized rendering
			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let accumulatedResponse = "";
			let messageAdded = false;

			while (true) {
				const { done, value } = await reader.read();

				if (done) {
					// Stream is complete - only add message if we haven't already
					if (accumulatedResponse && !messageAdded) {
						setMessages((prev) => {
							// Check if the last message already contains this content
							const lastMessage = prev[prev.length - 1];
							if (
								lastMessage?.role === "assistant" &&
								lastMessage?.content === accumulatedResponse
							) {
								return prev; // Don't add duplicate message
							}
							return [
								...prev,
								{ role: "assistant", content: accumulatedResponse },
							];
						});
						setStreamingResponse("");
						messageAdded = true;
					}
					break;
				}

				// Decode the current chunk
				const chunk = decoder.decode(value, { stream: true });

				// Process each line in the chunk (Server-Sent Events format)
				const lines = chunk.split("\n\n");
				let shouldUpdateUI = false;

				for (const line of lines) {
					if (line.trim() && line.startsWith("data: ")) {
						try {
							const data = JSON.parse(line.substring(6));

							if (data.error) {
								throw new Error(data.error);
							}

							if (data.done) {
								// Streaming completed, add the full response to messages if not already added
								if (!messageAdded) {
									setMessages((prev) => {
										// Check for duplicates before adding
										const lastMessage = prev[prev.length - 1];
										if (
											lastMessage?.role === "assistant" &&
											lastMessage?.content === accumulatedResponse
										) {
											return prev; // Don't add duplicate message
										}
										return [
											...prev,
											{ role: "assistant", content: accumulatedResponse },
										];
									});
									messageAdded = true;
								}
								setStreamingResponse("");
								setIsStreaming(false);
								break;
							}

							if (data.chunk) {
								// Update the accumulated response
								accumulatedResponse += data.chunk;
								shouldUpdateUI = true;
							}
						} catch (e) {
							console.error("Error parsing SSE data:", e, line);
						}
					}
				}

				// Only update the UI when we have meaningful content to show
				if (shouldUpdateUI) {
					// Use a debounced update strategy to avoid too frequent renders
					const now = Date.now();
					if (!window.lastStreamUpdate || now - window.lastStreamUpdate > 100) {
						setStreamingResponse(accumulatedResponse);
						window.lastStreamUpdate = now;
					}
				}
			}
		} catch (err) {
			// Don't set error message if the request was aborted
			if (err.name !== "AbortError") {
				setError(err.message);
				// Add error message to chat
				setMessages((prev) => [
					...prev,
					{
						role: "assistant",
						content: `I'm sorry, I encountered an error: ${err.message}`,
					},
				]);
			}
		} finally {
			setIsLoading(false);
			setIsStreaming(false);
			setIsProcessing(false); // Reset processing flag
			abortControllerRef.current = null;
			window.lastStreamUpdate = null; // Clean up
		}
	};

	// Modify handleKeyPress to prevent default only if we're going to process
	const handleKeyPress = (e) => {
		if (
			e.key === "Enter" &&
			!e.shiftKey &&
			!isProcessing &&
			currentMessage.trim()
		) {
			e.preventDefault();
			handleSendMessage();
		}
	};

	// Start a new conversation
	const handleNewConversation = () => {
		if (isStreaming) {
			cancelStream();
		}
		setMessages([]);
		setError(null);
		setStreamingResponse("");
	};

	// Empty state - no transcription
	if (!data.transcription) {
		return (
			<div className='flex flex-col items-center justify-center h-full text-center'>
				<div className='w-12 h-12 md:w-16 md:h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4'>
					<MessageSquare className='h-6 w-6 md:h-8 md:w-8 text-emerald-500' />
				</div>
				<p className='text-emerald-800 font-medium'>
					No content to discuss yet
				</p>
				<p className='text-xs md:text-sm text-emerald-600 mt-2'>
					Process audio, PDF, or YouTube content first to chat with the tutor
				</p>
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='bg-white/50 rounded-lg p-3 md:p-4 h-full flex flex-col'
		>
			<div className='flex flex-col sm:flex-row items-center justify-between mb-4 gap-2'>
				<div className='flex items-center gap-2'>
					{chatMode === "socratic" ? (
						<Lightbulb className='h-5 w-5 text-emerald-600' />
					) : (
						<HelpCircle className='h-5 w-5 text-blue-600' />
					)}
					<h3 className='text-lg font-semibold text-emerald-800'>
						{chatMode === "socratic" ? "Socratic Mentor" : "AskGPT"}
					</h3>
				</div>

				<div className='flex items-center gap-2'>
					{/* Chat Mode Toggle - Only show Socratic and Direct */}
					<div className='flex bg-white/70 p-1 rounded-lg border border-emerald-100'>
						<button
							onClick={() => {
								if (isStreaming) cancelStream();
								setChatMode("direct");
								if (messages.length > 0) handleNewConversation();
							}}
							className={`px-3 py-1 text-xs rounded-md transition-colors ${
								chatMode === "direct"
									? "bg-blue-100 text-blue-800"
									: "text-gray-600 hover:bg-gray-100"
							}`}
						>
							AskGPT
						</button>
						<button
							onClick={() => {
								if (isStreaming) cancelStream();
								setChatMode("socratic");
								if (messages.length > 0) handleNewConversation();
							}}
							className={`px-3 py-1 text-xs rounded-md transition-colors ${
								chatMode === "socratic"
									? "bg-emerald-100 text-emerald-800"
									: "text-gray-600 hover:bg-gray-100"
							}`}
						>
							Socratic
						</button>
					</div>

					<button
						onClick={handleNewConversation}
						className='flex items-center gap-1 text-xs bg-white hover:bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md transition-colors border border-emerald-200'
						title='Start a new conversation'
					>
						<RefreshCw className='h-3 w-3' />
						<span>New Chat</span>
					</button>
				</div>
			</div>

			{messages.length === 0 && !streamingResponse ? (
				<div className='flex-1 flex flex-col items-center justify-center text-center px-4'>
					<div
						className={`rounded-full p-3 mb-3 ${
							chatMode === "socratic" ? "bg-emerald-50" : "bg-blue-50"
						}`}
					>
						{chatMode === "socratic" ? (
							<Lightbulb className='h-6 w-6 text-emerald-500' />
						) : (
							<HelpCircle className='h-6 w-6 text-blue-500' />
						)}
					</div>
					<h4
						className={`font-medium mb-2 ${
							chatMode === "socratic" ? "text-emerald-800" : "text-blue-800"
						}`}
					>
						{chatMode === "socratic"
							? "Ask about the lecture content"
							: "Get direct answers to your questions"}
					</h4>
					<p className='text-sm text-emerald-600 max-w-md'>
						{chatMode === "socratic"
							? "I'm a Socratic tutor, which means I'll help guide your understanding through thoughtful questions rather than just providing answers."
							: "I'm here to provide direct answers to your questions based on the content of the lecture. Just ask away!"}
					</p>
					<div className='mt-6 space-y-2 w-full max-w-md'>
						<button
							onClick={() =>
								setCurrentMessage(
									chatMode === "socratic"
										? "What are the main points of this lecture?"
										: "Summarize the key points of this lecture."
								)
							}
							className={`w-full text-left p-2 text-sm bg-white hover:bg-emerald-50 rounded-md border border-emerald-100 text-emerald-800 transition-colors`}
						>
							{chatMode === "socratic"
								? "What are the main points of this lecture?"
								: "Summarize the key points of this lecture."}
						</button>
						<button
							onClick={() =>
								setCurrentMessage(
									chatMode === "socratic"
										? "Can you help me understand the concept of [topic]?"
										: "Explain the concept of [topic] from the lecture."
								)
							}
							className={`w-full text-left p-2 text-sm bg-white hover:bg-emerald-50 rounded-md border border-emerald-100 text-emerald-800 transition-colors`}
						>
							{chatMode === "socratic"
								? "Can you help me understand the concept of [topic]?"
								: "Explain the concept of [topic] from the lecture."}
						</button>
						<button
							onClick={() =>
								setCurrentMessage(
									chatMode === "socratic"
										? "Why is this topic important?"
										: "What are the practical applications of this information?"
								)
							}
							className={`w-full text-left p-2 text-sm bg-white hover:bg-emerald-50 rounded-md border border-emerald-100 text-emerald-800 transition-colors`}
						>
							{chatMode === "socratic"
								? "Why is this topic important?"
								: "What are the practical applications of this information?"}
						</button>
					</div>
				</div>
			) : (
				<div
					ref={chatContainerRef}
					className='flex-1 overflow-y-auto pr-2 space-y-4'
					onScroll={handleScroll}
				>
					{messages.map((message, index) => (
						<div
							key={index}
							className={`flex ${
								message.role === "user"
									? "justify-end"
									: message.role === "system"
									? "justify-center"
									: "justify-start"
							}`}
						>
							{message.role === "system" ? (
								<div className='bg-gray-100 text-gray-600 rounded-md px-3 py-1.5 text-xs italic max-w-[90%]'>
									<MemoizedMarkdown>{message.content}</MemoizedMarkdown>
								</div>
							) : (
								<div
									className={`flex gap-3 max-w-[80%] ${
										message.role === "user"
											? "bg-emerald-100 text-emerald-800"
											: message.role === "system"
											? "bg-gray-100 text-gray-600"
											: "bg-white text-gray-800"
									} p-3 rounded-lg ${
										message.role === "user"
											? "rounded-tr-none"
											: message.role === "system"
											? "rounded-tl-none"
											: "rounded-tl-none"
									} shadow-sm`}
								>
									<div
										className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${
											message.role === "user"
												? "bg-emerald-200"
												: message.role === "system"
												? "bg-gray-200"
												: chatMode === "socratic"
												? "bg-emerald-200"
												: "bg-blue-200"
										}`}
									>
										{message.role === "user" ? (
											<User className='h-3 w-3 text-emerald-700' />
										) : message.role === "system" ? (
											<Bot className='h-3 w-3 text-gray-600' />
										) : (
											<Bot
												className={`h-3 w-3 ${
													chatMode === "socratic"
														? "text-emerald-700"
														: chatMode === "direct"
														? "text-blue-700"
														: "text-yellow-700"
												}`}
											/>
										)}
									</div>
									<div className='markdown-body text-sm'>
										<MemoizedMarkdown>{message.content}</MemoizedMarkdown>
									</div>
								</div>
							)}
						</div>
					))}

					{/* Streaming Response */}
					{streamingResponse && (
						<div className='flex justify-start'>
							<div className='flex gap-3 max-w-[80%] bg-white p-3 rounded-lg rounded-tl-none shadow-sm'>
								<div
									className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center ${
										chatMode === "socratic"
											? "bg-emerald-200"
											: chatMode === "direct"
											? "bg-blue-200"
											: "bg-yellow-200"
									}`}
								>
									<Bot
										className={`h-3 w-3 ${
											chatMode === "socratic"
												? "text-emerald-700"
												: chatMode === "direct"
												? "text-blue-700"
												: "text-yellow-700"
										}`}
									/>
								</div>
								<div className='markdown-body text-sm'>
									<MemoizedMarkdown>{streamingResponse}</MemoizedMarkdown>
								</div>
							</div>
						</div>
					)}

					<div ref={messagesEndRef} />
				</div>
			)}

			{/* Scroll to bottom button */}
			{showScrollButton && (
				<button
					onClick={scrollToBottom}
					className='absolute bottom-28 right-8 bg-emerald-500 text-white rounded-full p-2 shadow-md hover:bg-emerald-600 transition-colors'
				>
					<ArrowDown className='h-4 w-4' />
				</button>
			)}

			{/* Chat input */}
			<div className='mt-4 flex items-end gap-2'>
				<textarea
					className={`flex-1 p-3 rounded-lg border focus:ring outline-none resize-none bg-white/80 text-sm ${
						chatMode === "socratic"
							? "border-emerald-200 focus:ring-emerald-300 focus:border-emerald-500"
							: "border-blue-200 focus:ring-blue-300 focus:border-blue-500"
					}`}
					rows={2}
					placeholder={
						chatMode === "socratic"
							? "Ask a question about the lecture (I'll help you think through it)..."
							: "Ask a question about the lecture (I'll provide a direct answer)..."
					}
					value={currentMessage}
					onChange={(e) => setCurrentMessage(e.target.value)}
					onKeyDown={handleKeyPress}
					disabled={isLoading || isStreaming}
				/>
				{isStreaming ? (
					<button
						onClick={cancelStream}
						className='px-4 py-3 rounded-lg transition-colors flex-shrink-0 bg-red-500 hover:bg-red-600 text-white'
						title='Stop generating'
					>
						<StopCircle className='h-5 w-5' />
					</button>
				) : (
					<button
						onClick={handleSendMessage}
						disabled={!currentMessage.trim() || isLoading}
						className={`px-4 py-3 rounded-lg transition-colors flex-shrink-0 ${
							!currentMessage.trim() || isLoading
								? "bg-gray-200 text-gray-400 cursor-not-allowed"
								: chatMode === "socratic"
								? "bg-emerald-600 text-white hover:bg-emerald-700"
								: "bg-blue-600 text-white hover:bg-blue-700"
						}`}
					>
						{isLoading ? (
							<Loader2 className='h-5 w-5 animate-spin' />
						) : (
							<Send className='h-5 w-5' />
						)}
					</button>
				)}
			</div>
		</motion.div>
	);
}
