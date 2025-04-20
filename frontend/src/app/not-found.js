import Link from "next/link";

export default function NotFound() {
	return (
		<div className='flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50 to-white'>
			<div className='w-full max-w-md space-y-8 text-center'>
				<div>
					<h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-emerald-800'>
						Page Not Found
					</h2>
					<p className='mt-2 text-center text-sm text-emerald-600'>
						The page you're looking for doesn't exist or has been moved.
					</p>
				</div>

				<div className='mt-8'>
					<Link
						href='/'
						className='inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'
					>
						Return to Home
					</Link>
				</div>
			</div>
		</div>
	);
}
