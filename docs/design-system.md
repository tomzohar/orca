# Design System

This document outlines the UI components available in our shared library. These components wrap **Angular Material** to ensure consistent branding and usage.

## 1. Atoms (Basic Elements)

| Component Name  | Wraps (Material)                       | Usage Note                                                |
| :-------------- | :------------------------------------- | :-------------------------------------------------------- |
| `UiButton`      | `MatButton`, `MatIconButton`, `MatFab` | Handles primary, secondary, text, and icon variants.      |
| `UiIcon`        | `MatIcon`                              | Centralized icon registry (SVG/Font).                     |
| `UiInput`       | `MatInput`                             | Standard text inputs.                                     |
| `UiCheckbox`    | `MatCheckbox`                          | Boolean selection.                                        |
| `UiSelect`      | `MatSelect`                            | Dropdown selection.                                       |
| `UiToggle`      | `MatSlideToggle`                       | Switch toggles.                                           |
| `UiAvatar`      | _(Custom)_                             | User profile pictures with optional status/branding ring. |
| `UiBadge`       | `MatBadge`                             | Notification counts or status dots.                       |
| `UiSpinner`     | `MatProgressSpinner`                   | Loading indicators (circular).                            |
| `UiProgressBar` | `MatProgressBar`                       | Progress tracking (linear).                               |

## 2. Molecules (Compound Elements)

| Component Name   | Wraps (Material)  | Usage Note                                                      |
| :--------------- | :---------------- | :-------------------------------------------------------------- |
| `UiFormField`    | `MatFormField`    | Wraps inputs/selects with usage helper text and error messages. |
| `UiCard`         | `MatCard`         | Container for various content types (tasks, stats).             |
| `UiDialog`       | `MatDialog`       | Modal windows for confirmations or forms.                       |
| `UiToast`        | `MatSnackBar`     | Temporary notifications (snackbars).                            |
| `UiTooltip`      | `MatTooltip`      | Hover information.                                              |
| `UiMenu`         | `MatMenu`         | Context menus or dropdown actions.                              |
| `UiSheet`        | `MatBottomSheet`  | Mobile-friendly or secondary action panels.                     |
| `UiAutocomplete` | `MatAutocomplete` | Search/Select inputs with suggestions.                          |
| `UiDatepicker`   | `MatDatepicker`   | Date selection.                                                 |

## 3. Organisms (Complex Structures)

| Component Name  | Details                                                                                 |
| :-------------- | :-------------------------------------------------------------------------------------- |
| `UiSidenav`     | Application shell navigation (wraps `MatSidenav`).                                      |
| `UiToolbar`     | Top bar for page titles and global actions (wraps `MatToolbar`).                        |
| `UiTable`       | Data display with pagination and sorting (wraps `MatTable`, `MatPaginator`, `MatSort`). |
| `UiKanbanBoard` | Drag-and-drop task management (uses CDK DragDrop).                                      |
| `UiChatWindow`  | The chat interface for Agent interaction. Composed of `UiCard`, `UiInput`, `UiButton`.  |
| `UiStepper`     | Multi-step wizards (wraps `MatStepper`).                                                |
| `UiTabs`        | Content segmentation (wraps `MatTabs`).                                                 |
