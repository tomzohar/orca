# System Architecture

## 1. Core Architecture

### 1.1 The "Blackboard" (Centralized State)

The system uses a shared data store as the Single Source of Truth. Agents do not merely communicate; they update persistent records to reflect progress.

- **Work Items:** Structured records defining the unit of work.
  - Attributes: Status (OPEN, IN_PROGRESS, BLOCKED, REVIEW), Priority, Role Assignment, **User Attribution** (who created, who assigned).
- **Artifacts:** Flexible storage for work products produced by agents.
  - Stores deliverables such as code changes, specifications, or diagrams.
- **Communication Channels:** Threaded logs linking conversation history to specific Work Items.
- **System Audit Log:** A chronological feed of all system events and agent actions.
- **Identity & Attribution:** Tracks human users and agent personas.
  - **Human Users:** Project owners who create and monitor jobs.
  - **Agent Personas:** Named agents (e.g., "Coding Agent") that execute work.
  - All jobs track their creator (`createdById`) and optional assigned agent (`assignedAgentId`).

### 1.2 Agent Execution Environment

- **Pluggable Execution Strategy:** The system supports multiple agent runtimes via a Strategy Pattern:
  - **Local Runner:** Runs simple LangGraph agents directly in the Node.js process (fast, low overhead).
  - **Docker Runner:** Spins up ephemeral Docker containers for complex agents (e.g., Claude Agent SDK) ensuring complete isolation.
- **Tool Registry System:** Centralized management of agent capabilities:
  - **ToolRegistryService:** Single source of truth for all available tools with dependency injection.
  - **Conditional Activation:** Tools only available when requirements are met (project context, task type, etc.).
  - **Tool Categories:** CORE (logging, artifacts), FILESYSTEM (file operations), ORCHESTRATION (job spawning), COMMUNICATION (comments).
  - **Factory Pattern:** Declarative tool definitions with metadata, activation predicates, and creation logic.
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
    - A user or system event triggers a `POST /agent-jobs` request, which requires a `projectId`.
    - The `AgentJobsService` creates a new `AgentJob` record in the database (The Blackboard) with:
      - Status: `PENDING`
      - Project link: Associated with the specified `Project`
      - **User Attribution**: `createdById` (auto-populated from project owner if not provided)
      - **Agent Assignment**: Optional `assignedAgentId` (set by orchestrator for task delegation)
      - **Configuration Reference** (Future): Optional `configurationId` linking to an `AgentConfiguration` for persona-specific behavior

2.  **Dispatcher & Execution:**
    - The `AgentJobsService` uses a **Factory** to select the appropriate Runner based on `job.agentType`:
      - **`DOCKER`**: Dispatches a Docker Container running the Claude Agent SDK.
      - **`FILE_SYSTEM`**: Dispatches the local LangGraph loop.
    - The Runner initializes the environment and **injects project context**:
      - Retrieves the `rootPath`, `includes`, and `excludes` from the associated `Project`.
    - **Tools as Actuators:** The agent is equipped with tools via the **Tool Registry**:
      - **Core Tools** (always available):
        - `log_progress`: Writes progress messages to `AgentJobLog`.
        - `save_artifact`: Writes outputs to `AgentJobArtifact` for UI display.
      - **Communication Tools** (always available):
        - `post_comment`: Posts comments to job threads for coordination.
        - `read_comments`: Reads comments from job threads for monitoring.
      - **Filesystem Tools** (conditional - requires project):
        - `file_system`: Safe, scoped access to project's `rootPath` with actions like read, write, list, find, git_diff, read_multiple, tree.
      - **Orchestration Tools** (conditional - requires orchestrator task type):
        - `spawn_job`: Creates child jobs for task delegation (multi-agent coordination).
      - Tools are **conditionally activated** based on job context:
        - `file_system` only available when job has associated project.
        - `spawn_job` only available for `TaskType.ORCHESTRATOR` jobs.
        - Registry gracefully skips unavailable tools with debug logging.

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
- **`registry/` (Tool Management Layer)**:
  - Responsibility: Centralized management of agent tools with conditional activation and dependency injection.
  - Key Files: `tool-registry.service.ts`, `tool-registry.service.spec.ts`.
  - **Key Concepts:**
    - **ToolFactory**: Interface for declarative tool definitions (metadata, activation predicates, creation logic).
    - **ToolContext**: Rich context object with job details, project paths, dependencies, and event callbacks.
    - **ToolCategory**: Enum for tool organization (CORE, FILESYSTEM, ORCHESTRATION, COMMUNICATION).
    - **Conditional Activation**: Tools use `canActivate()` predicates to check requirements (e.g., project exists, task type matches).
    - **Dependency Injection**: Repository and storage automatically injected into tool context.
