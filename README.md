# Kong Chat 🚀

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Kong Gateway](https://img.shields.io/badge/Kong-Gateway-green?style=for-the-badge&logo=kong)](https://konghq.com/)

> **Enterprise-grade real-time messaging platform powered by Kong API Gateway**

A modern, scalable chat application built with Next.js and secured by Kong API Gateway. Features real-time messaging, user authentication, room management, and comprehensive API management for professional communication needs.

## ✨ Features

### 🔐 **Authentication & Security**

- JWT-based authentication via Kong Gateway
- Secure user registration and login
- Protected routes and API endpoints
- Rate limiting and request validation

### 💬 **Real-time Messaging**

- Instant messaging with WebSocket support
- Message persistence and history
- Typing indicators
- User presence detection

### 🏠 **Room Management**

- Create and manage chat rooms
- Join/leave rooms dynamically
- Room descriptions and metadata
- Member count tracking

### 🎨 **Modern UI/UX**

- Dark theme professional design
- Responsive mobile-friendly interface
- Clean, intuitive user experience
- Real-time connection status

### 🚀 **Performance & Scalability**

- Kong Gateway for API management
- Load balancing and monitoring
- Microservices architecture
- Optimized for high performance

## 🛠️ Tech Stack

### **Frontend**

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Socket.IO Client** - Real-time communication
- **Radix UI** - Accessible component library
- **Lucide React** - Beautiful icons

### **Backend Architecture**

- **Kong API Gateway** - API management and security
- **Authentication Service** (Port 3001) - JWT auth
- **Chat Service** (Port 3002) - Messaging logic
- **Socket.IO** - Real-time WebSocket connections

### **Development Tools**

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Geist Font** - Modern typography
- **Vercel Analytics** - Performance monitoring

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Kong Gateway** (for API management)
- **Git** for version control

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/kong-chat.git
cd kong-chat
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Kong Gateway Configuration
NEXT_PUBLIC_GATEWAY_URL=http://localhost:8000

# Auth Service
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001

# Chat Service
NEXT_PUBLIC_CHAT_SERVICE_URL=http://localhost:3002

# Socket.IO Configuration
NEXT_PUBLIC_SOCKET_URL=http://localhost:8000

# Optional: Analytics
VERCEL_ANALYTICS_ID=your_analytics_id
```

### 4. Kong Gateway Setup

Ensure Kong Gateway is running and configured to route to your backend services:

```bash
# Example Kong configuration (adjust ports as needed)
curl -X POST http://localhost:8001/services \
  --data name=auth-service \
  --data url=http://localhost:3001

curl -X POST http://localhost:8001/services \
  --data name=chat-service \
  --data url=http://localhost:3002
```

## 🎯 Usage

### Development Mode

```bash
npm run dev
# or
yarn dev
```

Navigate to `http://localhost:3000` to access the application.

### Production Build

```bash
npm run build
npm start
# or
yarn build
yarn start
```

### Basic Usage Flow

1. **Register/Login**: Create an account or sign in
2. **Join Rooms**: Browse and join available chat rooms
3. **Send Messages**: Start chatting in real-time
4. **Create Rooms**: Set up new conversation spaces
5. **Monitor Status**: View online users and connection status

## 🔧 Configuration

### Kong Gateway Routes

The application expects the following Kong routes:

```yaml
# Authentication routes
/auth/api/v1/auth/* → Auth Service (3001)

# Chat API routes
/chat/api/* → Chat Service (3002)

# WebSocket connections
/socket.io/* → Chat Service WebSocket (3002)
```

### Environment Variables

| Variable                       | Description      | Default                 |
| ------------------------------ | ---------------- | ----------------------- |
| `NEXT_PUBLIC_GATEWAY_URL`      | Kong Gateway URL | `http://localhost:8000` |
| `NEXT_PUBLIC_AUTH_SERVICE_URL` | Auth service URL | `http://localhost:3001` |
| `NEXT_PUBLIC_CHAT_SERVICE_URL` | Chat service URL | `http://localhost:3002` |

### Backend wake-up (production)

The deployed backend (an Azure VM) deallocates itself after 30 minutes idle to save hosting
cost, since this is a portfolio demo rather than a service with real traffic. `app/api/wake`
is a serverless function that checks whether it's running and starts it back up when it
isn't; `components/backend-wake-gate.tsx` wraps the whole app (`app/layout.tsx`) and holds
visitors behind a "waking up" screen — polling every 8s, up to 3 minutes — until the backend
actually responds, not just until the VM boots (Postgres/Kafka/Kong take roughly another
minute after that).

This needs its own set of environment variables (a service principal scoped to only start
and read the power state of that one VM — see `deploy/README.md` in the `microservices-project`
repo for how it was created): `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`,
`AZURE_SUBSCRIPTION_ID`, `AZURE_RESOURCE_GROUP`, `AZURE_VM_NAME` — see `.env.local.example`.
Without them configured (e.g. local dev), the wake check no-ops and the app renders normally.

## 🌐 API Endpoints

### Authentication

```http
POST /auth/api/v1/auth/register
POST /auth/api/v1/auth/login
POST /auth/api/v1/auth/logout
```

### Users

```http
GET /chat/api/users/me
GET /chat/api/users/status
```

### Messages

```http
GET /chat/api/messages?roomId={id}&limit=50&offset=0
POST /chat/api/messages
PUT /chat/api/messages/{id}
DELETE /chat/api/messages/{id}
```

### Rooms

```http
GET /chat/api/rooms?limit=20&offset=0
POST /chat/api/rooms
GET /chat/api/rooms/{id}
PUT /chat/api/rooms/{id}
DELETE /chat/api/rooms/{id}
```

### WebSocket Events

```javascript
// Client to Server
socket.emit("message:send", { text, roomId });
socket.emit("join:room", roomId);
socket.emit("leave:room", roomId);
socket.emit("typing:start", { roomId });
socket.emit("typing:stop", { roomId });

// Server to Client
socket.on("message:new", (message) => {});
socket.on("user:joined", (data) => {});
socket.on("user:left", (data) => {});
socket.on("typing:user", (data) => {});
```

## 🏗️ Project Structure

```
kong-chat/
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication pages
│   ├── chat/              # Chat interface
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   ├── auth/              # Auth components
│   ├── chat/              # Chat components
│   └── ui/                # UI components
├── hooks/                 # Custom React hooks
│   └── use-chat.ts        # Main chat logic hook
├── lib/                   # Utility functions
│   ├── api.ts             # API client
│   ├── types.ts           # TypeScript types
│   └── utils.ts           # Helper functions
├── public/                # Static assets
└── docs/                  # Documentation
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**

```bash
git fork https://github.com/yourusername/kong-chat.git
```

2. **Create a feature branch**

```bash
git checkout -b feature/amazing-feature
```

3. **Commit your changes**

```bash
git commit -m 'Add some amazing feature'
```

4. **Push to the branch**

```bash
git push origin feature/amazing-feature
```

5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commits
- Add tests for new features
- Update documentation as needed
- Ensure code passes ESLint checks

## 🐛 Troubleshooting

### Common Issues

**Connection Issues**

```bash
# Check Kong Gateway status
curl http://localhost:8001/status

# Verify service routes
curl http://localhost:8001/services
```

**Build Errors**

```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**Socket Connection Problems**

- Ensure WebSocket routes are configured in Kong
- Check firewall settings for ports 3000, 3001, 3002, 8000
- Verify CORS configuration

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2024 Kong Chat

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

## 👥 Contact & Support

**Author**: Ahmed Nasser  
**Email**: ahmednaser7707@@gmail.com

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by [Ahmed Nasser](https://github.com/ahmednasser111)

</div>
