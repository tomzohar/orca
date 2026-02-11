import { Project } from './project.entity';

export interface IProjectsRepository {
    create(project: Project): Promise<Project>;
    findAll(): Promise<Project[]>;
    findById(id: number): Promise<Project | null>;
    findBySlug(slug: string): Promise<Project | null>;
    update(id: number, project: Partial<Project>): Promise<Project>;
    delete(id: number): Promise<void>;
}
