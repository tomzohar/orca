import {
  Component,
  DestroyRef,
  ElementRef,
  viewChild,
  inject,
  input,
  model,
  output,
  effect,
  computed,
  forwardRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormsModule,
  FormControl,
  ReactiveFormsModule,
  NG_VALUE_ACCESSOR,
  ControlValueAccessor,
} from '@angular/forms';
import { MarkdownModule } from 'ngx-markdown';
import { ButtonComponent } from '../button/button.component';
import type {
  MarkdownEditorConfig,
  MarkdownToolbarItem,
} from './markdown-editor.types';
import {
  DEFAULT_MARKDOWN_EDITOR_CONFIG,
  DEFAULT_TOOLBAR_ITEMS,
} from './markdown-editor.types';
import { IconName } from '../../types/component.types';

@Component({
  selector: 'orca-markdown-editor',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MarkdownModule,
    ButtonComponent,
  ],
  templateUrl: './markdown-editor.component.html',
  styleUrl: './markdown-editor.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MarkdownEditorComponent),
      multi: true,
    },
  ],
})
export class MarkdownEditorComponent implements ControlValueAccessor {
  private destroyRef = inject(DestroyRef);

  textareaRef = viewChild<ElementRef<HTMLTextAreaElement>>('textarea');
  protected readonly editorId = `orca-md-editor-${Math.random().toString(36).substring(2, 9)}`;

  // Expose IconName enum to template
  protected readonly IconName = IconName;

  config = input<
    MarkdownEditorConfig,
    Partial<MarkdownEditorConfig> | undefined
  >(DEFAULT_MARKDOWN_EDITOR_CONFIG, {
    transform: (value) => ({
      ...DEFAULT_MARKDOWN_EDITOR_CONFIG,
      ...value,
      toolbar: {
        ...DEFAULT_MARKDOWN_EDITOR_CONFIG.toolbar,
        ...value?.toolbar,
      },
    }),
  });

  value = model<string>('');
  control = new FormControl<string>('');

  modeChangeRequested = output<'edit' | 'preview' | 'split'>();
  toolbarAction = output<MarkdownToolbarItem>();

  onChange: (value: string) => void = () => {
    /* Intended empty */
  };
  onTouched: () => void = () => {
    /* Intended empty */
  };

  // Computed toolbar items from config
  toolbarItems = computed(() => {
    return (
      this.config().toolbar?.items || DEFAULT_TOOLBAR_ITEMS
    );
  });

  constructor() {
    // Sync model with form control
    effect(() => {
      const val = this.value();
      if (this.control.value !== val) {
        this.control.setValue(val, { emitEvent: false });
      }
    });

    // Handle disabled state
    effect(() => {
      if (this.config().disabled) {
        this.control.disable({ emitEvent: false });
      } else {
        this.control.enable({ emitEvent: false });
      }
    });

    // Subscribe to control changes
    this.control.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((val) => {
        if (val !== null) {
          this.value.set(val);
          this.onChange(val);
        }
      });
  }

  onInput(event: Event): void {
    const target = event.target as HTMLTextAreaElement;
    this.value.set(target.value);
    this.onChange(target.value);
  }

  requestModeChange(mode: 'edit' | 'preview' | 'split'): void {
    this.modeChangeRequested.emit(mode);
  }

  handleToolbarClick(item: MarkdownToolbarItem): void {
    const textareaRef = this.textareaRef();
    if (this.config().disabled || !textareaRef) return;

    const textarea = textareaRef.nativeElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const currentValue = this.value();

    let newText = '';
    let newCursorPos = start;

    switch (item) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        newCursorPos = start + (selectedText ? newText.length : 2);
        break;
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`;
        newCursorPos = start + (selectedText ? newText.length : 1);
        break;
      case 'strikethrough':
        newText = `~~${selectedText || 'strikethrough text'}~~`;
        newCursorPos = start + (selectedText ? newText.length : 2);
        break;
      case 'heading':
        newText = `## ${selectedText || 'Heading'}`;
        newCursorPos = start + newText.length;
        break;
      case 'code':
        if (selectedText.includes('\n')) {
          newText = `\`\`\`\n${selectedText || 'code block'}\n\`\`\``;
        } else {
          newText = `\`${selectedText || 'code'}\``;
        }
        newCursorPos = start + (selectedText ? newText.length : 1);
        break;
      case 'link':
        newText = `[${selectedText || 'link text'}](url)`;
        newCursorPos = start + newText.length - 4;
        break;
      case 'unordered-list':
        newText = `- ${selectedText || 'list item'}`;
        newCursorPos = start + newText.length;
        break;
      case 'ordered-list':
        newText = `1. ${selectedText || 'list item'}`;
        newCursorPos = start + newText.length;
        break;
      case 'quote':
        newText = `> ${selectedText || 'quote'}`;
        newCursorPos = start + newText.length;
        break;
      default:
        return;
    }

    const updatedValue =
      currentValue.substring(0, start) + newText + currentValue.substring(end);

    this.value.set(updatedValue);
    this.onChange(updatedValue);

    // Restore focus and cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);

    this.toolbarAction.emit(item);
  }

  getToolbarIcon(item: MarkdownToolbarItem): { name: IconName; size: 'sm' } {
    const iconMap: Record<Exclude<MarkdownToolbarItem, 'divider'>, IconName> = {
      bold: IconName.format_bold,
      italic: IconName.format_italic,
      strikethrough: IconName.strikethrough_s,
      heading: IconName.title,
      code: IconName.code,
      link: IconName.link,
      'unordered-list': IconName.format_list_bulleted,
      'ordered-list': IconName.format_list_numbered,
      quote: IconName.format_quote,
    };
    return { name: iconMap[item as Exclude<MarkdownToolbarItem, 'divider'>], size: 'sm' };
  }

  getToolbarTooltip(item: MarkdownToolbarItem): string {
    const tooltipMap: Record<Exclude<MarkdownToolbarItem, 'divider'>, string> =
    {
      bold: 'Bold',
      italic: 'Italic',
      strikethrough: 'Strikethrough',
      heading: 'Heading',
      code: 'Code',
      link: 'Insert Link',
      'unordered-list': 'Bullet List',
      'ordered-list': 'Numbered List',
      quote: 'Quote',
    };
    return tooltipMap[item as Exclude<MarkdownToolbarItem, 'divider'>];
  }

  // ControlValueAccessor implementation
  writeValue(value: string): void {
    this.value.set(value || '');
    this.control.setValue(value || '', { emitEvent: false });
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.control.disable({ emitEvent: false });
    } else {
      this.control.enable({ emitEvent: false });
    }
  }
}
