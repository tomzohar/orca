import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SpinnerComponent } from '@orca/design-system';
import { JobUIModel } from '@orca/orchestration-types';

@Component({
    selector: 'orca-job-artifacts',
    standalone: true,
    imports: [CommonModule, DatePipe, SpinnerComponent],
    templateUrl: './job-artifacts.component.html',
    styleUrl: './job-artifacts.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobArtifactsComponent {
    readonly job = input<JobUIModel | null>(null);
}
