---
description: Use when Reviewing features and refactors to ensure code quality and standards.
---

# Feature & Refactor Review Workflow

Use this workflow to verify that new features or refactored code adhere to the Orca project's standards.

## General review points

- [ ] private methods should be under public methods
- [ ] all methods have strict types for arguments and return types
- [ ] no 'any' or 'unknown' types, all types must be defined

## 🎨 Frontend Review Points

### 1. Styling and Design System

- [ ] **SCSS Imports**: Are styles importing via the alias?
  - **Correct**: `@use 'orca-styles' as *;` or `@use 'orca-styles' as orca;`
  - **Incorrect**: Relative imports like `@use '../../../../libs/design-system/...'`
- [ ] **Design Tokens**: Check for hardcoded colors or spacing. Ensure `tokens.$spacing-*` and `tokens.$color-*` (or namespaced variants) are used.
- [ ] **Orca Components**: Ensure orca components are used instead of raw Material components (`mat-card`, etc.).

### 2. Angular Best Practices

- [ ] **Control Flow**: Use modern Angular control flow (`@if`, `@for`, `@switch`) instead of legacy directives (`*ngIf`, `*ngFor`).
- [ ] **Form Integration**: If a custom input component is used, does it correctly implement `ControlValueAccessor` to support `ngModel` or Reactive Forms?
- [ ] **Performance**: Check for unnecessary `ChangeDetectorRef.detectChanges()` calls. Prefer signals or Observable-based change detection.

### 3. Verification Steps

- [ ] **Build Check**: Run `nx build web` and ensure it passes.
- [ ] **Visual Audit**: Open the browser and check:
  - No red build overlays.
  - claimed feature is operational with no bugs

---

## ⚙️ Backend Review Points

### 1. Architectural Integrity (SOLID)

- [ ] **Repository Pattern**: Is the service decoupled from Prisma?
  - **Check**: Look for an interface in `repositories/` and an injection token (Symbol) used in the service constructor.
- [ ] **Domain Entities**: Are domain-level classes or interfaces used for business logic?
  - **Avoid**: Leaking database models (e.g., raw Prisma types) into the controller or frontend responses.
- [ ] **Event-Driven**: Are side effects or cross-module communications handled via events?
  - **Check**: Use of `EventEmitter2` for things like real-time updates (SSE) or background tasks.

### 2. Implementation Quality

- [ ] **Strict Typing**: No `any` types. All function inputs and outputs must be explicitly typed.
- [ ] **Error Handling**: Are errors handled at the correct level? Proper HTTP exceptions (e.g., `NotFoundException`) should be thrown in the service or controller.
- [ ] **Dry & Modularity**: Is the business logic centralized in the service? Are controllers kept thin?

### 3. Verification & Testing

- [ ] **Unit Tests**: Are there tests for the service and repository?
- [ ] **Mocking**: Ensure external dependencies (Prisma, EventEmitter) are mocked correctly using `jest.fn()`.
- [ ] **Coverage**: Does the test file cover all the success paths and all the failure paths?

---

## 🚀 Execution

// turbo

1. Run `nx lint` for the affected project.
2. Run `nx build` for the affected project.
3. Perform a visual check using the `browser_subagent` if UI was changed.
