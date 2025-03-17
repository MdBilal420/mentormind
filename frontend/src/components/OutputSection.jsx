import { motion } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export default function OutputSection({ data, activeTab, setActiveTab }) {
	return (
		<div className='h-full flex flex-col'>
			<div className='mb-4'>
				<h2 className='text-xl md:text-2xl font-semibold text-emerald-800 mb-4'>
					Lecture Analysis
				</h2>

				<div className='w-full overflow-x-auto pb-2'>
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className='w-full'
					>
						<TabsList className='w-full flex md:grid md:grid-cols-4'>
							<TabsTrigger
								value='transcription'
								className='flex-1 text-xs md:text-sm whitespace-nowrap'
							>
								Transcription
							</TabsTrigger>
							<TabsTrigger
								value='summary'
								className='flex-1 text-xs md:text-sm whitespace-nowrap'
							>
								Summary
							</TabsTrigger>
							<TabsTrigger
								value='ask'
								className='flex-1 text-xs md:text-sm whitespace-nowrap'
							>
								Ask Tutor
							</TabsTrigger>
							<TabsTrigger
								value='quiz'
								className='flex-1 text-xs md:text-sm whitespace-nowrap'
							>
								Test Knowledge
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>

			<div className='flex-1 bg-white/30 backdrop-blur-lg rounded-xl md:rounded-2xl shadow-lg md:shadow-xl p-3 md:p-6 border border-white/40'>
				{data.loading ? (
					<div className='flex flex-col items-center justify-center h-full'>
						<Loader2 className='h-10 w-10 md:h-12 md:w-12 animate-spin text-emerald-600' />
						<p className='mt-4 text-emerald-700'>Processing your content...</p>
					</div>
				) : (
					<Tabs
						value={activeTab}
						onValueChange={setActiveTab}
						className='h-full flex flex-col'
					>
						<div className='sr-only'>
							<TabsList>
								<TabsTrigger value='transcription'>Transcription</TabsTrigger>
								<TabsTrigger value='summary'>Summary</TabsTrigger>
								<TabsTrigger value='ask'>Ask Tutor</TabsTrigger>
								<TabsTrigger value='quiz'>Test Knowledge</TabsTrigger>
							</TabsList>
						</div>

						<div className='flex-1'>
							<TabsContent value='transcription' className='h-full'>
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5 }}
									className='bg-white/50 rounded-lg p-3 md:p-4 h-full overflow-y-auto'
								>
									{data.transcription ? (
										<p className='text-sm md:text-base text-emerald-900 whitespace-pre-line'>
											{data.transcription}
										</p>
									) : (
										<div className='flex flex-col items-center justify-center h-full text-center'>
											<div className='w-12 h-12 md:w-16 md:h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4'>
												<Loader2 className='h-6 w-6 md:h-8 md:w-8 text-emerald-500' />
											</div>
											<p className='text-emerald-800 font-medium'>
												No content to transcribe yet
											</p>
											<p className='text-xs md:text-sm text-emerald-600 mt-2'>
												Upload audio, a PDF, or provide a YouTube URL to get
												started
											</p>
										</div>
									)}
								</motion.div>
							</TabsContent>

							<TabsContent value='summary' className='h-full'>
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5 }}
									className='bg-white/50 rounded-lg p-3 md:p-4 h-full overflow-y-auto'
								>
									{data.summary ? (
										<p className='text-sm md:text-base text-emerald-900 whitespace-pre-line'>
											{data.summary}
										</p>
									) : (
										<div className='flex flex-col items-center justify-center h-full text-center'>
											<div className='w-12 h-12 md:w-16 md:h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4'>
												<FileText className='h-6 w-6 md:h-8 md:w-8 text-emerald-500' />
											</div>
											<p className='text-emerald-800 font-medium'>
												No summary available yet
											</p>
											<p className='text-xs md:text-sm text-emerald-600 mt-2'>
												Process content to generate a summary
											</p>
										</div>
									)}
								</motion.div>
							</TabsContent>

							<TabsContent value='ask' className='h-full'>
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
														Ask questions about the lecture once content is
														processed
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
										></textarea>
										<button className='px-3 py-2 bg-emerald-600 text-white text-xs md:text-sm rounded-lg hover:bg-emerald-700 transition-colors self-end'>
											Ask
										</button>
									</div>
								</motion.div>
							</TabsContent>

							<TabsContent value='quiz' className='h-full'>
								<motion.div
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5 }}
									className='bg-white/50 rounded-lg p-3 md:p-4 h-full overflow-y-auto'
								>
									{data.questions ? (
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
									) : (
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
									)}
								</motion.div>
							</TabsContent>
						</div>
					</Tabs>
				)}
			</div>
		</div>
	);
}
