# Bulk Filesystem Operations

**Added:** February 11, 2026
**Purpose:** Reduce agent recursion and improve efficiency for exploration/review tasks

## Overview

The `file_system` tool now supports bulk operations that allow agents to gather large amounts of information in a single tool call, dramatically reducing the number of LLM round-trips required for tasks like code reviews, exploration, and analysis.

## New Actions

### 1. `read_multiple` - Read Multiple Files at Once

Read several files in a single call instead of making individual `read` calls.

**Parameters:**
- `paths`: Array of file paths to read (limit: 20 files)

**Example:**
```json
{
  "action": "read_multiple",
  "paths": [
    "apps/api/src/app/agent-jobs/agent-jobs.service.ts",
    "apps/api/src/app/agent-jobs/domain/entities/agent-job.entity.ts",
    "apps/api/src/app/agent-jobs/execution/services/local-agent-runner.ts"
  ]
}
```

**Output:**
```
Read 3 file(s):

=== apps/api/src/app/agent-jobs/agent-jobs.service.ts ===
[file content]

=== apps/api/src/app/agent-jobs/domain/entities/agent-job.entity.ts ===
[file content]

=== apps/api/src/app/agent-jobs/execution/services/local-agent-runner.ts ===
[file content]
```

**Use Case:** When you need to read a known set of related files (e.g., service + entity + tests).

---

### 2. `tree` - Directory Structure

Get a visual tree representation of a directory structure in one call.

**Parameters:**
- `path`: Directory to explore (default: `.`)
- `depth`: Maximum depth to traverse (default: 3)

**Example:**
```json
{
  "action": "tree",
  "path": "apps/api/src/app/agent-jobs",
  "depth": 2
}
```

**Output:**
```
Directory tree for apps/api/src/app/agent-jobs (depth: 2):
apps/api/src/app/agent-jobs/
├── agent/
│   └── tools/
├── agent-jobs.module.ts
├── agent-jobs.service.ts
├── agent-jobs.service.spec.ts
├── api/
│   ├── dto/
│   └── agent-jobs.controller.ts
├── data/
│   └── repositories/
├── domain/
│   ├── entities/
│   ├── events/
│   └── interfaces/
├── execution/
│   ├── matchers/
│   └── services/
└── storage/
    └── services/
```

**Use Case:** Understanding module structure before making changes, getting oriented in unfamiliar code.

---

### 3. `git_diff` - Uncommitted Changes

Get git diff output directly without manual exploration.

**Parameters:**
- `staged`: Show staged changes only (default: false)

**Example:**
```json
{
  "action": "git_diff",
  "staged": false
}
```

**Output:**
```
Uncommitted changes:

Files changed:
M  apps/api/src/app/agent-jobs/agent/tools/file-system.tool.ts
M  apps/api/src/app/agent-jobs/agent/agent.graph.ts
M  docs/project-status.md

Diff:
diff --git a/apps/api/src/app/agent-jobs/agent/tools/file-system.tool.ts b/apps/api/src/app/agent-jobs/agent/tools/file-system.tool.ts
[full diff content]
```

**Use Case:** Perfect for "review the changes" tasks - see exactly what changed in one call.

---

### 4. `read_matching` - Read Files by Pattern

Find files matching a glob pattern and read them all at once.

**Parameters:**
- `path`: Glob pattern (e.g., `**/*.entity.ts`)

**Example:**
```json
{
  "action": "read_matching",
  "path": "**/*.entity.ts"
}
```

**Output:**
```
Found and read 5 file(s) matching "**/*.entity.ts":

=== apps/api/src/app/agent-jobs/domain/entities/agent-job.entity.ts ===
[file content]

=== apps/api/src/app/projects/domain/entities/project.entity.ts ===
[file content]

... (up to 15 files)
```

**Use Case:** Review all entities, read all config files, analyze all test files, etc.

---

## Performance Comparison

### Before: "Review the changes" (25+ tool calls)
```
1. list ./
2. read CLAUDE.md
3. read docs/project-status.md
4. list apps/api/src/app/agent-jobs
5. list apps/api/src/app/agent-jobs/execution
6. list apps/api/src/app/agent-jobs/execution/services
7. read local-agent-runner.ts
8. read file-system.tool.ts
9. find **/job-details-panel.component.ts
10. read job-details-panel.component.ts
... (15 more calls)
→ Result: Hit recursion limit of 50
```

### After: "Review the changes" (3-5 tool calls)
```
1. git_diff                     → See what changed
2. read_multiple [changed files] → Read all changes
3. tree apps/api                → Get context
4. save_artifact [review.md]    → Save review
→ Result: Completed successfully
```

## Benefits

1. **Reduced Recursion:** 80% fewer tool calls for typical review tasks
2. **Faster Execution:** Fewer LLM round-trips = faster completion
3. **Lower Costs:** Fewer API calls = reduced token usage
4. **Better Context:** Agent sees related files together
5. **Increased Limit:** Can handle more complex tasks within recursion limit

## Limits

To prevent token overflow and maintain performance:

- `read_multiple`: Maximum 20 files per call
- `read_matching`: Maximum 15 files per call
- `tree`: Default depth 3 levels (configurable)
- `git_diff`: 5MB buffer limit

## Agent Guidance

The agent system prompt has been updated to prioritize bulk operations:

> "Use BULK operations to minimize tool calls:
> - Use 'read_multiple' instead of multiple 'read' calls
> - Use 'tree' to understand directory structure in one call
> - Use 'git_diff' to see what changed instead of exploring manually
> - Use 'read_matching' to read all files matching a pattern at once"

## Implementation

- **File:** `apps/api/src/app/agent-jobs/agent/tools/file-system.tool.ts`
- **Tests:** All 50 existing tests passing
- **Documentation:** Updated in `docs/project-status.md` and CLAUDE.md
