"use client";

import { createContext, useContext, useEffect, useState } from "react";
import supabase from "../lib/supabase";

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the authentication context
export const useAuth = () => {
	return useContext(AuthContext);
};

// Authentication provider component
export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);

	// Check for user session on initial load
	useEffect(() => {
		const checkUser = async () => {
			try {
				// Get the current session
				const {
					data: { session },
				} = await supabase.auth.getSession();

				// Set the user if there's a session
				setUser(session?.user || null);
			} catch (error) {
				console.error("Error checking user session:", error);
			} finally {
				setLoading(false);
			}
		};

		checkUser();

		// Listen for authentication state changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event, session) => {
			setUser(session?.user || null);
			setLoading(false);
		});

		// Clean up the subscription when the component unmounts
		return () => {
			subscription.unsubscribe();
		};
	}, []);

	// Sign up function
	const signUp = async (email, password) => {
		try {
			// Use signUpWithPassword instead of signUp to ensure proper user creation
			const { data, error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					// This ensures the user is created in the auth.users table
					emailRedirectTo: `${window.location.origin}/login`,
					// Add any additional user metadata if needed
					data: {
						created_at: new Date().toISOString(),
					},
				},
			});

			if (error) throw error;
			return { data, error: null };
		} catch (error) {
			console.error("Signup error:", error);
			return { data: null, error };
		}
	};

	// Sign in function
	const signIn = async (email, password) => {
		try {
			const { data, error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});

			if (error) throw error;
			return { data, error: null };
		} catch (error) {
			console.error("Signin error:", error);
			return { data: null, error };
		}
	};

	// Sign out function
	const signOut = async () => {
		try {
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
			return { error: null };
		} catch (error) {
			console.error("Signout error:", error);
			return { error };
		}
	};

	// Reset password function
	const resetPassword = async (email) => {
		try {
			const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
				redirectTo: `${window.location.origin}/login`,
			});
			if (error) throw error;
			return { data, error: null };
		} catch (error) {
			console.error("Reset password error:", error);
			return { data: null, error };
		}
	};

	// Update password function
	const updatePassword = async (newPassword) => {
		try {
			const { data, error } = await supabase.auth.updateUser({
				password: newPassword,
			});
			if (error) throw error;
			return { data, error: null };
		} catch (error) {
			console.error("Update password error:", error);
			return { data: null, error };
		}
	};

	// Value object to be provided by the context
	const value = {
		user,
		loading,
		signUp,
		signIn,
		signOut,
		resetPassword,
		updatePassword,
	};

	return (
		<AuthContext.Provider value={value}>
			{!loading && children}
		</AuthContext.Provider>
	);
};
