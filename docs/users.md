# Users Module Plan

## 1. Overview

The **Users Module** introduces identity and attribution to the Orca platform. It distinguishes between **Human Users** (the developers using the system) and **Agent Users** (the AI personas performing work).

This entity is central to:

- **Attribution/Lineage**: Knowing _who_ created a job or wrote a comment.
- **Agent Personas**: Defining different AI behaviors (system prompts) via "Agent Users".
- **Security**: Foundation for future authentication/RBAC.

## 2. Data Model

### 2.1 Prisma Schema

```prisma
model User {
  id           Int      @id @default(autoincrement())
  name         String
  avatar       String?  // URL or base64
  type         UserType @default(HUMAN)
  systemPrompt String?  // Specific instructions for Agent personas
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt // Added for good measure

  // Relations
  createdJobs  AgentJob[]        @relation("CreatedJobs")
  assignedJobs AgentJob[]        @relation("AssignedJobs")
  comments     AgentJobComment[]
}

enum UserType {
  HUMAN
  AGENT
}
```

### 2.2 Integration with AgentJob

The `AgentJob` model updates to link to specific users:

```prisma
model AgentJob {
  // ... existing fields ...

  // Who requested this job? (The Human)
  createdById Int
  createdBy   User @relation("CreatedJobs", fields: [createdById], references: [id])

  // Who is executing this job? (The Agent Persona)
  // Optional because legacy jobs might not have this, or for "System" jobs
  assignedAgentId Int?
  assignedAgent   User? @relation("AssignedJobs", fields: [assignedAgentId], references: [id])

  // ...
}
```

## 3. Architecture

The module follows the standard Domain-Driven Design (DDD) layers:

### 3.1 Domain Layer (`apps/api/src/app/users/domain/`)

- **Entity**: `UserEntity` (Pure TS class)
- **Repositories**: `UsersRepository` (Interface)
- **Enums**: `UserType`

### 3.2 Data Layer (`apps/api/src/app/users/data/`)

- **Repository Implementation**: `PrismaUsersRepository`
  - `findById(id)`
  - `findByType(type)`
  - `create(data)`
  - `ensureDefaultUser()`: Idempotent method to create the initial "Admin" human user.

### 3.3 Application/Service Layer (`apps/api/src/app/users/users.service.ts`)

- **UsersService**:
  - `getAgentUsers()`: Returns list of available AI personas.
  - `ensureDefaultHuman()`: Called on application bootstrap to guarantee a valid `createdById` exists for new jobs.

### 3.4 API Layer (`apps/api/src/app/users/api/`)

- **UsersController**:
  - `GET /users/agents`: List available agent personas (for job creation dropdown).
  - `POST /users/agents`: Create a new custom agent persona.
  - _(Future)_ `GET /users/me`: Current authenticated user.

## 4. Initialization Logic

To support the current single-user local workflow without forcing login flow immediately:

1.  **On Module Init**: `UsersService` checks if a Human User exists.
2.  **If Missing**: Creates default user:
    - Name: "Admin"
    - Type: `HUMAN`
    - Avatar: Default placeholder.
3.  **Frontend**: Hardcodes the ID of this default user (or fetches "me") for creating jobs/comments until Auth is fully implemented.

## 5. Agent Personas (Future "Orchestrator" alignment)

By defining Agents as `Users` with a `systemPrompt`:

- We can have a "Frontend Specialist" user.
- We can have a "QA Bot" user.
- Work is dispatched to them by assigning `assignedAgentId`.
- The **Runner** logic will look up the `assignedAgent.systemPrompt` and prepend it to the context, overriding/augmenting the default generic system prompt.

## 6. Implementation Steps

1.  **Schema Migration**: Add `User` model and relations.
2.  **Module Scaffold**: Create `users` module with standard directory structure.
3.  **Seed/Init**: Implement the `ensureDefaultUser` logic.
4.  **Integration**: Update `AgentJobsService` to require `userId` for creation.
