"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const Login = () => {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { signIn } = useAuth();
	const router = useRouter();

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			setError("");
			setLoading(true);

			const { data, error } = await signIn(email, password);

			if (error) {
				setError(error.message);
			} else if (data?.user) {
				// Redirect to dashboard on successful login
				router.push("/");
			} else {
				setError(
					"Failed to sign in. Please check your credentials and try again."
				);
			}
		} catch (error) {
			setError("Failed to sign in. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	// Quick access with test account
	const handleQuickAccess = async () => {
		try {
			setError("");
			setLoading(true);

			// Use test account credentials
			const testEmail = "test@mentormind.com";
			const testPassword = "test@1234";

			const { data, error } = await signIn(testEmail, testPassword);

			if (error) {
				setError(error.message);
			} else if (data?.user) {
				// Redirect to dashboard on successful login
				router.push("/");
			} else {
				setError("Failed to sign in with test account. Please try again.");
			}
		} catch (error) {
			setError("Failed to sign in with test account. Please try again.");
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
						Welcome to MentorMind
					</h2>
					<p className='mt-2 text-center text-sm text-emerald-600'>
						Sign in to continue your learning journey
					</p>
				</div>

				{/* Product Overview */}
				<div className='bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-emerald-100 shadow-sm'>
					<h3 className='text-sm font-medium text-emerald-700 mb-2'>
						Your AI Learning Companion
					</h3>
					<p className='text-xs text-emerald-600'>
						MentorMind adapts to your learning style, providing personalized
						explanations and guidance to help you master any subject.
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
								autoComplete='current-password'
								required
								className='relative block w-full rounded-xl border-0 py-2.5 px-3 text-emerald-900 bg-white/30 backdrop-blur-lg shadow-lg ring-1 ring-inset ring-white/40 placeholder:text-emerald-400 focus:ring-2 focus:ring-inset focus:ring-emerald-600 sm:text-sm'
								placeholder='Enter your password'
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
					</div>

					<div className='flex items-center justify-between'>
						<div className='text-sm'>
							<a
								href='/reset-password'
								className='font-medium text-emerald-600 hover:text-emerald-500 transition-colors'
							>
								Forgot your password?
							</a>
						</div>
						<div className='text-sm'>
							<a
								href='/signup'
								className='font-medium text-emerald-600 hover:text-emerald-500 transition-colors'
							>
								Don't have an account? Sign up
							</a>
						</div>
					</div>

					<div className='space-y-3'>
						<button
							type='submit'
							disabled={loading}
							className='group relative flex w-full justify-center rounded-xl bg-emerald-600 py-3 px-4 text-sm font-semibold text-white shadow-lg hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 transition-colors'
						>
							{loading ? "Signing in..." : "Sign in"}
						</button>

						<div className='relative'>
							<div className='absolute inset-0 flex items-center'>
								<div className='w-full border-t border-emerald-200'></div>
							</div>
							<div className='relative flex justify-center text-xs uppercase'>
								<span className='bg-white/70 backdrop-blur-sm px-2 text-emerald-500'>
									Or
								</span>
							</div>
						</div>

						<button
							type='button'
							onClick={handleQuickAccess}
							disabled={loading}
							className='group relative flex w-full justify-center rounded-xl bg-emerald-100 py-3 px-4 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 disabled:opacity-50 transition-colors'
						>
							{loading ? "Signing in..." : "Quick Access (Test Account)"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Login;
