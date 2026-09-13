"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import {
	MessageSquare,
	Shield,
	Zap,
	Users,
	Database,
	Activity,
	ArrowRight,
	CheckCircle,
	Github,
} from "lucide-react";

export default function HomePage() {
	const router = useRouter();
	const [isMounted, setIsMounted] = useState(false);

	// Handle client-side mounting
	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Check if user is already authenticated after component mounts
	useEffect(() => {
		if (isMounted && typeof window !== "undefined") {
			const token = localStorage.getItem("chat_token");
			if (token) {
				router.push("/chat");
			}
		}
	}, [router, isMounted]);

	const features = [
		{
			icon: Shield,
			title: "Kong API Gateway",
			description:
				"Secure authentication and API management with enterprise-grade Kong Gateway",
			color: "text-primary",
		},
		{
			icon: MessageSquare,
			title: "Real-time Messaging",
			description:
				"Instant messaging with WebSocket support and message persistence",
			color: "text-accent-foreground",
		},
		{
			icon: Users,
			title: "Room Management",
			description: "Create and join chat rooms with user presence indicators",
			color: "text-primary",
		},
		{
			icon: Zap,
			title: "High Performance",
			description: "Optimized for speed with rate limiting and load balancing",
			color: "text-accent-foreground",
		},
		{
			icon: Database,
			title: "Data Persistence",
			description: "Reliable message storage with full chat history",
			color: "text-primary",
		},
		{
			icon: Activity,
			title: "Monitoring & Analytics",
			description: "Real-time metrics and comprehensive observability",
			color: "text-accent-foreground",
		},
	];

	const techStack = [
		"Next.js",
		"TypeScript",
		"Tailwind CSS",
		"Socket.IO",
		"Kong Gateway",
		"JWT Auth",
		"PostgreSQL",
		"Kafka",
	];

	const apiEndpoints = [
		{
			method: "POST",
			path: "/api/v1/auth/register",
			description: "User registration",
		},
		{
			method: "POST",
			path: "/api/v1/auth/login",
			description: "User authentication",
		},
		{ method: "GET", path: "/api/messages", description: "Retrieve messages" },
		{ method: "POST", path: "/api/messages", description: "Send new message" },
		{ method: "GET", path: "/api/rooms", description: "List chat rooms" },
		{ method: "POST", path: "/api/rooms", description: "Create new room" },
		{ method: "WS", path: "/socket.io/", description: "Real-time connection" },
	];

	// Don't render until mounted to prevent hydration issues
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
		<div className="min-h-screen bg-background">
			<SiteHeader />

			{/* Hero Section */}
			<div className="relative overflow-hidden">
				<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
				<div className="relative max-w-7xl mx-auto px-4 py-24">
					<div className="text-center space-y-8">
						<div className="space-y-4">
							<Badge
								variant="secondary"
								className="bg-primary/10 text-primary border-primary/20">
								Powered by Kong API Gateway
							</Badge>
							<h1 className="text-4xl md:text-6xl font-bold text-foreground text-balance">
								Loopwire
							</h1>
							<p className="text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
								Enterprise-grade messaging platform with real-time
								communication, secure authentication, and comprehensive API
								management through Kong Gateway.
							</p>
						</div>

						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button
								size="lg"
								onClick={() => router.push("/auth")}
								className="bg-primary hover:bg-primary/90 text-primary-foreground">
								Get Started
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
							<Button size="lg" variant="outline" asChild>
								<a
									href="https://github.com/ahmednasser111/loopwire"
									target="_blank"
									rel="noopener noreferrer">
									<Github className="mr-2 h-4 w-4" />
									View Source
								</a>
							</Button>
						</div>

						<div className="flex flex-wrap items-center justify-center gap-2 pt-4">
							{techStack.map((tech) => (
								<Badge key={tech} variant="outline" className="text-muted-foreground">
									{tech}
								</Badge>
							))}
						</div>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div className="max-w-7xl mx-auto px-4 py-24">
				<div className="text-center space-y-4 mb-16">
					<h2 className="text-3xl font-bold text-foreground">
						Powerful Features
					</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto">
						Built with modern technologies and enterprise-grade infrastructure
						for reliable, scalable real-time communication.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{features.map((feature, index) => (
						<Card
							key={index}
							className="bg-card border-border hover:border-primary/20 transition-colors">
							<CardHeader>
								<div className="flex items-center gap-3">
									<div
										className={`p-2 rounded-lg bg-background ${feature.color}`}>
										<feature.icon className="h-5 w-5" />
									</div>
									<CardTitle className="text-foreground">
										{feature.title}
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent>
								<CardDescription className="text-muted-foreground">
									{feature.description}
								</CardDescription>
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			{/* API Documentation Section */}
			<div className="bg-muted/30">
				<div className="max-w-7xl mx-auto px-4 py-24">
					<div className="text-center space-y-4 mb-16">
						<h2 className="text-3xl font-bold text-foreground">
							API Endpoints
						</h2>
						<p className="text-muted-foreground max-w-2xl mx-auto">
							Comprehensive REST API with WebSocket support for real-time
							features. All endpoints are secured and rate-limited through Kong
							Gateway.
						</p>
					</div>

					<Card className="bg-card border-border">
						<CardHeader>
							<CardTitle className="text-foreground">
								Available Endpoints
							</CardTitle>
							<CardDescription className="text-muted-foreground">
								All requests go through Kong Gateway at http://localhost:8000
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{apiEndpoints.map((endpoint, index) => (
									<div
										key={index}
										className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
										<Badge
											variant={
												endpoint.method === "GET"
													? "secondary"
													: endpoint.method === "POST"
													? "default"
													: endpoint.method === "WS"
													? "outline"
													: "secondary"
											}
											className="font-mono text-xs min-w-[50px] justify-center">
											{endpoint.method}
										</Badge>
										<code className="font-mono text-sm text-primary flex-1">
											{endpoint.path}
										</code>
										<span className="text-sm text-muted-foreground">
											{endpoint.description}
										</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Architecture Section */}
			<div className="max-w-7xl mx-auto px-4 py-24">
				<div className="text-center space-y-4 mb-16">
					<h2 className="text-3xl font-bold text-foreground">
						Architecture Overview
					</h2>
					<p className="text-muted-foreground max-w-2xl mx-auto">
						Microservices architecture with Kong API Gateway managing
						authentication and chat services for optimal performance and
						security.
					</p>
				</div>

				<Card className="bg-card border-border">
					<CardContent className="p-8">
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							{/* Frontend */}
							<div className="text-center space-y-4">
								<div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
									<MessageSquare className="h-8 w-8 text-primary" />
								</div>
								<h3 className="font-semibold text-foreground">Frontend</h3>
								<p className="text-sm text-muted-foreground">
									Next.js application with real-time messaging interface
								</p>
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm">
										<CheckCircle className="h-4 w-4 text-green-500" />
										<span className="text-muted-foreground">
											React Components
										</span>
									</div>
									<div className="flex items-center gap-2 text-sm">
										<CheckCircle className="h-4 w-4 text-green-500" />
										<span className="text-muted-foreground">
											WebSocket Client
										</span>
									</div>
									<div className="flex items-center gap-2 text-sm">
										<CheckCircle className="h-4 w-4 text-green-500" />
										<span className="text-muted-foreground">
											Responsive Design
										</span>
									</div>
								</div>
							</div>

							{/* Kong Gateway */}
							<div className="text-center space-y-4">
								<div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
									<Shield className="h-8 w-8 text-primary" />
								</div>
								<h3 className="font-semibold text-foreground">Kong Gateway</h3>
								<p className="text-sm text-muted-foreground">
									API Gateway with authentication, rate limiting, and monitoring
								</p>
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm">
										<CheckCircle className="h-4 w-4 text-green-500" />
										<span className="text-muted-foreground">
											JWT Authentication
										</span>
									</div>
									<div className="flex items-center gap-2 text-sm">
										<CheckCircle className="h-4 w-4 text-green-500" />
										<span className="text-muted-foreground">Rate Limiting</span>
									</div>
									<div className="flex items-center gap-2 text-sm">
										<CheckCircle className="h-4 w-4 text-green-500" />
										<span className="text-muted-foreground">
											Load Balancing
										</span>
									</div>
								</div>
							</div>

							{/* Backend Services */}
							<div className="text-center space-y-4">
								<div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
									<Database className="h-8 w-8 text-primary" />
								</div>
								<h3 className="font-semibold text-foreground">
									Backend Services
								</h3>
								<p className="text-sm text-muted-foreground">
									Auth and Chat microservices with database persistence
								</p>
								<div className="space-y-2">
									<div className="flex items-center gap-2 text-sm">
										<CheckCircle className="h-4 w-4 text-green-500" />
										<span className="text-muted-foreground">
											Auth Service (3001)
										</span>
									</div>
									<div className="flex items-center gap-2 text-sm">
										<CheckCircle className="h-4 w-4 text-green-500" />
										<span className="text-muted-foreground">
											Chat Service (3002)
										</span>
									</div>
									<div className="flex items-center gap-2 text-sm">
										<CheckCircle className="h-4 w-4 text-green-500" />
										<span className="text-muted-foreground">
											Database Storage
										</span>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* CTA Section */}
			<div className="bg-primary/5 border-t border-border">
				<div className="max-w-7xl mx-auto px-4 py-24 text-center">
					<div className="space-y-6">
						<h2 className="text-3xl font-bold text-foreground">
							Ready to Get Started?
						</h2>
						<p className="text-muted-foreground max-w-2xl mx-auto">
							Join Loopwire and experience enterprise-grade messaging with
							real-time communication and robust security.
						</p>
						<Button
							size="lg"
							onClick={() => router.push("/auth")}
							className="bg-primary hover:bg-primary/90 text-primary-foreground">
							Start Chatting Now
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
