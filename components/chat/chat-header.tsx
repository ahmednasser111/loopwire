"use client";

import type { Room, User } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Hash, LogOut, Wifi, WifiOff } from "lucide-react";

interface ChatHeaderProps {
	currentRoom?: Room;
	user?: User | null;
	isConnected: boolean;
	onLogout: () => void;
}

export function ChatHeader({
	currentRoom,
	user,
	isConnected,
	onLogout,
}: ChatHeaderProps) {
	return (
		<div className="h-16 bg-card border-b border-border px-4 flex items-center justify-between">
			{/* Room Info */}
			<div className="flex items-center gap-3">
				<div className="flex items-center gap-2">
					<Hash className="h-5 w-5 text-muted-foreground" />
					<h1 className="font-semibold text-foreground">{currentRoom?.name}</h1>
				</div>
				{currentRoom?.description && (
					<span className="text-sm text-muted-foreground">
						{currentRoom.description}
					</span>
				)}
			</div>

			{/* User Info & Actions */}
			<div className="flex items-center gap-3">
				{/* Connection Status */}
				<div className="flex items-center gap-2">
					{isConnected ? (
						<>
							<Wifi className="h-4 w-4 text-green-500" />
							<Badge
								variant="secondary"
								className="bg-green-500/10 text-green-500 border-green-500/20">
								Connected
							</Badge>
						</>
					) : (
						<>
							<WifiOff className="h-4 w-4 text-red-500" />
							<Badge
								variant="secondary"
								className="bg-red-500/10 text-red-500 border-red-500/20">
								Disconnected
							</Badge>
						</>
					)}
				</div>

				{/* User Info */}
				{user && (
					<div className="text-sm text-muted-foreground">
						{user.firstName} {user.lastName}
					</div>
				)}

				{/* Actions */}
				<div className="flex items-center gap-1">
					<ThemeToggle />
					<Button
						variant="ghost"
						size="sm"
						onClick={onLogout}
						className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10">
						<LogOut className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
