import { CheckCircle, FileText, Loader2, Play } from "lucide-react";

const SampleFiles = ({
	type,
	samples,
	onSelect,
	selectedId,
	loadingSample,
}) => (
	<div className='mt-6 border-t border-emerald-100 pt-4'>
		<h3 className='text-sm font-medium text-emerald-800 mb-3'>
			Sample {type} Files
		</h3>
		<div className='space-y-2'>
			{samples.map((sample) => (
				<button
					key={sample.id}
					onClick={() => onSelect(sample)}
					disabled={loadingSample}
					className={`w-full p-3 rounded-lg border transition-all flex items-start gap-3
                        ${
													selectedId === sample.id
														? "border-emerald-500 bg-emerald-50"
														: "border-gray-200 hover:border-emerald-200 hover:bg-emerald-50/50"
												}
                        ${loadingSample ? "opacity-50 cursor-not-allowed" : ""}
                    `}
				>
					{type === "YouTube" ? (
						// YouTube thumbnail container
						<div className='relative flex-shrink-0 w-24 h-16 rounded-md overflow-hidden'>
							<img
								src={sample.thumbnail}
								alt={sample.name}
								className='object-cover w-full h-full'
							/>
							{loadingSample && selectedId === sample.id ? (
								<div className='absolute inset-0 bg-emerald-500/20 flex items-center justify-center'>
									<Loader2 className='h-5 w-5 text-emerald-500 animate-spin' />
								</div>
							) : (
								selectedId === sample.id && (
									<div className='absolute inset-0 bg-emerald-500/20 flex items-center justify-center'>
										<CheckCircle className='h-5 w-5 text-emerald-500' />
									</div>
								)
							)}
						</div>
					) : (
						// Icon for non-YouTube samples
						<>
							{loadingSample && selectedId === sample.id ? (
								<Loader2 className='h-5 w-5 text-emerald-500 animate-spin flex-shrink-0 mt-0.5' />
							) : selectedId === sample.id ? (
								<CheckCircle className='h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5' />
							) : type === "Audio" ? (
								<Play className='h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5' />
							) : (
								<FileText className='h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5' />
							)}
						</>
					)}
					<div className='text-left flex-1'>
						<p className='text-sm font-medium text-emerald-900'>
							{sample.name}
						</p>
						{sample.description && (
							<p className='text-xs text-emerald-600 mt-0.5'>
								{sample.description}
							</p>
						)}
					</div>
				</button>
			))}
		</div>
	</div>
);

export default SampleFiles;