- **`agent/` (Agent Logic Layer)**:
  - Responsibility: Agent graph definition and tool implementations.
  - Key Folders: `tools/` (individual tool implementations and factory exports).
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

#### Folder Structure (`apps/api/src/app/users/`)

- **`domain/`**: User entity, UserType enum, and repository interface. Pure TypeScript with no framework dependencies.
- **`data/`**: Prisma repository implementation for user persistence.
- **`application/`**: UsersService for user management (creation, lookup, validation).
- **`initialization/`**: UsersInitializationService that runs on app startup via `OnModuleInit` to ensure default users exist.

#### Folder Structure (`apps/api/src/app/agent-configurations/`)

- **`domain/`**: AgentConfiguration entity, repository interface, and DTOs (CreateAgentConfigurationDto, UpdateAgentConfigurationDto).
- **`data/`**: Prisma repository implementation for configuration persistence with domain entity mapping.
- **`application/`**: AgentConfigurationsService for business logic (CRUD operations, slug generation, validation).
- **`api/`**: REST controller with Swagger documentation, flexible ID/slug lookup.

**Key Concepts:**
- **Configuration Attributes**: name, slug, description, systemPrompt, rules, skills array, agentType, userId, projectId
- **Automatic Initialization**: Default "Coding Agent" configuration created during project setup
- **Slug Generation**: URL-friendly slugs auto-generated from names with uniqueness validation
- **Skills Reference**: Array of skill names pointing to `.claude/skills/` directory contents
- **User Attribution**: Every configuration is owned by a user (linked via userId)

#### Folder Structure (`apps/api/src/app/skills/`)

- **`skills.service.ts`**: Business logic for reading skills from filesystem (`.claude/skills/` directory).
- **`skills.controller.ts`**: Thin HTTP controller delegating to service (no business logic).
- **`skills.module.ts`**: Module registration with service provider and export.

**Key Concepts:**
- **Directory Structure**: Reads from `.claude/skills/skill-name/SKILL.md` pattern
- **Read-Only Operations**: No repository needed (filesystem operations only)
- **Separation of Concerns**: Controller handles HTTP, service handles filesystem logic
- **Error Handling**: Graceful handling of missing directories or permission issues
- **Sorting**: Skills automatically sorted alphabetically for consistent presentation

**Key Concepts (Users):**
- **User Types**: `HUMAN` (project owners, job creators) and `AGENT` (autonomous personas like "Coding Agent").
- **Default Users**: The system automatically creates:
  - "Human" (id: 1, type: HUMAN) - Default project owner and job creator.
  - "Coding Agent" (id: 2, type: AGENT) - Default agent for orchestrator task assignments.
- **Attribution Flow**:
  - Every `Project` has an `ownerId` pointing to a User.
  - Every `AgentJob` has a `createdById` (required, who created it) and optional `assignedAgentId` (which agent is executing it).
  - When creating a job without `createdById`, the system auto-populates it from the project's owner.

### 1.8 Tool Registry Architecture

The **Tool Registry** provides centralized management of agent capabilities with conditional activation based on job context.

#### Core Components

- **ToolRegistryService** (NestJS Injectable):
  - Central registry storing all tool factories.
  - Creates tool instances with proper context and dependencies.
  - Validates tool requirements and activation predicates.
  - Provides category-based tool filtering.

- **ToolFactory Interface**:
  - Metadata: name, description, category, requirements.
  - Activation predicate: `canActivate(context) => boolean`.
  - Creation function: `create(context) => DynamicStructuredTool`.

- **ToolContext Interface**:
  - Job context: jobId, job entity, projectId, projectRootPath.
  - Dependencies: repository, artifactStorage (injected by registry).
  - Event callbacks: onLog, onArtifact, onComment.

- **Tool Categories**:
  - **CORE**: log_progress, save_artifact (always available).
  - **FILESYSTEM**: file_system (requires project context).
  - **ORCHESTRATION**: spawn_job (requires orchestrator task type).
  - **COMMUNICATION**: post_comment, read_comments (always available).

#### Tool Lifecycle

1. **Registration**: Tools registered during module initialization via `OnModuleInit` hook.
2. **Selection**: Runner calls `getRequestedTools()` based on job type and context.
3. **Creation**: Registry calls `createTools()` with tool names and rich context.
4. **Activation**: Registry checks `canActivate()` for each tool, skips those that fail.
5. **Injection**: Repository and storage automatically injected into context.
6. **Execution**: Tools receive full context with event callbacks for real-time updates.

