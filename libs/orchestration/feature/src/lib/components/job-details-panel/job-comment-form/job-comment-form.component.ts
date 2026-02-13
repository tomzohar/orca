import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { ButtonComponent, MarkdownEditorComponent, MarkdownEditorConfig } from '@orca/design-system';

@Component({
    selector: 'orca-job-comment-form',
    standalone: true,
    imports: [ButtonComponent, MarkdownEditorComponent],
    templateUrl: './job-comment-form.component.html',
    styleUrl: './job-comment-form.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobCommentFormComponent {
    readonly commentContent = signal('');
    readonly submitComment = output<string>();

    readonly editorConfig: MarkdownEditorConfig = {
        mode: 'edit',
        toolbar: { enabled: false },
        showModeToggle: true,
        height: '90px',
        placeholder: 'Write a comment (Markdown supported)...',
    };

    onSubmit(): void {
        const content = this.commentContent().trim();
        if (content) {
            this.submitComment.emit(content);
            this.commentContent.set('');
        }
    }

    onContentChange(content: string): void {
        this.commentContent.set(content);
    }
}
