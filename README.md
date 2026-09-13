# Loopwire

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Kong Gateway](https://img.shields.io/badge/Kong-Gateway-green?style=for-the-badge&logo=kong)](https://konghq.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-realtime-black?style=for-the-badge&logo=socket.io)](https://socket.io/)

> **Real-time messaging platform built on an API-gateway-fronted microservices backend**

Loopwire is a real-time chat application with JWT authentication, room management, and
presence/typing indicators, backed by a Kong API Gateway routing to independent auth and
chat microservices. This repo is the frontend client; it talks to a separate backend
project (auth service, chat service, Postgres, Kafka) over REST and WebSockets.

## Features

### Authentication & Security

- JWT-based authentication via Kong Gateway
- Secure user registration and login
- Protected routes and API endpoints
- Rate limiting and request validation

### Real-time Messaging

- Instant messaging with WebSocket support
- Message persistence and history
- Typing indicators
- User presence detection

### Room Management

- Create and manage chat rooms
- Join/leave rooms dynamically
- Room descriptions and metadata
- Member count tracking

### Modern UI/UX

- Dark theme, professional design
- Responsive, mobile-friendly interface
- Real-time connection status

### Performance & Scalability

- Kong Gateway for API management
- Load balancing and monitoring
- Microservices architecture

## Tech Stack

### Frontend

- **React (App Router)** — TypeScript, server + client components
- **Tailwind CSS** — utility-first styling
- **Socket.IO Client** — real-time communication
- **Radix UI** — accessible component primitives
- **Lucide React** — icons

### Backend Architecture

- **Kong API Gateway** — API management and security
- **Authentication Service** (Port 3001) — JWT auth
- **Chat Service** (Port 3002) — messaging logic
- **Socket.IO** — real-time WebSocket connections

### Development Tools

- **ESLint** — code linting
- **Geist Font** — typography
- **Vercel Analytics** — performance monitoring

## Prerequisites

- **Node.js** (v18 or higher)
- **pnpm**
- **Kong Gateway** (for API management)
- **Git**

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/ahmednasser111/loopwire.git
cd loopwire
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Environment setup

Create a `.env.local` file in the root directory (see `.env.local.example`):

```env
# Kong Gateway Configuration
NEXT_PUBLIC_GATEWAY_URL=http://localhost:8000

# Optional: Analytics
VERCEL_ANALYTICS_ID=your_analytics_id
```

### 4. Kong Gateway setup

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

## Usage

### Development mode

```bash
pnpm dev
```

Navigate to `http://localhost:3000` to access the application.

### Production build

```bash
pnpm build
pnpm start
```

### Basic usage flow

1. **Register/Login**: create an account or sign in
2. **Join Rooms**: browse and join available chat rooms
3. **Send Messages**: chat in real-time
4. **Create Rooms**: set up new conversation spaces
5. **Monitor Status**: view online users and connection status

## Configuration

### Kong Gateway routes

The application expects the following Kong routes:

```yaml
# Authentication routes
/auth/api/v1/auth/* → Auth Service (3001)

# Chat API routes
/chat/api/* → Chat Service (3002)

# WebSocket connections
/socket.io/* → Chat Service WebSocket (3002)
```

### Environment variables

| Variable                   | Description       | Default                  |
| -------------------------- | ------------------ | ------------------------ |
| `NEXT_PUBLIC_GATEWAY_URL`  | Kong Gateway URL  | `http://localhost:8000`  |

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

## API Endpoints

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

## Project Structure

```text
loopwire/
├── app/                    # App Router routes
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
│   ├── types.ts           # TypeScript types
│   └── utils.ts           # Helper functions
└── public/                # Static assets
```

## Troubleshooting

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
pnpm build
```

**Socket Connection Problems**

- Ensure WebSocket routes are configured in Kong
- Check firewall settings for ports 3000, 3001, 3002, 8000
- Verify CORS configuration

## License

MIT License — see the [LICENSE](LICENSE) file for details.

## Contact

**Author**: Ahmed Nasser
**Email**: <ahmednaser7707@gmail.com>
**GitHub**: [@ahmednasser111](https://github.com/ahmednasser111)
