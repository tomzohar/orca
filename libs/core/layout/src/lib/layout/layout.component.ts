import { ChangeDetectionStrategy, Component, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent, TopbarComponent, SidebarItem, TopbarAction } from '@orca/design-system';
import { injectAppLayoutConfig } from '../queries/app-layout.query';

@Component({
    selector: 'orca-layout',
    standalone: true,
    imports: [CommonModule, SidebarComponent, TopbarComponent],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
    private layoutQuery = injectAppLayoutConfig();

    sidebarConfig = computed(() => {
        const data = this.layoutQuery.data();
        if (!data) return { items: [] };

        return {
            items: data.sidebar.routes.map((route) => ({
                id: route.path,
                label: route.label,
                route: route.path,
                icon: route.icon ? { name: route.icon } : undefined,
            })),
        };
    });

    topbarConfig = computed(() => {
        const data = this.layoutQuery.data();
        if (!data) return { title: '' };

        return {
            title: data.topbar.title,
        };
    });

    sidebarItemClick = output<SidebarItem>();
    topbarActionClick = output<TopbarAction>();

    onSidebarItemClick(item: SidebarItem) {
        this.sidebarItemClick.emit(item);
    }

    onTopbarActionClick(action: TopbarAction) {
        this.topbarActionClick.emit(action);
    }
}
