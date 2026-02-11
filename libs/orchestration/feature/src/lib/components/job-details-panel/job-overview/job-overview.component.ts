import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { JobUIModel } from '@orca/orchestration-types';

@Component({
    selector: 'orca-job-overview',
    standalone: true,
    imports: [CommonModule, DatePipe],
    templateUrl: './job-overview.component.html',
    styleUrl: './job-overview.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobOverviewComponent {
    readonly job = input<JobUIModel | null>(null);
}
