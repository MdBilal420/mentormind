import { motion } from "framer-motion";
import {
	ArrowLeft,
	Upload,
	FileImage,
	Copy,
	Download,
	Check,
	X,
	Loader2,
	Eye,
	Edit3,
	Plus,
	ClipboardCheck,
	BookOpen,
	Target,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "./ui/toast.jsx";

export default function EvaluateNotes({ onBack, transcription }) {
	const [uploadedImages, setUploadedImages] = useState([]);
	const [extractedTexts, setExtractedTexts] = useState([]);
	const [processing, setProcessing] = useState(false);
	const [copiedIndex, setCopiedIndex] = useState(null);
	const [showUploadDialog, setShowUploadDialog] = useState(false);
	const [activeTab, setActiveTab] = useState('extract'); // 'extract' or 'evaluate'
	
	// Evaluation state
	const [evaluationForm, setEvaluationForm] = useState({
		evaluation_type: '',
		user_notes: '',
		reference_content: transcription || '',
		goal: ''
	});
	const [evaluationResult, setEvaluationResult] = useState(null);
	const [evaluating, setEvaluating] = useState(false);
	const [selectedTextId, setSelectedTextId] = useState(null);
	
	const fileInputRef = useRef(null);

	// Supported file types
	const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

	// Evaluation types
	const evaluationTypes = [
		{ value: 'completeness', label: 'Completeness', description: 'How complete the notes are compared to reference content' },
		{ value: 'depth', label: 'Depth of Understanding', description: 'Depth of understanding demonstrated in the notes' },
		{ value: 'structure', label: 'Structure & Organization', description: 'Organization and logical flow of the notes' },
		{ value: 'clarity', label: 'Clarity & Readability', description: 'Readability and communication effectiveness' },
		{ value: 'relevance', label: 'Relevance to Goal', description: 'How well notes align with a specific goal' },
		{ value: 'practice', label: 'Practical Application', description: 'Practical applicability and actionable insights' },
		{ value: 'overall_score', label: 'Overall Score', description: 'Comprehensive evaluation with scoring' }
	];

	// Cleanup effect to prevent lingering toasts
	useEffect(() => {
		return () => {
			toast.dismiss();
		};
	}, []);

	// Update evaluation form when transcription changes
	useEffect(() => {
		if (transcription) {
			setEvaluationForm(prev => ({
				...prev,
				reference_content: transcription
			}));
		}
	}, [transcription]);

	// Update evaluation form when a text is selected
	useEffect(() => {
		if (selectedTextId) {
			const selectedText = extractedTexts.find(text => text.id === selectedTextId);
			if (selectedText) {
				setEvaluationForm(prev => ({
					...prev,
					user_notes: selectedText.text
				}));
			}
		}
	}, [selectedTextId, extractedTexts]);

	const handleFileUpload = (event) => {
		console.log("handleFileUpload called");
		const files = Array.from(event.target.files);
		const validFiles = files.filter(file => supportedTypes.includes(file.type));

		if (validFiles.length === 0) {
			console.log("No valid files found, showing error toast");
			toast.error("Please upload valid image files (JPEG, PNG, WebP)");
			return;
		}

		const newImages = validFiles.map(file => ({
			id: Date.now() + Math.random(),
			file,
			preview: URL.createObjectURL(file),
			name: file.name,
			size: file.size
		}));

		setUploadedImages(prev => [...prev, ...newImages]);
		console.log("Files uploaded successfully, showing success toast");
		toast.success(`${validFiles.length} image(s) uploaded successfully`);
		setShowUploadDialog(false);
	};

	const removeImage = (imageId) => {
		console.log("Removing image:", imageId);
		setUploadedImages(prev => {
			const image = prev.find(img => img.id === imageId);
			if (image) {
				URL.revokeObjectURL(image.preview);
			}
			return prev.filter(img => img.id !== imageId);
		});
		setExtractedTexts(prev => prev.filter(text => text.imageId !== imageId));
	};

	const extractTextFromImage = async (image) => {
		console.log("extractTextFromImage called for:", image.name);
		setProcessing(true);
		const toastId = toast.loading(`Extracting text from ${image.name}...`);
		console.log("image");

		try {
			const formData = new FormData();
			formData.append('file', image.file);

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/extract-text-llm`, {
				method: 'POST',
				body: formData,
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			
			if (!result.success) {
				throw new Error(result.error || 'Failed to extract text');
			}

			const extractedText = {
				id: Date.now() + Math.random(),
				imageId: image.id,
				text: result.text,
				timestamp: new Date().toISOString(),
				confidence: Math.round(result.confidence * 100),
				method: result.method || 'llm'
			};

			setExtractedTexts(prev => [...prev, extractedText]);
			
			console.log("Text extracted successfully, dismissing loading and showing success");
			toast.dismiss(toastId);
			toast.success(`Text extracted from ${image.name} (${extractedText.confidence}% confidence)`);
		} catch (error) {
			console.error('Error extracting text:', error);
			console.log("Text extraction failed, dismissing loading and showing error");
			toast.dismiss(toastId);
			toast.error(`Failed to extract text from ${image.name}: ${error.message}`);
		} finally {
			setProcessing(false);
		}
	};

	const copyText = async (text, index) => {
		console.log("copyText called for index:", index);
		try {
			await navigator.clipboard.writeText(text);
			setCopiedIndex(index);
			setTimeout(() => setCopiedIndex(null), 2000);
			console.log("Text copied successfully, showing success toast");
			toast.success("Text copied to clipboard");
		} catch (error) {
			console.error('Error copying text:', error);
			console.log("Text copy failed, showing error toast");
			toast.error("Failed to copy text");
		}
	};

	const downloadText = (text, filename) => {
		console.log("downloadText called for:", filename);
		const blob = new Blob([text], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${filename.replace(/\.[^/.]+$/, '')}_extracted.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		console.log("Text downloaded successfully, showing success toast");
		toast.success("Text downloaded successfully");
	};

	const formatFileSize = (bytes) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	const useTextForEvaluation = (textId) => {
		setSelectedTextId(textId);
		setActiveTab('evaluate');
		toast.success("Text loaded for evaluation");
	};

	const handleEvaluationFormChange = (field, value) => {
		setEvaluationForm(prev => ({
			...prev,
			[field]: value
		}));
	};

	const evaluateNotes = async () => {
		// Validate form
		if (!evaluationForm.evaluation_type) {
			toast.error("Please select an evaluation type");
			return;
		}
		if (!evaluationForm.user_notes.trim()) {
			toast.error("Please provide user notes");
			return;
		}
		if (!transcription) {
			toast.error("No transcription available for reference");
			return;
		}
		if (evaluationForm.evaluation_type === 'relevance' && !evaluationForm.goal.trim()) {
			toast.error("Please provide a goal for relevance evaluation");
			return;
		}

		setEvaluating(true);
		const toastId = toast.loading("Evaluating your notes...");

		try {
			const requestBody = {
				evaluation_type: evaluationForm.evaluation_type,
				user_notes: evaluationForm.user_notes,
				reference_content: transcription
			};

			if (evaluationForm.evaluation_type === 'relevance') {
				requestBody.goal = evaluationForm.goal;
			}

			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/evaluate/notes`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(requestBody),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.detail || `HTTP error! status: ${response.status}`);
			}

			const result = await response.json();
			setEvaluationResult(result.result);
			
			toast.dismiss(toastId);
			toast.success("Note evaluation completed!");
		} catch (error) {
			console.error('Error evaluating notes:', error);
			toast.dismiss(toastId);
			toast.error(`Failed to evaluate notes: ${error.message}`);
		} finally {
			setEvaluating(false);
		}
	};

	const getLoadingMessage = (evaluationType) => {
		const messages = {
			completeness: "Analyzing completeness of your notes...",
			depth: "Evaluating depth of understanding...",
			structure: "Reviewing organization and structure...",
			clarity: "Assessing clarity and readability...",
			relevance: "Checking relevance to your goal...",
			practice: "Evaluating practical applicability...",
			overall_score: "Generating comprehensive evaluation..."
		};
		return messages[evaluationType] || "Evaluating your notes...";
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='bg-white/50 rounded-lg p-3 md:p-4 h-full overflow-y-auto'
		>
			{/* Header */}
			<div className='flex items-center justify-between mb-6'>
				<div className='flex items-center gap-2'>
					<button
						onClick={onBack}
						className='p-1 hover:bg-emerald-100 rounded-md transition-colors'
						title='Go back'
					>
						<ArrowLeft className='h-4 w-4 text-emerald-600' />
					</button>
					<FileImage className='h-5 w-5 text-emerald-600' />
					<h3 className='text-lg font-semibold text-emerald-800'>
						Text Extraction & Evaluation
					</h3>
				</div>
				{activeTab === 'extract' && (
					<button
						onClick={() => setShowUploadDialog(true)}
						className='bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2'
					>
						<Plus className='h-4 w-4' />
						Upload Images
					</button>
				)}
			</div>

			{/* Tabs */}
			<div className='flex gap-2 mb-6 border-b border-emerald-100'>
				<button
					onClick={() => setActiveTab('extract')}
					className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
						activeTab === 'extract'
							? 'bg-emerald-600 text-white'
							: 'text-emerald-600 hover:bg-emerald-50'
					}`}
				>
					<FileImage className='h-4 w-4 inline mr-2' />
					Extract Text
				</button>
				<button
					onClick={() => setActiveTab('evaluate')}
					className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
						activeTab === 'evaluate'
							? 'bg-emerald-600 text-white'
							: 'text-emerald-600 hover:bg-emerald-50'
					}`}
				>
					<ClipboardCheck className='h-4 w-4 inline mr-2' />
					Evaluate Notes
				</button>
			</div>

			{/* Upload Dialog */}
			{showUploadDialog && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						className='bg-white rounded-lg p-6 max-w-md w-full'
					>
						<div className='flex items-center justify-between mb-4'>
							<h4 className='text-lg font-semibold text-emerald-800'>
								Upload Images
							</h4>
							<button
								onClick={() => setShowUploadDialog(false)}
								className='p-1 hover:bg-gray-100 rounded-md transition-colors'
							>
								<X className='h-4 w-4 text-gray-600' />
							</button>
						</div>
						
						<div
							onClick={() => fileInputRef.current?.click()}
							className='border-2 border-dashed border-emerald-300 rounded-lg p-6 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors'
						>
							<Upload className='h-8 w-8 text-emerald-500 mx-auto mb-3' />
							<h5 className='text-md font-medium text-emerald-800 mb-2'>
								Upload Handwritten Notes
							</h5>
							<p className='text-sm text-emerald-600 mb-3'>
								Click to upload or drag and drop images
							</p>
							<p className='text-xs text-emerald-500'>
								Supported: JPEG, PNG, WebP • Max: 10MB
							</p>
						</div>
						
						<input
							ref={fileInputRef}
							type="file"
							multiple
							accept="image/*"
							onChange={handleFileUpload}
							className='hidden'
						/>
						
						<div className='flex gap-3 mt-4'>
							<button
								onClick={() => setShowUploadDialog(false)}
								className='flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
							>
								Cancel
							</button>
						</div>
					</motion.div>
				</div>
			)}

			{/* Tab Content */}
			{activeTab === 'extract' && (
				<div className='space-y-6'>
					{/* Uploaded Images */}
					{uploadedImages.length > 0 && (
						<div>
							<h4 className='text-md font-semibold text-emerald-800 mb-3'>
								Uploaded Images ({uploadedImages.length})
							</h4>
							<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
								{uploadedImages.map((image) => {
									const extractedText = extractedTexts.find(text => text.imageId === image.id);
									const isProcessing = processing && !extractedText;

									return (
										<motion.div
											key={image.id}
											initial={{ opacity: 0, scale: 0.9 }}
											animate={{ opacity: 1, scale: 1 }}
											className='bg-white/70 rounded-lg shadow-sm border border-emerald-100 overflow-hidden'
										>
											<div className='relative'>
												<img
													src={image.preview}
													alt={image.name}
													className='w-full h-32 object-cover'
												/>
												<button
													onClick={() => removeImage(image.id)}
													className='absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors'
													title='Remove image'
												>
													<X className='h-3 w-3' />
												</button>
											</div>

											<div className='p-3'>
												<div className='flex items-center gap-2 mb-2'>
													<FileImage className='h-4 w-4 text-emerald-500' />
													<p className='text-sm font-medium text-emerald-800 truncate'>
														{image.name}
													</p>
												</div>
												<p className='text-xs text-emerald-600 mb-3'>
													{formatFileSize(image.size)}
												</p>

												<div className='flex gap-2'>
													{!extractedText && !isProcessing && (
														<button
															onClick={() => extractTextFromImage(image)}
															className='flex-1 bg-emerald-600 text-white text-xs px-3 py-2 rounded-md hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1'
														>
															<Eye className='h-3 w-3' />
															Extract Text
														</button>
													)}
													{isProcessing && (
														<button
															disabled
															className='flex-1 bg-emerald-400 text-white text-xs px-3 py-2 rounded-md flex items-center justify-center gap-1'
														>
															<Loader2 className='h-3 w-3 animate-spin' />
															Processing...
														</button>
													)}
													{extractedText && (
														<button
															onClick={() => extractTextFromImage(image)}
															className='flex-1 bg-blue-600 text-white text-xs px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-1'
														>
															<Edit3 className='h-3 w-3' />
															Re-extract
														</button>
													)}
												</div>
											</div>
										</motion.div>
									);
								})}
							</div>
						</div>
					)}

					{/* Extracted Text Results */}
					{extractedTexts.length > 0 && (
						<div>
							<h4 className='text-md font-semibold text-emerald-800 mb-3'>
								Extracted Text ({extractedTexts.length})
							</h4>
							<div className='space-y-4'>
								{extractedTexts.map((extractedText, index) => {
									const image = uploadedImages.find(img => img.id === extractedText.imageId);
									
									return (
										<motion.div
											key={extractedText.id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.3, delay: index * 0.1 }}
											className='bg-white/70 rounded-lg shadow-sm border border-emerald-100 p-4'
										>
											<div className='flex items-center justify-between mb-3'>
												<div className='flex items-center gap-2'>
													<FileImage className='h-4 w-4 text-emerald-500' />
													<p className='text-sm font-medium text-emerald-800'>
														{image?.name || 'Unknown Image'}
													</p>
												</div>
												<div className='flex items-center gap-2'>
													<span className='text-xs text-emerald-600'>
														Confidence: {extractedText.confidence}%
													</span>
													<button
														onClick={() => useTextForEvaluation(extractedText.id)}
														className='px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1'
														title='Use for evaluation'
													>
														<Target className='h-3 w-3' />
														Evaluate
													</button>
													<button
														onClick={() => copyText(extractedText.text, index)}
														className='p-1 hover:bg-emerald-100 rounded transition-colors'
														title='Copy text'
													>
														{copiedIndex === index ? (
															<Check className='h-4 w-4 text-green-600' />
														) : (
															<Copy className='h-4 w-4 text-emerald-600' />
														)}
													</button>
													<button
														onClick={() => downloadText(extractedText.text, image?.name || 'extracted')}
														className='p-1 hover:bg-emerald-100 rounded transition-colors'
														title='Download text'
													>
														<Download className='h-4 w-4 text-emerald-600' />
													</button>
												</div>
											</div>

											<div className='bg-gray-50 rounded-md p-3'>
												<pre className='text-sm text-gray-800 whitespace-pre-wrap font-sans'>
													{extractedText.text}
												</pre>
											</div>

											<p className='text-xs text-gray-500 mt-2'>
												Extracted: {new Date(extractedText.timestamp).toLocaleString()}
											</p>
										</motion.div>
									);
								})}
							</div>
						</div>
					)}

					{/* Empty State */}
					{uploadedImages.length === 0 && (
						<div className='text-center py-12'>
							<FileImage className='h-16 w-16 text-emerald-300 mx-auto mb-4' />
							<h4 className='text-lg font-medium text-emerald-800 mb-2'>
								No images uploaded yet
							</h4>
							<p className='text-sm text-emerald-600 mb-4'>
								Click the "Upload Images" button to get started
							</p>
						</div>
					)}
				</div>
			)}

			{activeTab === 'evaluate' && (
				<div className='space-y-6'>
					{/* Reference Content Info */}
					{transcription && (
						<div className='bg-blue-50/70 rounded-lg p-4 border border-blue-200'>
							<div className='flex items-center gap-2 mb-2'>
								<BookOpen className='h-4 w-4 text-blue-600' />
								<h4 className='text-sm font-semibold text-blue-800'>
									Using Transcription as Reference
								</h4>
							</div>
							<p className='text-xs text-blue-600'>
								Your notes will be evaluated against the transcribed content.
							</p>
						</div>
					)}

					{/* No Transcription Warning */}
					{!transcription && (
						<div className='bg-orange-50/70 rounded-lg p-4 border border-orange-200'>
							<div className='flex items-center gap-2 mb-2'>
								<BookOpen className='h-4 w-4 text-orange-600' />
								<h4 className='text-sm font-semibold text-orange-800'>
									No Transcription Available
								</h4>
							</div>
							<p className='text-xs text-orange-600'>
								Please transcribe some audio content first to use as reference for evaluation.
							</p>
						</div>
					)}

					{/* Evaluation Form */}
					<div className='bg-white/70 rounded-lg p-4 shadow-sm border border-emerald-100'>
						<h4 className='text-md font-semibold text-emerald-800 mb-3 flex items-center gap-2'>
							<ClipboardCheck className='h-4 w-4' />
							Note Evaluation
							{selectedTextId && (
								<span className='text-xs text-blue-600 ml-2'>
									(Using extracted text)
								</span>
							)}
						</h4>

						{/* Goal (only for relevance evaluation) */}
						{evaluationForm.evaluation_type === 'relevance' && (
							<div className='mb-3'>
								<label className='block text-xs font-medium text-emerald-800 mb-1'>
									Learning Goal
								</label>
								<input
									type="text"
									value={evaluationForm.goal}
									onChange={(e) => handleEvaluationFormChange('goal', e.target.value)}
									placeholder="Enter your learning goal..."
									className='w-full p-2 text-sm border border-emerald-200 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
									disabled={!transcription}
								/>
							</div>
						)}

						{/* Evaluation Type and Button Row */}
						<div className='flex gap-3 items-end'>
							<div className='flex-1'>
								<label className='block text-xs font-medium text-emerald-800 mb-1'>
									Evaluation Type
								</label>
								<select
									value={evaluationForm.evaluation_type}
									onChange={(e) => handleEvaluationFormChange('evaluation_type', e.target.value)}
									className='w-full p-2 text-sm border border-emerald-200 rounded-md focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500'
									disabled={!transcription}
								>
									<option value="">Select evaluation type...</option>
									{evaluationTypes.map(type => (
										<option key={type.value} value={type.value}>
											{type.label}
										</option>
									))}
								</select>
							</div>
							
							{/* Evaluate Button */}
							<button
								onClick={evaluateNotes}
								disabled={evaluating || !transcription || !evaluationForm.user_notes.trim()}
								className='bg-emerald-600 text-white py-2 px-4 text-sm rounded-md hover:bg-emerald-700 transition-colors disabled:bg-emerald-400 flex items-center gap-2 whitespace-nowrap'
							>
								{evaluating ? (
									<>
										<Loader2 className='h-3 w-3 animate-spin' />
										Evaluating...
									</>
								) : (
									<>
										<ClipboardCheck className='h-3 w-3' />
										Evaluate
									</>
								)}
							</button>
						</div>

						{/* Evaluation Type Description */}
						{evaluationForm.evaluation_type && (
							<p className='text-xs text-emerald-600 mt-2'>
								{evaluationTypes.find(t => t.value === evaluationForm.evaluation_type)?.description}
							</p>
						)}
					</div>

					{/* Evaluation Results */}
					{evaluationResult && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							className='bg-white/70 rounded-lg p-6 shadow-sm border border-emerald-100'
						>
							<h4 className='text-lg font-semibold text-emerald-800 mb-4 flex items-center gap-2'>
								<BookOpen className='h-5 w-5' />
								Evaluation Results
							</h4>
							<div className='bg-gray-50 rounded-md p-4'>
								<pre className='text-sm text-gray-800 whitespace-pre-wrap font-sans'>
									{evaluationResult}
								</pre>
							</div>
						</motion.div>
					)}

					{/* Empty State for Evaluate Tab */}
					{!evaluationForm.user_notes && extractedTexts.length > 0 && transcription && (
						<div className='text-center py-8'>
							<ClipboardCheck className='h-12 w-12 text-emerald-300 mx-auto mb-3' />
							<h4 className='text-md font-medium text-emerald-800 mb-2'>
								Select text to evaluate
							</h4>
							<p className='text-sm text-emerald-600'>
								Click the "Evaluate" button on any extracted text to load it here
							</p>
						</div>
					)}
				</div>
			)}
		</motion.div>
	);
} 