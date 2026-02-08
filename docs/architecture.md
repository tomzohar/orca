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
    - A user or system event triggers a `POST /agent-jobs` request.
    - The `AgentJobsService` creates a new `AgentJob` record in the database (The Blackboard) with status `PENDING`.

2.  **Dispatcher & Execution:**
    - The `AgentJobsService` uses a **Factory** to select the appropriate Runner based on `job.agentType`:
      - **`CLAUDE_SDK`**: Dispatches a Docker Container running the Claude Agent SDK.
      - **`LANGGRAPH`**: Dispatches the local LangGraph loop.
    - The Runner initializes the environment (mounts volumes or configures context).
    - **Tools as Actuators:** The agent is equipped with specific tools that wrap the "Blackboard" repository:
      - `logTool`: Writes progress to `AgentJobLog`.
      - `saveArtifactTool`: Writes outputs to `AgentJobArtifact`.

3.  **Real-Time Feedback Loop:**
    - As the Agent thinks and acts, it calls these tools.
    - Each tool execution updates the Database **AND** emits a domain event (e.g., `JobLogAddedEvent`).
    - The `AgentJobsController` listens for these events and pushes them to the frontend via Server-Sent Events (SSE).
    - This ensures the "Blackboard" is always the source of truth, while the user sees live updates.

### 1.5 End-to-End User Flow

1.  **Task Definition:** User opens the Dashboard and describes a task (e.g., "Refactor the auth service").
2.  **Mode Selection:** User selects an Execution Mode:
    - **Quick / Interactive:** Best for Q&A, small fixes, or "chat with codebase" (RAG). Uses the **Local Runner** (`LANGGRAPH`) which runs instantly in the server process.
    - **Deep / Autonomous:** Best for complex coding, heavy refactoring, or long-running tasks. Uses the **Docker Runner** (`CLAUDE_SDK`) which provisions an isolated environment for safe execution.
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
