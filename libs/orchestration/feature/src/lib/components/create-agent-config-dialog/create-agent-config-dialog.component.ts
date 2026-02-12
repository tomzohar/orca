import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { injectCreateAgentConfigMutation } from '@orca/orchestration-data';
import {
    DialogComponent,
    DropdownComponent,
    DropdownOption,
    InputComponent,
} from '@orca/design-system';
import { injectSkillsQuery, type Skill } from '@orca/core/projects';

interface DialogData {
    projectId: number;
    userId: number;
}

@Component({
    selector: 'orca-create-agent-config-dialog',
    standalone: true,
    imports: [
        CommonModule,
        DialogComponent,
        InputComponent,
        DropdownComponent,
    ],
    templateUrl: './create-agent-config-dialog.component.html',
    styleUrl: './create-agent-config-dialog.component.scss',
})
export class CreateAgentConfigDialogComponent {
    private readonly dialogRef = inject(DialogRef<boolean>);
    private readonly data = inject<DialogData>(DIALOG_DATA);
    private readonly createMutation = injectCreateAgentConfigMutation();
    private readonly skillsQuery = injectSkillsQuery();

    // Form state
    readonly name = signal('');
    readonly description = signal('');
    readonly systemPrompt = signal('');
    readonly rules = signal('');
    readonly skills = signal<string[]>([]);
    readonly agentType = signal<'DOCKER' | 'FILE_SYSTEM'>('DOCKER');

    // Agent type options for dropdown
    readonly agentTypeOptions: DropdownOption<'DOCKER' | 'FILE_SYSTEM'>[] = [
        { label: 'DOCKER (Isolated)', value: 'DOCKER' },
        { label: 'FILE_SYSTEM (Fast)', value: 'FILE_SYSTEM' },
    ];

    // Skills options for dropdown
    readonly skillsOptions = computed<DropdownOption<string>[]>(() => {
        const skills = this.skillsQuery.data() || [];
        return skills.map((skill: Skill) => ({
            label: skill.name,
            value: skill.name,
        }));
    });

    readonly isLoadingSkills = computed(() => this.skillsQuery.isLoading());

    // Validation
    readonly canSubmit = computed(
        () =>
            this.name().trim().length > 0 &&
            this.systemPrompt().trim().length > 0 &&
            !this.isSubmitting()
    );

    readonly isSubmitting = computed(() => this.createMutation.isPending());
    readonly errorMessage = computed(() => {
        const error = this.createMutation.error();
        return error ? 'Failed to create agent configuration. Please try again.' : '';
    });

    onSubmit(): void {
        if (!this.canSubmit()) return;

        this.createMutation.mutate(
            {
                name: this.name().trim(),
                description: this.description().trim() || undefined,
                systemPrompt: this.systemPrompt().trim(),
                rules: this.rules().trim() || undefined,
                skills: this.skills().length > 0 ? this.skills() : undefined,
                agentType: this.agentType(),
                projectId: this.data.projectId,
                userId: this.data.userId,
            },
            {
                onSuccess: () => {
                    this.dialogRef.close(true);
                },
            }
        );
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }

    onClose(): void {
        if (!this.isSubmitting()) {
            this.dialogRef.close(false);
        }
    }
}
