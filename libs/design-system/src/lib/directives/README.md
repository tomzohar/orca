# Design System Directives

## FillAvailableHeightDirective

A directive that automatically fills the available vertical space from the element's position to the bottom of the viewport.

### Usage

```typescript
import { FillAvailableHeightDirective } from '@orca/design-system';

@Component({
  standalone: true,
  imports: [FillAvailableHeightDirective],
  template: `
    <div [uiFillAvailableHeight]="20">
      <!-- Content that fills available height -->
    </div>
  `
})
export class MyComponent {}
```

### Features

- **Automatic height calculation**: Measures the element's Y position and calculates remaining viewport height
- **Responsive**: Automatically updates on window resize and DOM changes (via ResizeObserver)
- **Configurable margin**: Optional margin parameter to add spacing from the bottom
- **Performance optimized**: Uses `requestAnimationFrame` to debounce updates
- **Safe**: Prevents negative heights using `Math.max(0, availableHeight)`

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `uiFillAvailableHeight` | `number` | `0` | Margin to subtract from the calculated height (in pixels) |

### Examples

#### Basic Usage (No Margin)
```html
<div [uiFillAvailableHeight]="0">
  Content fills to viewport bottom
</div>
```

#### With Bottom Margin
```html
<div [uiFillAvailableHeight]="40">
  Content with 40px margin from bottom
</div>
```

#### Dynamic Margin
```typescript
export class MyComponent {
  bottomMargin = signal(20);
}
```

```html
<div [uiFillAvailableHeight]="bottomMargin()">
  Content with dynamic margin
</div>
```

### Use Cases

- **Scrollable containers**: Make a container fill remaining space and add scrolling
- **Split layouts**: Create resizable split panes
- **Dashboard panels**: Fill available space with data grids or charts
- **Chat interfaces**: Make message containers fill available height
- **Sidebars**: Create full-height navigation panels

### Browser Support

- All modern browsers (Chrome, Firefox, Safari, Edge)
- ResizeObserver support (gracefully degrades to window resize only in older environments)
- Tested in Angular testing environments (no ResizeObserver required)
