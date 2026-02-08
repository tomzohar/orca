# Execution Layer

This directory handles the actual running of agents in different environments.

## Responsibilities

- Implementing Agent Runners (Local, Docker).
- Parsing and reacting to logs (Matchers).
- Managing agent lifecycles within containers or local processes.

## Key Files

- `services/`: Concrete implementations of `IAgentRunner`.
- `matchers/`: Logic for detecting patterns in logs.
