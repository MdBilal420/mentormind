"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

const Navigation = () => {
	const { user, signOut } = useAuth();
	const router = useRouter();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const handleSignOut = async () => {
		try {
			await signOut();
			router.push("/login");
		} catch (error) {
			console.error("Error signing out:", error);
		}
	};

	return (
		<nav className='bg-gradient-to-r from-emerald-50 to-emerald-100/80 shadow-sm border-b border-emerald-100'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between h-16'>
					<div className='flex'>
						<div className='flex-shrink-0 flex items-center'>
							<Link
								href='/'
								className='text-xl font-bold text-emerald-600 hover:text-emerald-700 transition-colors'
							>
								MentorMind
							</Link>
						</div>
					</div>

					{/* Mobile menu button */}
					<div className='flex items-center md:hidden'>
						<button
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							className='inline-flex items-center justify-center p-2 rounded-md text-emerald-600 hover:text-emerald-700 hover:bg-emerald-400/5 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-400'
						>
							<span className='sr-only'>Open main menu</span>
							{!isMobileMenuOpen ? (
								<svg
									className='block h-6 w-6'
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M4 6h16M4 12h16M4 18h16'
									/>
								</svg>
							) : (
								<svg
									className='block h-6 w-6'
									xmlns='http://www.w3.org/2000/svg'
									fill='none'
									viewBox='0 0 24 24'
									stroke='currentColor'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M6 18L18 6M6 6l12 12'
									/>
								</svg>
							)}
						</button>
					</div>

					{/* Desktop menu */}
					<div className='hidden md:flex md:items-center'>
						{user ? (
							<div className='flex items-center space-x-4'>
								<Link
									href='/profile'
									className='text-emerald-600 hover:text-emerald-700 transition-colors'
								>
									Profile
								</Link>
								<button
									onClick={handleSignOut}
									className='bg-emerald-400/5 text-emerald-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-400/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-colors'
								>
									Sign Out
								</button>
							</div>
						) : (
							<div className='flex items-center space-x-4'>
								<Link
									href='/login'
									className='text-emerald-600 hover:text-emerald-700 transition-colors'
								>
									Sign In
								</Link>
								<Link
									href='/signup'
									className='bg-emerald-400/5 text-emerald-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-emerald-400/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400 transition-colors'
								>
									Sign Up
								</Link>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Mobile menu */}
			<div className={`${isMobileMenuOpen ? "block" : "hidden"} md:hidden`}>
				<div className='px-2 pt-2 pb-3 space-y-1 sm:px-3'>
					{user ? (
						<>
							<Link
								href='/profile'
								className='block px-3 py-2 rounded-md text-base font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-400/5'
							>
								Profile
							</Link>
							<button
								onClick={handleSignOut}
								className='block w-full text-left px-3 py-2 rounded-md text-base font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-400/5'
							>
								Sign Out
							</button>
						</>
					) : (
						<>
							<Link
								href='/login'
								className='block px-3 py-2 rounded-md text-base font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-400/5'
							>
								Sign In
							</Link>
							<Link
								href='/signup'
								className='block px-3 py-2 rounded-md text-base font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-400/5'
							>
								Sign Up
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navigation;
