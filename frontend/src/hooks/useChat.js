import { useEffect, useRef, useState } from "react";

const API_URL = "http://localhost:8000";
//const API_URL = "https://bilal-420-edubot-hf.hf.space";

const extractVideoId = (url) => {
	const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
	const match = url.match(regExp);
	return match && match[2].length === 11 ? match[2] : null;
};

const useChat = () => {
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");
	const [isListening, setIsListening] = useState(false);
	const [sessionId, setSessionId] = useState("");
	const messagesEndRef = useRef(null);
	const [resourceType, setResourceType] = useState("text");
	const [videos, setVideos] = useState([
		{
			title: "Quantum Computing",
			url: "https://www.youtube.com/watch?v=lt4OsgmUTGI",
		},
		{ title: "Blockchain", url: "https://www.youtube.com/watch?v=SSo_EIwHSd4" },
	]);
	const [pdfs, setPdfs] = useState([]);
	const [selectedResource, setSelectedResource] = useState(null);
	const [content, setContent] = useState("");

	console.log("content", messages);

	useEffect(() => {
		setSessionId(Math.random().toString(36).substring(7));

		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		if (SpeechRecognition) {
			const recognition = new SpeechRecognition();
			recognition.continuous = true;
			recognition.interimResults = true;

			recognition.onresult = (event) => {
				const transcript = Array.from(event.results)
					.map((result) => result[0])
					.map((result) => result.transcript)
					.join("");

				setInput(transcript);
			};

			window.recognition = recognition;
		}
	}, []);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSend = async () => {
		if (!input.trim()) return;

		const userMessage = { type: "user", content: input };
		setMessages((prev) => [...prev, userMessage]);
		setInput("");

		try {
			const response = await fetch(`${API_URL}/chat`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ text: input, session_id: sessionId }),
			});

			const data = await response.json();
			setMessages((prev) => [
				...prev,
				{ type: "bot", content: data.explanation },
			]);
			setContent(data.explanation);
		} catch (error) {
			console.error("Error sending message:", error);
			setMessages((prev) => [
				...prev,
				{
					type: "error",
					content: "Sorry, there was an error processing your message.",
				},
			]);
			setContent("");
		}
		// else if (resourceType === "video") {
		// 	try {
		// 		const videoId = extractVideoId(selectedResource);
		// 		const response = await fetch(
		// 			`${API_URL}/fetch-transcript-video/${videoId}/${input}`
		// 		);

		// 		const data = await response.json();
		// 		console.log("data", data);
		// 		setMessages((prev) => [
		// 			...prev,
		// 			{ type: "bot", content: data.transcript },
		// 		]);
		// 		setContent(data.transcript);
		// 		setResourceType("text");
		// 		setSelectedResource(null);
		// 	} catch (error) {
		// 		console.error("Error fetching transcript:", error);
		// 		setMessages((prev) => [
		// 			...prev,
		// 			{
		// 				type: "error",
		// 				content: "Sorry, there was an error fetching the transcript.",
		// 			},
		// 		]);
		// 		setContent("");
		// 	}
		// }
	};

	const handleVoiceToggle = () => {
		if (isListening) {
			window.recognition?.stop();
		} else {
			window.recognition?.start();
		}
		setIsListening(!isListening);
	};

	const handleFileUpload = async (event) => {
		const file = event.target.files[0];
		if (!file) return;

		const formData = new FormData();
		formData.append("file", file);

		try {
			const response = await fetch("http://localhost:8000/upload/pdf", {
				method: "POST",
				body: formData,
			});

			const data = await response.json();
			setMessages((prev) => [
				...prev,
				{
					type: "bot",
					content: data.content,
				},
				{
					type: "system",
					content: `Successfully uploaded ${file.name}. You can now ask questions about its content.`,
				},
			]);
			setPdfs((prev) => [...prev, { name: file.name }]);
			setContent(data.content);
		} catch (error) {
			console.error("Error uploading file:", error);
			setMessages((prev) => [
				...prev,
				{
					type: "error",
					content: "Sorry, there was an error uploading your file.",
				},
			]);
		}
	};

	return [
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
			setVideos,
			setResourceType,
			handleSend,
			handleVoiceToggle,
			setInput,
			handleFileUpload,
			setSelectedResource,
		},
	];
};

export default useChat;
