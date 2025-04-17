import { Construction } from "lucide-react";

export default function TalkToTutorMode() {
	return (
		<div className='flex-1 flex flex-col items-center justify-center text-center px-4'>
			<div className='rounded-full p-3 mb-3 bg-yellow-50'>
				<Construction className='h-6 w-6 text-yellow-500' />
			</div>
			<h4 className='font-medium mb-2 text-yellow-800'>
				Talk to Tutor Mode - Coming Soon!
			</h4>
			<p className='text-sm text-yellow-600 max-w-md'>
				We're working on an exciting new feature that will allow you to have
				voice conversations with your AI tutor. Stay tuned!
			</p>
		</div>
	);
}
