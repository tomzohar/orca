# System Architecture

## 1. Core Architecture

### 1.1 The "Blackboard" (Centralized State)

The system uses a shared data store as the Single Source of Truth. Agents do not merely communicate; they update persistent records to reflect progress.

- **Work Items:** Structured records defining the unit of work.
  - Attributes: Status (OPEN, IN_PROGRESS, BLOCKED, REVIEW), Priority, Role Assignment.
- **Artifacts:** Flexible storage for work products produced by agents.
  - Stores deliverables such as code changes, specifications, or diagrams.
- **Communication Channels:** Threaded logs linking conversation history to specific Work Items.
- **System Audit Log:** A chronological feed of all system events and agent actions.

### 1.2 Agent Execution Environment

- **Pluggable Execution Strategy:** The system supports multiple agent runtimes via a Strategy Pattern:
  - **Local Runner:** Runs simple LangGraph agents directly in the Node.js process (fast, low overhead).
  - **Docker Runner:** Spins up ephemeral Docker containers for complex agents (e.g., Claude Agent SDK) ensuring complete isolation.
- **Tools & Interfaces:**
  - **Filesystem:** Agents interact with the project via direct bind-mounts (Docker) or direct FS access (Local).
  - **State Access:** All agents report back to the "Blackboard" via `stdout` parsing (Docker) or direct events (Local).

### 1.3 Orchestration Control Plane

The control plane manages the lifecycle of tasks and agents.

- **Event Loop:** Monitors the state store for changes. When a Work Item becomes valid for a role, it triggers a job.
- **Job Dispatcher:** Instantiates the appropriate Agent for the task, managing resource allocation.
- **Idle Monitoring:** A background process that detects system inactivity to trigger proactive agents (e.g., for backlog review or innovation proposals).

### 1.4 Orchestration Algorithm

The current "Spawning" & "Blackboard" flow functions as follows:

1.  **Job Creation (The Trigger):**
    - A user or system event triggers a `POST /agent-jobs` request, which now requires a `projectId`.
    - The `AgentJobsService` creates a new `AgentJob` record in the database (The Blackboard) with status `PENDING`, linked to the specified `Project`.

2.  **Dispatcher & Execution:**
    - The `AgentJobsService` uses a **Factory** to select the appropriate Runner based on `job.agentType`:
      - **`DOCKER`**: Dispatches a Docker Container running the Claude Agent SDK.
      - **`FILE_SYSTEM`**: Dispatches the local LangGraph loop.
    - The Runner initializes the environment and **injects project context**:
      - Retrieves the `rootPath`, `includes`, and `excludes` from the associated `Project`.
    - **Tools as Actuators:** The agent is equipped with specific tools that wrap the "Blackboard" and the localized Workspace:
      - `logTool`: Writes progress to `AgentJobLog`.
      - `saveArtifactTool`: Writes outputs to `AgentJobArtifact`.
      - `fileSystemTool`: Provides the agent with safe, scoped access to the project's `rootPath`.

3.  **Real-Time Feedback Loop:**
    - As the Agent thinks and acts, it calls these tools.
    - Each tool execution updates the Database **AND** emits a domain event (e.g., `JobLogAddedEvent`).
    - The `AgentJobsController` listens for these events and pushes them to the frontend via Server-Sent Events (SSE).
    - This ensures the "Blackboard" is always the source of truth, while the user sees live updates.

### 1.5 End-to-End User Flow

1.  **Task Definition:** User opens the Dashboard and describes a task (e.g., "Refactor the auth service").
2.  **Mode Selection:** User selects an Execution Mode:
    - **Quick / Interactive:** Best for Q&A, small fixes, or "chat with codebase" (RAG). Uses the **Local Runner** (`FILE_SYSTEM`) which runs instantly in the server process.
    - **Deep / Autonomous:** Best for complex coding, heavy refactoring, or long-running tasks. Uses the **Docker Runner** (`DOCKER`) which provisions an isolated environment for safe execution.
3.  **Job Initialization:**
    - The API creates an `AgentJob` record and sets the `agentType` based on the selected mode.
    - Status is set to `PENDING`.
4.  **Execution:**
    - The Dispatcher spawns the appropriate agent.
    - **Quick Mode:** The agent begins streaming text tokens immediately.
    - **Deep Mode:** The system provisions a Docker container, mounts the project, and the autonomous agent begins its loop.
5.  **Monitoring & Review:**
    - User watches real-time logs and sees file changes appear in the artifact list.
    - User can interrupt or amend instructions at any time.

