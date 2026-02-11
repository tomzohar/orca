import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule, MatTabChangeEvent } from '@angular/material/tabs';
import { TabsConfig } from '../../types/component.types';
import { IconComponent } from '../icon/icon.component';

const DEFAULT_CONFIG: TabsConfig = {
    tabs: [],
    selectedIndex: 0,
    alignment: 'start',
    animationDuration: '300ms',
    disableRipple: false,
    headerPosition: 'above'
};

@Component({
    selector: 'orca-tabs',
    standalone: true,
    imports: [CommonModule, MatTabsModule, IconComponent],
    templateUrl: './tabs.component.html',
    styleUrls: ['./tabs.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsComponent {
    config = input<TabsConfig, Partial<TabsConfig> | undefined>(DEFAULT_CONFIG, {
        transform: (value) => {
            if (!value) return DEFAULT_CONFIG;
            return { ...DEFAULT_CONFIG, ...value };
        }
    });

    tabChanged = output<number>();

    onTabChanged(event: MatTabChangeEvent) {
        this.tabChanged.emit(event.index);
    }
}
