import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { BackendWakeGate } from "@/components/backend-wake-gate";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
	title: "Loopwire — Real-Time Messaging Platform",
	description:
		"Loopwire is a real-time messaging platform with JWT authentication, room management, and an API gateway-backed microservices architecture.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange>
					<Suspense fallback={null}>
						<BackendWakeGate>{children}</BackendWakeGate>
					</Suspense>
					<Analytics />
				</ThemeProvider>
			</body>
		</html>
	);
}
