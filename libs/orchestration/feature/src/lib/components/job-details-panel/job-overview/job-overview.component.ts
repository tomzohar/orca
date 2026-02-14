import { ChangeDetectionStrategy, Component, inject, input, computed, viewChild, ElementRef, effect } from '@angular/core';
import { DatePipe } from '@angular/common';
import { JobUIModel } from '@orca/orchestration-types';
import { MarkdownEditorComponent, MarkdownEditorConfig, FillAvailableHeightDirective } from '@orca/design-system';
import { JobCommentsComponent } from '../job-comments/job-comments.component';
import { JobCommentFormComponent } from '../job-comment-form/job-comment-form.component';
import { injectCommentsQuery, injectAddCommentMutation } from '@orca/orchestration-data';

@Component({
    selector: 'orca-job-overview',
    standalone: true,
    imports: [FillAvailableHeightDirective, MarkdownEditorComponent, JobCommentsComponent, JobCommentFormComponent, FillAvailableHeightDirective],
    templateUrl: './job-overview.component.html',
    styleUrl: './job-overview.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobOverviewComponent {
    readonly job = input<JobUIModel | null>(null);

    // View child for scrolling
    private readonly commentsListContainer = viewChild<ElementRef<HTMLDivElement>>('commentsListContainer');

    // Comments query
    readonly commentsQuery = injectCommentsQuery(() => {
        const currentJob = this.job();
        return currentJob ? parseInt(currentJob.id, 10) : null;
    });

    readonly comments = computed(() => this.commentsQuery.data() ?? []);
    readonly commentsLoading = computed(() => this.commentsQuery.isLoading());

    constructor() {
        // Auto-scroll when comments change
        effect(() => {
            const comments = this.comments();
            const container = this.commentsListContainer();

            if (comments.length > 0 && container) {
                // Use a small timeout to ensure DOM is updated
                setTimeout(() => {
                    this.scrollToBottom();
                }, 0);
            }
        });
    }

    /**
     * Scroll comments list to bottom
     */
    private scrollToBottom(): void {
        const container = this.commentsListContainer();
        if (container) {
            const element = container.nativeElement;
            element.scrollTo({
                top: element.scrollHeight,
                behavior: 'smooth',
            });
        }
    }

    // Add comment mutation
    readonly addCommentMutation = injectAddCommentMutation();

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

    /**
     * Handle comment submission
     */
    onSubmitComment(content: string): void {
        const currentJob = this.job();
        if (!currentJob) return;

        const jobId = parseInt(currentJob.id, 10);
        // Use the job creator's ID as the comment author
        const authorId = currentJob.createdById;

        this.addCommentMutation.mutate({
            jobId,
            authorId,
            dto: { content },
        });
    }
}
