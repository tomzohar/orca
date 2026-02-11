import { ChangeDetectionStrategy, Component, computed, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SidebarComponent, TopbarComponent, SidebarItem, TopbarAction, IconName, SidebarConfig } from '@orca/design-system';
import { injectAppLayoutConfig } from '../queries/app-layout.query';
import { injectProjectDetection } from '@orca/core/projects';
import { map } from 'rxjs';

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
    private projectQuery = injectProjectDetection();
    private router = inject(Router);
    readonly icons = IconName;

    // Convert router events to a signal that tracks the current URL
    private currentUrl = toSignal(
        this.router.events.pipe(
            map(() => this.router.url)
        ),
        { initialValue: this.router.url }
    );

    sidebarConfig = computed((): SidebarConfig => {
        const data = this.layoutQuery.data();
        if (!data) return { items: [] };

        const currentUrl = this.currentUrl();

        return {
            items: data.sidebar.routes.map((route) => ({
                id: route.path,
                label: route.label,
                route: route.path,
                icon: route.icon ? { name: route.icon as IconName } : undefined,
                isActive: currentUrl === route.path || currentUrl.startsWith(route.path + '/'),
            })),
        };
    });

    topbarConfig = computed(() => {
        const data = this.layoutQuery.data();
        if (!data) return {};

        return {};
    });

    projectName = computed(() => {
        return this.projectQuery.data()?.project?.name;
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
