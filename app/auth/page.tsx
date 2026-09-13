"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { useChat } from "@/hooks/use-chat";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SiteHeader } from "@/components/site-header";
import { CheckCircle } from "lucide-react";

export default function AuthPage() {
	const [isLogin, setIsLogin] = useState(true);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [isMounted, setIsMounted] = useState(false);
	const router = useRouter();
	const { login, register, isLoading, error, isAuthenticated } = useChat();

	// Handle client-side mounting
	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Check if already authenticated after component mounts
	useEffect(() => {
		if (isMounted && isAuthenticated()) {
			router.push("/chat");
		}
	}, [isMounted, isAuthenticated, router]);

	const handleLogin = async (email: string, password: string) => {
		try {
			await login(email, password);
			router.push("/chat");
		} catch (err) {
			// Error is handled by the useChat hook
		}
	};

	const handleRegister = async (userData: {
		firstName: string;
		lastName: string;
		email: string;
		password: string;
	}) => {
		try {
			await register(userData);
			setSuccessMessage("Account created successfully! Please sign in.");
			setIsLogin(true);
		} catch (err) {
			// Error is handled by the useChat hook
		}
	};

	// Show loading while checking authentication
	if (!isMounted) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<p className="text-muted-foreground">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<SiteHeader />
			<div className="flex flex-1 items-center justify-center p-4">
				<div className="w-full max-w-md space-y-6">
					{/* Header */}
					<div className="text-center space-y-2">
						<h1 className="text-3xl font-bold text-foreground">Loopwire</h1>
						<p className="text-muted-foreground">
							Professional messaging powered by Kong API Gateway
						</p>
					</div>

					{/* Success Message */}
					{successMessage && (
						<Alert className="border-green-500/20 bg-green-500/10">
							<CheckCircle className="h-4 w-4 text-green-500" />
							<AlertDescription className="text-green-700 dark:text-green-300">
								{successMessage}
							</AlertDescription>
						</Alert>
					)}

					{/* Auth Forms */}
					{isLogin ? (
						<LoginForm
							onLogin={handleLogin}
							onSwitchToRegister={() => {
								setIsLogin(false);
								setSuccessMessage(null);
							}}
							isLoading={isLoading}
							error={error}
						/>
					) : (
						<RegisterForm
							onRegister={handleRegister}
							onSwitchToLogin={() => {
								setIsLogin(true);
								setSuccessMessage(null);
							}}
							isLoading={isLoading}
							error={error}
						/>
					)}

					{/* Footer */}
					<div className="text-center text-sm text-muted-foreground">
						<p>Secure authentication via Kong Gateway</p>
						<p className="mt-1">
							Real-time messaging • Room management • User presence
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
