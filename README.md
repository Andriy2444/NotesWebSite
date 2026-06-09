# 📝 Notes Management and Synchronization System

<div align="center">

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)

A full-stack web application for managing notes with folder organization, sharing capabilities, and persistent storage — built with a modern, containerized architecture.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Overview](#-api-overview)
- [Authentication Flow](#-authentication-flow)
- [Roadmap](#-roadmap)

---

## 🌟 Overview

**Notes Management and Synchronization System** is a full-stack application that allows users to create, organize, and manage notes within a folder hierarchy. Each user has a private workspace with persistent storage — notes are saved to a PostgreSQL database and remain available across sessions and page reloads.

The application features a clean separation of concerns: a **NestJS** backend handles business logic and data persistence, while a **React + Vite** frontend delivers a fast, responsive UI. Everything runs in **Docker** containers for consistent local development and easy deployment.

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure login and registration with access & refresh token strategy
- 📁 **Folder Management** — Create and organize notes into folders
- 📝 **Note CRUD** — Create, read, update, and delete notes
- 🔗 **Note Sharing** — Share notes with other users
- ⚙️ **User Settings** — Personalized account settings
- 💾 **Persistent Storage** — Notes survive page reloads, stored in PostgreSQL via Prisma ORM
- 🐳 **Fully Dockerized** — Backend, frontend, and database run in Docker containers
- 🔄 **Token Refresh** — Silent access token renewal using refresh tokens

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| [NestJS](https://nestjs.com/) | Node.js framework for scalable server-side apps |
| [Prisma ORM](https://www.prisma.io/) | Type-safe database access and migrations |
| [PostgreSQL](https://www.postgresql.org/) | Relational database |
| [JWT](https://jwt.io/) | Stateless authentication (access + refresh tokens) |
| TypeScript | Type safety across the entire backend |

### Frontend
| Technology | Purpose |
|---|---|
| [React](https://react.dev/) | UI component library |
| [Vite](https://vitejs.dev/) | Fast development server and build tool |
| TypeScript | Type-safe React components |
| Axios / Fetch | HTTP client for API communication |

### Infrastructure
| Technology | Purpose |
|---|---|
| Docker + Docker Compose | Container orchestration |
| Prisma Migrations | Database schema versioning |

---

## 📁 Project Structure

```
NotesWebSite/
├── backend/                    # NestJS API server
│   ├── prisma/
│   │   ├── migrations/         # Database migration history
│   │   └── schema.prisma       # Prisma data model
│   ├── src/
│   │   ├── auth/               # JWT authentication (login, register, refresh)
│   │   ├── folders/            # Folder CRUD module
│   │   ├── notes/              # Notes CRUD module
│   │   ├── prisma/             # Prisma service provider
│   │   ├── settings/           # User settings module
│   │   ├── share/              # Note sharing module
│   │   ├── users/              # User management module
│   │   ├── app.controller.ts
│   │   ├── app.module.ts
│   │   ├── app.service.ts
│   │   └── main.ts             # Application entry point
│   ├── Dockerfile
│   ├── .env                    # Backend environment variables
│   └── tsconfig.json
│
├── frontend/                   # React + Vite client
│   ├── src/
│   │   ├── assets/             # Static assets (images, icons)
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page-level components
│   │   ├── styles/             # Global and component styles
│   │   ├── api.ts              # API client configuration
│   │   ├── App.tsx             # Root application component
│   │   └── main.tsx            # React entry point
│   ├── Dockerfile
│   ├── .env                    # Frontend environment variables
│   └── vite.config.ts
│
├── docker-compose.yml          # Multi-container orchestration
├── .env                        # Root environment variables
└── .env.example                # Environment variables template
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

- [Docker](https://www.docker.com/get-started) & Docker Compose
- [Node.js](https://nodejs.org/) v18+ (for local development without Docker)
- [Git](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/NotesWebSite.git
cd NotesWebSite
```

### 2. Configure environment variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Update the values in `.env` (see [Environment Variables](#-environment-variables) section below).

### 3. Start with Docker Compose

```bash
docker-compose up --build
```

This will start three containers:
- **PostgreSQL** — database on port `5432`
- **Backend** — NestJS API on port `3000`
- **Frontend** — React app on port `5173`

### 4. Run database migrations

Once containers are running, apply Prisma migrations:

```bash
docker-compose exec backend npx prisma migrate deploy
```

### 5. Open the app

Navigate to [http://localhost:5173](http://localhost:5173) in your browser.

---

### Local Development (without Docker)

#### Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 🔧 Environment Variables

Copy `.env.example` to `.env` and configure the following:

### Root `.env` (Docker Compose)

```env
POSTGRES_USER=user
POSTGRES_PASSWORD=pass
POSTGRES_DB=my_db

BACKEND_PORT=3000
FRONTEND_PORT=5173

# ⚠️ Port must be 5432 (PostgreSQL default)
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}?schema=public"
```

### `backend/.env`

```env
JWT_SECRET="12345678901234567890123456789012"

DATABASE_URL="postgresql://user:pass@postgres:5432/my_db?schema=public"
```

### `frontend/.env`

```env
VITE_API_URL=http://localhost:3000
```

> ⚠️ Never commit `.env` files with real credentials. Use `.env.example` as the template.

## 📡 API Overview

The backend exposes a RESTful API. All protected routes require a valid `Bearer` access token in the `Authorization` header.

### 🔐 Auth

| Method | Endpoint | Body / Params | Description |
|--------|----------|---------------|-------------|
| `POST` | `/auth/register` | `email`, `username`, `password` | Register a new user |
| `POST` | `/auth/login` | `email`, `password` | Login, returns access & refresh tokens |
| `POST` | `/auth/refresh` | `refreshToken` | Get a new access token |
| `POST` | `/auth/logout` | `refreshToken` | Invalidate the refresh token |
| `GET` | `/auth/sessions` | — | List all active sessions |
| `DELETE` | `/auth/sessions/:id` | `sessionId` | Revoke a specific session |

### 👤 Users

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/users/me` | — | Get current user profile |
| `PATCH` | `/users/me` | `username` | Update username |

### 📁 Folders

| Method | Endpoint | Body / Query | Description |
|--------|----------|--------------|-------------|
| `POST` | `/folders` | `name`, `parentId` | Create a folder (supports nesting) |
| `GET` | `/folders` | `?parentId`, `?view`, `?space` | Get folders with filters |
| `GET` | `/folders/:id/notes` | `folderId` | Get all notes inside a folder |
| `PATCH` | `/folders/:id` | `name`, `isFavorite`, `isArchived`, `toTrash` | Update folder metadata |
| `DELETE` | `/folders/:id` | — | Delete a folder |

### 📝 Notes

| Method | Endpoint | Body / Query | Description |
|--------|----------|--------------|-------------|
| `POST` | `/notes` | `title`, `content`, `folderId`, `noteDate` | Create a note |
| `GET` | `/notes` | `?folderId`, `?view`, `?space` | Get notes with filters |
| `GET` | `/notes/calendar` | `?year`, `?month` | Get notes grouped by calendar date |
| `GET` | `/notes/:id` | — | Get a specific note |
| `PATCH` | `/notes/:id` | `title`, `content`, `folderId`, `noteDate`, `isFavorite`, `isArchived`, `toTrash` | Update note |
| `DELETE` | `/notes/:id` | — | Delete a note |

### 🕓 Note Versions

| Method | Endpoint | Params | Description |
|--------|----------|--------|-------------|
| `GET` | `/notes/:id/versions` | `noteId` | Get version history of a note |
| `POST` | `/notes/:id/versions/:versionId/restore` | `noteId`, `versionId` | Restore a specific version |
| `DELETE` | `/notes/:id/versions/:versionId` | `noteId`, `versionId` | Delete a specific version |

### ⚙️ Settings

| Method | Endpoint | Body | Description |
|--------|----------|------|-------------|
| `GET` | `/settings` | — | Get user settings |
| `PATCH` | `/settings` | `theme` | Update settings (e.g. theme) |

### 🔗 Sharing

| Method | Endpoint | Body / Params | Description |
|--------|----------|---------------|-------------|
| `POST` | `/share/note/:id` | `email`, `role` | Share a note with another user |
| `POST` | `/share/folder/:id` | `email`, `role` | Share a folder with another user |
| `DELETE` | `/share/note/:id/:userId` | `noteId`, `userId` | Revoke note access for a user |
| `DELETE` | `/share/folder/:id/:userId` | `folderId`, `userId` | Revoke folder access for a user |

> 🔒 All endpoints except `/auth/register`, `/auth/login`, and `/auth/refresh` require a valid `Authorization: Bearer <access_token>` header. Requests without a token return `401 Unauthorized`.

---

## 🔐 Authentication Flow

The app uses a **dual-token JWT strategy**:

```
┌──────────┐      login/register      ┌──────────┐
│  Client  │ ───────────────────────► │  Server  │
│          │ ◄─────────────────────── │          │
│          │   access token (15m)     │          │
│          │   refresh token (7d)     │          │
└──────────┘                          └──────────┘
      │
      │  access token expires
      ▼
┌──────────┐    POST /auth/refresh    ┌──────────┐
│  Client  │ ──────────────────────► │  Server  │
│          │ ◄────────────────────── │          │
│          │   new access token       │          │
└──────────┘                          └──────────┘
```

- **Access Token** — short-lived (15 minutes), used for all protected API calls
- **Refresh Token** — long-lived (7 days), stored securely, used only to obtain a new access token
- On access token expiry, the client silently requests a new one using the refresh token

---

## 🗺 Roadmap

- [x] User registration and login with JWT (access + refresh tokens)
- [x] Note CRUD operations
- [x] Folder management
- [x] Note sharing between users
- [x] Persistent storage with PostgreSQL + Prisma
- [x] Dockerized development environment
- [x] **Rich text editor** — TipTap note editing
- [x] **Search** — full-text search across notes
- [x] **Note versioning** — history of changes per note
- [ ] **Real-time synchronization** (WebSockets) — notes update live across browser tabs and devices

---

## 📄 License

This project is licensed under a **Custom License** — free for non-commercial and educational use.
Commercial use requires explicit written permission from the author.

See the [LICENSE](LICENSE) file for full terms.

> 📧 Contact: andriy241179@gmail.com