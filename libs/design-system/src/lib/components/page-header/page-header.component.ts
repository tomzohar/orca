import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { IconName } from '../../types/component.types';

@Component({
    selector: 'orca-page-header',
    standalone: true,
    imports: [CommonModule, IconComponent],
    templateUrl: './page-header.component.html',
    styleUrl: './page-header.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeaderComponent {
    title = input.required<string>();
    icon = input<IconName>();
    subTitle = input<string>();
}
