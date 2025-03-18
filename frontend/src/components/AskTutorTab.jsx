import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useState } from "react";

export default function AskTutorTab({ data }) {
	const [question, setQuestion] = useState("");

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='bg-white/50 rounded-lg p-3 md:p-4 h-full flex flex-col'
		>
			<div className='flex-1 overflow-y-auto mb-3 md:mb-4 bg-white/70 rounded-lg p-3 md:p-4'>
				<div className='space-y-3 md:space-y-4'>
					{data.transcription ? (
						<>
							<div className='flex justify-end'>
								<div className='bg-emerald-100 rounded-lg p-2 md:p-3 max-w-[80%]'>
									<p className='text-xs md:text-sm text-emerald-800'>
										What are the key points of this lecture?
									</p>
								</div>
							</div>
							<div className='flex justify-start'>
								<div className='bg-white rounded-lg p-2 md:p-3 max-w-[80%] shadow-sm'>
									<p className='text-xs md:text-sm text-emerald-900'>
										Based on the lecture, the key points are...
									</p>
								</div>
							</div>
						</>
					) : (
						<div className='flex flex-col items-center justify-center h-full text-center py-6 md:py-8'>
							<p className='text-xs md:text-sm text-emerald-600 italic'>
								Ask questions about the lecture once content is processed
							</p>
						</div>
					)}
				</div>
			</div>

			<div className='flex gap-2'>
				<textarea
					className='flex-1 p-2 md:p-3 text-xs md:text-sm rounded-lg border border-emerald-200 focus:ring focus:ring-emerald-300 focus:border-emerald-500 outline-none resize-none'
					rows={2}
					placeholder='Ask a question about the lecture...'
					value={question}
					onChange={(e) => setQuestion(e.target.value)}
				></textarea>
				<button
					className='px-3 py-2 bg-emerald-600 text-white text-xs md:text-sm rounded-lg hover:bg-emerald-700 transition-colors self-end flex items-center gap-1'
					disabled={!data.transcription || !question}
				>
					<Send className='h-3.5 w-3.5' />
					Ask
				</button>
			</div>
		</motion.div>
	);
}
