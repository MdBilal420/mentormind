import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	...compat.extends("next/core-web-vitals"),
	{
		// Add custom parser options to avoid serialization issues
		linterOptions: {
			reportUnusedDisableDirectives: true,
		},
		// Disable rules that might cause serialization issues
		rules: {
			// Add any specific rules to disable here
		},
	},
];

export default eslintConfig;
