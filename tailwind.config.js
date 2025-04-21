/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
	theme: {
		extend: {
			keyframes: {
				"fade-in": {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				"scroll-up": {
					"0%": {
						transform: "rotateX(45deg) translateY(100%)",
						opacity: 0,
					},
					"20%": {
						opacity: 1,
					},
					"80%": {
						opacity: 1,
					},
					"100%": {
						transform: "rotateX(45deg) translateY(-100%)",
						opacity: 0,
					},
				},
			},
			animation: {
				"fade-in": "fade-in 0.5s ease-in-out",
				"scroll-up": "scroll-up 12s linear infinite",
			},
			perspective: {
				1000: "1000px",
			},
			transform: {
				"3d": "preserve-3d",
			},
			rotate: {
				"x-45": "rotateX(45deg)",
			},
			transitionDuration: {
				600: "600ms",
			},
		},
	},
	plugins: [],
};
