"use client";

import Link from "next/link";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoMark } from "@/components/logo-mark";

export function SiteHeader() {
	return (
		<header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
				<Link href="/" className="flex items-center gap-2">
					<LogoMark className="h-8 w-8 text-sm" />
					<span className="font-semibold text-foreground">Loopwire</span>
				</Link>

				<div className="flex items-center gap-1">
					<Button variant="ghost" size="icon" asChild>
						<a
							href="https://github.com/ahmednasser111/loopwire"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="View source on GitHub">
							<Github className="h-4 w-4" />
						</a>
					</Button>
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
