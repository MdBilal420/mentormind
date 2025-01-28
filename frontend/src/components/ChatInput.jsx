import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, MicOff, Send, Upload } from "lucide-react";

const ChatInput = ({
	input,
	setInput,
	isListening,
	handleSend,
	handleVoiceToggle,
	handleFileUpload,
}) => (
	<div className='flex gap-2'>
		<Button
			variant='outline'
			size='icon'
			onClick={() => document.getElementById("file-upload").click()}
		>
			<Upload className='h-4 w-4' />
		</Button>
		<Input
			type='file'
			id='file-upload'
			className='hidden'
			onChange={handleFileUpload}
			accept='.pdf'
		/>
		<Button
			variant={isListening ? "destructive" : "outline"}
			size='icon'
			onClick={handleVoiceToggle}
		>
			{isListening ? (
				<MicOff className='h-4 w-4' />
			) : (
				<Mic className='h-4 w-4' />
			)}
		</Button>

		<Input
			value={input}
			onChange={(e) => setInput(e.target.value)}
			onKeyPress={(e) => e.key === "Enter" && handleSend()}
			placeholder='What do you want to know?'
			className='flex-grow'
		/>

		<Button onClick={handleSend}>
			<Send className='h-4 w-4' />
		</Button>
	</div>
);

export default ChatInput;
