"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const Signup = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState("");
	const { signUp } = useAuth();
	const router = useRouter();

	const handleSubmit = async (e) => {
		e.preventDefault();

		// Validate passwords match
		if (password !== confirmPassword) {
			return setError("Passwords do not match");
		}

		// Validate password strength
		if (password.length < 8) {
			return setError("Password must be at least 8 characters long");
		}

		try {
			setError("");
			setMessage("");
			setLoading(true);

			const { data, error } = await signUp(email, password);

			if (error) {
				setError(error.message);
			} else {
				// Check if email confirmation is required
				if (data?.user?.identities?.length === 0) {
					setError("This email is already registered. Please sign in instead.");
				} else {
					setMessage("Check your email for the confirmation link");
					// Optionally redirect to login page after a delay
					setTimeout(() => {
						router.push("/login");
					}, 3000);
				}
			}
		} catch (error) {
			setError("Failed to create an account. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50 to-white relative overflow-hidden'>
			{/* Background decorative elements */}
			<div className='absolute inset-0 overflow-hidden pointer-events-none'>
				<div className='absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full opacity-20 blur-3xl'></div>
				<div className='absolute top-1/2 -left-20 w-60 h-60 bg-teal-200 rounded-full opacity-20 blur-3xl'></div>
				<div className='absolute bottom-0 right-1/4 w-40 h-40 bg-cyan-200 rounded-full opacity-20 blur-3xl'></div>
				<div className='absolute top-1/3 left-1/4 w-20 h-20 bg-emerald-300 rounded-full opacity-10 blur-2xl'></div>
			</div>

			<div className='w-full max-w-md space-y-8 relative z-10'>
				<div>
					<h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-emerald-800'>
						Join MentorMind
					</h2>
					<p className='mt-2 text-center text-sm text-emerald-600'>
						Create your account to start learning
					</p>
				</div>

				{/* Product Overview */}
				<div className='bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-emerald-100 shadow-sm'>
					<h3 className='text-sm font-medium text-emerald-700 mb-2'>
						About MentorMind
					</h3>
					<p className='text-xs text-emerald-600'>
						MentorMind is your personal AI learning companion that adapts to
						your learning style. Upload your study materials, ask questions, and
						get personalized explanations to master any subject.
					</p>
				</div>

				{error && (
					<div
						className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative'
						role='alert'
					>
						<span className='block sm:inline'>{error}</span>
					</div>
				)}

				{message && (
					<div
						className='bg-emerald-100 border border-emerald-400 text-emerald-700 px-4 py-3 rounded-xl relative'
						role='alert'
					>
						<span className='block sm:inline'>{message}</span>
					</div>
				)}

				<form className='mt-8 space-y-6' onSubmit={handleSubmit}>
					<div className='space-y-4'>
						<div>
							<label
								htmlFor='email-address'
								className='block text-sm font-medium text-emerald-700 mb-1'
							>
								Email address
							</label>
							<input
								id='email-address'
								name='email'
								type='email'
								autoComplete='email'
								required
								className='relative block w-full rounded-xl border-0 py-2.5 px-3 text-emerald-900 bg-white/30 backdrop-blur-lg shadow-lg ring-1 ring-inset ring-white/40 placeholder:text-emerald-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm'
								placeholder='Enter your email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div>
							<label
								htmlFor='password'
								className='block text-sm font-medium text-emerald-700 mb-1'
							>
								Password
							</label>
							<input
								id='password'
								name='password'
								type='password'
								autoComplete='new-password'
								required
								className='relative block w-full rounded-xl border-0 py-2.5 px-3 text-emerald-900 bg-white/30 backdrop-blur-lg shadow-lg ring-1 ring-inset ring-white/40 placeholder:text-emerald-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm'
								placeholder='Create a password (min. 8 characters)'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
						<div>
							<label
								htmlFor='confirm-password'
								className='block text-sm font-medium text-emerald-700 mb-1'
							>
								Confirm Password
							</label>
							<input
								id='confirm-password'
								name='confirm-password'
								type='password'
								autoComplete='new-password'
								required
								className='relative block w-full rounded-xl border-0 py-2.5 px-3 text-emerald-900 bg-white/30 backdrop-blur-lg shadow-lg ring-1 ring-inset ring-white/40 placeholder:text-emerald-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm'
								placeholder='Confirm your password'
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
							/>
						</div>
					</div>

					<div className='text-sm text-right'>
						<a
							href='/login'
							className='font-medium text-emerald-600 hover:text-emerald-500 transition-colors'
						>
							Already have an account? Sign in
						</a>
					</div>

					<div>
						<button
							type='submit'
							disabled={loading}
							className='group relative flex w-full justify-center rounded-xl bg-emerald-600 py-3 px-4 text-sm font-semibold text-white shadow-lg hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 transition-colors'
						>
							{loading ? "Creating account..." : "Sign up"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Signup;
