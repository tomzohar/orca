
import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService, PROJECTS_REPOSITORY } from './projects.service';
import { IProjectsRepository } from '../domain/projects.repository.interface';
import { Project } from '../domain/project.entity';
import { CreateProjectDto } from '../domain/dtos/create-project.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('ProjectsService', () => {
    let service: ProjectsService;
    let repository: IProjectsRepository;

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

    const mockProjectsRepository = {
        create: jest.fn(),
        findAll: jest.fn(),
        findById: jest.fn(),
        findBySlug: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProjectsService,
                {
                    provide: PROJECTS_REPOSITORY,
                    useValue: mockProjectsRepository,
                },
            ],
        }).compile();

        service = module.get<ProjectsService>(ProjectsService);
        repository = module.get<IProjectsRepository>(PROJECTS_REPOSITORY);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new project', async () => {
            const dto: CreateProjectDto = {
                name: 'Test Project',
                rootPath: '/tmp/test',
            };

            mockProjectsRepository.findBySlug.mockResolvedValue(null);
            mockProjectsRepository.create.mockResolvedValue(mockProject);

            const result = await service.create(dto);

            expect(repository.findBySlug).toHaveBeenCalledWith('test-project');
            expect(repository.create).toHaveBeenCalled();
            expect(result).toEqual(mockProject);
        });

        it('should throw ConflictException if slug already exists', async () => {
            const dto: CreateProjectDto = {
                name: 'Test Project',
                rootPath: '/tmp/test',
            };

            mockProjectsRepository.findBySlug.mockResolvedValue(mockProject);

            await expect(service.create(dto)).rejects.toThrow(ConflictException);
        });
    });

    describe('findAll', () => {
        it('should return all projects', async () => {
            mockProjectsRepository.findAll.mockResolvedValue([mockProject]);

            const result = await service.findAll();

            expect(repository.findAll).toHaveBeenCalled();
            expect(result).toEqual([mockProject]);
        });
    });

    describe('findOne', () => {
        it('should return a project by id', async () => {
            mockProjectsRepository.findById.mockResolvedValue(mockProject);

            const result = await service.findOne(1);

            expect(repository.findById).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockProject);
        });
    });

    describe('findBySlug', () => {
        it('should return a project by slug', async () => {
            mockProjectsRepository.findBySlug.mockResolvedValue(mockProject);

            const result = await service.findBySlug('test-project');

            expect(repository.findBySlug).toHaveBeenCalledWith('test-project');
            expect(result).toEqual(mockProject);
        });
    });

    describe('getDefaultProject', () => {
        it('should return the first project', async () => {
            mockProjectsRepository.findAll.mockResolvedValue([mockProject]);

            const result = await service.getDefaultProject();

            expect(result).toEqual(mockProject);
        });

        it('should throw NotFoundException if no projects exist', async () => {
            mockProjectsRepository.findAll.mockResolvedValue([]);

            await expect(service.getDefaultProject()).rejects.toThrow(
                NotFoundException,
            );
        });
    });
});
