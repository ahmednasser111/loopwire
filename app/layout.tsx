import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { Suspense } from "react";
import { BackendWakeGate } from "@/components/backend-wake-gate";
import "./globals.css";

export const metadata: Metadata = {
	title: "Kong Chat - Real-time Messaging Platform",
	description:
		"Professional chat application powered by Kong API Gateway with real-time messaging, authentication, and room management.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark">
			<body
				className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
				<Suspense fallback={null}>
					<BackendWakeGate>{children}</BackendWakeGate>
				</Suspense>
				<Analytics />
			</body>
		</html>
	);
}
