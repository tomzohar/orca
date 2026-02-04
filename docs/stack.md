# Technology Stack & Models

## 1. Technology Stack

| Component         | Technology                                 | Rationale                                                                                                               |
| :---------------- | :----------------------------------------- | :---------------------------------------------------------------------------------------------------------------------- |
| **Frontend**      | **Angular 18+**                            | **Zoneless & Signals** for high-performance real-time updates. Shared mental model (decorators/DI) with NestJS.         |
| **UI Library**    | **Angular Material**                       | Robust, accessible, and comprehensive component suite to be wrapped for consistent branding.                            |
| **API Framework** | NestJS                                     | Modular architecture, native WebSocket support (Gateways), excellent TypeScript support.                                |
| **Database**      | PostgreSQL + **pgvector**                  | Relational for Tasks/Tickets; JSONB for flexible Artifacts; **pgvector for Semantic Memory (RAG)**; Pub/Sub for events. |
| **ORM**           | Prisma (or Drizzle)                        | Type-safe access. _Consider Drizzle if cold-start latency becomes critical._                                            |
| **Agent Logic**   | LangGraph                                  | Best-in-class for **stateful, cyclic** agent workflows (loops, memory, human-interrupts).                               |
| **Observability** | **LangSmith**                              | Critical for debugging agent traces, managing prompt versions, and evaluating run performance.                          |
| **Model Gateway** | **LiteLLM (DockerSidecar)** or **Portkey** | **LiteLLM**: Run as Docker/Microservice. **Portkey**: Node.js native alternative. Both unify APIs & track costs.        |
| **Tool Protocol** | MCP                                        | Standardized industry protocol to connect agents to tools (Filesystem, DB, Terminal).                                   |
| **Runtime**       | Docker                                     | Security sandboxing for agents and "dangerous" tools (Terminal/Bash).                                                   |
| **Repo Strategy** | **Nx Monorepo**                            | **Best-in-class for Angular + NestJS**. Shared types/DTOs between API & Frontend. Unified CI/CD.                        |
| **Queues**        | BullMQ (Redis)                             | Decouples API from long-running agent reasoning tasks.                                                                  |

## 2. Model Strategy (Tiered & Financial)

We use a tiered model strategy to optimize the **Cost-to-Intelligence** ratio, managed via **LiteLLM** for centralized accounting.

| Agent Role        | Model Tier       | Recommended Model                                         |
| :---------------- | :--------------- | :-------------------------------------------------------- |
| **Product Owner** | High (Reasoning) | **Claude 3.5 Sonnet** (Best for writing specs & planning) |
| **Architect**     | High (Context)   | **Gemini 1.5 Pro** (2M+ tokens for reading entire repos)  |
| **Developer**     | High (Coding)    | **Claude 3.5 Sonnet** (SOTA coding) or **GPT-4o**         |
| **QA / Janitor**  | Low (Speed)      | **Gemini 1.5 Flash** or **GPT-4o-mini** (Cheap & fast)    |

- **Safeguards:**
  - **Token Budget:** Hard stop if daily spend > $X (enforced via LiteLLM).
  - **Loop Killer:** Terminates any thread > 20 turns without a state change.
