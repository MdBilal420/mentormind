"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

const UserProfile = () => {
	const { user, signOut, updatePassword, isTestAccount } = useAuth();
	const router = useRouter();
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSignOut = async () => {
		try {
			setError("");
			await signOut();
			router.push("/login");
		} catch (error) {
			setError("Failed to sign out. Please try again.");
		}
	};

	const handlePasswordUpdate = async (e) => {
		e.preventDefault();

		// Validate passwords match
		if (newPassword !== confirmPassword) {
			return setError("Passwords do not match");
		}

		try {
			setError("");
			setMessage("");
			setLoading(true);

			const { error } = await updatePassword(newPassword);

			if (error) {
				setError(error.message);
			} else {
				setMessage("Password updated successfully");
				setNewPassword("");
				setConfirmPassword("");
			}
		} catch (error) {
			setError("Failed to update password. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-emerald-50 to-white'>
			<div className='w-full max-w-2xl p-6 bg-white/30 backdrop-blur-lg rounded-xl shadow-lg border border-white/40'>
				<h2 className='text-2xl font-bold mb-6 text-emerald-800'>
					User Profile
				</h2>

				<div className='mb-6'>
					<h3 className='text-lg font-medium mb-2 text-emerald-700'>
						Account Information
					</h3>
					<div className='bg-white/50 p-4 rounded-xl shadow-md border border-white/40'>
						<p className='mb-2'>
							<span className='font-medium text-emerald-700'>Email:</span>{" "}
							<span className='text-emerald-900'>{user?.email}</span>
						</p>
						<p className='mb-2'>
							<span className='font-medium text-emerald-700'>User ID:</span>{" "}
							<span className='text-emerald-900'>{user?.id}</span>
						</p>
						<p>
							<span className='font-medium text-emerald-700'>
								Last Sign In:
							</span>{" "}
							<span className='text-emerald-900'>
								{user?.last_sign_in_at
									? new Date(user.last_sign_in_at).toLocaleString()
									: "N/A"}
							</span>
						</p>
					</div>
				</div>

				{!isTestAccount && (
					<div className='mb-6'>
						<h3 className='text-lg font-medium mb-2 text-emerald-700'>
							Change Password
						</h3>

						{error && (
							<div
								className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-4'
								role='alert'
							>
								<span className='block sm:inline'>{error}</span>
							</div>
						)}

						{message && (
							<div
								className='bg-emerald-100 border border-emerald-400 text-emerald-700 px-4 py-3 rounded-xl relative mb-4'
								role='alert'
							>
								<span className='block sm:inline'>{message}</span>
							</div>
						)}

						<form onSubmit={handlePasswordUpdate} className='space-y-4'>
							<div>
								<label
									htmlFor='new-password'
									className='block text-sm font-medium text-emerald-700 mb-1'
								>
									New Password
								</label>
								<input
									id='new-password'
									type='password'
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									className='w-full px-3 py-2.5 text-emerald-900 bg-white/30 backdrop-blur-lg rounded-xl shadow-lg ring-1 ring-inset ring-white/40 focus:ring-2 focus:ring-inset focus:ring-emerald-600 placeholder:text-emerald-400'
									required
								/>
							</div>

							<div>
								<label
									htmlFor='confirm-password'
									className='block text-sm font-medium text-emerald-700 mb-1'
								>
									Confirm New Password
								</label>
								<input
									id='confirm-password'
									type='password'
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									className='w-full px-3 py-2.5 text-emerald-900 bg-white/30 backdrop-blur-lg rounded-xl shadow-lg ring-1 ring-inset ring-white/40 focus:ring-2 focus:ring-inset focus:ring-emerald-600 placeholder:text-emerald-400'
									required
								/>
							</div>

							<button
								type='submit'
								disabled={loading}
								className='w-full flex justify-center py-3 px-4 rounded-xl shadow-lg text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 disabled:opacity-50 transition-colors'
							>
								{loading ? "Updating..." : "Update Password"}
							</button>
						</form>
					</div>
				)}

				<div>
					<button
						onClick={handleSignOut}
						className='w-full flex justify-center py-3 px-4 rounded-xl shadow-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 disabled:opacity-50 transition-colors'
					>
						Sign Out
					</button>
				</div>
			</div>
		</div>
	);
};

export default UserProfile;
