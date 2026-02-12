export type MarkdownToolbarItem =
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'heading'
  | 'code'
  | 'link'
  | 'unordered-list'
  | 'ordered-list'
  | 'quote'
  | 'divider';

export interface MarkdownToolbarConfig {
  enabled?: boolean;
  items?: MarkdownToolbarItem[];
}

export interface MarkdownEditorConfig {
  mode?: 'edit' | 'preview' | 'split';
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  hint?: string;
  height?: string;
  minHeight?: string;
  toolbar?: MarkdownToolbarConfig;
  showModeToggle?: boolean;
  enableSyntaxHighlight?: boolean;
  sanitize?: boolean;
}

export const DEFAULT_TOOLBAR_ITEMS: MarkdownToolbarItem[] = [
  'bold',
  'italic',
  'strikethrough',
  'divider',
  'heading',
  'divider',
  'code',
  'link',
  'divider',
  'unordered-list',
  'ordered-list',
  'quote',
];

export const DEFAULT_MARKDOWN_EDITOR_CONFIG: MarkdownEditorConfig = {
  mode: 'edit',
  disabled: false,
  placeholder: 'Enter markdown...',
  height: '300px',
  showModeToggle: true,
  enableSyntaxHighlight: true,
  sanitize: true,
  toolbar: {
    enabled: true,
    items: DEFAULT_TOOLBAR_ITEMS,
  },
};