### 1.6 File Structure & Domain Isolation

To ensure long-term maintainability and prevent "Big Ball of Mud" anti-patterns, the system follows a Layered Architecture with strict Domain Isolation.

#### Folder Structure (`apps/api/src/app/agent-jobs/`)

- **`api/` (Presentation Layer)**:
  - Responsibility: Handling HTTP requests/responses, DTO validation, and SSE streaming.
  - Key Files: `agent-jobs.controller.ts`, `dto/`.
- **`domain/` (Core Logic Layer)**:
  - Responsibility: Housing core business logic, entities, interfaces, and domain events. This layer **must not** depend on external frameworks or database clients (e.g., Prisma).
  - Key Files: `entities/`, `interfaces/`, `events/`.
- **`execution/` (Application Layer)**:
  - Responsibility: Orchestrating the execution of agents. Translates domain intentions into runner-specific actions.
  - Key Files: `services/` (`DockerAgentRunner`, `LocalAgentRunner`), `matchers/`.
- **`data/` (Infrastructure Layer - Persistence)**:
  - Responsibility: Implementing repository interfaces using specific providers (e.g., Prisma).
  - Key Files: `repositories/` (`PrismaAgentJobsRepository`).
- **`storage/` (Infrastructure Layer - Artifacts)**:
  - Responsibility: Handling physical storage of artifacts produced by agents.
  - Key Files: `services/` (`DbArtifactStorage`).

#### Folder Structure (`apps/api/src/app/projects/`)

- **`api/`**: Project CRUD and slug-based lookup.
- **`domain/`**: `Project` entity and repository interface.
- **`application/`**: Business logic for project generation and management.
- **`data/`**: Prisma implementation of project persistence.

### 1.7 Workspace Awareness (Projects)

The `Projects` module provides the structural context for agent execution. A project is not just a folder; it's a domain boundary.

- **Entity Attributes**:
  - `rootPath`: Absolute path on the server filesystem.
  - `slug`: Human-readable unique identifier.
  - `includes`/`excludes`: Glob patterns to control agent visibility.
- **Lifecycle Integration**:
  - Every `AgentJob` must be associated with a `Project`.
  - This ensures that when an agent is spawned, it "knows" where it is working and what files are relevant.
  - Execution tools (like `fileSystemTool`) are automatically scoped to the project's `rootPath`.

#### Best Practices

- **Dependency Inversion**: Application logic (`execution/`) and Presentation (`api/`) depend on interfaces defined in `domain/` rather than concrete implementations. This allows for easy swapping of runners or database providers.
- **Domain Isolation**: Domain entities (`AgentJobEntity`) are pure TypeScript classes. Prisma models are mapped to entities in the repository layer to prevent ORM leak into the business logic.
- **Strict Typing with `import type`**: When importing interfaces for type-checking only (e.g., in service constructors), use `import type` to minimize bundle size and avoid circular dependency runtime issues.
- **Module READMEs**: Every sub-folder contains a `README.md` explaining its responsibility, maintaining high tribal knowledge within the codebase.

### 1.7 Frontend Architecture

To maintain scalability alongside the backend, the frontend follows a modular library-based architecture.

#### State Management

- **Server State:** Handled by **TanStack Query** (via `@tanstack/angular-query-experimental`). This eliminates boilerplate for data fetching, caching, and synchronization.
- **Local State:** Uses Angular Signals for reactive, fine-grained UI updates.

#### Library Strategy

- **`apps/web`**: The application shell. Responsible for routing, layout, and page-level orchestration.
- **`libs/core`**: Business logic and state management.
  - Example: `libs/core/layout` manages the global sidebar/topbar configuration via TanStack Query.
- **`libs/ui`**: Pure UI components (Design System). Stateless and reusable.

#### Experimental Integration

- **DevTools**: We utilize a custom wrapper for the experimental Angular Query DevTools to enable deep inspection of queries during development.

## 2. Control Dashboard

The Human-in-the-Loop interface for monitoring and intervention.

### 2.1 Views

- **Live Feed:** A real-time stream of system logs and agent activities.
- **Kanban Board ("God Mode"):**
  - Visual representation of Work Items.
  - **Capabilities:** Allows manual editing of Artifacts. The system treats human edits as the absolute truth.
- **Intervention Protocol:**
  - View of active communication threads.
  - **Capabilities:** Humans can inject messages into an agent's context with "Super Admin" privileges, forcing prioritization of instructions.
