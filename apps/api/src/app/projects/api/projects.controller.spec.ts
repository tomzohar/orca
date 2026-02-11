
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from '../application/projects.service';
import { AgentJobsService } from '../../agent-jobs/agent-jobs.service';
import { CreateProjectDto } from '../domain/dtos/create-project.dto';
import { Project } from '../domain/project.entity';
import { NotFoundException } from '@nestjs/common';

describe('ProjectsController', () => {
    let controller: ProjectsController;
    let service: ProjectsService;

    const mockProject = new Project(
        1,
        'Test Project',
        'test-project',
        '/tmp/test',
        'Test Description',
        ['**/*'],
        ['**/node_modules/**'],
        new Date(),
        new Date(),
    );

    const mockProjectsService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findBySlug: jest.fn(),
        findOne: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ProjectsController],
            providers: [
                {
                    provide: ProjectsService,
                    useValue: mockProjectsService,
                },
                {
                    provide: AgentJobsService,
                    useValue: { getJobs: jest.fn() },
                },
            ],
        }).compile();

        controller = module.get<ProjectsController>(ProjectsController);
        service = module.get<ProjectsService>(ProjectsService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a project', async () => {
            const dto: CreateProjectDto = {
                name: 'Test Project',
                rootPath: '/tmp/test',
            };

            mockProjectsService.create.mockResolvedValue(mockProject);

            const result = await controller.create(dto);

            expect(service.create).toHaveBeenCalledWith(dto);
            expect(result).toEqual(mockProject);
        });
    });

    describe('findAll', () => {
        it('should return an array of projects', async () => {
            mockProjectsService.findAll.mockResolvedValue([mockProject]);

            const result = await controller.findAll();

            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual([mockProject]);
        });
    });

    describe('findOne', () => {
        it('should return a project by slug', async () => {
            mockProjectsService.findBySlug.mockResolvedValue(mockProject);

            const result = await controller.findOne('test-project');

            expect(service.findBySlug).toHaveBeenCalledWith('test-project');
            expect(result).toEqual(mockProject);
        });

        it('should throw NotFoundException if project not found', async () => {
            mockProjectsService.findBySlug.mockResolvedValue(null);

            await expect(controller.findOne('non-existent')).rejects.toThrow(
                NotFoundException,
            );
        });
    });


});
