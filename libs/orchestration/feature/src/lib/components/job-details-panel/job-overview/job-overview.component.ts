import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { JobUIModel } from '@orca/orchestration-types';
import { MarkdownEditorComponent, MarkdownEditorConfig } from '@orca/design-system';

@Component({
    selector: 'orca-job-overview',
    standalone: true,
    imports: [DatePipe, MarkdownEditorComponent],
    templateUrl: './job-overview.component.html',
    styleUrl: './job-overview.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobOverviewComponent {
    readonly job = input<JobUIModel | null>(null);

    /**
     * Markdown editor config for preview-only mode
     */
    readonly promptMarkdownConfig: MarkdownEditorConfig = {
        mode: 'preview',
        toolbar: { enabled: false },
        showModeToggle: false,
        height: 'auto',
        minHeight: '100px',
    };
}
