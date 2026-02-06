# Project Status

**Last Updated:** February 6, 2026

## 1. Overview

Orca is an autonomous software orchestration platform. We are currently in the **POC Phase**, focusing on the "Blackboard" architecture where agents collaborate on a centralized state.

## 2. Current Architecture State

### Backend (`apps/api`)

- **Framework:** NestJS + Prisma (PostgreSQL).
- **Core Module:** `agent-jobs`
- **Data Model:**
  - `AgentJob`: The core unit of work.
  - `AgentJobLog`: Relational table for streaming logs (1:N with Job).
  - `AgentJobArtifact`: Relational table for file outputs (1:N with Job).
- **Status:**
  - ✅ "Blackboard" Schema implemented (relational tables).
  - ✅ Service layer refactored for decoupling (`IAgentRunner`, `IArtifactStorage`).
  - ✅ Granular SSE event stream implemented (`log_added`, `status_changed`, etc.).
  - ✅ Unit tests updated and passing.

### Frontend (`apps/web`)

- **Framework:** Angular 18+ (Zoneless/Signals) + Angular Material.
- **Components:**
  - `AgentPocComponent`: Simple interface to spawn agents and view logs.
- **Status:**
  - ✅ Basic UI for spawning jobs.
  - ✅ Handles granular SSE event payloads using Angular Signals.

## 3. Recent Accomplishments

- **Database Migration:** Transitioned from JSON-based `logs` and `artifacts` columns to dedicated relational tables (`init_blackboard_tables`).
- **Architecture Decoupling:** Extracted Agent execution logic into `IAgentRunner` and Artifact storage into `IArtifactStorage` providers.
- **Granular Event System:** Moved from generic `agent-job.updated` events to specific domain events (`JobLogAddedEvent`, etc.) for efficient real-time updates.

## 4. Next Steps

1.  **Frontend Update:** Refactor `agent-poc` to handle granular SSE events (e.g., `log_added` event) instead of refetching/receiving the whole job object.
2.  **Agent Logic:** Implement actual agent integration (LangGraph) by providing a new implementation of `IAgentRunner`.
3.  **Artifact Storage:** Implement S3/Cloud storage provider for `IArtifactStorage`.
