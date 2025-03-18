import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function SummaryTab({ data }) {
	if (!data.summary) {
		return (
			<div className='flex flex-col items-center justify-center h-full text-center'>
				<div className='w-12 h-12 md:w-16 md:h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4'>
					<FileText className='h-6 w-6 md:h-8 md:w-8 text-emerald-500' />
				</div>
				<p className='text-emerald-800 font-medium'>No summary available yet</p>
				<p className='text-xs md:text-sm text-emerald-600 mt-2'>
					Process content to generate a summary
				</p>
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='bg-white/50 rounded-lg p-3 md:p-4 h-full overflow-y-auto'
		>
			<p className='text-sm md:text-base text-emerald-900 whitespace-pre-line'>
				{data.summary}
			</p>
		</motion.div>
	);
}
