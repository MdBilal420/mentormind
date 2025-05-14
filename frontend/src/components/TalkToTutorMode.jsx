import { useConversation } from "@11labs/react";

import { AnimatePresence, motion } from "framer-motion";
import { Construction, Mic, MicOff } from "lucide-react";
import { useCallback, useState } from "react";

export default function TalkToTutorMode({ data, topic }) {
	const [error, setError] = useState(null);

	// console.log(data, "data");
	// console.log(topic, "topic");
	// Initialize conversation hook
	const conversation = useConversation({
		onConnect: () => console.log("Connected to voice agent"),
		onDisconnect: () => console.log("Disconnected from voice agent"),
		onMessage: (message) => console.log("Message:", message),
		onError: (error) => {
			console.error("Conversation error:", error);
			setError(error.message);
		},
	});

	// Function to get signed URL for private agents
	const getSignedUrl = async () => {
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/get-signed-url`
			);
			if (!response.ok) {
				throw new Error(`Failed to get signed url: ${response.statusText}`);
			}
			const { signedUrl } = await response.json();
			return signedUrl;
		} catch (error) {
			console.error("Error getting signed URL:", error);
			throw error;
		}
	};

	console.log(topic, "topic", data);

	// Start conversation handler
	const startConversation = useCallback(async () => {
		try {
			if (!topic) {
				setError("Please select a topic first to start the conversation");
				return;
			}
			// Request microphone permission
			await navigator.mediaDevices.getUserMedia({ audio: true });

			// For private agents, get signed URL
			// const signedUrl = await getSignedUrl();

			// Start the conversation session
			await conversation.startSession({
				//signedUrl, // Use signed URL for private agents
				// Or use agentId for public agents:
				agentId: "JZmfbugV533aCUAhkFha",
				dynamicVariables: {
					topic: topic,
					transcription: data.transcription,
				},
			});
		} catch (error) {
			console.error("Failed to start conversation:", error);
			setError("Failed to start conversation: " + error.message);
		}
	}, [conversation, topic]);

	// Stop conversation handler
	const stopConversation = useCallback(async () => {
		try {
			await conversation.endSession();
		} catch (error) {
			console.error("Failed to stop conversation:", error);
			setError("Failed to stop conversation: " + error.message);
		}
	}, [conversation]);

	if (error) {
		return (
			<div className='flex-1 flex flex-col items-center justify-center text-center px-4'>
				<div className='rounded-full p-3 mb-3 bg-red-50'>
					<Construction className='h-6 w-6 text-red-500' />
				</div>
				<h4 className='font-medium mb-2 text-red-800'>Error</h4>
				<p className='text-sm text-red-600 max-w-md'>{error}</p>
				<button
					onClick={() => setError(null)}
					className='mt-4 px-4 py-2 bg-red-100 text-red-800 rounded hover:bg-red-200'
				>
					Try Again
				</button>
			</div>
		);
	}

	return (
		<div className='flex-1 flex flex-col items-center justify-between p-4 bg-gradient-to-br from-[#e8f5f7] to-[#e0f2f7] border border-teal-100 rounded-xlc '>
			<div className='w-full max-w-2xl'>
				{/* Status Display */}
				<div className='mb-4 p-4 bg-white/50 rounded-lg backdrop-blur-sm border border-teal-100 shadow-sm'>
					<p className='text-sm text-teal-700'>
						Status:{" "}
						<span className='font-medium text-teal-900'>
							{conversation.status}
						</span>
					</p>
					<p className='text-sm text-teal-700'>
						Agent is{" "}
						<span className='font-medium text-teal-900'>
							{conversation.isSpeaking ? "speaking" : "listening"}
						</span>
					</p>
					{topic && (
						<p className='text-sm text-teal-700 mt-2'>
							Current Topic:{" "}
							<span className='font-medium text-teal-900'>{topic}</span>
						</p>
					)}
				</div>

				{/* Conversation Area */}
				<motion.div
					className='flex-1 mb-6 min-h-[300px] bg-white/70 rounded-xl backdrop-blur-sm border border-teal-100 p-6 relative overflow-hidden shadow-xl shadow-teal-100'
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					{/* Glowing Orb Background */}
					<div className='absolute inset-0 flex items-center justify-center'>
						<div className='w-96 h-96 rounded-full bg-gradient-to-r from-teal-200/30 to-cyan-200/30 blur-3xl'></div>
					</div>

					<AnimatePresence mode='wait'>
						{!topic || !data.transcription ? (
							<motion.div
								className='h-full flex flex-col items-center justify-center relative z-10'
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.9 }}
							>
								<motion.div
									className='w-24 h-24 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center shadow-lg'
									animate={{
										scale: [1, 1.05, 1],
										boxShadow: [
											"0 0 25px rgba(156, 163, 175, 0.3)",
											"0 0 35px rgba(156, 163, 175, 0.5)",
											"0 0 25px rgba(156, 163, 175, 0.3)",
										],
									}}
									transition={{ duration: 2, repeat: Infinity }}
								>
									<Construction className='w-10 h-10 text-white' />
								</motion.div>
								<h3 className='text-lg font-medium text-gray-900 mt-6 mb-2'>
									Select a Topic First
								</h3>
								<p className='text-sm text-gray-600 text-center max-w-md'>
									Please select a topic before starting the conversation with
									the AI tutor
								</p>
							</motion.div>
						) : conversation.status === "disconnected" ? (
							<motion.div
								className='h-full flex flex-col items-center justify-center relative z-10'
								initial={{ opacity: 0, scale: 0.9 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.9 }}
							>
								<motion.div
									className='w-24 h-24 rounded-full bg-gradient-to-r from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg'
									animate={{
										scale: [1, 1.05, 1],
										boxShadow: [
											"0 0 25px rgba(45, 212, 191, 0.3)",
											"0 0 35px rgba(45, 212, 191, 0.5)",
											"0 0 25px rgba(45, 212, 191, 0.3)",
										],
									}}
									transition={{ duration: 2, repeat: Infinity }}
								>
									<Mic className='w-10 h-10 text-white' />
								</motion.div>
								<h3 className='text-lg font-medium text-teal-900 mt-6 mb-2'>
									Start a Conversation
								</h3>
								<p className='text-sm text-teal-600 text-center max-w-md'>
									Click the button below to begin your conversation with the AI
									tutor
								</p>
							</motion.div>
						) : (
							<motion.div
								className='h-full flex flex-col items-center justify-center relative z-10'
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
							>
								{conversation.isSpeaking ? (
									<motion.div
										className='w-24 h-24 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center'
										animate={{
											scale: [1, 1.1, 1],
											boxShadow: [
												"0 0 25px rgba(52, 211, 153, 0.3)",
												"0 0 35px rgba(52, 211, 153, 0.5)",
												"0 0 25px rgba(52, 211, 153, 0.3)",
											],
										}}
										transition={{ duration: 1.5, repeat: Infinity }}
									>
										<div className='flex items-center gap-1'>
											{[...Array(3)].map((_, i) => (
												<motion.div
													key={i}
													className='w-1 bg-white'
													animate={{ height: [15, 30, 15] }}
													transition={{
														duration: 1,
														repeat: Infinity,
														delay: i * 0.1,
													}}
												/>
											))}
										</div>
									</motion.div>
								) : (
									<motion.div
										className='w-24 h-24 rounded-full bg-gradient-to-r from-cyan-400 to-teal-500 flex items-center justify-center'
										animate={{
											scale: [1, 1.1, 1],
											boxShadow: [
												"0 0 25px rgba(34, 211, 238, 0.3)",
												"0 0 35px rgba(34, 211, 238, 0.5)",
												"0 0 25px rgba(34, 211, 238, 0.3)",
											],
										}}
										transition={{ duration: 2, repeat: Infinity }}
									>
										<Mic className='w-10 h-10 text-white' />
									</motion.div>
								)}
								<span className='text-teal-800 font-medium mt-4'>
									{conversation.isSpeaking
										? "AI is speaking..."
										: "Listening..."}
								</span>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>

				{/* Control Buttons */}
				<div className='flex flex-row justify-center gap-4'>
					<motion.button
						onClick={startConversation}
						disabled={
							conversation.status === "connected" ||
							!topic ||
							!data.transcription
						}
						className={`flex items-center justify-center gap-2 px-4 sm:px-8 py-3 sm:py-4 rounded-xl font-medium w-full  ${
							conversation.status === "connected" ||
							!topic ||
							!data.transcription
								? "bg-gray-100 text-gray-400 cursor-not-allowed"
								: "bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-lg hover:shadow-xl shadow-teal-500/25"
						}`}
						whileHover={{
							scale:
								conversation.status !== "connected" &&
								topic &&
								data.transcription
									? 1.05
									: 1,
						}}
						whileTap={{
							scale:
								conversation.status !== "connected" &&
								topic &&
								data.transcription
									? 0.95
									: 1,
						}}
					>
						<Mic className='w-5 h-5' />
						<span className='text-sm'>Start Conversation</span>
					</motion.button>

					<motion.button
						onClick={stopConversation}
						disabled={conversation.status !== "connected"}
						className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium w-full ${
							conversation.status !== "connected"
								? "bg-gray-100 text-gray-400 cursor-not-allowed"
								: "bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-lg hover:shadow-xl shadow-rose-500/25"
						}`}
						whileHover={{
							scale: conversation.status === "connected" ? 1.05 : 1,
						}}
						whileTap={{ scale: conversation.status === "connected" ? 0.95 : 1 }}
					>
						<MicOff className='w-5 h-5' />
						<span className='text-sm'>Stop Conversation</span>
					</motion.button>
				</div>
			</div>
		</div>
	);
}
