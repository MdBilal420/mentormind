"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import InputSidebar from "./InputSidebar";
import OutputSection from "./OutputSection";

export default function Dashboard() {
	const [activeTab, setActiveTab] = useState("transcription");
	const [outputData, setOutputData] = useState({
		transcription: "",
		summary: "",
		loading: false,
	});
	const [inputType, setInputType] = useState("audio");
	const [sidebarOpen, setSidebarOpen] = useState(true);

	// Close sidebar by default on mobile
	useEffect(() => {
		const handleResize = () => {
			if (window.innerWidth < 768) {
				setSidebarOpen(false);
			} else {
				setSidebarOpen(true);
			}
		};

		// Initial check
		handleResize();

		// Listen for window resize
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	const handleProcessContent = async (data) => {
		// Close sidebar on mobile after processing
		if (window.innerWidth < 768) {
			setSidebarOpen(false);
		}

		// This will be implemented to handle API calls to our backend
		try {
			setOutputData({ ...outputData, loading: true });

			// Simulate API call with timeout
			await new Promise((resolve) => setTimeout(resolve, 2000));

			// Mock data for now
			setOutputData({
				transcription: "This is a sample transcription of the lecture...",
				summary:
					"The lecture covered key concepts related to AI and machine learning...",
				questions: [
					{
						question: "What is the main purpose of machine learning?",
						options: [
							"To replace human intelligence",
							"To enhance data processing capabilities",
							"To learn patterns from data without explicit programming",
							"To create sentient AI systems",
						],
						correctAnswer: 2,
					},
					// More questions...
				],
				loading: false,
			});
		} catch (error) {
			console.error("Error processing content:", error);
			setOutputData({ ...outputData, loading: false });
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex flex-col md:flex-row'>
			{/* Mobile Header with Menu */}
			<div className='md:hidden flex items-center justify-between p-4 border-b border-emerald-200 bg-white/30 backdrop-blur-sm'>
				<h1 className='text-xl font-bold text-emerald-800'>
					AI Lecture Assistant
				</h1>
				<button
					onClick={() => setSidebarOpen(!sidebarOpen)}
					className='p-2 rounded-lg bg-emerald-100 text-emerald-700'
				>
					{sidebarOpen ? <X size={20} /> : <Menu size={20} />}
				</button>
			</div>

			{/* Sidebar for Inputs */}
			<div
				className={`
				${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"} 
				transition-transform duration-300 ease-in-out
				md:w-72 lg:w-80 bg-white/30 backdrop-blur-lg border-r border-white/40 
				fixed md:static top-0 left-0 h-full z-20 md:z-0
				p-4 flex flex-col
				w-3/4 sm:w-64
			`}
			>
				<div className='hidden md:block mb-6'>
					<h1 className='text-2xl font-bold text-emerald-800'>
						AI Lecture Assistant
					</h1>
					<p className='text-emerald-600 text-sm mt-1'>
						Transform lectures into structured notes
					</p>
				</div>

				<InputSidebar
					onProcessContent={handleProcessContent}
					inputType={inputType}
					setInputType={setInputType}
				/>
			</div>

			{/* Overlay for mobile */}
			{sidebarOpen && (
				<div
					className='md:hidden fixed inset-0 bg-black bg-opacity-50 z-10'
					onClick={() => setSidebarOpen(false)}
				></div>
			)}

			{/* Main Content for Output */}
			<div className='flex-1 p-4 md:p-6 pt-4 overflow-auto'>
				<OutputSection
					data={outputData}
					activeTab={activeTab}
					setActiveTab={setActiveTab}
				/>
			</div>
		</div>
	);
}
