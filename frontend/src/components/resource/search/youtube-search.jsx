import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import SerpApi from "google-search-results-nodejs";

const apiKey = process.env.NEXT_APP_SERP_API_KEY;
const YoutubeSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  console.log("API KEY", apiKey, `${process.env.NEXT_APP_SERP_API_KEY}`);
  const handleSearch = async () => {
    const search = new SerpApi.GoogleSearch(
      `ed096b84136a92bc5ea5edac843ed6d802fdb148cb180874da4be1ab72ca2604`
    );
    const params = {
      engine: "youtube",
      search_query: query,
    };
    console.log("SEARCH", search, params);
    search.json(params, (data) => {
      console.log("DATA", data);
      setResults(data.video_results);
    });
  };

  return (
    <div className='mt-4'>
      <Input
        type='text'
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='Search YouTube'
      />
      <Button onClick={handleSearch} className='mt-2'>
        Search
      </Button>

      <div>
        {results.map((result) => (
          <div key={result.id.videoId}>
            <h3>{result.snippet.title}</h3>
            <p>{result.snippet.description}</p>
            <img
              src={result.snippet.thumbnails.default.url}
              alt={result.snippet.title}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default YoutubeSearch;
