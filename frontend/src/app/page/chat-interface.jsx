"use client";

import ChatHeader from "@/components/ChatHeader";
import ChatInput from "@/components/ChatInput";
import ChatMessages from "@/components/ChatMessages";
import Quiz from "@/components/quiz/Quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useChat from "@/hooks/useChat";

const ChatInterface = () => {
	const [
		{
			messages,
			input,
			videos,
			isListening,
			messagesEndRef,
			content,
			resourceType,
			pdfs,
		},
		{
			setResourceType,
			handleSend,
			handleVoiceToggle,
			setInput,
			handleFileUpload,
			setSelectedResource,
		},
	] = useChat();

	return (
		<div className='flex flex-col w-full mx-auto p-4 h-full max-h-[500px]'>
			<ChatHeader />
			<div className='flex flex-col lg:flex-row w-full mx-auto p-4 h-full'>
				{/* <Resource
					setInput={setInput}
					setResourceType={setResourceType}
					setSelectedResource={setSelectedResource}
					videos={videos}
					pdfs={pdfs}
					className='w-full lg:w-1/4'
				/> */}
				<Card className='flex-grow flex flex-col w-full lg:w-2/4 h-full mb-4 lg:mb-0 lg:mx-4'>
					<CardHeader>
						<CardTitle>Edubot</CardTitle>
					</CardHeader>
					<CardContent className='flex-grow flex flex-col overflow-y-auto'>
						<ChatMessages messages={messages} messagesEndRef={messagesEndRef} />
						<ChatInput
							input={input}
							setInput={setInput}
							isListening={isListening}
							handleSend={handleSend}
							handleVoiceToggle={handleVoiceToggle}
							resourceType={resourceType}
							handleFileUpload={handleFileUpload}
						/>
					</CardContent>
				</Card>
				<Quiz content={content} className='w-full lg:w-1/4' />
			</div>
		</div>
	);
};

export default ChatInterface;
