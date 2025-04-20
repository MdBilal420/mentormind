"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
	const { user, loading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		// If not loading and no user, redirect to login
		// Skip redirection during static builds when auth is not available
		if (!loading && !user && typeof window !== "undefined") {
			router.push("/login");
		}
	}, [user, loading, router]);

	// Show loading state while checking authentication
	if (loading) {
		return (
			<div className='flex min-h-screen items-center justify-center bg-gradient-to-b from-emerald-50 to-white'>
				<div className='text-center'>
					<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600 mx-auto'></div>
					<p className='mt-4 text-emerald-600'>Loading...</p>
				</div>
			</div>
		);
	}

	// If user is authenticated, render children
	// During static builds, we'll render children even without authentication
	return children;
};

export default ProtectedRoute;
