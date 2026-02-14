import { ChangeDetectionStrategy, Component, input, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { JobComment, UserType } from '@orca/orchestration-types';
import { EmptyStateComponent, IconName, MarkdownEditorComponent, MarkdownEditorConfig, SpinnerComponent, AvatarComponent, AvatarConfig } from '@orca/design-system';

@Component({
    selector: 'orca-job-comments',
    standalone: true,
    imports: [DatePipe, EmptyStateComponent, MarkdownEditorComponent, SpinnerComponent, AvatarComponent],
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

    /**
     * Get avatar config for a comment author
     */
    getAvatarConfig(comment: JobComment): AvatarConfig {
        const isAgent = comment.author?.type === UserType.AGENT;

        return {
            size: 'sm',
            shape: 'circular',
            showIcon: true,
            icon: isAgent ? IconName.smart_toy : IconName.person,
        };
    }

    /**
     * Get author display name
     */
    getAuthorName(comment: JobComment): string {
        return comment.author?.name || 'Unknown User';
    }
}
