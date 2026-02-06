# Design System Library

This library contains the shared UI components and design tokens for the Orca project. It wraps Angular Material and follows the branding guidelines.

## Quick Start

### Developing Components with Storybook

To start Storybook and work on components in isolation:

```bash
npx nx storybook design-system
```

This will launch Storybook at `http://localhost:4400`.

### Creating a New Component

Use the following Nx generator to create a new component:

```bash
npx nx g @nx/angular:component <component-name> --project=design-system --export
```

Then, create a story for it:

````bash
```bash
npx nx g @nx/angular:stories --project=design-system
````

## Component Development Guidelines

### Wrapping Angular Material

When wrapping Angular Material components (like `mat-input` or `mat-select`) in a custom component:

- **Use Reactive Forms API**: Prefer an internal `FormControl` synchronized with your component's signals/inputs.
- **Error State Management**: Correctly trigger the Material error state by using a custom `ErrorStateMatcher` that references the internal `FormControl`. This ensures that `mat-error` and `mat-hint` toggle correctly and adhere to Material's native validation triggers.
- **Model Synchronization**: Use Angular's `model()` or `input()` signals to bridge the custom component's API with the internal `FormControl` for a seamless developer experience.

## Styling & Tokens

All components should use the design tokens defined in:
`libs/design-system/src/lib/styles/_tokens.scss`

Import them in your component's SCSS:

```scss
@use 'libs/design-system/src/lib/styles/tokens' as *;

.my-component {
  color: $primary;
}
```

## Build & Publish

To build the library:

```bash
npx nx build design-system
```

To publish (requires configuration):

```bash
# First, update version in package.json
npx nx run design-system:publish
```
