# NexusChat — Real-Time Collaboration & Messaging Platform

[![NexusChat CI/CD](https://github.com/your-username/NexusChat/actions/workflows/ci.yml/badge.svg)](https://github.com)
[![Docker Image](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**NexusChat** is a production-grade, full-stack real-time collaboration and chat application built with modern MERN architecture, TypeScript, Tailwind CSS, Socket.IO, JWT Role-Based Access Control, and containerized with Docker & Docker Compose.

---

## 📋 Evaluation Checklist Coverage

| # | Evaluation Requirement | Implementation Highlights in NexusChat | Status |
|---|---|---|:---:|
| 1 | **Frontend with Tailwind CSS** | Fully responsive (Mobile, Tablet, Desktop), custom dark/light theme, interactive modals, toasts, validation | ✅ Complete |
| 2 | **React Concepts & Hooks** | `useState`, `useEffect`, `useContext`, custom hooks (`useDebounce`, `useLocalStorage`), cleanup timers | ✅ Complete |
| 3 | **State Management** | React Context API architecture (`AuthContext`, `SocketContext`, `ThemeContext`) for modular state | ✅ Complete |
| 4 | **Backend REST API** | Express.js RESTful endpoints (`/api/auth`, `/api/users`, `/api/rooms`, `/api/admin/stats`), proper HTTP verbs & status codes | ✅ Complete |
| 5 | **MongoDB & Mongoose** | Strict Mongoose Schemas (`User`, `ChatRoom`, `Message`), `.populate()` relations, indexes, hybrid in-memory fallback | ✅ Complete |
| 6 | **Data Validation & Security** | Request input validation, bcrypt password hashing (10 salt rounds), protected headers, error middleware | ✅ Complete |
| 7 | **Authentication & Authorization** | JWT Token authentication (7-day validity), protected routes, Role-Based Access Control (`user` vs `admin`) | ✅ Complete |
| 8 | **Real-Time Features (Socket.IO)** | WebSockets for live chat, instant message broadcast, typing indicators, active room transitions, live user presence | ✅ Complete |
| 9 | **Docker Containerization** | Multi-stage production `Dockerfile`, `.dockerignore`, `docker-compose.yml` (App + MongoDB orchestration) | ✅ Complete |
| 10 | **DevOps & CI/CD** | GitHub Actions automated workflow (`.github/workflows/ci.yml`) for linting, Vite production build, & Docker build | ✅ Complete |

---

## 🏛️ System Architecture

```text
┌────────────────────────────────────────────────────────┐
│             React + Tailwind CSS Frontend              │
│  (AuthContext, SocketContext, ThemeContext, Lucide)     │
└───────────────▲────────────────────────▲───────────────┘
                │ HTTP REST (JSON)       │ WebSocket (ws/wss)
                ▼                        ▼
┌────────────────────────────────────────────────────────┐
│             Express.js + Socket.IO Server              │
│        (server.ts - TypeScript Runtime via tsx)         │
│  - JWT Verification & Role-Based Access Control        │
│  - RESTful Endpoints (/api/auth, /api/rooms, /api/...) │
│  - Real-time Event Broadcaster (Typing, Presence, Chat)│
└──────────────────────────┬─────────────────────────────┘
                           │ Mongoose ODM
                           ▼
┌────────────────────────────────────────────────────────┐
│                  MongoDB Atlas / Local                 │
│         Collections: users, chatrooms, messages        │
└────────────────────────────────────────────────────────┘
```

---

## 👥 Demo Credentials for Evaluation

The database seeds automatically upon startup. You can evaluate with both user roles:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **System Admin** | `admin@chat.com` | `admin123` | Full access, Admin Analytics Dashboard, User role promotion/demotion, Room deletion |
| **Standard User** | `user@chat.com` | `user123` | Real-time chat, create rooms, view active peers, live typing |

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun**
- **MongoDB Atlas** connection string (or local MongoDB)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/your-username/NexusChat.git
cd NexusChat

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the project root:
```env
PORT=3000
NODE_ENV=development
JWT_SECRET=nexus_chat_super_secret_jwt_key_2026
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/nexus_chat?retryWrites=true&w=majority
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🍃 MongoDB Atlas Setup Instructions

1. Log in to [MongoDB Cloud](https://cloud.mongodb.com/).
2. Create or open your free **M0 Cluster**.
3. **Database Access**: Create a Database User with username and password (e.g., `nexus_user` / `SecurePass123`).
4. **Network Access**: Add IP Address `0.0.0.0/0` (Allow access from anywhere) to ensure connectivity during presentation and deployment.
5. **Connection String**: Go to **Database** -> **Connect** -> **Drivers** (Node.js) -> Copy the SRV URI:
   ```text
   mongodb+srv://nexus_user:<password>@cluster0.abcde.mongodb.net/nexus_chat?retryWrites=true&w=majority
   ```
6. Paste into your `.env` file as `MONGO_URI`.

> **Note**: NexusChat includes a zero-configuration **In-Memory Fallback**. If MongoDB Atlas is temporarily unreachable, the app seamlessly boots and operates without crashing!

---

## 🐳 Docker Deployment Guide

### Option 1: Standalone Docker Container
```bash
# Build the Docker image
docker build -t nexus-chat:latest .

# Run the container
docker run -p 3000:3000 -e MONGO_URI="mongodb+srv://..." nexus-chat:latest
```

### Option 2: Docker Compose (App + Local MongoDB)
```bash
# Start multi-container stack
docker compose up -d --build

# View container logs
docker compose logs -f

# Stop container stack
docker compose down
```

---

## 📡 REST API Documentation

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user with name, email, password |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/auth/me` | Protected (JWT) | Get profile of logged-in user |
| `GET` | `/api/users` | Protected (JWT) | List all registered users and presence status |
| `PATCH` | `/api/users/:id/role` | Admin Only | Promote or demote user role (`user` / `admin`) |
| `GET` | `/api/rooms` | Protected (JWT) | Fetch accessible chat rooms |
| `POST` | `/api/rooms` | Protected (JWT) | Create new public or private chat room |
| `DELETE` | `/api/rooms/:id` | Admin Only | Delete chat room and associated messages |
| `GET` | `/api/rooms/:id/messages` | Protected (JWT) | Fetch message history for a room |
| `GET` | `/api/admin/stats` | Admin Only | System metrics: uptime, memory, user & room count |

---

## ⚡ Socket.IO Real-Time Events

- `join_room` / `leave_room`: Subscribe / unsubscribe from specific chat room channels.
- `send_message`: Real-time message dispatch with persistence to MongoDB.
- `typing_start` / `typing_stop`: Broadcasts live typing indicator to room participants.
- `room_created` / `room_deleted`: Notifies all connected clients to update room listings instantly.
- `user_status_changed`: Live presence tracking (`online`, `offline`).

---

## 🧪 Testing & Verification

```bash
# Run TypeScript type-checking & lint
npm run lint

# Build production assets
npm run build
```

---

## 👨‍💻 Project Presentation & Viva Highlights

When presenting to your evaluator:
1. **Show Modals in the Navbar**: Point out the built-in **API Docs**, **Database Schema**, **DevOps & Docker Guide**, and **Evaluation Checklist** modals right in the top navigation bar!
2. **Demonstrate Real-Time Chat**: Open two separate browser windows (one Incognito) with `admin@chat.com` and `user@chat.com`. Type in one window to show instant typing indicator and message delivery via Socket.IO without page reloads.
3. **Demonstrate RBAC**: Log in as `admin@chat.com` to show the Admin Analytics Dashboard, change user roles, and delete rooms. Show that standard users cannot access these capabilities.
4. **Demonstrate Docker**: Show `Dockerfile` and `docker-compose.yml` in your repository.

