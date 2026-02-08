# Project Status

**Last Updated:** February 8, 2026

## 1. Overview

Orca is an autonomous software orchestration platform. We have successfully implemented the **Pluggable Agent Architecture**, enabling both fast local execution and isolated Docker-based execution for deep coding tasks. The platform is now backed by a robust testing infrastructure and strict domain isolation.

## 2. Current Architecture State

### Backend (`apps/api`)

- **Framework:** NestJS + Prisma (PostgreSQL).
- **Core Module:** `agent-jobs`
- **Architecture:** **Pluggable Strategy Pattern**
  - `AgentRunnerFactory`: Dispatches jobs based on `AgentType`.
  - **Quick Mode (`LocalAgentRunner`)**: In-process LangGraph execution (Fast, Database-only artifacts).
  - **Testing Infrastructure**:
    - Centralized mocking system for LLMs, Runners, and Repositories.
    - Automated test execution via Nx (monorepo-safe).
- [x] **Deep Mode (Dockerized Agent)**:
  - [x] Create `apps/agent-scaffold` with Claude Agent SDK.
  - [x] Implement `DockerAgentRunner` in backend.
  - [x] Integrate with `AgentJobs` module.
  - [x] Verify tool use (File System, Bash).
- [x] **Log Formatting**: Parse raw JSON logs into human-readable updates.
- [x] **Artifact Capture**: Store agent file outputs (`Write` & `Edit` via `fs.watch`) in DB.
- [x] **Feedback Loop**: Agent can request user input (`AskUserQuestion`), triggering `WAITING_FOR_USER` status.
- **Data Model:**
  - `AgentJob`: Includes `agentType` logic.
  - `AgentJobLog` & `AgentJobArtifact`: Relational tables for streaming outputs.
- **Status:**
  - ✅ "Blackboard" Schema implemented.
  - ✅ Docker Infrastructure verified (Image built, permissions configured).
  - ✅ Granular SSE event stream (`log_added`, `artifact_added`).
  - ✅ Domain Isolation: Prisma models decoupled from domain events.
  - ✅ Test Coverage: ~90% for execution services and log matchers.

### Frontend (`apps/web`)

- **Framework:** Angular 18+ (Zoneless/Signals) + Angular Material.
- **Components:**
  - `AgentPocComponent`: Real-time agent interaction interface.
  - **Agent Mode Selector**: Dropdown to switch between "Quick" and "Deep" modes.
- **Status:**
  - ✅ Connects to backend via proxy.
  - ✅ Consumes SSE stream for live updates.
  - ✅ Displays logs and artifacts in real-time.
  - ✅ Monorepo-safe test suite (non-watch mode by default).

## 3. Recent Accomplishments

- **Domain Integrity:** Fixed Prisma model leakage into domain events, enforcing strict architectural boundaries.
- **Mocking Infrastructure:** Established a dedicated mocking layer in `test-utils` with best practices documentation.
- **Unit Testing:** Implemented comprehensive test suites for `LocalAgentRunner`, `DockerAgentRunner`, and execution log matchers (`AskUserMatcher`, `ToolUseMatcher`).
- **Test Optimization:** Resolved monorepo-wide test synchronization issues, ensuring all projects (`api`, `web`, `design-system`) can be tested in a single, non-blocking run.
- **TypeScript Quality:** Resolved complex Jest typing issues in mock files through `tsconfig` improvements.

## 4. Next Steps (Orchestration & UI)

1.  **Orchestration Logic:** Handle the `WAITING_FOR_USER` state in the frontend (display question, accept input).
2.  **Resume Job:** Implement API to resume a job with user feedback.
3.  **Frontend Polish:** Render artifacts (HTML preview?) and improve log styling.
