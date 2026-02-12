# Project Status

**Last Updated:** February 12, 2026 (Afternoon Update)

## 1. Overview

Orca is an autonomous software orchestration platform. We have successfully implemented the **Pluggable Agent Architecture** and a specialized **Projects Module**, enabling agents to operate with full project awareness and localized file system access. The platform now features **fully automatic project initialization** and a comprehensive **Orchestration Dashboard** with real-time job monitoring and management.

## 2. Current Architecture State

### Backend (`apps/api`)

- **Framework:** NestJS + Prisma (PostgreSQL).
- **Core Modules:**
  - `agent-jobs`: Core execution engine.
  - `projects`: Manages file system project metadata and access.
  - `users`: User identity and attribution system.
  - `agent-configurations`: Reusable agent persona configurations with system prompts and execution preferences.
  - `skills`: Reads and manages Claude skills from project's `.claude/skills/` directory.
- **Architecture:** **Pluggable Strategy Pattern**
  - `AgentRunnerFactory`: Dispatches jobs based on `AgentType`.
  - **Quick Mode (`LocalAgentRunner`)**: ✅ **Production-Ready** - In-process LangGraph execution with:
    - Robust error handling and status management
    - Enhanced stream processing with agent response capture
    - Execution timing and tool invocation monitoring
    - Glob pattern file search (recursion limit: 50)
    - Dual file creation (filesystem + database artifacts)
    - Full project-aware filesystem access with security validation
  - **Testing Infrastructure:**
    - Centralized mocking system for LLMs, Runners, and Repositories.
    - Automated test execution via Nx (monorepo-safe).
- [x] **Deep Mode (Dockerized Agent)**:
  - [x] Create `apps/agent-scaffold` with Claude Agent SDK.
  - [x] Implement `DockerAgentRunner` in backend.
  - [x] Integrate with `AgentJobs` module.
  - [x] Verify tool use (File System, Bash).
  - [x] Robust error handling and configuration validation.
- [x] **Project Awareness**:
  - [x] Implement `Projects` module (CRUD for project metadata).
  - [x] **Auto-Initialization**: `GET /projects/detect` automatically detects AND creates projects (idempotent).
  - [x] **Smart Slug Generation**: Uses parent directory + basename for unique project slugs.
  - [x] Integrate `projectId` into `AgentJob` schema.
  - [x] Inject project `rootPath` into agent tools (File System Tool).
- [x] **Log Formatting**: Parse raw JSON logs into human-readable updates.
- [x] **Artifact Capture**: Store agent file outputs (`Write` & `Edit` via `fs.watch`) in DB.
- [x] **Feedback Loop**: Agent can request user input (`AskUserQuestion`), triggering `WAITING_FOR_USER` status.
- **Data Model:**
  - `User`: Identity system with HUMAN and AGENT types, system prompt support (future).
  - `AgentJob`: Includes `agentType`, `projectId`, `createdById`, and `assignedAgentId` for full attribution.
  - `Project`: Defines root paths, includes, excludes, and owner for agent access.
  - `AgentConfiguration`: Stores reusable agent personas with system prompts, rules, skills, and execution preferences.
  - `AgentJobLog` & `AgentJobArtifact`: Relational tables for streaming outputs.
- **Status:**
  - ✅ "Blackboard" Schema implemented.
  - ✅ Project management system integrated.
  - ✅ Docker Infrastructure verified (Image built, permissions configured).
  - ✅ Granular SSE event stream (`log_added`, `artifact_added`, `status_changed`).
  - ✅ Domain Isolation: Prisma models decoupled from domain events.
  - ✅ Test Coverage: High coverage (50 tests passing) for execution services and project module.
  - ✅ **LocalAgentRunner Production-Ready**: Full codebase interaction (read, write, search) with robust error handling and observability.

### Frontend (`apps/web`)

- **Framework:** Angular 18+ (Zoneless/Signals) + Angular Material.
- **Core Libraries:**
  - `libs/core/projects`: Project detection services and TanStack Query integration.
  - `libs/design-system`: Atomic UI components (Sidebar, Topbar, Card, Tabs, Spinner, etc.).
- **Components:**
  - `App`: Main application component managing global project detection and layout state.
  - **Orchestration Dashboard**:
    - `KanbanViewComponent`: Visualizes job lifecycle with integrated drag-and-drop.
    - `JobDetailsPanelComponent`: **Input-driven architecture** (removed shared state service). Merges query data with real-time SSE updates for logs and artifacts.
- **Status:**
  - ✅ Connects to backend via proxy.
  - ✅ Consumes SSE stream for live updates.
  - ✅ **Routing & Navigation:** Deep-linkable job details (`/orchestration/:jobId`) with query parameter support for tab states (`?tab=logs`).
  - ✅ **State Management:** TanStack Query + Signals for high-performance reactive updates.
  - ✅ **Design System:** Reusable `TabsComponent` and improved `KanbanViewComponent`.
  - ✅ **Automatic Initialization:** Seamless workspace onboarding.
  - ✅ Monorepo-safe test suite (non-watch mode by default).

## 3. Recent Accomplishments

