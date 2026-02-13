import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { JobComment } from '@orca/orchestration-types';
import { EmptyStateComponent, IconName, MarkdownEditorComponent, MarkdownEditorConfig, SpinnerComponent } from '@orca/design-system';

@Component({
    selector: 'orca-job-comments',
    standalone: true,
    imports: [DatePipe, EmptyStateComponent, MarkdownEditorComponent, SpinnerComponent],
    templateUrl: './job-comments.component.html',
    styleUrl: './job-comments.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobCommentsComponent {
    readonly comments = input.required<JobComment[]>();
    readonly loading = input<boolean>(false);
    readonly iconName = IconName;

    /**
     * Markdown editor config for preview-only mode
     */
    readonly markdownConfig: MarkdownEditorConfig = {
        mode: 'preview',
        toolbar: { enabled: false },
        showModeToggle: false,
        height: 'auto'
    };
}
