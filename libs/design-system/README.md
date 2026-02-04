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

```bash
npx nx g @nx/angular:stories --project=design-system
```

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
