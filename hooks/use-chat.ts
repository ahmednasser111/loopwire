"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import type { User, Message, Room } from "@/lib/types";

interface AuthenticatedSocket extends Socket {
	userId?: string;
	user?: any;
}

interface MessageData {
	text: string;
	roomId?: string;
}

interface TypingData {
	roomId: string;
	userId: string;
	isTyping: boolean;
}

interface UserStatus {
	status: "online" | "offline";
	lastSeen: string;
	userId: string;
}

// Chat client hook for managing authentication and real-time messaging
export function useChat(
	gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:8000"
) {
	const [user, setUser] = useState<User | null>(
		typeof window !== "undefined"
			? JSON.parse(localStorage.getItem("chat_user") || "null")
			: null
	);
	const [token, setToken] = useState<string | null>(
		typeof window !== "undefined" ? localStorage.getItem("chat_token") : null
	);
	const [isConnected, setIsConnected] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const [rooms, setRooms] = useState<Room[]>([]);
	const [currentRoom, setCurrentRoom] = useState<string>("");
	const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
	const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [userStatus, setUserStatus] = useState<UserStatus | null>(null);

	const socketRef = useRef<AuthenticatedSocket | null>(null);
	const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Initialize authentication from localStorage
	useEffect(() => {
		const savedToken = localStorage.getItem("chat_token");
		const savedUser = localStorage.getItem("chat_user");
		const savedRoom = localStorage.getItem("currentRoom");

		if (savedToken) {
			setToken(savedToken);
			if (savedUser) {
				try {
					setUser(JSON.parse(savedUser));
				} catch {
					localStorage.removeItem("chat_user");
				}
			}
			if (savedRoom) {
				setCurrentRoom(savedRoom);
			}
			getCurrentUser(savedToken);
		}
	}, []);

	// Connect socket when user is authenticated
	useEffect(() => {
		if (token && user && !socketRef.current) {
			connectSocket(token);
		}

		return () => {
			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
			}
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}
		};
	}, [token, user]);

	// API helper function
	const apiCall = useCallback(
		async (endpoint: string, options: RequestInit = {}) => {
			const url = `${gatewayUrl}${endpoint}`;
			const headers = {
				"Content-Type": "application/json",
				...(token && { Authorization: `Bearer ${token}` }),
				...options.headers,
			};

			try {
				const response = await fetch(url, { ...options, headers });

				if (!response.ok) {
					const errorText = await response.text();
					throw new Error(`API call failed: ${response.status} ${errorText}`);
				}

				return await response.json();
			} catch (err) {
				console.error("API call error:", err);
				throw err;
			}
		},
		[gatewayUrl, token]
	);

	// Socket connection with proper event handlers based on SocketService
	const connectSocket = useCallback(
		(authToken: string) => {
			if (socketRef.current?.connected) return;

			try {
				socketRef.current = io(gatewayUrl, {
					auth: { token: authToken },
					transports: ["websocket"],
					autoConnect: true,
				}) as AuthenticatedSocket;

				const socket = socketRef.current;

				socket.on("connect", () => {
					console.log("Socket connected:", socket.id);
					setIsConnected(true);
					setError(null);

					// Auto-join current room if set
					if (currentRoom) {
						socket.emit("join:room", currentRoom);
					}

					// Request online users list
					socket.emit("users:online");
				});

				socket.on("disconnect", (reason) => {
					console.log("Socket disconnected:", reason);
					setIsConnected(false);

					// Auto-reconnect on server disconnect
					if (reason === "io server disconnect") {
						reconnectTimeoutRef.current = setTimeout(() => {
							if (token && user) {
								socket.connect();
							}
						}, 2000);
					}
				});

				socket.on("connect_error", (error) => {
					console.error("Socket connection error:", error);
					setIsConnected(false);
					setError("Connection failed. Please try again.");
				});

				// Real-time message events (matching SocketService)
				socket.on("message:new", (message: Message) => {
					console.log("New message received:", message);
					setMessages((prev) => {
						// Avoid duplicates
						const exists = prev.some((m) => m.id === message.id);
						if (exists) return prev;
						return [...prev, message].sort(
							(a, b) =>
								new Date(a.createdAt).getTime() -
								new Date(b.createdAt).getTime()
						);
					});
				});

				socket.on("message:updated", (message: Message) => {
					console.log("Message updated:", message);
					setMessages((prev) =>
						prev.map((msg) => (msg.id === message.id ? message : msg))
					);
				});

				socket.on("message:deleted", (data: { messageId: string }) => {
					console.log("Message deleted:", data);
					setMessages((prev) =>
						prev.filter((msg) => msg.id !== data.messageId)
					);
				});

				// User presence events (matching SocketService)
				socket.on(
					"user:joined",
					(data: { userId: string; roomId: string; timestamp: Date }) => {
						console.log("User joined:", data);
						if (data.roomId === currentRoom) {
							setOnlineUsers((prev) => new Set([...prev, data.userId]));
						}
					}
				);

				socket.on(
					"user:left",
					(data: { userId: string; roomId: string; timestamp: Date }) => {
						console.log("User left:", data);
						if (data.roomId === currentRoom) {
							setOnlineUsers((prev) => {
								const newSet = new Set(prev);
								newSet.delete(data.userId);
								return newSet;
							});
						}
					}
				);

				socket.on("users:online:list", (data: { users: string[] }) => {
					console.log("Online users updated:", data);
					setOnlineUsers(new Set(data.users));
				});

				socket.on(
					"user:status",
					(data: {
						userId: string;
						status: "online" | "offline";
						timestamp: Date;
					}) => {
						console.log("User status updated:", data);
						if (data.userId === user?.id) {
							setUserStatus({
								userId: data.userId,
								status: data.status,
								lastSeen: data.timestamp.toString(),
							});
						}
					}
				);

				// Typing events (matching SocketService)
				socket.on("typing:user", (data: TypingData) => {
					if (data.roomId === currentRoom && data.userId !== user?.id) {
						if (data.isTyping) {
							setTypingUsers((prev) => new Set([...prev, data.userId]));
						} else {
							setTypingUsers((prev) => {
								const newSet = new Set(prev);
								newSet.delete(data.userId);
								return newSet;
							});
						}
					}
				});

				// Room events
				socket.on("room:created", (room: Room) => {
					console.log("Room created:", room);
					setRooms((prev) => [...prev, room]);
				});

				socket.on("room:updated", (room: Room) => {
					console.log("Room updated:", room);
					setRooms((prev) => prev.map((r) => (r.id === room.id ? room : r)));
				});

				socket.on("room:deleted", (data: { roomId: string }) => {
					console.log("Room deleted:", data);
					setRooms((prev) => prev.filter((r) => r.id !== data.roomId));
					if (currentRoom === data.roomId) {
						setCurrentRoom("");
						setMessages([]);
						localStorage.removeItem("currentRoom");
					}
				});

				// Error handling
				socket.on("error", (error) => {
					console.error("Socket error:", error);
					setError(error.message || "Socket error occurred");
				});
			} catch (error) {
				console.error("Failed to connect socket:", error);
				setError("Failed to establish real-time connection");
			}
		},
		[gatewayUrl, currentRoom, user?.id, token]
	);

	// Authentication functions
	const register = useCallback(
		async (userData: {
			firstName: string;
			lastName: string;
			email: string;
			password: string;
		}) => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await apiCall("/auth/api/v1/auth/register", {
					method: "POST",
					body: JSON.stringify(userData),
				});

				return response;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Registration failed";
				setError(errorMessage);
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[apiCall]
	);

	const login = useCallback(
		async (email: string, password: string) => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await apiCall("/auth/api/v1/auth/login", {
					method: "POST",
					body: JSON.stringify({ email, password }),
				});

				const { token: newToken } = response;
				setToken(newToken);
				localStorage.setItem("chat_token", newToken);

				// Get user info
				const userData = await getCurrentUser(newToken);
				if (userData) {
					// Socket will connect via useEffect
					return { token: newToken, user: userData };
				}

				return response;
			} catch (err) {
				const errorMessage =
					err instanceof Error ? err.message : "Login failed";
				setError(errorMessage);
				throw err;
			} finally {
				setIsLoading(false);
			}
		},
		[apiCall]
	);

	const logout = useCallback(async () => {
		try {
			if (token) {
				await apiCall("/auth/api/v1/auth/logout", { method: "POST" });
			}
		} catch (err) {
			console.error("Logout error:", err);
		} finally {
			// Clean up state
			setToken(null);
			setUser(null);
			setIsConnected(false);
			setCurrentRoom("");
			setMessages([]);
			setRooms([]);
			setOnlineUsers(new Set());
			setTypingUsers(new Set());
			setUserStatus(null);

			// Clear localStorage
			localStorage.removeItem("chat_token");
			localStorage.removeItem("chat_user");
			localStorage.removeItem("currentRoom");

			// Clear timeouts
			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}

			// Disconnect socket
			if (socketRef.current) {
				socketRef.current.disconnect();
				socketRef.current = null;
			}
		}
	}, [apiCall, token]);

	const getCurrentUser = useCallback(
		async (authToken?: string) => {
			const currentToken = authToken || token;
			if (!currentToken) return null;

			try {
				const response = await fetch(`${gatewayUrl}/chat/api/users/me`, {
					headers: { Authorization: `Bearer ${currentToken}` },
					cache: "no-store",
				});

				if (response.ok) {
					const { user: userData } = await response.json();
					setUser(userData);
					localStorage.setItem("chat_user", JSON.stringify(userData));
					return userData;
				}
			} catch (err) {
				console.error("Get user error:", err);
			}
			return null;
		},
		[gatewayUrl, token]
	);

	// Message functions (matching SocketService events)
	const sendMessage = useCallback(
		async (text: string, roomId: string) => {
			const targetRoom = roomId || currentRoom;

			// Ensure user is in a room before sending
			if (!targetRoom) {
				throw new Error("You must join a room before sending messages");
			}

			if (!token) throw new Error("Not authenticated");

			// Validate message
			if (!text || text.trim().length === 0) {
				throw new Error("Message text is required");
			}

			if (text.length > 1000) {
				throw new Error("Message too long (max 1000 characters)");
			}

			try {
				// Send via socket for real-time if connected, fallback to API
				if (socketRef.current?.connected) {
					socketRef.current.emit("message:send", { text, roomId: targetRoom });
					return; // Message will be received via socket event
				} else {
					// Fallback to REST API
					const response = await apiCall("/chat/api/messages", {
						method: "POST",
						body: JSON.stringify({ text, roomId: targetRoom }),
					});

					const { message } = response;
					setMessages((prev) => [...prev, message]);
					return message;
				}
			} catch (err) {
				console.error("Send message error:", err);
				throw err;
			}
		},
		[apiCall, token, currentRoom]
	);

	const getMessages = useCallback(
		async (roomId: string, limit = 50, offset = 0) => {
			if (!token) return [];

			try {
				const params = new URLSearchParams({
					...(roomId && { roomId }),
					limit: limit.toString(),
					offset: offset.toString(),
				});

				const response = await apiCall(`/chat/api/messages?${params}`);
				const { messages: messageList } = response;

				if (roomId === currentRoom || !roomId) {
					setMessages(messageList);
				}

				return messageList;
			} catch (err) {
				console.error("Get messages error:", err);
				return [];
			}
		},
		[apiCall, token, currentRoom]
	);

	// Room functions (removed global room references)
	const getRooms = useCallback(
		async (limit = 20, offset = 0) => {
			if (!token) return [];

			try {
				const params = new URLSearchParams({
					limit: limit.toString(),
					offset: offset.toString(),
				});

				const response = await apiCall(`/chat/api/rooms?${params}`);
				const { rooms: roomList } = response;

				setRooms(roomList);
				return roomList;
			} catch (err) {
				console.error("Get rooms error:", err);
				return [];
			}
		},
		[apiCall, token]
	);

	const createRoom = useCallback(
		async (name: string, description?: string) => {
			if (!token) throw new Error("Not authenticated");

			try {
				const response = await apiCall("/chat/api/rooms", {
					method: "POST",
					body: JSON.stringify({ name, description }),
				});

				const { room } = response;
				setRooms((prev) => [...prev, room]);
				return room;
			} catch (err) {
				console.error("Create room error:", err);
				throw err;
			}
		},
		[apiCall, token]
	);

	const switchRoom = useCallback(
		async (roomId: string) => {
			try {
				if (!roomId) throw new Error("Room ID is required");

				// Leave current room if connected via socket
				if (currentRoom && socketRef.current?.connected) {
					socketRef.current.emit("leave:room", currentRoom);
				}

				// Update current room
				setCurrentRoom(roomId);
				setMessages([]); // Clear messages when switching rooms
				setTypingUsers(new Set()); // Clear typing users

				// Join new room if connected via socket
				if (socketRef.current?.connected) {
					socketRef.current.emit("join:room", roomId);
				}

				// Load room messages
				await getMessages(roomId);

				// Save to localStorage
				localStorage.setItem("currentRoom", roomId);
			} catch (error) {
				console.error("Error switching room:", error);
				throw error;
			}
		},
		[currentRoom, getMessages]
	);

	// Typing functions (matching SocketService events)
	const startTyping = useCallback(() => {
		if (currentRoom && socketRef.current?.connected) {
			socketRef.current.emit("typing:start", { roomId: currentRoom });
		}
	}, [currentRoom]);

	const stopTyping = useCallback(() => {
		if (currentRoom && socketRef.current?.connected) {
			socketRef.current.emit("typing:stop", { roomId: currentRoom });
		}
	}, [currentRoom]);

	// Enhanced connection check with API call
	const checkConnection = useCallback(async () => {
		if (!token) {
			setIsConnected(false);
			return false;
		}

		try {
			// Check socket connection
			const socketConnected = socketRef.current?.connected || false;

			// Check API connection and user status
			const response = await apiCall("/chat/api/users/status");

			if (response) {
				setUserStatus(response);
				setIsConnected(socketConnected);

				// If socket is not connected but API is working, try to reconnect socket
				if (!socketConnected && token && user) {
					console.log(
						"API working but socket disconnected, attempting reconnect..."
					);
					connectSocket(token);
				}

				return true;
			}
		} catch (err) {
			console.error("Connection check failed:", err);
			setIsConnected(false);

			// Try to reconnect socket if we have credentials
			if (token && user && !socketRef.current?.connected) {
				console.log("Connection check failed, attempting socket reconnect...");
				connectSocket(token);
			}

			return false;
		}

		return false;
	}, [apiCall, token, user, connectSocket]);

	// Utility functions
	const isAuthenticated = useCallback(() => {
		return !!(token && user);
	}, [token, user]);

	const canSendMessage = useCallback(() => {
		return !!(token && user && currentRoom);
	}, [token, user, currentRoom]);

	const getUsersOnlineCount = useCallback(() => {
		return onlineUsers.size;
	}, [onlineUsers]);

	const getTypingUsersCount = useCallback(() => {
		return typingUsers.size;
	}, [typingUsers]);

	// Auto-refresh connection status
	useEffect(() => {
		if (!token || !user) return;

		const interval = setInterval(() => {
			checkConnection();
		}, 30000); // Check every 30 seconds

		return () => clearInterval(interval);
	}, [token, user, checkConnection]);

	return {
		// State
		user,
		token,
		isConnected,
		messages,
		rooms,
		currentRoom,
		onlineUsers,
		typingUsers,
		isLoading,
		error,
		userStatus,

		// Auth functions
		register,
		login,
		logout,
		getCurrentUser,

		// Message functions
		sendMessage,
		getMessages,

		// Room functions
		getRooms,
		createRoom,
		switchRoom,

		// Typing functions
		startTyping,
		stopTyping,

		// Utility functions
		isAuthenticated,
		canSendMessage,
		checkConnection,
		getUsersOnlineCount,
		getTypingUsersCount,
	};
}