- **Agent Configuration System (Feb 12, 2026 - Afternoon):**
  - **Implemented complete agent configuration management:**
    - `AgentConfiguration` model with system prompts, rules, skills array, and execution preferences
    - Full CRUD API with project-scoped configurations
    - Automatic slug generation for URL-friendly identifiers
    - User attribution via `userId` (linked to project owner)
    - Active/inactive state management for configuration lifecycle
  - **Database Schema:**
    - Created `AgentConfiguration` table with relations to `User` and `Project`
    - Supports both `DOCKER` and `FILE_SYSTEM` agent types
    - Skills stored as string array for referencing Claude skills
    - Text fields for system prompts and rules (unlimited length)
    - Cascade delete on project removal
  - **Module Architecture:**
    - Domain layer: Pure TypeScript entities following DDD patterns
    - Data layer: Prisma repository with proper type mapping
    - Application layer: Business logic with slug uniqueness validation
    - API layer: RESTful endpoints with flexible ID/slug lookup
  - **Frontend Integration:**
    - Agent configurations list view (`/agents`) with project filtering
    - Create dialog with form validation and multiselect skills dropdown
    - TanStack Query integration for real-time updates
    - TypeScript interfaces synced with backend
    - User ID automatically retrieved from project owner
    - Skills dropdown populated from project's `.claude/skills/` directory
  - **Automatic Initialization:**
    - Default "Coding Agent" configuration created on project setup
    - Hardcoded professional defaults (system prompt, rules, Docker execution)
    - Idempotent: checks for existing config before creation
    - Non-blocking: won't fail project creation if config creation fails
  - **API Endpoints:**
    - `POST /api/agent-configurations` - Create configuration
    - `GET /api/agent-configurations?projectId=<id>` - List all or filter by project
    - `GET /api/agent-configurations/:idOrSlug` - Get by ID or slug
    - `PUT /api/agent-configurations/:id` - Update configuration
    - `DELETE /api/agent-configurations/:id` - Delete configuration
  - **Testing & Verification:**
    - All builds passing (backend and frontend)
    - Module dependencies properly configured with forwardRef
    - Database migrations applied successfully
  - **Status:** ✅ Complete - Foundation ready for agent persona management and job-config linking

- **Skills Management System (Feb 12, 2026 - Afternoon):**
  - **Implemented complete skills discovery and management:**
    - Skills module reads from project's `.claude/skills/` directory structure
    - Supports nested directory structure: `.claude/skills/skill-name/SKILL.md`
    - API endpoint for listing available skills with automatic sorting
    - Error handling for missing directories or permission issues
  - **Module Architecture:**
    - Service layer: Business logic for filesystem operations (proper separation of concerns)
    - Controller layer: Thin HTTP request handlers delegating to service
    - Repository pattern not needed (read-only filesystem operations)
  - **Frontend Integration:**
    - TanStack Query hooks for skills state management (`injectSkillsQuery`)
    - Reusable skills state accessible from multiple components
    - 10-minute cache with automatic invalidation
    - Multiselect dropdown in agent configuration dialog
    - Loading states during skills fetch
  - **API Endpoint:**
    - `GET /api/skills` - Returns array of available skills with names and file paths
  - **Design System Enhancement:**
    - Added `multiple` support to `DropdownComponent` for multiselect behavior
    - Backend returns sorted skills for consistent UI presentation
  - **Architecture Principle Applied:**
    - Controllers only handle HTTP concerns (request/response)
    - Services contain all business logic (filesystem reading, directory traversal)
    - Clear separation enables better testability and maintainability
  - **Status:** ✅ Complete - Skills can be discovered, listed, and selected during agent configuration

- **Users Module - Phase 1: Core Attribution (Feb 12, 2026 - Morning):**
  - **Implemented complete identity and attribution system:**
    - `User` model with `HUMAN` and `AGENT` types
    - Automatic initialization creates default users ("Human" and "Coding Agent")
    - All jobs now track who created them (`createdById`)
    - Support for agent assignment (`assignedAgentId`)
    - All projects track their owner (`ownerId`)
  - **Database Schema:**
    - Added `UserType` enum (HUMAN, AGENT)
    - Created `User` table with full relations
    - Updated `Project` with `ownerId` foreign key
    - Updated `AgentJob`: removed `assignee` string, added `createdById` (required) and `assignedAgentId` (optional)
    - Migration applied with default user seeding
  - **Module Architecture:**
    - Domain layer: Pure TypeScript entities with factory methods
    - Data layer: Prisma repository implementation with proper type mapping
    - Application layer: Business logic for user management and initialization
    - Initialization service: Creates default users on app startup via `OnModuleInit`
  - **API Changes:**
    - `POST /agent-jobs` now accepts optional `createdById` (auto-populated from project owner if not provided)
    - `POST /agent-jobs` supports optional `assignedAgentId` for orchestrator assignments
    - All job responses now include user attribution data
  - **Integration:**
    - Projects module automatically creates owner users during project initialization
    - AgentJobs module validates users and requires attribution
    - Backward-compatible: `createdById` auto-populates from project owner when not provided
  - **Testing & Verification:**
    - All 50+ existing tests still passing
    - Migration verified with default users created (Human id:1, Coding Agent id:2)
    - API validation working correctly
    - Server initialization logs confirm successful user setup
  - **Status:** ✅ Phase 1 complete - Foundation ready for future phases (Agent Personas API, Job Comments, Authentication)

