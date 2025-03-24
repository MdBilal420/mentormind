import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

const apiKey = process.env.GOOGLE_YOUTUBE_API_KEY;
const YoutubeSearch = ({ handleVideoClick }) => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState([]);

	// console.log("API KEY", apiKey, `${process.env.GOOGLE_YOUTUBE_API_KEY}`);
	const handleSearch = async () => {
		try {
			const response = await fetch(
				`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${encodeURIComponent(
					query
				)}&key=${apiKey}&type=video`
			);

			if (!response.ok) {
				throw new Error("YouTube API request failed");
			}

			const data = await response.json();
			setResults(data.items);
		} catch (error) {
			console.error("Error searching YouTube:", error);
		}
	};

	useEffect(() => {
		if (query) {
			handleSearch();
		} else {
			setResults([]);
		}
	}, [query]);

	return (
		<div className='mt-2'>
			<Input
				type='text'
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder='Search YouTube'
			/>
			{query && (
				<div className='flex flex-row items-center justify-end mt-2'>
					<p
						className='text-sm text-gray-500 cursor-pointer hover:text-gray-700'
						onClick={() => setQuery("")}
					>
						clear
					</p>
				</div>
			)}

			<div className='mt-2 flex flex-col overflow-y-auto h-[400px]'>
				{results.map((result) => (
					<div
						key={result.id.videoId}
						className='flex flex-row items-center justify-center border border-gray-200 rounded-md p-2 mb-1 cursor-pointer hover:bg-gray-100'
						onClick={() =>
							handleVideoClick({
								url: `https://www.youtube.com/watch?v=${result.id.videoId}`,
								title: result.snippet.title,
							})
						}
					>
						<img
							src={result.snippet.thumbnails.default.url}
							alt={result.snippet.title}
							style={{ width: "30%", height: "auto" }}
						/>
						<p
							className='font-bold mb-2 ml-1 text-sm'
							style={{ fontSize: "12px", width: "70%" }}
						>
							{result.snippet.title}
						</p>
					</div>
				))}
			</div>
		</div>
	);
};

export default YoutubeSearch;
