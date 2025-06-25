import { motion } from "framer-motion";
import {
	Upload,
	FileImage,
	Copy,
	Download,
	Check,
	X,
	Loader2,
	Eye,
	Edit3,
	Trash2,
	ArrowLeft,
} from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "./ui/toast.jsx";

export default function HandwrittenNotesUploader({ onTextExtracted, onBack }) {
	const [uploadedImages, setUploadedImages] = useState([]);
	const [extractedTexts, setExtractedTexts] = useState([]);
	const [processing, setProcessing] = useState(false);
	const [copiedIndex, setCopiedIndex] = useState(null);
	const fileInputRef = useRef(null);

	// Supported file types
	const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

	const handleFileUpload = (event) => {
		const files = Array.from(event.target.files);
		const validFiles = files.filter(file => supportedTypes.includes(file.type));

		if (validFiles.length === 0) {
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
		toast.success(`${validFiles.length} image(s) uploaded successfully`);
	};

	const removeImage = (imageId) => {
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
		setProcessing(true);
		const toastId = toast.loading(`Extracting text from ${image.name}...`);

		try {
			// Create FormData for file upload
			const formData = new FormData();
			formData.append('file', image.file);

			// Call the real OCR API endpoint
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/extract-text-from-image`, {
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
				confidence: Math.round(result.confidence * 100), // Convert to percentage
				processingTime: result.processing_time
			};

			setExtractedTexts(prev => [...prev, extractedText]);
			
			// Notify parent component if callback provided
			if (onTextExtracted) {
				onTextExtracted(extractedText);
			}

			toast.dismiss(toastId);
			toast.success(`Text extracted from ${image.name} (${extractedText.confidence}% confidence)`);
		} catch (error) {
			console.error('Error extracting text:', error);
			toast.dismiss(toastId);
			toast.error(`Failed to extract text from ${image.name}: ${error.message}`);
		} finally {
			setProcessing(false);
		}
	};

	const copyText = async (text, index) => {
		try {
			await navigator.clipboard.writeText(text);
			setCopiedIndex(index);
			setTimeout(() => setCopiedIndex(null), 2000);
			toast.success("Text copied to clipboard");
		} catch (error) {
			console.error('Error copying text:', error);
			toast.error("Failed to copy text");
		}
	};

	const downloadText = (text, filename) => {
		const blob = new Blob([text], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${filename.replace(/\.[^/.]+$/, '')}_extracted.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		toast.success("Text downloaded successfully");
	};

	const formatFileSize = (bytes) => {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='bg-white/50 rounded-lg p-4 h-full overflow-y-auto'
		>
			{/* Header */}
			<div className='mb-6'>
				<div className='flex items-center gap-2 mb-2'>
					<button
						onClick={onBack}
						className='p-1 hover:bg-emerald-100 rounded-md transition-colors'
						title='Go back'
					>
						<ArrowLeft className='h-4 w-4 text-emerald-600' />
					</button>
					<h3 className='text-lg font-semibold text-emerald-800'>
						Handwritten Notes OCR
					</h3>
				</div>
				<p className='text-sm text-emerald-600'>
					Upload images of handwritten notes to extract and analyze text
				</p>
			</div>

			{/* Upload Area */}
			<div className='mb-6'>
				<div
					onClick={() => fileInputRef.current?.click()}
					className='border-2 border-dashed border-emerald-300 rounded-lg p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/50 transition-colors'
				>
					<Upload className='h-12 w-12 text-emerald-500 mx-auto mb-4' />
					<h4 className='text-lg font-medium text-emerald-800 mb-2'>
						Upload Handwritten Notes
					</h4>
					<p className='text-sm text-emerald-600 mb-4'>
						Click to upload or drag and drop images (JPEG, PNG, WebP)
					</p>
					<p className='text-xs text-emerald-500'>
						Supported formats: JPEG, PNG, WebP • Max file size: 10MB
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
			</div>

			{/* Uploaded Images */}
			{uploadedImages.length > 0 && (
				<div className='mb-6'>
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
									className='bg-white rounded-lg shadow-sm border border-emerald-100 overflow-hidden'
								>
									{/* Image Preview */}
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

									{/* Image Info */}
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

										{/* Action Buttons */}
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
									className='bg-white rounded-lg shadow-sm border border-emerald-100 p-4'
								>
									{/* Header */}
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

									{/* Extracted Text */}
									<div className='bg-gray-50 rounded-md p-3'>
										<pre className='text-sm text-gray-800 whitespace-pre-wrap font-sans'>
											{extractedText.text}
										</pre>
									</div>

									{/* Timestamp */}
									<p className='text-xs text-gray-500 mt-2'>
										Extracted: {new Date(extractedText.timestamp).toLocaleString()}
									</p>
								</motion.div>
							);
						})}
					</div>
				</div>
			)}
		</motion.div>
	);
} 