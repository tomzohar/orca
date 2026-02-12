import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { MarkdownModule } from 'ngx-markdown';
import { MarkdownEditorComponent } from './markdown-editor.component';

const sampleMarkdown = `# Welcome to Orca

This is a **markdown editor** with *live preview*.

## Features

- Bold, italic, and ~~strikethrough~~
- Headers and lists
- \`Inline code\` and code blocks
- [Links](https://example.com) and more!

\`\`\`javascript
function hello() {
  console.log('Hello, Orca!');
}
\`\`\`

> Blockquotes work too!
`;

const meta: Meta<MarkdownEditorComponent> = {
  title: 'Components/MarkdownEditor',
  component: MarkdownEditorComponent,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [MarkdownModule.forRoot()],
    }),
  ],
};

export default meta;
type Story = StoryObj<MarkdownEditorComponent>;

export const EditMode: Story = {
  args: {
    config: {
      mode: 'edit',
      label: 'Task Description',
      placeholder: 'Describe your task using markdown...',
      hint: 'Supports markdown formatting',
    },
  },
  render: (args) => ({
    props: args,
    template: `<orca-markdown-editor [config]="config"></orca-markdown-editor>`,
  }),
};

export const PreviewMode: Story = {
  args: {
    config: {
      mode: 'preview',
      label: 'Task Description',
    },
    value: sampleMarkdown,
  },
  render: (args) => ({
    props: args,
    template: `<orca-markdown-editor [config]="config" [value]="value"></orca-markdown-editor>`,
  }),
};

export const SplitMode: Story = {
  args: {
    config: {
      mode: 'split',
      label: 'Task Description',
      height: '400px',
    },
    value: '# Heading\n\nType markdown on the left to see preview on the right.',
  },
  render: (args) => ({
    props: args,
    template: `<orca-markdown-editor [config]="config" [value]="value"></orca-markdown-editor>`,
  }),
};

export const WithContent: Story = {
  args: {
    config: {
      mode: 'edit',
      label: 'Agent Instructions',
      hint: 'Use markdown to format your instructions',
    },
    value: sampleMarkdown,
  },
  render: (args) => ({
    props: args,
    template: `<orca-markdown-editor [config]="config" [value]="value"></orca-markdown-editor>`,
  }),
};

export const CustomHeight: Story = {
  args: {
    config: {
      mode: 'edit',
      label: 'Notes',
      height: '500px',
      placeholder: 'Write your notes...',
    },
  },
  render: (args) => ({
    props: args,
    template: `<orca-markdown-editor [config]="config"></orca-markdown-editor>`,
  }),
};

export const NoToolbar: Story = {
  args: {
    config: {
      mode: 'edit',
      label: 'Simple Editor',
      toolbar: { enabled: false },
    },
  },
  render: (args) => ({
    props: args,
    template: `<orca-markdown-editor [config]="config"></orca-markdown-editor>`,
  }),
};

export const CustomToolbar: Story = {
  args: {
    config: {
      mode: 'edit',
      label: 'Custom Toolbar',
      toolbar: {
        enabled: true,
        items: ['bold', 'italic', 'divider', 'link', 'code'],
      },
    },
  },
  render: (args) => ({
    props: args,
    template: `<orca-markdown-editor [config]="config"></orca-markdown-editor>`,
  }),
};

export const Disabled: Story = {
  args: {
    config: {
      mode: 'edit',
      label: 'Read Only',
      disabled: true,
    },
    value: '# This content cannot be edited',
  },
  render: (args) => ({
    props: args,
    template: `<orca-markdown-editor [config]="config" [value]="value"></orca-markdown-editor>`,
  }),
};

export const WithError: Story = {
  args: {
    config: {
      mode: 'edit',
      label: 'Task Description',
      error: 'Description is required and must be at least 10 characters',
    },
    value: 'Too short',
  },
  render: (args) => ({
    props: args,
    template: `<orca-markdown-editor [config]="config" [value]="value"></orca-markdown-editor>`,
  }),
};

export const MinimalConfig: Story = {
  args: {
    value: 'A minimal markdown editor with default settings',
  },
  render: (args) => ({
    props: args,
    template: `<orca-markdown-editor [value]="value"></orca-markdown-editor>`,
  }),
};

export const NoModeToggle: Story = {
  args: {
    config: {
      mode: 'edit',
      label: 'No Mode Toggle',
      showModeToggle: false,
    },
  },
  render: (args) => ({
    props: args,
    template: `<orca-markdown-editor [config]="config"></orca-markdown-editor>`,
  }),
};

export const LongContent: Story = {
  args: {
    config: {
      mode: 'split',
      label: 'Long Document',
      height: '600px',
    },
    value: `# Documentation

## Introduction

This is a comprehensive guide to using markdown in your application.

### Basic Formatting

Use **bold** for emphasis, *italic* for subtle emphasis, and ~~strikethrough~~ for corrections.

### Code Examples

Inline code can be shown with \`backticks\`.

Multi-line code blocks:

\`\`\`typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}!\`;
}
\`\`\`

### Lists

Unordered lists:
- First item
- Second item
  - Nested item
  - Another nested item
- Third item

Ordered lists:
1. First step
2. Second step
3. Third step

### Links and Images

Visit [Orca Documentation](https://example.com) for more information.

### Quotes

> "The best way to predict the future is to invent it."
> - Alan Kay

### Horizontal Rules

---

That's all for now!
`,
  },
  render: (args) => ({
    props: args,
    template: `<orca-markdown-editor [config]="config" [value]="value"></orca-markdown-editor>`,
  }),
};
