import { inject } from '@angular/core';
import { ProjectsService } from '../services/projects.service';
import { ProjectDetectionStore } from '../stores/project-detection.store';

/**
 * APP_INITIALIZER function to detect project before app bootstrap
 * @returns Promise<void>
 */
export async function initializeProjectDetection(): Promise<void> {
    const service = inject(ProjectsService);
    const store = inject(ProjectDetectionStore);


    try {
        const result = await service.detectProject();
        store.setData(result);
    } catch (error) {
        console.error('Failed to detect project:', error);
        store.setError(error as Error);
        // Don't throw - allow app to start even if detection fails
    }
}
