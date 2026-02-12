# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Required Documentation

Before working on any task, read these documentation files to understand the project context:

- `docs/vision.md` - Project vision and goals
- `docs/architecture.md` - System architecture and design decisions
- `docs/stack.md` - Technology stack details
- `docs/memories.md` - Agent memory system
- `docs/project-status.md` - Current project status and roadmap

## Project Overview

Orca is an autonomous software orchestration platform for managing teams of AI agents. The system uses a **Centralized State ("Blackboard")** architecture where agents collaborate on shared state, with a Human-in-the-Loop dashboard for monitoring and intervention.

## Technology Stack

- **Frontend**: Angular 18+ with Zoneless & Signals, Angular Material
- **Backend**: NestJS with Prisma ORM
- **Database**: PostgreSQL (with pgvector for semantic memory)
- **Monorepo**: Nx workspace
- **Agent Runtime**: LangGraph (local) + Claude Agent SDK (Docker)
- **State Management**: TanStack Query (Angular experimental)

## Development Commands

### Starting the Application

```bash
# Start the frontend (Angular)
npm run start:client
# or
npx nx serve web

# Start the backend (NestJS)
npm run start:server
# or
npx nx serve api

# Start the design system (Storybook)
npm run storybook
# or
npx nx storybook design-system
```

### Database Management

```bash
# Start PostgreSQL via Docker
docker compose up -d

# Generate Prisma client (required after schema changes)
npx nx prisma-generate api

# Open Prisma Studio (database GUI)
npm run db:studio
```

### Running Tests

```bash
# Run tests for a specific project
npx nx test <project-name>

# Examples:
npx nx test api
npx nx test web
npx nx test design-system

# Run tests in watch mode (for design-system)
npx nx test:watch design-system
```

### Linting and Building

```bash
# Lint a specific project
npx nx lint <project-name>

# Build a specific project
npx nx build <project-name>

# Build all projects
npx nx run-many -t build
```

## Architecture

### Monorepo Structure

```
apps/
├── web/              # Angular frontend application
├── api/              # NestJS backend application
├── agent-scaffold/   # Claude Agent SDK Docker runtime
├── web-e2e/          # E2E tests for frontend
└── api-e2e/          # E2E tests for backend

libs/
├── core/             # Core utilities and state management
│   └── layout/       # Global layout orchestration
├── design-system/    # UI component library (ui- prefix)
└── orchestration/    # Orchestration-specific modules
    ├── types/        # Shared types
    ├── data/         # Data access
    ├── feature/      # Feature modules
    └── ui/           # UI components
```

### Backend Architecture (apps/api)

The backend follows a **Layered Architecture** with strict domain isolation:

- **`api/`** (Presentation Layer): HTTP controllers, DTOs, SSE streaming
- **`domain/`** (Core Logic): Entities, interfaces, domain events (framework-agnostic)
- **`execution/`** or **`application/`** (Application Layer): Business logic orchestration
- **`data/`** (Infrastructure - Persistence): Repository implementations (Prisma)
- **`storage/`** (Infrastructure - Artifacts): Physical storage handling

**Key Modules:**
- `agent-jobs/`: Core execution engine with pluggable strategy pattern
  - `LocalAgentRunner`: In-process LangGraph execution (Quick Mode)
  - `DockerAgentRunner`: Isolated Claude SDK execution (Deep Mode)
- `projects/`: Workspace metadata management for project-aware agent execution
- `health/`: Health check endpoints
- `prisma/`: Database client service

**Important Principles:**
- Domain entities are pure TypeScript classes (no ORM leak)
- Use Dependency Inversion: depend on domain interfaces, not concrete implementations
- Use `import type` for type-only imports
- Prisma client is generated to `apps/api/prisma/client` (git-ignored)

### Frontend Architecture (apps/web)

**State Management:**
- Server state: TanStack Query (`@tanstack/angular-query-experimental`)
- Local state: Angular Signals

**Core Structure:**
- Application shell handles routing and layout orchestration
- `libs/core` contains business logic and state management
- `libs/design-system` provides pure, stateless UI components

### Agent Execution Flow

1. User submits job via dashboard (must specify `projectId`)
2. `AgentJobsService` creates `AgentJob` record with status `PENDING`
3. `AgentRunnerFactory` selects runner based on `agentType`:
   - `FILE_SYSTEM`: Local in-process execution (fast)
   - `DOCKER`: Docker container execution (isolated)
4. Agent receives project-scoped tools:
   - `logTool`: Write to `AgentJobLog`
   - `saveArtifactTool`: Write to `AgentJobArtifact`
   - `fileSystemTool`: Scoped access to project `rootPath`
5. Real-time updates via SSE to frontend dashboard

## Code Conventions

### Angular Components

**File Structure:**
Every component must have separate files:
- `.ts` - Component class
- `.html` - Template
- `.scss` - Styles
- `.spec.ts` - Unit tests

**Component Best Practices:**
- Components handle view logic only (no business logic, API calls, or calculations)
- Use services for business logic
- Keep components under ~500 lines (split if larger)
- Use `@inject()` function, NOT constructor injection
- Use signals for inputs/outputs, NOT `@Input`/`@Output`
- Prefer single input config type over multiple inputs
- All methods must have strict types for arguments and return values

**Templates:**
- ALWAYS use UI components from `design-system` library
- Avoid native HTML elements outside `design-system`
- Use `@if`, `@for`, `@switch` instead of `*ngIf`, `*ngFor`, `*ngFor`
- If a design system component is missing, implement it in `design-system` with Storybook first

**Styles:**
- ALWAYS use design tokens from `libs/design-system/src/lib/styles/_tokens.scss`
- Avoid `::ng-deep`
- Avoid unnecessary nesting and complex selectors
- If a token is missing, add it to the design system

### Design System Components

- All components use `ui-` prefix
- Every component must have a `.stories.ts` file
- Components are pure and stateless
- Wraps Angular Material components for consistency

### TypeScript

- Strict typing everywhere (arguments and return types)
- Single responsibility per function/class
- Use `import type` for type-only imports

### Testing

- Use centralized mocking system for LLMs, Runners, and Repositories
- Tests run in non-watch mode by default (monorepo-safe)
- Use `test:watch` target where available for development

## Database Schema

**Key Models:**
- `AgentJob`: Job execution records with `type`, `status`, `prompt`, and `projectId`
- `Project`: Workspace metadata with `rootPath`, `slug`, `includes`, `excludes`
- `AgentJobLog`: Real-time log entries for jobs
- `AgentJobArtifact`: File outputs from agent execution

**Enums:**
- `JobStatus`: `PENDING`, `RUNNING`, `COMPLETED`, `FAILED`, `WAITING_FOR_USER`
- `AgentType`: `DOCKER`, `FILE_SYSTEM`

## Project Awareness

Every `AgentJob` must be associated with a `Project`. Projects provide:
- `rootPath`: Absolute filesystem path
- `slug`: Human-readable unique identifier
- `includes`/`excludes`: Glob patterns for agent file access
- Automatic initialization via `GET /projects/detect` (idempotent)

Agent tools are automatically scoped to the project's `rootPath`.

## Important Notes

- Prisma client must be regenerated after schema changes: `npx nx prisma-generate api`
- Docker is required for database and Deep Mode (Claude SDK) execution
- Project auto-initialization uses parent directory + basename for slug uniqueness
- SSE provides real-time updates for job status, logs, and artifacts
- Frontend uses proxy configuration (`apps/web/proxy.conf.json`) for API calls
