import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import Navigation from "../components/Navigation";
import { AuthProvider } from "../contexts/AuthContext";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata = {
	title: "MentorMind",
	description: "An AI-powered learning assistant",
};

export default function RootLayout({ children }) {
	return (
		<html lang='en'>
			<head>
				<Script id='microsoft-clarity' strategy='afterInteractive'>
					{`
						(function(c,l,a,r,i,t,y){
							c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
							t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
							y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
						})(window, document, "clarity", "script", "r6ejow727a");
					`}
				</Script>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<AuthProvider>
					<Navigation />
					<main className='min-h-screen'>{children}</main>
				</AuthProvider>
			</body>
		</html>
	);
}
