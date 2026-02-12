import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
    EmptyStateComponent,
    EmptyStateConfig,
    ListComponent,
    SpinnerComponent,
    MarkdownEditorComponent,
    MarkdownEditorConfig,
    IconName,
    ListConfig,
    ListItem,
} from '@orca/design-system';
import { JobStatus, JobUIModel, JobArtifact } from '@orca/orchestration-types';

@Component({
    selector: 'orca-job-artifacts',
    standalone: true,
    imports: [SpinnerComponent, ListComponent, EmptyStateComponent, MarkdownEditorComponent],
    templateUrl: './job-artifacts.component.html',
    styleUrl: './job-artifacts.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobArtifactsComponent {
    readonly job = input<JobUIModel | null>(null);

    readonly emptyStateConfig = computed((): EmptyStateConfig => {
        const currentJob = this.job();
        if (!currentJob) {
            return { title: 'No job' };
        }
        if (currentJob.status === JobStatus.COMPLETED) {
            return {
                title: 'No artifacts found',
                description: 'No artifacts were generated for this job.',
            };
        }
        return {
            title: 'No artifacts yet',
            description: 'Artifacts will appear here once the job is completed.',
        };
    });

    /**
     * Computed signal that maps artifacts to ListConfig
     */
    readonly artifactsListConfig = computed<ListConfig>(() => {
        const currentJob = this.job();
        if (!currentJob || !currentJob.artifacts || currentJob.artifacts.length === 0) {
            return {
                items: [],
                expandable: true,
                showIcons: true,
                multipleExpanded: false,
            };
        }

        const items: ListItem[] = currentJob.artifacts.map((artifact) => ({
            id: artifact.id.toString(),
            title: artifact.filename,
            icon: this.getFileIcon(artifact.filename),
            description: `${this.getFileExtension(artifact.filename).toUpperCase()} file`,
        }));

        return {
            items,
            expandable: true,
            showIcons: true,
            multipleExpanded: true,
        };
    });

    /**
     * Determines the appropriate icon based on file extension
     */
    getFileIcon(filename: string): IconName {
        const extension = this.getFileExtension(filename);

        // Map file extensions to Material Icons
        const iconMap: Record<string, IconName> = {
            // JavaScript files
            'js': IconName.javascript,
            'jsx': IconName.javascript,
            'ts': IconName.javascript,
            'tsx': IconName.javascript,
            'mjs': IconName.javascript,
            'cjs': IconName.javascript,

            // HTML files
            'html': IconName.html,
            'htm': IconName.html,

            // CSS files
            'css': IconName.css,
            'scss': IconName.css,
            'sass': IconName.css,
            'less': IconName.css,
        };

        if (extension && iconMap[extension]) {
            return iconMap[extension];
        }

        return IconName.article;
    }

    /**
     * Gets file extension from filename
     */
    private getFileExtension(filename: string): string {
        return filename.split('.').pop()?.toLowerCase() || '';
    }

    /**
     * Gets the formatted markdown content for an artifact
     * Wraps code files (JS, HTML, CSS) in markdown code blocks
     */
    getArtifactMarkdownContent(item: ListItem): string {
        if (!item.id) return '';

        const artifact = this.job()?.artifacts?.find(a => a.id.toString() === item.id);
        if (!artifact) return '';

        return this.formatArtifactContent(artifact);
    }

    /**
     * Formats artifact content as markdown with code blocks for code files
     */
    private formatArtifactContent(artifact: JobArtifact): string {
        const extension = this.getFileExtension(artifact.filename);
        const codeExtensions = ['js', 'jsx', 'ts', 'tsx', 'mjs', 'cjs', 'html', 'htm', 'css', 'scss', 'sass', 'less'];

        if (codeExtensions.includes(extension)) {
            // Determine the language identifier for syntax highlighting
            const languageMap: Record<string, string> = {
                'js': 'javascript',
                'jsx': 'javascript',
                'ts': 'typescript',
                'tsx': 'typescript',
                'mjs': 'javascript',
                'cjs': 'javascript',
                'html': 'html',
                'htm': 'html',
                'css': 'css',
                'scss': 'scss',
                'sass': 'sass',
                'less': 'less',
            };

            const language = languageMap[extension] || extension;
            return `\`\`\`${language}\n${artifact.content}\n\`\`\``;
        }

        // For other files, render as-is (assuming it's already markdown or plain text)
        return artifact.content;
    }

    /**
     * Markdown editor config for preview-only mode (used in template)
     */
    readonly markdownConfig: MarkdownEditorConfig = {
        mode: 'preview',
        toolbar: { enabled: false },
        showModeToggle: false,
        height: 'auto',
        minHeight: '200px',
    };
}
