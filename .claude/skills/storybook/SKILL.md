---
name: storybook
description: Use this skill to develop, preview, and test UI components in isolation using Storybook.
allowed-tools: Bash
---

This skill allows agents to interact with Storybook in the `design-system` library.

## Commands

### Start Storybook

To start the Storybook development server:

```bash
npx nx storybook design-system
```

### Build Storybook

To build a static version of Storybook:

```bash
npx nx build-storybook design-system
```

## Best Practices

- **Isolation**: Always develop components in the `design-system` library first.
- **Stories**: Ensure every component has a `.stories.ts` file in the same directory.
- **Prefix**: All components must use the `ui-` prefix.
- **Tokens**: Use design tokens from `libs/design-system/src/lib/styles/_tokens.scss` for styling.