- **Bulk Filesystem Operations (Feb 11, 2026 - Evening):**
  - **Enhanced file_system tool** with bulk operations to dramatically reduce recursion:
    - `read_multiple`: Read multiple files in a single call (limit: 20 files)
    - `tree`: Get directory structure with configurable depth (default: 3 levels)
    - `git_diff`: Get uncommitted or staged changes directly
    - `read_matching`: Read all files matching a glob pattern (limit: 15 files)
  - **Reduced Tool Calls:** Review tasks now use 3-5 calls instead of 25+
  - **Updated System Prompt:** Agent now prioritizes bulk operations
  - **Benefits:** Lower recursion, faster execution, reduced API costs, better context
  - **Status:** ✅ Implemented and tested (all 50 tests passing)

- **AgentType Enum Rename (Feb 11, 2026 - Evening):**
  - Renamed enum values for clarity: `LANGGRAPH` → `FILE_SYSTEM`, `CLAUDE_SDK` → `DOCKER`
  - Updated 24 files across backend, frontend, tests, and documentation
  - Database migrated with new enum values
  - All tests passing after migration

- **LocalAgentRunner Production Readiness (Feb 11, 2026):**
  - **Fixed Critical Bugs:**
    - Artifact storage interface now returns structured objects (id + path) instead of fragile string parsing.
    - Enhanced error handling in fire-and-forget pattern with proper status updates and logging.
    - Clarified and validated project loading strategy with fail-fast validation.
  - **Enhanced Observability:**
    - Stream processing now captures and logs agent responses to database (visible in UI).
    - Added execution timing (start time, duration) with millisecond precision.
    - Tool invocations now logged with arguments for debugging.
    - Agent intermediate thoughts/actions now visible in logs.
  - **Improved Agent Capabilities:**
    - Increased recursion limit from 25 to 50 for complex tasks.
    - Added `find` action to file_system tool with glob pattern support (`**/*.ts`).
    - Automatically excludes `node_modules`, `.git`, `.nx`, `dist` from searches.
    - Limits search results to 500 files to prevent overwhelming output.
  - **Dual File Creation:**
    - File system tool's `write` action now creates both:
      - Actual files on disk (primary behavior)
      - Artifacts in database for UI viewing (automatic)
    - Events emitted for both filesystem writes and artifact creation.
  - **Test Coverage:**
    - All 50 unit tests passing.
    - Updated tool descriptions for clarity (file_system vs save_artifact).
    - Enhanced system prompt to guide agent tool selection.
  - **Status:** ✅ LocalAgentRunner is now **production-ready** for reading files, writing files, performing codebase searches, and creating artifacts.

- **Input-Driven Job Details & Advanced Routing (Feb 11, 2026):**
  - Refactored `JobDetailsPanelComponent` to be purely input-driven, eliminating the complex `JobDetailsStateService`.
  - Implemented deep-linkable job routes and query-parameter-based tab switching (Overview, Logs, Artifacts).
  - Integrated real-time SSE updates directly into the detail panel using Angular Signals.
  - Cleaned up redundant imports and modernized component lifecycle handling using `effect` and `onCleanup`.

- **Real-Time Orchestration (Feb 11, 2026):**
  - Completed the full Job Management lifecycle with backend repository decoupling.
  - Implemented SSE (Server-Sent Events) for real-time status, log, and artifact updates.
  - Launched the Job Creation dialog and the Detail Panel infrastructure.

- **Kanban & Project Foundation (Feb 10, 2026):**
  - Initial implementation of the Kanban board and automatic project initialization.
  - Refactored project initialization to be zero-intervention and idempotent.

## 4. Next Steps (Orchestration & UI)

1.  **Agent Configuration Enhancements:**
    - ✅ ~~Basic CRUD and automatic initialization~~ (Complete)
    - Add detail panel for viewing/editing individual configurations
    - Implement delete confirmation dialog
    - Add agent testing/preview functionality
    - Link jobs to configurations (optional agent selection during job creation)
    - Validate skills against `.claude/skills/` directory
    - Create configuration templates library
    - Add version history tracking for configurations

2.  **Users Module - Phase 2: Job Comments:**
    - Implement `AgentJobComment` model with user attribution
    - Add commenting API endpoints
    - Create UI for adding/viewing comments on jobs
    - Real-time comment updates via SSE

3.  **Resume & Feedback UI:** Implement the `WAITING_FOR_USER` interaction (display question, accept input, API to resume).

4.  **Generic List Components:** Utilize the new `ListItem` and `ListConfig` types to build specialized log and artifact lists.

5.  **Project Management UI:** Create frontend views for managing/editing existing projects (rename, update excludes).

6.  **Artifact Previews:** Enhance the Artifacts tab with code highlighting or HTML previews for generated files.

7.  **Job Interaction:** Fully implement drag-and-drop logic to update job status/priority via API.
