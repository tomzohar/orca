import { Job, JobUIModel } from '@orca/orchestration-types';

/**
 * Priority display configuration
 */

/**
 * Maps a backend Job to a JobUIModel with computed display properties
 * 
 * @param job - The backend job entity
 * @returns JobUIModel with formatted display fields
 */
export function mapJobToUIModel(job: Job): JobUIModel {
    return {
        ...job,
        formattedCreatedAt: formatDate(job.createdAt)
    };
}

/**
 * Maps an array of backend Jobs to JobUIModels
 * 
 * @param jobs - Array of backend job entities
 * @returns Array of JobUIModels
 */
export function mapJobsToUIModels(jobs: Job[]): JobUIModel[] {
    return jobs.map(mapJobToUIModel);
}

/**
 * Formats an ISO date string to a human-readable format
 * 
 * @param isoDate - ISO 8601 date string
 * @returns Formatted date string (e.g., "Feb 10, 2026")
 */
function formatDate(isoDate: string): string {
    const date = new Date(isoDate);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}
