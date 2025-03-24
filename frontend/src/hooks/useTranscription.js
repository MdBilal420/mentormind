import { useState } from "react";

export function useTranscription() {
	const [transcriptionData, setTranscriptionData] = useState({
		transcription: "",
		sentences: [],
		audio: null,
		audioUrl: "",
		loading: false,
		error: null,
	});

	const processAudioFile = async (file) => {
		if (!file) {
			setTranscriptionData((prev) => ({
				...prev,
				error: "No audio file provided",
			}));
			return;
		}

		// Reset error state and set loading
		setTranscriptionData((prev) => ({
			...prev,
			loading: true,
			error: null,
		}));

		try {
			// Check if file is an audio file
			if (!file.type.startsWith("audio/")) {
				throw new Error(
					"The selected file is not an audio file. Please select a valid audio file."
				);
			}

			// Check file size (limit to 100MB for example)
			if (file.size > 100 * 1024 * 1024) {
				throw new Error(
					"File size exceeds the limit (100MB). Please select a smaller file."
				);
			}

			// Create object URL for the audio file for playback
			const audioUrl = URL.createObjectURL(file);

			// Create FormData for API call
			const formData = new FormData();
			formData.append("file", file);

			// Make API call to backend
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL}/api/transcribe`,
				{
					method: "POST",
					body: formData,
				}
			);

			// Handle HTTP errors
			if (!response.ok) {
				const errorData = await response.json().catch(() => null);
				const errorMessage =
					errorData?.detail ||
					`Server error: ${response.status} ${response.statusText}`;
				throw new Error(errorMessage);
			}

			const data = await response.json();

			if (data.success) {
				setTranscriptionData({
					transcription: data.transcription,
					sentences: data.sentences || [],
					audio: file,
					audioUrl,
					loading: false,
					error: null,
				});

				return {
					transcription: data.transcription,
					sentences: data.sentences || [],
					audioUrl,
				};
			} else {
				throw new Error(
					data.message || "Transcription failed for an unknown reason"
				);
			}
		} catch (error) {
			console.error("Error transcribing audio:", error);

			// Set error state
			setTranscriptionData((prev) => ({
				...prev,
				loading: false,
				error: error.message || "Failed to transcribe the audio file",
			}));

			throw error;
		}
	};

	const clearTranscription = () => {
		// Clean up any object URLs to prevent memory leaks
		if (transcriptionData.audioUrl) {
			URL.revokeObjectURL(transcriptionData.audioUrl);
		}

		setTranscriptionData({
			transcription: "",
			sentences: [],
			audio: null,
			audioUrl: "",
			loading: false,
			error: null,
		});
	};

	const retryTranscription = async () => {
		if (transcriptionData.audio) {
			return processAudioFile(transcriptionData.audio);
		} else {
			setTranscriptionData((prev) => ({
				...prev,
				error: "No audio file available to retry. Please upload a new file.",
			}));
		}
	};

	return {
		transcriptionData,
		processAudioFile,
		clearTranscription,
		retryTranscription,
	};
}
