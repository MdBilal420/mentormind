/**
 * Format seconds into MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
	if (typeof seconds !== "number" || isNaN(seconds)) {
		return "00:00";
	}

	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins.toString().padStart(2, "0")}:${secs
		.toString()
		.padStart(2, "0")}`;
};

/**
 * Groups words into sentences based on punctuation
 * @param {Array} words - Array of word objects with timestamps
 * @returns {Array} Array of sentence objects
 */
export const groupWordsIntoSentences = (words) => {
	if (!words || words.length === 0) {
		return [];
	}

	const sentences = [];
	let currentSentence = { words: [], startTime: words[0].start };

	words.forEach((word) => {
		currentSentence.words.push(word);
		// If word ends with punctuation, start a new sentence
		if (word.word.match(/[.!?]$/)) {
			sentences.push({
				...currentSentence,
				endTime: word.end,
				text: currentSentence.words.map((w) => w.word).join(" "),
			});
			currentSentence = { words: [], startTime: word.end };
		}
	});

	// Add the last sentence if it's not empty and doesn't end with punctuation
	if (currentSentence.words.length > 0) {
		sentences.push({
			...currentSentence,
			endTime: currentSentence.words[currentSentence.words.length - 1].end,
			text: currentSentence.words.map((w) => w.word).join(" "),
		});
	}

	return sentences;
};
