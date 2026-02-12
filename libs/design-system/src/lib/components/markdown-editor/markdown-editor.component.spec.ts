import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MarkdownModule } from 'ngx-markdown';
import { MarkdownEditorComponent } from './markdown-editor.component';
import type { MarkdownEditorConfig } from './markdown-editor.types';

describe('MarkdownEditorComponent', () => {
  let component: MarkdownEditorComponent;
  let fixture: ComponentFixture<MarkdownEditorComponent>;

  const defaultConfig: Partial<MarkdownEditorConfig> = {
    mode: 'edit',
    label: 'Description',
    placeholder: 'Enter markdown...',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MarkdownEditorComponent,
        BrowserAnimationsModule,
        MarkdownModule.forRoot(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MarkdownEditorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('config', defaultConfig);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display label', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(
      compiled.querySelector('.orca-markdown-label')?.textContent
    ).toContain('Description');
  });

  it('should render textarea in edit mode', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.orca-markdown-textarea')).toBeTruthy();
    expect(compiled.querySelector('.orca-markdown-preview')).toBeFalsy();
  });

  it('should render preview in preview mode', () => {
    fixture.componentRef.setInput('config', {
      ...defaultConfig,
      mode: 'preview',
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.orca-markdown-preview')).toBeTruthy();
    expect(compiled.querySelector('.orca-markdown-textarea')).toBeFalsy();
  });

  it('should render split view in split mode', () => {
    fixture.componentRef.setInput('config', { ...defaultConfig, mode: 'split' });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.split').length).toBe(2);
  });

  it('should emit modeChangeRequested on mode toggle', () => {
    const spy = vi.spyOn(component.modeChangeRequested, 'emit');
    component.requestModeChange('preview');
    expect(spy).toHaveBeenCalledWith('preview');
  });

  it('should update value on input', () => {
    const textarea = fixture.nativeElement.querySelector(
      'textarea'
    ) as HTMLTextAreaElement;
    textarea.value = '# Test Heading';
    textarea.dispatchEvent(new Event('input'));

    expect(component.value()).toBe('# Test Heading');
  });

  it('should apply bold formatting to selected text', () => {
    component.value.set('selected text');
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector(
      'textarea'
    ) as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 13);

    component.handleToolbarClick('bold');
    expect(component.value()).toContain('**selected text**');
  });

  it('should apply bold formatting with placeholder text', () => {
    component.value.set('');
    fixture.detectChanges();

    component.handleToolbarClick('bold');
    expect(component.value()).toContain('**bold text**');
  });

  it('should apply italic formatting', () => {
    component.value.set('text');
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector(
      'textarea'
    ) as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 4);

    component.handleToolbarClick('italic');
    expect(component.value()).toContain('*text*');
  });

  it('should apply strikethrough formatting', () => {
    component.value.set('text');
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector(
      'textarea'
    ) as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 4);

    component.handleToolbarClick('strikethrough');
    expect(component.value()).toContain('~~text~~');
  });

  it('should apply heading formatting', () => {
    component.value.set('');
    fixture.detectChanges();

    component.handleToolbarClick('heading');
    expect(component.value()).toContain('## Heading');
  });

  it('should apply inline code formatting', () => {
    component.value.set('code');
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector(
      'textarea'
    ) as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 4);

    component.handleToolbarClick('code');
    expect(component.value()).toContain('`code`');
  });

  it('should apply code block formatting for multiline text', () => {
    component.value.set('line1\nline2');
    fixture.detectChanges();

    const textarea = fixture.nativeElement.querySelector(
      'textarea'
    ) as HTMLTextAreaElement;
    textarea.setSelectionRange(0, 11);

    component.handleToolbarClick('code');
    expect(component.value()).toContain('```\nline1\nline2\n```');
  });

  it('should apply link formatting', () => {
    component.value.set('');
    fixture.detectChanges();

    component.handleToolbarClick('link');
    expect(component.value()).toContain('[link text](url)');
  });

  it('should apply unordered list formatting', () => {
    component.value.set('');
    fixture.detectChanges();

    component.handleToolbarClick('unordered-list');
    expect(component.value()).toContain('- list item');
  });

  it('should apply ordered list formatting', () => {
    component.value.set('');
    fixture.detectChanges();

    component.handleToolbarClick('ordered-list');
    expect(component.value()).toContain('1. list item');
  });

  it('should apply quote formatting', () => {
    component.value.set('');
    fixture.detectChanges();

    component.handleToolbarClick('quote');
    expect(component.value()).toContain('> quote');
  });

  it('should handle disabled state', () => {
    fixture.componentRef.setInput('config', {
      ...defaultConfig,
      disabled: true,
    });
    fixture.detectChanges();

    const container = fixture.nativeElement.querySelector(
      '.orca-markdown-editor'
    );
    expect(container?.classList.contains('disabled')).toBe(true);
  });

  it('should display error message', () => {
    fixture.componentRef.setInput('config', {
      ...defaultConfig,
      error: 'Invalid markdown',
    });
    fixture.detectChanges();

    const errorText = fixture.nativeElement.querySelector('.error-text');
    expect(errorText?.textContent).toContain('Invalid markdown');
  });

  it('should display hint message', () => {
    fixture.componentRef.setInput('config', {
      ...defaultConfig,
      hint: 'Use markdown syntax',
    });
    fixture.detectChanges();

    const hintText = fixture.nativeElement.querySelector('.hint-text');
    expect(hintText?.textContent).toContain('Use markdown syntax');
  });

  it('should hide error when hint is present but error is not', () => {
    fixture.componentRef.setInput('config', {
      ...defaultConfig,
      hint: 'Hint text',
      error: undefined,
    });
    fixture.detectChanges();

    const errorText = fixture.nativeElement.querySelector('.error-text');
    expect(errorText).toBeFalsy();
  });

  it('should hide toolbar when disabled', () => {
    fixture.componentRef.setInput('config', {
      ...defaultConfig,
      toolbar: { enabled: false },
    });
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('.orca-markdown-toolbar')
    ).toBeFalsy();
  });

  it('should render custom toolbar items', () => {
    fixture.componentRef.setInput('config', {
      ...defaultConfig,
      toolbar: {
        enabled: true,
        items: ['bold', 'italic', 'link'],
      },
    });
    fixture.detectChanges();

    expect(component.toolbarItems().length).toBe(3);
  });

  it('should not apply formatting when disabled', () => {
    fixture.componentRef.setInput('config', {
      ...defaultConfig,
      disabled: true,
    });
    fixture.detectChanges();

    component.value.set('text');
    const initialValue = component.value();

    component.handleToolbarClick('bold');

    expect(component.value()).toBe(initialValue);
  });

  it('should get correct icon for toolbar item', () => {
    const icon = component.getToolbarIcon('bold');
    expect(icon.name).toBe('format_bold');
    expect(icon.size).toBe('sm');
  });

  it('should get correct tooltip for toolbar item', () => {
    const tooltip = component.getToolbarTooltip('bold');
    expect(tooltip).toBe('Bold');
  });

  it('should implement ControlValueAccessor', () => {
    const onChange = vi.fn();
    const onTouched = vi.fn();

    component.registerOnChange(onChange);
    component.registerOnTouched(onTouched);

    component.writeValue('test value');
    expect(component.value()).toBe('test value');

    component.control.setValue('new value');
    fixture.detectChanges();

    expect(onChange).toHaveBeenCalledWith('new value');
  });

  it('should handle setDisabledState', () => {
    component.setDisabledState(true);
    expect(component.control.disabled).toBe(true);

    component.setDisabledState(false);
    expect(component.control.disabled).toBe(false);
  });
});
