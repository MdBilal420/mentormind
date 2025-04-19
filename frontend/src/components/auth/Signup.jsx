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
		<div className='flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50 to-white'>
			<div className='w-full max-w-md space-y-8'>
				<div>
					<h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-emerald-800'>
						Join EduBot
					</h2>
					<p className='mt-2 text-center text-sm text-emerald-600'>
						Create your account to start learning
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
