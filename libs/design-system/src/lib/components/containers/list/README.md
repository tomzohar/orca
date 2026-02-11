# List Component

An expandable/collapsible list component for the Orca design system.

## Features

- **Expandable Mode**: Use Material's expansion panels for expandable list items
- **Simple Mode**: Flat list with clickable items
- **Icons**: Optional icons for each list item
- **Badges**: Display numeric or text badges
- **Disabled State**: Support for disabled items
- **Multiple Expansion**: Allow multiple items to be expanded simultaneously

## Usage

### Expandable List

```typescript
import { ListComponent } from '@orca/design-system';

@Component({
  template: `
    <orca-list
      [config]="{
        expandable: true,
        showIcons: true,
        items: [
          {
            id: '1',
            title: 'Agent Job #1234',
            description: 'Completed 2 minutes ago',
            icon: 'check',
            badge: '3',
            content: 'Detailed content goes here...'
          }
        ]
      }"
      (itemExpanded)="onExpanded($event)"
      (itemCollapsed)="onCollapsed($event)"
    />
  `
})
```

### Simple List

```typescript
<orca-list
  [config]="{
    expandable: false,
    showIcons: true,
    items: [
      {
        id: '1',
        title: 'Dashboard',
        description: 'View system overview',
        icon: 'dashboard'
      },
      {
        id: '2',
        title: 'Projects',
        description: 'Manage your projects',
        icon: 'view_kanban',
        badge: '5'
      }
    ]
  }"
  (itemClicked)="onItemClick($event)"
/>
```

## API

### ListConfig

```typescript
interface ListConfig {
  items: ListItem[];
  expandable?: boolean;          // Default: true
  showIcons?: boolean;            // Default: true
  multipleExpanded?: boolean;     // Default: false
}
```

### ListItem

```typescript
interface ListItem {
  id?: string;
  title: string;
  description?: string;
  icon?: string;
  badge?: string;
  content?: string;              // Required for expandable items
  disabled?: boolean;
}
```

## Events

- **itemExpanded**: Emitted when an item is expanded (expandable mode)
- **itemCollapsed**: Emitted when an item is collapsed (expandable mode)
- **itemClicked**: Emitted when an item is clicked (simple mode)

## Styling

The component uses design tokens from `@orca/design-system`:

- `$surface-color`: Background color
- `$primary-color`: Icon and badge colors
- `$text-primary`: Primary text color
- `$text-secondary`: Secondary text color
- `$spacing-*`: Consistent spacing
- `$radius-*`: Border radius values

## Examples

See the Storybook stories for live examples:
- Expandable List
- Multiple Expanded
- Simple List
- With/Without Icons
- Minimal List
- With Badges
