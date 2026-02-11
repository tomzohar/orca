# Project Status

**Last Updated:** February 11, 2026

## 1. Overview

Orca is an autonomous software orchestration platform. We have successfully implemented the **Pluggable Agent Architecture** and a specialized **Projects Module**, enabling agents to operate with full project awareness and localized file system access. The platform now features **fully automatic project initialization** and a comprehensive **Orchestration Dashboard** with real-time job monitoring and management.

## 2. Current Architecture State

### Backend (`apps/api`)

- **Framework:** NestJS + Prisma (PostgreSQL).
- **Core Modules:**
  - `agent-jobs`: Core execution engine.
  - `projects`: Manages file system project metadata and access.
- **Architecture:** **Pluggable Strategy Pattern**
  - `AgentRunnerFactory`: Dispatches jobs based on `AgentType`.
  - **Quick Mode (`LocalAgentRunner`)**: In-process LangGraph execution (Fast, Project-aware).
  - **Testing Infrastructure:**
    - Centralized mocking system for LLMs, Runners, and Repositories.
    - Automated test execution via Nx (monorepo-safe).
- [x] **Deep Mode (Dockerized Agent)**:
  - [x] Create `apps/agent-scaffold` with Claude Agent SDK.
  - [x] Implement `DockerAgentRunner` in backend.
  - [x] Integrate with `AgentJobs` module.
  - [x] Verify tool use (File System, Bash).
  - [x] Robust error handling and configuration validation.
- [x] **Project Awareness**:
  - [x] Implement `Projects` module (CRUD for project metadata).
  - [x] **Auto-Initialization**: `GET /projects/detect` automatically detects AND creates projects (idempotent).
  - [x] **Smart Slug Generation**: Uses parent directory + basename for unique project slugs.
  - [x] Integrate `projectId` into `AgentJob` schema.
  - [x] Inject project `rootPath` into agent tools (File System Tool).
- [x] **Log Formatting**: Parse raw JSON logs into human-readable updates.
- [x] **Artifact Capture**: Store agent file outputs (`Write` & `Edit` via `fs.watch`) in DB.
- [x] **Feedback Loop**: Agent can request user input (`AskUserQuestion`), triggering `WAITING_FOR_USER` status.
- **Data Model:**
  - `AgentJob`: Includes `agentType` and `projectId` logic.
  - `Project`: Defines root paths, includes, and excludes for agent access.
  - `AgentJobLog` & `AgentJobArtifact`: Relational tables for streaming outputs.
- **Status:**
  - ✅ "Blackboard" Schema implemented.
  - ✅ Project management system integrated.
  - ✅ Docker Infrastructure verified (Image built, permissions configured).
  - ✅ Granular SSE event stream (`log_added`, `artifact_added`).
  - ✅ Domain Isolation: Prisma models decoupled from domain events.
  - ✅ Test Coverage: High coverage for execution services and project module.

### Frontend (`apps/web`)

- **Framework:** Angular 18+ (Zoneless/Signals) + Angular Material.
- **Core Libraries:**
  - `libs/core/projects`: Project detection services and TanStack Query integration.
  - `libs/design-system`: Atomic UI components (Sidebar, Topbar, Card, Tabs, Spinner, etc.).
- **Components:**
  - `App`: Main application component managing global project detection and layout state.
  - **Orchestration Dashboard**:
    - `KanbanViewComponent`: Visualizes job lifecycle with integrated drag-and-drop.
    - `JobDetailsPanelComponent`: **Input-driven architecture** (removed shared state service). Merges query data with real-time SSE updates for logs and artifacts.
- **Status:**
  - ✅ Connects to backend via proxy.
  - ✅ Consumes SSE stream for live updates.
  - ✅ **Routing & Navigation:** Deep-linkable job details (`/orchestration/:jobId`) with query parameter support for tab states (`?tab=logs`).
  - ✅ **State Management:** TanStack Query + Signals for high-performance reactive updates.
  - ✅ **Design System:** Reusable `TabsComponent` and improved `KanbanViewComponent`.
  - ✅ **Automatic Initialization:** Seamless workspace onboarding.
  - ✅ Monorepo-safe test suite (non-watch mode by default).

## 3. Recent Accomplishments

- **Input-Driven Job Details & Advanced Routing (Feb 11, 2026):**
  - Refactored `JobDetailsPanelComponent` to be purely input-driven, eliminating the complex `JobDetailsStateService`.
  - Implemented deep-linkable job routes and query-parameter-based tab switching (Overview, Logs, Artifacts).
  - Integrated real-time SSE updates directly into the detail panel using Angular Signals.
  - Cleaned up redundant imports and modernized component lifecycle handling using `effect` and `onCleanup`.

- **Real-Time Orchestration (Feb 11, 2026):**
  - Completed the full Job Management lifecycle with backend repository decoupling.
  - Implemented SSE (Server-Sent Events) for real-time status, log, and artifact updates.
  - Launched the Job Creation dialog and the Detail Panel infrastructure.

- **Kanban & Project Foundation (Feb 10, 2026):**
  - Initial implementation of the Kanban board and automatic project initialization.
  - Refactored project initialization to be zero-intervention and idempotent.

## 4. Next Steps (Orchestration & UI)

1.  **Resume & Feedback UI:** Implement the `WAITING_FOR_USER` interaction (display question, accept input, API to resume).
2.  **Generic List Components:** Utilize the new `ListItem` and `ListConfig` types to build specialized log and artifact lists.
3.  **Project Management UI:** Create frontend views for managing/editing existing projects (rename, update excludes).
4.  **Artifact Previews:** Enhance the Artifacts tab with code highlighting or HTML previews for generated files.
5.  **Job Interaction:** Fully implement drag-and-drop logic to update job status/priority via API.
