# Project Status

**Last Updated:** February 13, 2026

## Overview

Autonomous software orchestration platform with pluggable agent architecture, project-aware file system access, and real-time dashboard monitoring.

## Architecture

### Backend (`apps/api`)
**Stack:** NestJS + Prisma + PostgreSQL

**Modules:**
- `agent-jobs`: Execution engine with pluggable strategy pattern
- `projects`: Project metadata, auto-initialization, smart slug generation
- `users`: Identity system (HUMAN/AGENT types), attribution tracking
- `agent-configurations`: Reusable agent personas with prompts/rules/skills
- `skills`: Reads/manages Claude skills from `.claude/skills/`

**Agent Execution:**
- **Quick Mode (`LocalAgentRunner`)**: ✅ Production-ready in-process LangGraph execution
  - Recursion limit: 50, glob search, dual file creation (disk + DB), full security validation
- **Deep Mode (`DockerAgentRunner`)**: ✅ Complete - Isolated Claude SDK in Docker with verified tool use

**Infrastructure:**
- ✅ Tool Registry: Centralized tool management with conditional activation
- ✅ Centralized mocking system, 110 tests passing
- ✅ Blackboard schema, project system, Docker verified
- ✅ SSE events: `log_added`, `artifact_added`, `status_changed`, `comment_added`
- ✅ Domain isolation (Prisma decoupled from domain events)

### Frontend (`apps/web`)
**Stack:** Angular 18+ (Zoneless/Signals) + Angular Material

**Libraries:**
- `libs/core/projects`: TanStack Query + project detection
- `libs/design-system`: Atomic UI components (30+ components)

**Features:**
- ✅ Kanban job board with drag-and-drop
- ✅ Input-driven job details panel with SSE real-time updates
- ✅ Deep-linkable routes (`/orchestration/:jobId?tab=logs`)
- ✅ Automatic project initialization
- ✅ 45+ tests passing

## Recent Accomplishments

### Feb 13, 2026 - Tool Registry System
✅ **Centralized Tool Management:**
- `ToolRegistryService`: Single source of truth for all agent tools
- `ToolFactory` pattern: Declarative tool definitions with metadata, activation predicates, creation logic
- Tool categories: CORE, FILESYSTEM, ORCHESTRATION, COMMUNICATION
- Conditional activation: Tools only available when requirements are met

✅ **Tool Registry Features:**
- Project-aware activation (file_system requires project context)
- Task-type activation (spawn_job only for orchestrator jobs)
- Dependency injection (repository, storage auto-injected)
- Rich context with job details, event callbacks, project paths
- Category-based filtering and organization

✅ **Orchestrator Tools (Phase 2 Foundation):**
- `spawn_job` tool for creating child jobs
- Automatic comment posting on job spawn
- Child job tracking via parentJobId
- Ready for multi-agent coordination

✅ **LocalAgentRunner Integration:**
- Replaced manual tool creation with registry-based approach
- Context-aware tool selection via `getRequestedTools()`
- Tools automatically activated based on job type and project availability
- Zero breaking changes, all 110 tests passing

✅ **Testing & Documentation:**
- 14 new registry tests, 6 new integration tests
- Comprehensive implementation guide (`docs/tool-registry-implementation.md`)
- Full backward compatibility maintained

**Impact:** Foundation for parallel execution, orchestrator agents, and easy tool extensibility

### Feb 13, 2026 - Parallel Execution Phase 1
✅ **Database Schema:**
- Job hierarchy: `parentJobId`, `childJobs` relation
- Enums: `TaskType` (ORCHESTRATOR/CODING/REVIEW), `MergeStatus` (PENDING/READY/CONFLICT/MERGED)
- Git isolation: `gitBranch` field for branch tracking

✅ **GitService:**
- Methods: `getDiff()`, `getChangedFiles()`, `detectConflicts()`
- Security: `execFile` (no command injection), branch name validation
- 15 new tests, 90 total passing, zero breaking changes

**Next:** Phase 2 (Multi-Agent Coordination + Docker Clone)

### Feb 12, 2026 - Comments, Configs, Skills, Users

✅ **Job Comments:**
- Backend: `AgentJobComment` model, POST/GET endpoints, SSE `comment_added` events
- Agent tools: `postComment`, `readComments`
- Frontend: Markdown editor, scrollable list, optimistic updates
- 58 backend + 45 frontend tests passing

✅ **Agent Configurations:**
- CRUD API, auto slug generation, project-scoped
- Default "Coding Agent" created on project init
- Frontend: list view, create dialog, multiselect skills dropdown

✅ **Skills Management:**
- Reads `.claude/skills/` directory
- Endpoint: `GET /api/skills`
- Multiselect dropdown support added to design system

✅ **Users Module Phase 1:**
- `User` model (HUMAN/AGENT types)
- Attribution: `createdById`, `assignedAgentId` on jobs
- Auto-initialization: default users created on app startup

### Feb 11, 2026 - Agent Runner Enhancements

✅ **Bulk Filesystem Operations:**
- Tools: `read_multiple` (20 files), `tree` (depth: 3), `git_diff`, `read_matching` (15 files)
- Reduced tool calls from 25+ to 3-5 per review task

✅ **AgentType Rename:**
- `LANGGRAPH` → `FILE_SYSTEM`, `CLAUDE_SDK` → `DOCKER`
- 24 files updated, migration complete

✅ **LocalAgentRunner Production:**
- Recursion limit: 50, glob search with `find` action
- Dual file creation (disk + DB artifacts)
- Enhanced observability: execution timing, tool logging, agent responses captured
- Artifact interface returns structured objects (id + path)

✅ **UI Improvements:**
- Input-driven `JobDetailsPanelComponent` (removed state service)
- Deep-linkable routes with query params (`/orchestration/:jobId?tab=logs`)
- SSE real-time updates with Angular Signals

### Feb 10-11, 2026 - Foundation

✅ **Core Infrastructure:**
- Kanban board with drag-and-drop
- Automatic project initialization (idempotent)
- SSE events for status/logs/artifacts
- Job creation dialog and detail panel

## Next Steps

### Parallel Execution Phase 2
- Additional orchestrator tools (`check_child_status`, `collect_results`)
- Docker clone isolation for branch-based execution
- Multi-agent coordination and result aggregation
- Orchestrator agent prompt templates

### Agent Configuration
- Detail panel for viewing/editing
- Delete confirmation dialog
- Testing/preview functionality
- Link jobs to configs (optional selection during creation)
- Skill validation against `.claude/skills/`
- Configuration templates library
- Version history tracking

### Job Resume (Users Phase 3)
- Job lineage tracking (`baseJobId` self-reference)
- `resumeJob()` service with context enrichment
- Resume dialog component
- Enriched prompt builder (logs + artifacts + comments)
- "Resume with Feedback" button on completed/failed jobs
- SSE resume events

### UI Enhancements
- `WAITING_FOR_USER` interaction (display question, accept input, resume API)
- Generic list components using `ListItem`/`ListConfig` types
- Project management views (rename, update excludes)
- Artifact previews (code highlighting, HTML preview)
- Drag-and-drop status/priority updates via API
