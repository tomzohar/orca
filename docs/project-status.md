# Project Status

**Last Updated:** February 10, 2026 (15:24)

## 1. Overview

Orca is an autonomous software orchestration platform. We have successfully implemented the **Pluggable Agent Architecture** and a specialized **Projects Module**, enabling agents to operate with full project awareness and localized file system access. The platform now features **fully automatic project initialization** - projects are detected and created without any user intervention, providing a seamless zero-friction onboarding experience.

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
  - `libs/core/layout`: Centralized layout orchestration (`LayoutComponent`) driven by state.
  - `libs/core/projects`: Project detection services and TanStack Query integration.
  - `libs/design-system`: Atomic UI components (Sidebar, Topbar, Card, Spinner, etc.).
- **Components:**
  - `App`: Main application component managing global project detection and layout state.
  - `AgentPocComponent`: Real-time agent interaction interface.
  - **Agent Mode Selector**: Dropdown to switch between "Quick" and "Deep" modes.
- **Status:**
  - ✅ Connects to backend via proxy.
  - ✅ Consumes SSE stream for live updates.
  - ✅ Displays logs and artifacts in real-time.
  - ✅ **State Management:** TanStack Query (Experimental) integrated for server state.
  - ✅ **Layout Orchestration:** `LayoutComponent` migrated to `core` and integrated with `AppLayoutQuery`.
  - ✅ **DevTools:** Custom wrapper for Angular Query DevTools integrated with toggle.
  - ✅ **Auto-Initialization:** App automatically initializes projects on detection. Simplified to 3 states: loading, error (with retry), loaded.
  - ✅ Monorepo-safe test suite (non-watch mode by default).

## 3. Recent Accomplishments

- **Automatic Project Initialization (Feb 10, 2026):** Refactored project initialization to be fully automatic:
  - Backend auto-creates projects when detected (idempotent - no duplicates)
  - Smart slug generation using parent directory for uniqueness
  - Removed manual `LoadProjectDialog` component and workflow
  - Frontend simplified to 3 states with error recovery via retry button
  - Zero user intervention required - seamless onboarding experience
- **DevTools Integration:** Added a toggleable DevTools button in the main application for improved debugging of TanStack Query state.
- **Projects Module Implementation:** Launched a dedicated `Projects` module to manage workspace metadata, enabling agents to have localized context and safe file system access.
- **Agent-Project Integration:** Updated `AgentJobs` to be project-aware, ensuring `LocalAgentRunner` correctly initializes file system tools with the project's root path.

## 4. Next Steps (Orchestration & UI)

1.  **Orchestration Logic:** Handle the `WAITING_FOR_USER` state in the frontend (display question, accept input).
2.  **Project Management UI:** Create frontend views for managing/editing existing projects (rename, update excludes, etc.).
3.  **Resume Job:** Implement API to resume a job with user feedback.
4.  **Frontend Polish:** Render artifacts (HTML preview?) and improve log styling.
5.  **Agent UX:** Add progress visibility and improved error handling for "Deep" mode execution.
