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
  - **Deep Mode (`DockerAgentRunner`)**: Isolated Docker execution (`orca-agent` image) for complex tasks.
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

## 4. Next Steps (Claude SDK Implementation)

We are now ready to implement the actual **Claude Agent** logic inside the Docker container.

1.  **Agent Entry Point:** Create the `main.ts` (or `main.py`) script inside `apps/agent-scaffold` that initializes the Claude Agent.
2.  **Tool Implementation:**
    - **File System Tools:** Give the agent access to read/write files in the mounted `/app` directory.
    - **Bash Tool:** Allow the agent to run approved shell commands.
3.  **Communication Protocol:** Ensure the Agent script logs structured output that `DockerAgentRunner` can parse (for better UI feedback).
4.  **Error Handling:** Handle API limits and container crashes gracefully.
