"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/hooks/use-chat";
import { MessageList } from "@/components/chat/message-list";
import { MessageInput } from "@/components/chat/message-input";
import { RoomSidebar } from "@/components/chat/room-sidebar";
import { ChatHeader } from "@/components/chat/chat-header";
import type { Room } from "@/lib/types";

export default function ChatPage() {
	const router = useRouter();
	const [isMounted, setIsMounted] = useState(false);
	const {
		user,
		messages,
		rooms,
		currentRoom,
		onlineUsers,
		isLoading,
		sendMessage,
		getMessages,
		getRooms,
		createRoom,
		switchRoom,
		logout,
		isAuthenticated,
		userStatus,
	} = useChat();

	const [currentRoomData, setCurrentRoomData] = useState<Room | undefined>();

	// Handle client-side mounting
	useEffect(() => {
		setIsMounted(true);
	}, []);

	// Redirect if not authenticated after component mounts
	useEffect(() => {
		if (isMounted && !isAuthenticated()) {
			router.push("/auth");
		}
	}, [isMounted, isAuthenticated, router]);

	// Load initial data
	useEffect(() => {
		if (isMounted && isAuthenticated()) {
			getRooms();
		}
	}, [isMounted, isAuthenticated, getRooms, getMessages]);

	// Update current room data
	useEffect(() => {
		const roomData = rooms.find((room) => room.id === currentRoom);
		setCurrentRoomData(roomData);
		getMessages(currentRoom);
	}, [rooms, currentRoom]);

	const handleSendMessage = async (text: string) => {
		try {
			await sendMessage(text, currentRoom);
		} catch (error) {
			console.error("Failed to send message:", error);
		}
	};

	const handleRoomSelect = async (roomId: string) => {
		try {
			await switchRoom(roomId);
			await getMessages(roomId);
		} catch (error) {
			console.error("Failed to switch room:", error);
		}
	};

	const handleCreateRoom = async (name: string, description?: string) => {
		try {
			await createRoom(name, description);
		} catch (error) {
			console.error("Failed to create room:", error);
		}
	};

	const handleLogout = async () => {
		try {
			await logout();
			router.push("/auth");
		} catch (error) {
			console.error("Failed to logout:", error);
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

	// Show redirect message while redirecting
	if (!isAuthenticated()) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<div className="text-center">
					<p className="text-muted-foreground">Redirecting to login...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="h-screen bg-background flex">
			{/* Sidebar */}
			<RoomSidebar
				rooms={rooms}
				currentRoom={currentRoom}
				onRoomSelect={handleRoomSelect}
				onCreateRoom={handleCreateRoom}
				onlineUsers={Array.from(onlineUsers.values()).filter(
					(u) => u.id !== user?.id
				)}
			/>

			{/* Main Chat Area */}
			<div className="flex-1 flex flex-col">
				{/* Header */}
				<ChatHeader
					currentRoom={currentRoomData}
					user={user}
					isConnected={userStatus?.status === "online"}
					onLogout={handleLogout}
				/>

				{/* Messages */}
				<MessageList messages={messages} currentUserId={user?.id} />

				{/* Message Input */}
				<MessageInput
					onSendMessage={handleSendMessage}
					isLoading={isLoading}
					placeholder={
						currentRoomData
							? `Message ${currentRoomData.name}`
							: "Select a room to send messages"
					}
				/>
			</div>
		</div>
	);
}
