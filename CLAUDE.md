# CLAUDE.md

This file provides guidance for AI agents working with the cirrus-test codebase.

## Project Overview

This is a test repository for validating the Cirrus autonomous development platform. It contains a blog-style API with users, posts, comments, and tags that agents can modify to test Cirrus workflows.

## Architecture

This is a **TypeScript Turborepo monorepo** with PostgreSQL database and Redis caching.

### Structure

```
apps/
  api/                  # Express API server
    src/
      db/               # Database layer (migrations, seeding)
      models/           # Data models (user, post, comment, tag)
      routes/           # API route handlers
      utils/            # Utility functions

packages/
  shared/               # Shared types and validation schemas (Zod)

docker/
  compose.yml           # PostgreSQL + Redis for local dev
  Dockerfile            # Production Docker image
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run API in development mode
pnpm --filter api dev

# Run tests
pnpm test

# Run type checking
pnpm check-types

# Database operations
pnpm --filter api db:migrate    # Run migrations
pnpm --filter api db:seed       # Seed test data
pnpm --filter api db:reset      # Reset database
```

## Database Setup

1. Start PostgreSQL and Redis:
   ```bash
   docker compose -f docker/compose.yml up -d postgres redis
   ```

2. Run migrations:
   ```bash
   pnpm --filter api db:migrate
   ```

3. Seed test data:
   ```bash
   pnpm --filter api db:seed
   ```

## API Endpoints

### Health & Legacy
- `GET /` - Returns `{ message: "Hello World" }`
- `GET /health` - Returns `{ status: "ok", timestamp: "..." }`
- `GET /farewell` - Returns `{ message: "Farewell!" }`

### Users (`/api/users`)
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Soft delete user

### Posts (`/api/posts`)
- `GET /api/posts` - List posts (query: `status`, `author_id`, `limit`, `offset`)
- `GET /api/posts/:id` - Get post by ID
- `GET /api/posts/slug/:slug` - Get post by slug
- `POST /api/posts` - Create post
- `PATCH /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `GET /api/posts/:id/comments` - Get comments for post
- `POST /api/posts/:id/comments` - Add comment to post
- `POST /api/posts/:id/tags/:tagId` - Add tag to post
- `DELETE /api/posts/:id/tags/:tagId` - Remove tag from post

### Tags (`/api/tags`)
- `GET /api/tags` - List all tags
- `GET /api/tags/:id` - Get tag by ID
- `GET /api/tags/slug/:slug` - Get tag by slug
- `POST /api/tags` - Create tag
- `DELETE /api/tags/:id` - Delete tag

## Code Conventions

1. **ES Modules** - All packages use ESM (`"type": "module"`)
2. **Strict TypeScript** - `strict: true`
3. **Zod validation** - Request bodies validated with Zod schemas
4. **Express** - Use Express for API routes
5. **JSON responses** - All endpoints return JSON
6. **PostgreSQL** - Use pg package for database queries
7. **Vitest** - Use Vitest for testing

## Testing Tasks

When Cirrus assigns you a task, follow these guidelines:

1. **Read the task description carefully**
2. **Make minimal changes** - Only implement what's requested
3. **Test your changes** - Run `pnpm build && pnpm test` to verify
4. **Keep it simple** - Avoid over-engineering

## Common Tasks

Tasks you might be asked to implement:

- Add new API endpoints
- Add new database models/tables
- Add validation rules
- Fix bugs in existing endpoints
- Add middleware (auth, rate limiting, etc.)
- Add new tests
- Improve error handling

## Environment Variables

See `.env.example` for all environment variables:

- `PORT` - API server port (default: 3000)
- `DATABASE_HOST` - PostgreSQL host (default: localhost)
- `DATABASE_PORT` - PostgreSQL port (default: 5432)
- `DATABASE_USER` - PostgreSQL user (default: postgres)
- `DATABASE_PASSWORD` - PostgreSQL password (default: postgres)
- `DATABASE_NAME` - PostgreSQL database (default: cirrus_test)
- `REDIS_URL` - Redis connection URL (default: redis://localhost:6379)
