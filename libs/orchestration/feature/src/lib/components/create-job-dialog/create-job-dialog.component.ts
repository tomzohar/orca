import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
    DialogComponent,
    InputComponent,
    DropdownComponent,
    DropdownOption,
} from '@orca/design-system';
import { injectCreateJobMutation } from '@orca/orchestration-data';

export interface CreateJobDialogData {
    projectId: number;
    projectName: string;
}

@Component({
    selector: 'orca-create-job-dialog',
    standalone: true,
    imports: [CommonModule, DialogComponent, InputComponent, DropdownComponent],
    templateUrl: './create-job-dialog.component.html',
    styleUrl: './create-job-dialog.component.scss',
})
export class CreateJobDialogComponent {
    private readonly dialogRef = inject(DialogRef<number>);
    private readonly data = inject<CreateJobDialogData>(DIALOG_DATA);

    // Data from DIALOG_DATA
    readonly projectId = this.data.projectId;
    readonly projectName = this.data.projectName;

    // Form state
    readonly prompt = signal('');
    readonly agentType = signal<'FILE_SYSTEM' | 'DOCKER'>('DOCKER');

    // Mutation
    private readonly createJobMutation = injectCreateJobMutation();

    // Agent type options for dropdown
    readonly agentTypeOptions: DropdownOption<'FILE_SYSTEM' | 'DOCKER'>[] = [
        { label: 'Docker', value: 'DOCKER' },
        { label: 'Local', value: 'FILE_SYSTEM' },
    ];

    // Computed states
    readonly isSubmitting = computed(() => this.createJobMutation.isPending());
    readonly canSubmit = computed(() => this.prompt().trim().length > 0 && !this.isSubmitting());
    readonly errorMessage = computed(() => {
        const error = this.createJobMutation.error();
        if (!error) return '';
        return 'Failed to create job. Please try again.';
    });

    /**
     * Handles dialog close
     */
    onClose(): void {
        if (!this.isSubmitting()) {
            this.dialogRef.close();
        }
    }

    /**
     * Handles form submission
     */
    onSubmit(): void {
        if (!this.canSubmit()) return;

        this.createJobMutation.mutate(
            {
                prompt: this.prompt().trim(),
                type: this.agentType(),
                projectId: this.projectId,
            },
            {
                onSuccess: (response) => {
                    this.dialogRef.close(response.id);
                },
            }
        );
    }

    /**
     * Handles cancel button click
     */
    onCancel(): void {
        this.onClose();
    }
}
