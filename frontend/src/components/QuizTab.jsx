import { motion } from "framer-motion";

export default function QuizTab({ data }) {
	if (!data.questions || data.questions.length === 0) {
		return (
			<div className='flex flex-col items-center justify-center h-full text-center'>
				<div className='w-12 h-12 md:w-16 md:h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4'>
					<span className='text-xl md:text-2xl font-bold text-emerald-500'>
						?
					</span>
				</div>
				<p className='text-emerald-800 font-medium'>
					No quiz questions available yet
				</p>
				<p className='text-xs md:text-sm text-emerald-600 mt-2'>
					Process content to generate quiz questions
				</p>
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='bg-white/50 rounded-lg p-3 md:p-4 h-full overflow-y-auto'
		>
			<div className='space-y-4 md:space-y-6'>
				{data.questions.map((q, idx) => (
					<div
						key={idx}
						className='bg-white/70 rounded-lg p-3 md:p-4 shadow-sm'
					>
						<p className='font-medium text-xs md:text-sm text-emerald-800 mb-2 md:mb-3'>
							{idx + 1}. {q.question}
						</p>
						<div className='space-y-1 md:space-y-2'>
							{q.options.map((option, optIdx) => (
								<div key={optIdx} className='flex items-center'>
									<input
										type='radio'
										name={`question-${idx}`}
										id={`q${idx}-opt${optIdx}`}
										className='mr-2'
									/>
									<label
										htmlFor={`q${idx}-opt${optIdx}`}
										className='text-xs md:text-sm text-emerald-700'
									>
										{option}
									</label>
								</div>
							))}
						</div>
					</div>
				))}
				<button className='px-3 py-2 bg-emerald-600 text-white text-xs md:text-sm rounded-lg hover:bg-emerald-700 transition-colors'>
					Check Answers
				</button>
			</div>
		</motion.div>
	);
}
