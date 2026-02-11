import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { injectProjectDetection } from '@orca/core/projects';
import { EmptyStateComponent, EmptyStateConfig, SpinnerComponent, ButtonComponent, ButtonConfig, IconName } from '@orca/design-system';
import { AppLayoutService, LayoutComponent } from '@orca/core/layout';
import { AngularQueryDevtoolsComponent } from "./utils/angular-query-devtools.component";
import { appRoutes } from './app.routes';
import { getSidebarRoutes } from './utils/route.utils';

@Component({
  selector: 'orca-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    EmptyStateComponent,
    SpinnerComponent,
    LayoutComponent,
    AngularQueryDevtoolsComponent,
    ButtonComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private layoutService = inject(AppLayoutService);
  showDevTools = signal(false);

  readonly toggleDevtoolsButtonConfig: ButtonConfig = {
    variant: 'ghost',
    icon: {
      name: IconName.construction,
    }
  };

  constructor() {
    effect(() => {
      this.initializeLayout();
    })
  }

  // TanStack Query - returns Signal<CreateQueryResult<ProjectDetectionResult>>
  projectDetectionQuery = injectProjectDetection();

  // Computed signals from query
  isLoading = computed(() => this.projectDetectionQuery.isLoading());
  isError = computed(() => this.projectDetectionQuery.isError());
  error = computed(() => this.projectDetectionQuery.error());
  hasProject = computed(() => this.projectDetectionQuery.data()?.project !== null);

  // Error state configuration
  errorStateConfig = computed<EmptyStateConfig>(() => ({
    imgSrc: '/assets/empty-state-img.png',
    title: 'Failed to Initialize Project',
    description: this.error()?.message || 'Could not detect or create project. Please check your configuration.',
    action: {
      label: 'Retry',
    }
  }));

  retryDetection() {
    this.projectDetectionQuery.refetch();
  }

  private initializeLayout(): void {
    this.layoutService.updateLayoutConfig({
      sidebar: {
        routes: getSidebarRoutes(appRoutes)
      }
    });
  }
}
