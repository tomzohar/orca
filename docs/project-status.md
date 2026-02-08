# Project Status

**Last Updated:** February 7, 2026

## 1. Overview

Orca is an autonomous software orchestration platform. We have successfully implemented the **Pluggable Agent Architecture**, enabling both fast local execution and isolated Docker-based execution for deep coding tasks.

## 2. Current Architecture State

### Backend (`apps/api`)

- **Framework:** NestJS + Prisma (PostgreSQL).
- **Core Module:** `agent-jobs`
- **Architecture:** **Pluggable Strategy Pattern**
  - `AgentRunnerFactory`: Dispatches jobs based on `AgentType`.
  - **Quick Mode (`LocalAgentRunner`)**: In-process LangGraph execution (Fast, Database-only artifacts).
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

### Frontend (`apps/web`)

- **Framework:** Angular 18+ (Zoneless/Signals) + Angular Material.
- **Components:**
  - `AgentPocComponent`: Real-time agent interaction interface.
  - **Agent Mode Selector**: Dropdown to switch between "Quick" and "Deep" modes.
- **Status:**
  - ✅ Connects to backend via proxy.
  - ✅ Consumes SSE stream for live updates.
  - ✅ Displays logs and artifacts in real-time.

## 3. Recent Accomplishments

- **Pluggable Agent Architecture:** Implemented Strategy Pattern to support multiple agent runners.
- **Docker Integration:** Created `orca-agent` Docker image with Node.js/Python and confirmed container connectivity.
- **Frontend UI:** Added "Agent Mode" selection and validated End-to-End flow.
- **Bug Fixes:** Resolved Angular `ControlValueAccessor` issues in `DropdownComponent`.

## 4. Next Steps (Orchestration & UI)

1.  **Orchestration Logic:** Handle the `WAITING_FOR_USER` state in the frontend (display question, accept input).
2.  **Resume Job:** Implement API to resume a job with user feedback.
3.  **Frontend Polish:** Render artifacts (HTML preview?) and improve log styling.
