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

Agents operate within an isolated runtime to ensure security and consistency.

- **Isolation:** Each agent instance operates in a sandboxed environment containing the target project's source code.
- **Tool Interfaces:** Agents interact with the external world and the project via standardized connectors.
  - **Filesystem Access:** For reading and writing code.
  - **State Access:** For querying the Centralized State.
  - **Terminal Access:** For executing commands (build, test) within the sandbox.

### 1.3 Orchestration Control Plane

The control plane manages the lifecycle of tasks and agents.

- **Event Loop:** Monitors the state store for changes. When a Work Item becomes valid for a role, it triggers a job.
- **Job Dispatcher:** Instantiates the appropriate Agent for the task, managing resource allocation.
- **Idle Monitoring:** A background process that detects system inactivity to trigger proactive agents (e.g., for backlog review or innovation proposals).

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
