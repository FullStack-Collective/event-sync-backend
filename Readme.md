# 🎯 EventSync Backend

EventSync is a real-time event management platform that replaces static materials (PDF, paper programs) with a dynamic interface for seamless navigation and live interaction during events.

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Quick Setup for Developers](#quick-setup-for-developers)
- [Database Setup Guide](#database-setup-guide)
- [Prisma Commands](#prisma-commands)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Available Scripts](#available-scripts)
- [Environment Variables](#environment-variables)
- [Team Workflow](#team-workflow)
- [Troubleshooting](#troubleshooting)

## 🚀 Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (admin only)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** (v14 or higher) - installed locally or using Docker

## ⚡ Quick Setup for Developers

Follow these steps to get the backend running on your machine:

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/eventsync-backend.git
cd eventsync-backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up PostgreSQL Database


```sql
CREATE USER eventsync_user WITH PASSWORD 'Eventsync2024!';
CREATE DATABASE eventsync OWNER eventsync_user;
```

### Step 4: Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then edit `.env` and update the database connection string if needed:

```env
DATABASE_URL="postgresql://eventsync_user:Eventsync2024!@localhost:5432/eventsync?schema=public"
PORT=3000
ADMIN_EMAIL="admin@eventsync.com"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

### Step 5: Generate Database Tables with Prisma

**IMPORTANT: Run these commands in order**

```bash
# Step 5.1: Generate Prisma Client (TypeScript SDK)
npx prisma generate

# Step 5.2: Push the schema to your database (creates all tables)
npx prisma db push

# Step 5.3 (Optional): Open Prisma Studio to view your data
npx prisma studio
```

### Step 6: Start the Development Server

```bash
npm run dev
```

The server will start at `http://localhost:3000`

### Step 7: Test the API

```bash
# Health check endpoint
curl http://localhost:3000/api/health

# Expected response:
# { "status": "OK", "message": "Backend EventSync fonctionne !" }
```

## 📚 Prisma Commands (Cheat Sheet for Developers)

Here are all the Prisma commands you'll need:

### Essential Commands (Use these daily)

| Command | Purpose | When to use |
|---------|---------|-------------|
| `npx prisma generate` | Generates Prisma Client | After every `npm install` or schema change |
| `npx prisma db push` | Pushes schema to database | When you modify `schema.prisma` |
| `npx prisma studio` | Opens database GUI | To view/edit data visually |

### Advanced Commands

| Command | Purpose |
|---------|---------|
| `npx prisma validate` | Checks if your schema is valid |
| `npx prisma format` | Formats your Prisma schema file |
| `npx prisma db pull` | Pulls existing database schema |
| `npx prisma migrate dev` | Creates migrations (for production) |

## 📁 Project Structure

```
eventsync-backend/
├── src/
│   ├── controllers/          # Request handlers (1 per entity)
│   │   ├── event.controller.ts
│   │   ├── session.controller.ts
│   │   ├── speaker.controller.ts
│   │   ├── room.controller.ts
│   │   └── question.controller.ts
│   ├── services/             # Business logic (1 per entity)
│   │   ├── event.service.ts
│   │   ├── session.service.ts
│   │   ├── speaker.service.ts
│   │   ├── room.service.ts
│   │   └── question.service.ts
│   ├── routes/               # API routes (1 per entity)
│   │   ├── event.routes.ts
│   │   ├── session.routes.ts
│   │   ├── speaker.routes.ts
│   │   ├── room.routes.ts
│   │   └── question.routes.ts
│   ├── middleware/           # Auth & error handling
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── types/                # TypeScript types
│   │   └── index.ts
│   ├── utils/                # Utilities
│   │   └── prisma.ts
│   └── index.ts              # Entry point
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Auto-generated migrations
├── docs/
│   └── scripts.sql           # Database setup script
├── .env                      # Environment variables
├── .env.example              # Example environment file
├── .gitignore
├── package.json
└── tsconfig.json
```

## 🔌 API Endpoints

### Public Routes (No authentication required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List all events |
| GET | `/api/events/:id` | Get event details |
| GET | `/api/sessions` | List all sessions |
| GET | `/api/sessions/:id` | Get session details |
| GET | `/api/speakers` | List all speakers |
| GET | `/api/speakers/:id` | Get speaker profile |
| GET | `/api/rooms` | List all rooms |
| POST | `/api/questions` | Submit a question |
| PUT | `/api/questions/:id/upvote` | Upvote a question |

### Admin Routes (JWT authentication required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/events` | Create event |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |
| POST | `/api/sessions` | Create session |
| PUT | `/api/sessions/:id` | Update session |
| DELETE | `/api/sessions/:id` | Delete session |
| POST | `/api/speakers` | Create speaker |
| PUT | `/api/speakers/:id` | Update speaker |
| DELETE | `/api/speakers/:id` | Delete speaker |
| POST | `/api/rooms` | Create room |
| PUT | `/api/rooms/:id` | Update room |
| DELETE | `/api/rooms/:id` | Delete room |

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start development server with hot reload

# Production
npm run build            # Build TypeScript to JavaScript
npm run start            # Start production server

# Prisma
npm run prisma:generate  # Generate Prisma Client
npm run prisma:push      # Push schema to database
npm run prisma:studio    # Open Prisma Studio GUI

# Utility
npm run clean            # Delete node_modules and package-lock.json
```
## 📋 Task Distribution by Developer

| Developer     | Entities                   | Number of Endpoints |
| ------------- | -------------------------- | ------------------- |
| [Valisoa](https://github.com/valisoa01)  | Events                     | 5                   |
| [David](https://github.com/DavFilsDev)    | Sessions + Rooms           | 10                  |
| [Zinedis](https://github.com/Safid849)   | Speakers + SessionSpeakers | 8                   |
| [Herinjaka](https://github.com/24194Njaka) | Questions + Live Logic     | 4                   |

---

## 🎯 Valisoa: Events

###  Implemented endpoints

| Method | Endpoint          | Description                      | Auth   |
| ------ | ----------------- | -------------------------------- | ------ |
| GET    | `/api/events`     | List all events                  | Public |
| GET    | `/api/events/:id` | Event details + related sessions | Public |
| POST   | `/api/events`     | Create an event                  | Admin  |
| PUT    | `/api/events/:id` | Update an event                  | Admin  |
| DELETE | `/api/events/:id` | Delete an event (cascade)        | Admin  |


## 🎯 David: Sessions + Rooms

### Implemented endpoints (Sessions)

| Method | Endpoint                        | Description                            | Auth   |
| ------ | ------------------------------- | -------------------------------------- | ------ |
| GET    | `/api/sessions`                 | List all sessions                      | Public |
| GET    | `/api/sessions/:id`             | Session details + speakers + questions | Public |
| GET    | `/api/events/:eventId/sessions` | Sessions for a specific event          | Public |
| POST   | `/api/sessions`                 | Create a session                       | Admin  |
| PUT    | `/api/sessions/:id`             | Update a session                       | Admin  |
| DELETE | `/api/sessions/:id`             | Delete a session                       | Admin  |

### Implemented endpoints (Rooms)

| Method | Endpoint         | Description    | Auth   |
| ------ | ---------------- | -------------- | ------ |
| GET    | `/api/rooms`     | List all rooms | Public |
| GET    | `/api/rooms/:id` | Room details   | Public |
| POST   | `/api/rooms`     | Create a room  | Admin  |
| PUT    | `/api/rooms/:id` | Update a room  | Admin  |
| DELETE | `/api/rooms/:id` | Delete a room  | Admin  |


## 🎯 Zinedis: Speakers + SessionSpeakers

### Implemented endpoints (Sessions)

| Method | Endpoint                                       | Description                        | Auth   |
| ------ | ---------------------------------------------- | ---------------------------------- | ------ |
| GET    | `/api/speakers`                                | List all speakers                  | Public |
| GET    | `/api/speakers/:id`                            | Speaker details + related sessions | Public |
| POST   | `/api/speakers`                                | Create a speaker                   | Admin  |
| PUT    | `/api/speakers/:id`                            | Update a speaker                   | Admin  |
| DELETE | `/api/speakers/:id`                            | Delete a speaker                   | Admin  |
| POST   | `/api/sessions/:sessionId/speakers/:speakerId` | Add a speaker to a session         | Admin  |
| DELETE | `/api/sessions/:sessionId/speakers/:speakerId` | Remove a speaker from a session    | Admin  |


## 🎯 Herinjaka: Questions + Live Logic

### Implemented endpoints (Sessions)

| Method | Endpoint                             | Description                                      | Auth   |
| ------ | ------------------------------------ | ------------------------------------------------ | ------ |
| GET    | `/api/sessions/:sessionId/questions` | List questions for a session (sorted by upvotes) | Public |
| POST   | `/api/questions`                     | Ask a question (anonymous allowed)               | Public |
| PUT    | `/api/questions/:id/upvote`          | Upvote a question                                | Public |
| DELETE | `/api/questions/:id`                 | Delete a question                                | Admin  |


## 👥 Contributors

| Developer | Email                   |
| --------- | ----------------------- |
| [Valisoa](https://github.com/valisoa01)  | `not avalaible yet`   |
| [David](https://github.com/DavFilsDev)   | `miharisoadavidfils@gmail.com`     |
| [Zinedis](https://github.com/Safid849)  | `nantenainabakari@gmail.com`   |
| [Herinjaka](https://github.com/24194Njaka) | `not avalaible yet` |