# Project Status

**Last Updated:** February 6, 2026

## 1. Overview

Orca is an autonomous software orchestration platform. We are currently in the **POC Phase**, focusing on the "Blackboard" architecture where agents collaborate on a centralized state.

## 2. Current Architecture State

### Backend (`apps/api`)

- **Framework:** NestJS + Prisma (PostgreSQL).
- **Core Module:** `agent-jobs`
- **Data Model:**
  - `AgentJob`: The core unit of work (Blackboard pattern).
  - `AgentJobLog`: Relational table for streaming logs.
  - `AgentJobArtifact`: Relational table for file outputs.
- **AI/LLM:**
  - **Service:** `LlmService` supporting OpenAI, Anthropic, and Google Gemini.
  - **Agent Runner:** `LangGraphAgentRunner` executing LangChain graphs.
  - **Status:**
    - ✅ "Blackboard" Schema implemented.
    - ✅ Granular SSE event stream (`log_added`, `artifact_added`).
    - ✅ Integrated Google Gemini Flash/Pro models.
    - ✅ Database fully operational.

### Frontend (`apps/web`)

- **Framework:** Angular 18+ (Zoneless/Signals) + Angular Material.
- **Components:**
  - `AgentPocComponent`: Real-time agent interaction interface.
- **Status:**
  - ✅ Connects to backend via proxy.
  - ✅ Consumes SSE stream for live updates.
  - ✅ Displays logs and artifacts in real-time.

## 3. Recent Accomplishments

- **LLM Integration:** Integrated Google Gemini models via `LlmService` and configured `LangGraph` execution.
- **Infrastructure Fixes:** Resolved database connection issues and verified Docker environment.
- **End-to-End Flow:** Verified complete flow from Frontend -> API -> LLM -> Database -> Frontend (via SSE).

## 4. Next Steps

1.  **Orchestration Logic:** Implement smarter agent routing and complex LangGraph workflows (e.g., specific coding agents vs. planning agents).
2.  **Artifact Handling:** Enhance frontend to render different artifact types (code diffs, preview) beyond simple text/file download.
3.  **Refactor & Polish:** Clean up POC code in frontend and enhance error handling.
