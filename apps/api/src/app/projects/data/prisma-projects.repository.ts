import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service'; // Adjust import path
import { IProjectsRepository } from '../domain/projects.repository.interface';
import { Project } from '../domain/project.entity';
import { Project as PrismaProject } from '../../../../prisma/client';

@Injectable()
export class PrismaProjectsRepository implements IProjectsRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(project: Project): Promise<Project> {
        const created = await this.prisma.project.create({
            data: {
                name: project.name,
                slug: project.slug,
                rootPath: project.rootPath,
                description: project.description,
                includes: project.includes,
                excludes: project.excludes,
            },
        });
        return this.mapToEntity(created);
    }

    async findAll(): Promise<Project[]> {
        const projects = await this.prisma.project.findMany();
        return projects.map((p) => this.mapToEntity(p));
    }

    async findById(id: number): Promise<Project | null> {
        const project = await this.prisma.project.findUnique({
            where: { id },
        });
        return project ? this.mapToEntity(project) : null;
    }

    async findBySlug(slug: string): Promise<Project | null> {
        const project = await this.prisma.project.findUnique({
            where: { slug },
        });
        return project ? this.mapToEntity(project) : null;
    }

    async update(id: number, project: Partial<Project>): Promise<Project> {
        // Basic implementation, handling simplified update logic
        const updated = await this.prisma.project.update({
            where: { id },
            data: {
                ...project,
                // Ensure immutable fields or specific logic is handled if needed
                id: undefined,
                createdAt: undefined,
                updatedAt: undefined
            }
        });
        return this.mapToEntity(updated);
    }

    async delete(id: number): Promise<void> {
        await this.prisma.project.delete({ where: { id } });
    }

    private mapToEntity(prismaProject: PrismaProject): Project {
        return new Project(
            prismaProject.id,
            prismaProject.name,
            prismaProject.slug,
            prismaProject.rootPath,
            prismaProject.description,
            prismaProject.includes,
            prismaProject.excludes,
            prismaProject.createdAt,
            prismaProject.updatedAt,
        );
    }
}
