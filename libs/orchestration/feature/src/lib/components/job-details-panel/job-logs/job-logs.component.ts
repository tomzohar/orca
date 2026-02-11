import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SpinnerComponent } from '@orca/design-system';
import { JobUIModel } from '@orca/orchestration-types';

@Component({
    selector: 'orca-job-logs',
    standalone: true,
    imports: [DatePipe, SpinnerComponent],
    templateUrl: './job-logs.component.html',
    styleUrl: './job-logs.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JobLogsComponent {
    readonly job = input<JobUIModel | null>(null);
}
