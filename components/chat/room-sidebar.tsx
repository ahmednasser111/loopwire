"use client";

import { useState } from "react";
import type { Room } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Plus, Hash, Users } from "lucide-react";
import type { OnlineUser } from "@/hooks/use-chat";

interface RoomSidebarProps {
	rooms: Room[];
	currentRoom: string;
	onRoomSelect: (roomId: string) => void;
	onCreateRoom: (name: string, description?: string) => Promise<void>;
	onlineUsers: OnlineUser[];
}

function displayName(user: OnlineUser): string {
	const name = [user.firstName, user.lastName].filter(Boolean).join(" ");
	return name || user.email;
}

export function RoomSidebar({
	rooms,
	currentRoom,
	onRoomSelect,
	onCreateRoom,
	onlineUsers,
}: RoomSidebarProps) {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [newRoomName, setNewRoomName] = useState("");
	const [newRoomDescription, setNewRoomDescription] = useState("");
	const [isCreating, setIsCreating] = useState(false);

	const handleCreateRoom = async () => {
		if (!newRoomName.trim()) return;

		setIsCreating(true);
		try {
			await onCreateRoom(
				newRoomName.trim(),
				newRoomDescription.trim() || undefined
			);
			setNewRoomName("");
			setNewRoomDescription("");
			setIsCreateDialogOpen(false);
		} catch (error) {
			console.error("Failed to create room:", error);
		} finally {
			setIsCreating(false);
		}
	};

	return (
		<div className="w-64 bg-card border-r border-border flex flex-col">
			{/* Header */}
			<div className="p-4 border-b border-border">
				<div className="flex items-center justify-between">
					<h2 className="font-semibold text-foreground">Rooms</h2>
					<Dialog
						open={isCreateDialogOpen}
						onOpenChange={setIsCreateDialogOpen}>
						<DialogTrigger asChild>
							<Button size="sm" variant="ghost" className="h-8 w-8 p-0">
								<Plus className="h-4 w-4" />
							</Button>
						</DialogTrigger>
						<DialogContent className="bg-card border-border">
							<DialogHeader>
								<DialogTitle className="text-foreground">
									Create New Room
								</DialogTitle>
							</DialogHeader>
							<div className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="roomName" className="text-foreground">
										Room Name
									</Label>
									<Input
										id="roomName"
										value={newRoomName}
										onChange={(e) => setNewRoomName(e.target.value)}
										placeholder="Enter room name"
										className="bg-input border-border text-foreground"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="roomDescription" className="text-foreground">
										Description (optional)
									</Label>
									<Input
										id="roomDescription"
										value={newRoomDescription}
										onChange={(e) => setNewRoomDescription(e.target.value)}
										placeholder="Enter room description"
										className="bg-input border-border text-foreground"
									/>
								</div>
								<div className="flex gap-2">
									<Button
										onClick={handleCreateRoom}
										disabled={!newRoomName.trim() || isCreating}
										className="bg-primary hover:bg-primary/90 text-primary-foreground">
										{isCreating ? "Creating..." : "Create Room"}
									</Button>
									<Button
										variant="outline"
										onClick={() => setIsCreateDialogOpen(false)}
										className="border-border text-foreground">
										Cancel
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</div>

			{/* Room List */}
			<ScrollArea className="flex-1">
				<div className="p-2 space-y-1">
					{rooms.length === 0 ? (
						<div className="p-4 text-center">
							<p className="text-sm text-muted-foreground mb-2">No rooms yet</p>
							<Button
								onClick={() => setIsCreateDialogOpen(true)}
								size="sm"
								variant="outline"
								className="border-border text-foreground">
								<Plus className="h-4 w-4 mr-1" />
								Create Room
							</Button>
						</div>
					) : (
						rooms.map((room) => (
							<button
								key={room.id}
								onClick={() => onRoomSelect(room.id)}
								className={`w-full text-left p-3 rounded-lg transition-colors ${
									currentRoom === room.id
										? "bg-primary/10 text-primary border border-primary/20"
										: "hover:bg-accent text-muted-foreground hover:text-accent-foreground"
								}`}>
								<div className="flex items-center gap-2">
									<Hash className="h-4 w-4 flex-shrink-0" />
									<div className="flex-1 min-w-0">
										<p className="font-medium truncate">{room.name}</p>
										{room.description && (
											<p className="text-xs opacity-70 truncate">
												{room.description}
											</p>
										)}
									</div>
									{room.memberCount && (
										<Badge variant="secondary" className="text-xs">
											{room.memberCount}
										</Badge>
									)}
								</div>
							</button>
						))
					)}
				</div>
			</ScrollArea>

			{/* Online Users - Only show when a room is selected */}
			{currentRoom && (
				<div className="border-t border-border p-4">
					<div className="flex items-center gap-2 mb-3">
						<Users className="h-4 w-4 text-muted-foreground" />
						<span className="text-sm font-medium text-foreground">
							Online ({onlineUsers.length})
						</span>
					</div>
					<ScrollArea className="max-h-32">
						<div className="space-y-1">
							{onlineUsers.length === 0 ? (
								<p className="text-xs text-muted-foreground">No users online</p>
							) : (
								onlineUsers.map((onlineUser) => (
									<div
										key={onlineUser.id}
										className="flex items-center gap-2 text-sm">
										<div className="h-2 w-2 bg-green-500 rounded-full" />
										<span className="text-muted-foreground truncate">
											{displayName(onlineUser)}
										</span>
									</div>
								))
							)}
						</div>
					</ScrollArea>
				</div>
			)}
		</div>
	);
}
