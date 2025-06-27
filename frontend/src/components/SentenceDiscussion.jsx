import { useState, useRef, useEffect } from "react";
import { Send, X, MessageSquare, StopCircle, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

// Local storage key generator
const getStorageKey = (sentenceText) => {
	return `sentence_discussion_${btoa(sentenceText).slice(0, 20)}`;
};

export default function SentenceDiscussion({ 
	sentence, 
	isOpen, 
	onClose, 
	onSendQuestion,
	transcript 
}) {
	const [question, setQuestion] = useState("");
	const [messages, setMessages] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isStreaming, setIsStreaming] = useState(false);
	const [streamingResponse, setStreamingResponse] = useState("");
	const abortControllerRef = useRef(null);
	const messagesEndRef = useRef(null);

	// Load chat history from localStorage when component opens
	useEffect(() => {
		if (isOpen) {
			const storageKey = getStorageKey(sentence.text);
			const savedMessages = localStorage.getItem(storageKey);
			if (savedMessages) {
				try {
					const parsedMessages = JSON.parse(savedMessages);
					setMessages(parsedMessages);
				} catch (error) {
					console.error("Error loading chat history:", error);
					setMessages([]);
				}
			} else {
				setMessages([]);
			}
		}
	}, [isOpen, sentence.text]);

	// Save messages to localStorage whenever messages change
	useEffect(() => {
		if (messages.length > 0) {
			const storageKey = getStorageKey(sentence.text);
			localStorage.setItem(storageKey, JSON.stringify(messages));
		}
	}, [messages, sentence.text]);

	// Auto-scroll to bottom when messages change or streaming response updates
	useEffect(() => {
		// Only scroll within the messages container, not the entire discussion
		const messagesContainer = messagesEndRef.current?.parentElement;
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	}, [messages, streamingResponse]);

	const scrollToBottom = () => {
		// Only scroll within the messages container
		const messagesContainer = messagesEndRef.current?.parentElement;
		if (messagesContainer) {
			messagesContainer.scrollTop = messagesContainer.scrollHeight;
		}
	};

	const handleSendQuestion = async () => {
		if (!question.trim()) return;

		const userMessage = {
			id: Date.now(),
			type: "user",
			content: question,
			timestamp: new Date().toLocaleTimeString()
		};

		setMessages(prev => [...prev, userMessage]);
		setQuestion("");
		setIsLoading(true);
		setIsStreaming(true);
		setStreamingResponse("");

		// Scroll to bottom within the messages container only
		setTimeout(() => scrollToBottom(), 100);

		try {
			// Create abort controller for the fetch request
			abortControllerRef.current = new AbortController();

			// Prepare the context with the specific sentence
			const sentenceContext = `The following is the transcript of a lecture. The user is asking about this specific sentence: "${sentence.text}". Please provide context and answer based on the full transcript.\n\nFull transcript:\n${transcript || ""}`;

			console.log(sentenceContext);
			// Send request to chat-direct-stream endpoint
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/chat-direct-stream`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					messages: [
						{
							role: "user",
							content: `I'm asking about this specific sentence: "${sentence.text}". My question is: ${question}`
						}
					],
					transcript: sentenceContext,
				}),
				signal: abortControllerRef.current.signal,
			});
			console.log("response", response);

			if (!response.ok) {
				throw new Error("Failed to get response from AI");
			}

			// Process the streaming response
			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let accumulatedResponse = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				const chunk = decoder.decode(value);
				const lines = chunk.split('\n');

				for (const line of lines) {
					if (line.trim() && line.startsWith("data: ")) {
						try {
							const data = JSON.parse(line.substring(6));

							if (data.error) {
								throw new Error(data.error);
							}

							if (data.done) {
								// Streaming completed, add the full response to messages
								setMessages(prev => [
									...prev,
									{
										id: Date.now() + 1,
										type: "ai",
										content: accumulatedResponse,
										timestamp: new Date().toLocaleTimeString()
									}
								]);
								setStreamingResponse("");
								setIsStreaming(false);
								// Scroll to bottom within the messages container only
								setTimeout(() => scrollToBottom(), 100);
								break;
							}

							if (data.chunk) {
								accumulatedResponse += data.chunk;
								setStreamingResponse(accumulatedResponse);
								// Scroll to bottom within the messages container only
								setTimeout(() => scrollToBottom(), 50);
							}
						} catch (e) {
							console.error("Error parsing SSE data:", e, line);
						}
					}
				}
			}
		} catch (error) {
			if (error.name !== "AbortError") {
				const errorMessage = {
					id: Date.now() + 1,
					type: "error",
					content: `Sorry, I couldn't process your question: ${error.message}`,
					timestamp: new Date().toLocaleTimeString()
				};
				setMessages(prev => [...prev, errorMessage]);
				// Scroll to bottom within the messages container only
				setTimeout(() => scrollToBottom(), 100);
			}
		} finally {
			setIsLoading(false);
			setIsStreaming(false);
			setStreamingResponse("");
			abortControllerRef.current = null;
		}
	};

	const cancelStream = () => {
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
			abortControllerRef.current = null;
		}

		// Finalize the current streaming response
		if (streamingResponse) {
			setMessages(prev => [
				...prev,
				{
					id: Date.now() + 1,
					type: "ai",
					content: streamingResponse,
					timestamp: new Date().toLocaleTimeString()
				}
			]);
			setStreamingResponse("");
			// Scroll to bottom within the messages container only
			setTimeout(() => scrollToBottom(), 100);
		}

		setIsStreaming(false);
		setIsLoading(false);
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSendQuestion();
		}
	};

	if (!isOpen) return null;

	return (
		<div 
			className="mt-2 mb-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4 animate-in slide-in-from-top-2 duration-200"
			onClick={(e) => e.stopPropagation()}
		>
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-2">
					<MessageSquare className="h-4 w-4 text-emerald-600" />
					<span className="text-sm font-medium text-emerald-800">
						Ask about this sentence
					</span>
					{messages.length > 0 && (
						<span className="text-xs text-emerald-500 bg-emerald-100 px-2 py-1 rounded-full">
							{messages.length} messages
						</span>
					)}
				</div>
				<button
					onClick={(e) => {
						e.preventDefault();
						e.stopPropagation();
						onClose();
					}}
					className="text-emerald-500 hover:text-emerald-700 transition-colors"
				>
					<X className="h-4 w-4" />
				</button>
			</div>

			{/* Sentence context */}
			<div className="mb-3 p-2 bg-white rounded border border-emerald-100">
				<p className="text-sm text-emerald-700 italic">
					"{sentence.text}"
				</p>
			</div>

			{/* Messages */}
			<div 
				className="max-h-48 overflow-y-auto mb-3 space-y-2"
				onClick={(e) => e.stopPropagation()}
				onScroll={(e) => e.stopPropagation()}
			>
				{messages.length === 0 && !streamingResponse && !isLoading ? (
					<div className="text-center text-sm text-emerald-600 py-4">
						Ask a question about this sentence to get started
					</div>
				) : (
					<>
						{messages.map((message) => (
							<div
								key={message.id}
								className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`max-w-[80%] p-2 rounded-lg text-sm ${
										message.type === "user"
											? "bg-emerald-500 text-white"
											: message.type === "error"
											? "bg-red-100 text-red-700"
											: "bg-white border border-emerald-200 text-emerald-800"
									}`}
								>
									<p>{message.content}</p>
									<p className="text-xs opacity-70 mt-1">
										{message.timestamp}
									</p>
								</div>
							</div>
						))}
						
						{/* Loading indicator after request is sent */}
						{isLoading && !streamingResponse && (
							<div className="flex justify-start">
								<div className="max-w-[80%] p-2 rounded-lg text-sm bg-white border border-emerald-200 text-emerald-800">
									<div className="flex items-center gap-2">
										<Loader2 className="h-3 w-3 animate-spin text-emerald-500" />
										<span>Thinking...</span>
									</div>
								</div>
							</div>
						)}
						
						{/* Streaming Response */}
						{streamingResponse && (
							<div className="flex justify-start">
								<div className="max-w-[80%] p-2 rounded-lg text-sm bg-white border border-emerald-200 text-emerald-800">
									<p>{streamingResponse}</p>
									<p className="text-xs opacity-70 mt-1">
										{new Date().toLocaleTimeString()}
									</p>
								</div>
							</div>
						)}
					</>
				)}
				{/* Scroll anchor */}
				<div ref={messagesEndRef} />
			</div>

			{/* Input */}
			<div className="flex gap-2">
				<Input
					value={question}
					onChange={(e) => setQuestion(e.target.value)}
					onKeyPress={handleKeyPress}
					placeholder="Ask a question about this sentence..."
					className="flex-1 text-sm"
					disabled={isLoading || isStreaming}
					onClick={(e) => e.stopPropagation()}
				/>
				{isStreaming ? (
					<Button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							cancelStream();
						}}
						size="sm"
						className="bg-red-500 hover:bg-red-600"
					>
						<StopCircle className="h-3 w-3" />
					</Button>
				) : (
					<Button
						onClick={(e) => {
							e.preventDefault();
							e.stopPropagation();
							handleSendQuestion();
						}}
						disabled={!question.trim() || isLoading}
						size="sm"
						className="bg-emerald-500 hover:bg-emerald-600"
					>
						<Send className="h-3 w-3" />
					</Button>
				)}
			</div>
		</div>
	);
} 