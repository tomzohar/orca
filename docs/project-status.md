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
  - ✅ Service layer refactored to use atomic `addLog` and `addArtifact` operations.
  - ✅ Unit tests passing.
  - ⚠️ API endpoints return full objects; optimization for streaming individual events is pending.

### Frontend (`apps/web`)

- **Framework:** Angular 18+ (Zoneless/Signals) + Angular Material.
- **Components:**
  - `AgentPocComponent`: Simple interface to spawn agents and view logs.
- **Status:**
  - ✅ Basic UI for spawning jobs.
  - ⚠️ Consumes Server-Sent Events (SSE) but expects a full `AgentJob` object update. Needs update to handle granular log events if backend changes event payload.

## 3. Recent Accomplishments

- **Database Migration:** Transitioned from JSON-based `logs` and `artifacts` columns to dedicated relational tables (`init_blackboard_tables`).
- **Refactoring:** Cleaned up `AgentJobsService` and `PrismaAgentJobsRepository` to adhere to SOLID principles and strict typing.

## 4. Next Steps

1.  **Frontend Update:** Refactor `agent-poc` to handle granular SSE events (e.g., `JobLogCreated` event) instead of refetching/receiving the whole job object.
2.  **Agent Logic:** Implement actual agent integration (LangChain/LangGraph) replacing the mock "simulated processing" in `AgentJobsService`.
3.  **Artifact Storage:** Move from simple DB text storage for artifacts to a proper file storage/S3 abstraction.
