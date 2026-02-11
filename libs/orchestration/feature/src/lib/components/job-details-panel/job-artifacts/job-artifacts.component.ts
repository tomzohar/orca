import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { EmptyStateComponent, EmptyStateConfig, ListComponent, SpinnerComponent } from '@orca/design-system';
import { IconName, ListConfig, ListItem } from '@orca/design-system';
import { JobStatus, JobUIModel } from '@orca/orchestration-types';

@Component({
    selector: 'orca-job-artifacts',
    standalone: true,
    imports: [SpinnerComponent, ListComponent, EmptyStateComponent],
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
            content: artifact.content,
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
        const extension = filename.split('.').pop()?.toLowerCase();

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
}
