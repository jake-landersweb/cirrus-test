# CLAUDE.md

This file provides guidance for AI agents working with the cirrus-test codebase.

## Project Overview

This is a minimal test repository for validating the Cirrus autonomous development platform. It contains a simple Express API that agents can modify to test Cirrus workflows.

## Architecture

This is a **TypeScript Turborepo monorepo**.

### Structure

```
apps/
  api/              # Express API server

packages/
  shared/           # Shared types

docker/
  compose.yml       # PostgreSQL for testing
```

## Development Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run API in development mode
pnpm --filter api dev

# Run type checking
pnpm check-types
```

## API Endpoints

Current endpoints in `apps/api/src/index.ts`:

- `GET /` - Returns `{ message: "Hello World" }`
- `GET /health` - Returns `{ status: "ok", timestamp: "..." }`

## Code Conventions

1. **ES Modules** - All packages use ESM (`"type": "module"`)
2. **Strict TypeScript** - `strict: true`, `noUncheckedIndexedAccess: true`
3. **Express** - Use Express for API routes
4. **JSON responses** - All endpoints return JSON

## Testing Tasks

When Cirrus assigns you a task, follow these guidelines:

1. **Read the task description carefully**
2. **Make minimal changes** - Only implement what's requested
3. **Test your changes** - Run `pnpm build` to verify TypeScript compiles
4. **Keep it simple** - This is a test project, avoid over-engineering

## Common Tasks

Tasks you might be asked to implement:

- Add new API endpoints (e.g., `/ping`, `/version`, `/status`)
- Modify existing endpoints
- Add query parameters or request body handling
- Add middleware

## Environment Variables

- `PORT` - API server port (default: 3000)
- `POSTGRES_PORT` - PostgreSQL port (default: 5432)
