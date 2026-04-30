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

**Option A: Using the provided SQL script (Recommended)**

Run the SQL script to create the database and user:

```bash
# Connect to PostgreSQL as postgres user
sudo -u postgres psql

# Or on Windows (using psql)
psql -U postgres

# Then run the script
\i docs/scripts.sql
```

**Option B: Manual Setup**

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

## 🗄️ Database Setup Guide

### For New Developers: Complete Database Setup

If you're setting up the project for the first time, here's everything you need to know:

#### 1. **Ensure PostgreSQL is Running**

```bash
# On Linux (Ubuntu/Debian)
sudo systemctl status postgresql
sudo systemctl start postgresql

# On macOS with Homebrew
brew services start postgresql

# On Windows
# PostgreSQL should be running as a Windows service
```

#### 2. **Run the Database Setup Script**

We've included a SQL script at `docs/scripts.sql` that will:

- Create the `eventsync_user` user
- Create the `eventsync` database
- Set up all necessary permissions

```bash
# Connect to PostgreSQL and run the script
psql -U postgres -f docs/scripts.sql

# Or if you're already in psql:
\i docs/scripts.sql
```

#### 3. **Verify Database Creation**

```bash
# List all databases
psql -U postgres -c "\l"

# Connect to the eventsync database
psql -U eventsync_user -d eventsync -h localhost

# You should see a successful connection
```

### What the SQL Script Does

The `docs/scripts.sql` file:

1. **Creates a dedicated user** `eventsync_user` with password `Eventsync2024!`
2. **Creates the database** `eventsync` owned by this user
3. **Grants all necessary privileges** for the user to work with the database
4. **Sets up default privileges** so any new tables created will automatically be accessible

This ensures that when you run `npx prisma db push`, Prisma can successfully create all the tables.

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

### Typical Workflow

```bash
# 1. After cloning the project
npm install
npx prisma generate

# 2. After modifying schema.prisma
npx prisma db push
npx prisma generate

# 3. To view your data
npx prisma studio

# 4. If something goes wrong
npx prisma generate --no-engine
npx prisma db push --force-reset
```

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

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Database connection (required)
DATABASE_URL="postgresql://eventsync_user:Eventsync2024!@localhost:5432/eventsync?schema=public"

# Server configuration (optional, defaults to 3000)
PORT=3000

# Admin authentication (required)
ADMIN_EMAIL="admin@eventsync.com"
JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters-long"

# Node environment (optional)
NODE_ENV="development"  # or "production"
```

## 👥 Team Workflow

### First Time Setup for Each Developer

```bash
# 1. Clone the repository
git clone https://github.com/your-org/eventsync-backend.git
cd eventsync-backend

# 2. Run database setup (if not already done)
psql -U postgres -f docs/scripts.sql

# 3. Install dependencies
npm install

# 4. Setup environment
cp .env.example .env
# Edit .env if needed (usually DATABASE_URL is already correct)

# 5. Generate Prisma Client and push schema
npx prisma generate
npx prisma db push

# 6. Start developing!
npm run dev
```

### Daily Git Workflow

```bash
# 1. Always start by getting latest changes
git checkout main
git pull origin main

# 2. Create your feature branch
git checkout -b feature/your-task-name

# 3. Make your changes and commit
git add .
git commit -m "feat: description of your changes"

# 4. Push your branch
git push origin feature/your-task-name

# 5. Create a Pull Request on GitHub
# 6. After PR is merged, delete your branch
```

### Avoiding Conflicts

Each developer should work on their own entity:

| Developer | Entity | Files to modify |
|-----------|--------|-----------------|
| Dev A | Events | `event.controller.ts`, `event.service.ts`, `event.routes.ts` |
| Dev B | Sessions & Rooms | `session.*`, `room.*` files |
| Dev C | Speakers | `speaker.*` files |
| Dev D | Questions | `question.*` files |

**Files that multiple people might modify:**
- `src/index.ts` (when adding routes)
- `prisma/schema.prisma` (when adding/updating models)

**Solution:** Communicate on Slack/Discord before editing these files.

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. **Prisma generate error: "Cannot find module"**

```bash
# Solution
rm -rf node_modules package-lock.json
npm install
npx prisma generate
```

#### 2. **Database connection error: "Can't reach database server"**

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list                 # macOS

# Verify the connection string in .env
cat .env | grep DATABASE_URL

# Test PostgreSQL connection
psql -U eventsync_user -d eventsync -h localhost
```

#### 3. **Permission denied when creating database**

```bash
# Connect as postgres superuser
sudo -u postgres psql

# Then run the script manually
\i docs/scripts.sql
```

#### 4. **Port 3000 already in use**

```bash
# Change port in .env
PORT=3001

# Or kill process using port 3000
lsof -i :3000  # Find PID
kill -9 [PID]  # Kill process
```

#### 5. **Prisma client not generated after schema changes**

```bash
# Regenerate client
npx prisma generate
npx prisma db push
```

### Getting Help

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section above
2. Look for existing issues on GitHub
3. Ask in the team Slack/Discord channel
4. Check Prisma's documentation: https://www.prisma.io/docs

## 📝 Additional Notes

- **Only admin authentication** is implemented (no user registration)
- All GET endpoints are public
- POST/PUT/DELETE endpoints require JWT token in Authorization header
- The project uses TypeScript - make sure your IDE has TypeScript support

## 🎯 Next Steps After Setup

Once the backend is running, you can:

1. Test the API using Postman or curl
2. Start implementing your assigned entity (Event, Session, Speaker, or Question)
3. Create your feature branch and begin coding

---

**Happy coding! 🚀**
```

This README includes everything your team needs:
- Complete setup instructions
- Database setup using your `scripts.sql` file
- All Prisma commands with explanations
- Team workflow guidelines
- Troubleshooting for common issues
- Clear structure for 4 developers working in parallel