#### Extensibility

- **Add New Tools**: Register factory in module without modifying runner code.
- **Custom Tool Sets**: Configure different tools for different agent configurations.
- **Plugin System**: Future support for dynamic tool discovery and hot-reload.
- **Tool Permissions**: Future user-level restrictions on tool availability.

#### Example: Conditional Activation

```typescript
// file_system tool only activates when project exists
canActivate: (context) => !!context.projectRootPath && !!context.artifactStorage

// spawn_job tool only activates for orchestrator jobs
canActivate: (context) => context.job?.taskType === TaskType.ORCHESTRATOR
```

### 1.7 Workspace Awareness (Projects)

The `Projects` module provides the structural context for agent execution. A project is not just a folder; it's a domain boundary.

- **Entity Attributes**:
  - `rootPath`: Absolute path on the server filesystem.
  - `slug`: Human-readable unique identifier.
  - `includes`/`excludes`: Glob patterns to control agent visibility.
  - `ownerId`: Reference to the User who owns this project.
- **Lifecycle Integration**:
  - Every `AgentJob` must be associated with a `Project`.
  - Every `Project` must be owned by a User (automatically created during project initialization).
  - This ensures that when an agent is spawned, it "knows" where it is working and what files are relevant.
  - Execution tools (like `fileSystemTool`) are automatically scoped to the project's `rootPath`.
- **Auto-Initialization**:
  - When a project is detected or created, the system automatically:
    - Ensures an owner user exists (uses default "Human" user in Phase 1)
    - Creates a default "Coding Agent" configuration with professional defaults
      - System prompt for software development tasks
      - Recommended rules for code quality and safety
      - Docker execution mode for isolated, safe operation
    - Project initialization is idempotent and non-blocking (configuration creation failures won't prevent project setup)

#### Best Practices

- **Dependency Inversion**: Application logic (`execution/`) and Presentation (`api/`) depend on interfaces defined in `domain/` rather than concrete implementations. This allows for easy swapping of runners or database providers.
- **Domain Isolation**: Domain entities (`AgentJobEntity`) are pure TypeScript classes. Prisma models are mapped to entities in the repository layer to prevent ORM leak into the business logic.
- **Separation of Concerns**: Controllers are thin HTTP handlers that only deal with request/response concerns. All business logic belongs in services. This pattern:
  - Makes controllers easy to read and maintain (typically 3-10 lines per endpoint)
  - Enables business logic reuse across multiple controllers or contexts
  - Improves testability by isolating HTTP concerns from business logic
  - Example: `SkillsController` delegates to `SkillsService` for all filesystem operations
- **Strict Typing with `import type`**: When importing interfaces for type-checking only (e.g., in service constructors), use `import type` to minimize bundle size and avoid circular dependency runtime issues.
- **Module READMEs**: Every sub-folder contains a `README.md` explaining its responsibility, maintaining high tribal knowledge within the codebase.

### 1.7 Frontend Architecture

To maintain scalability alongside the backend, the frontend follows a modular library-based architecture.

#### State Management

- **Server State:** Handled by **TanStack Query** (via `@tanstack/angular-query-experimental`). This eliminates boilerplate for data fetching, caching, and synchronization.
  - Examples: Job data, project detection, agent configurations, skills directory
  - Custom query hooks (e.g., `injectSkillsQuery`, `injectAgentConfigsQuery`) provide reactive, cached access to backend data
  - Automatic cache invalidation on mutations ensures UI stays synchronized
- **Local State:** Uses Angular Signals for reactive, fine-grained UI updates.

#### Library Strategy

- **`apps/web`**: The application shell. Responsible for routing, layout, and page-level orchestration.
- **`libs/core`**: Business logic and state management.
  - Example: `libs/core/layout` manages the global sidebar/topbar configuration via TanStack Query.
  - Example: `libs/core/projects` provides skills management with reusable query hooks.
- **`libs/orchestration`**: Domain-specific modules for orchestration features.
  - `types/`: Shared TypeScript interfaces (AgentConfiguration, Project, etc.)
  - `data/`: HTTP services and TanStack Query hooks for backend communication
  - `feature/`: Smart components with business logic (agent config list, job panels)
  - `ui/`: Dumb presentation components specific to orchestration domain
- **`libs/design-system`**: Pure UI components (Design System). Stateless and reusable.
  - All components use `ui-` prefix (e.g., `ui-button`, `ui-dropdown`)
  - Components accept configuration objects instead of multiple inputs
  - Recently enhanced with multiselect dropdown support

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
