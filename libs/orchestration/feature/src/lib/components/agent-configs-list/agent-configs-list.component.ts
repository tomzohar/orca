import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { injectProjectDetection } from '@orca/core/projects';
import { injectAgentConfigsQuery } from '@orca/orchestration-data';
import {
    ButtonComponent,
    EmptyStateComponent,
    ListComponent,
    PageHeaderComponent,
    SpinnerComponent,
    DialogService,
    IconName,
} from '@orca/design-system';
import type { ListConfig } from '@orca/design-system';
import { CreateAgentConfigDialogComponent } from '../create-agent-config-dialog/create-agent-config-dialog.component';

@Component({
    selector: 'orca-agent-configs-list',
    standalone: true,
    imports: [
        CommonModule,
        PageHeaderComponent,
        ButtonComponent,
        ListComponent,
        SpinnerComponent,
        EmptyStateComponent,
    ],
    templateUrl: './agent-configs-list.component.html',
    styleUrl: './agent-configs-list.component.scss',
})
export class AgentConfigsListComponent {
    private readonly dialogService = inject(DialogService);
    private readonly router = inject(Router);
    private readonly projectDetection = injectProjectDetection();

    // Icon names for template
    readonly IconName = IconName;

    readonly projectId = computed(() => this.projectDetection.data()?.project?.id);
    readonly projectName = computed(() => this.projectDetection.data()?.project?.name || 'Unknown');
    readonly userId = computed(() => this.projectDetection.data()?.project?.ownerId);

    private readonly configsQuery = injectAgentConfigsQuery(this.projectId);

    readonly isLoading = computed(() => this.configsQuery.isLoading());
    readonly configs = computed(() => this.configsQuery.data() || []);
    readonly showEmpty = computed(() => !this.isLoading() && this.configs().length === 0);

    readonly listConfig = computed<ListConfig>(() => ({
        items: this.configs().map((config) => ({
            id: config.id.toString(),
            title: config.name,
            description: config.description || 'No description',
            badge: config.agentType,
            icon: IconName.settings,
            disabled: !config.isActive,
        })),
        showIcons: true,
        expandable: false,
    }));

    onCreateConfig(): void {
        const projectId = this.projectId();
        const userId = this.userId();

        if (!projectId || !userId) {
            console.error('Missing projectId or userId');
            return;
        }

        const dialogRef = this.dialogService.open(CreateAgentConfigDialogComponent, {
            data: {
                projectId,
                userId
            },
        });

        dialogRef.closed.subscribe((created) => {
            if (created) {
                // Query will auto-refresh due to invalidation
            }
        });
    }

    onConfigClick(item: unknown): void {
        // Future: Open detail panel or navigate to detail page
        console.log('Config clicked:', item);
    }
}
