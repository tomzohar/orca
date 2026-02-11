
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

    describe('detectProject', () => {
        beforeEach(() => {
            // Mock fs.existsSync for project type detection
            jest.spyOn(require('fs'), 'existsSync');
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should return matching project with typescript type when tsconfig.json exists', async () => {
            const cwd = '/Users/tomzohar/projects/orca';
            jest.spyOn(process, 'cwd').mockReturnValue(cwd);

            const matchingProject = new Project(
                1,
                'Orca',
                'orca',
                cwd,
                'Main project',
                ['**/*'],
                ['**/node_modules/**'],
                new Date(),
                new Date()
            );

            mockProjectsRepository.findAll.mockResolvedValue([matchingProject]);
            require('fs').existsSync.mockImplementation((path: string) => {
                if (path.includes('tsconfig.json')) return true;
                return false;
            });

            const result = await service.detectProject();

            expect(result.project).toEqual(matchingProject);
            expect(result.workingDirectory.path).toBe(cwd);
            expect(result.workingDirectory.projectType).toBe('typescript');
        });

        it('should auto-create project with javascript type when only package.json exists', async () => {
            const cwd = '/Users/tomzohar/projects/some-js-project';
            jest.spyOn(process, 'cwd').mockReturnValue(cwd);

            const autoCreatedProject = new Project(
                1,
                'some-js-project',
                'projects-some-js-project',
                cwd,
                undefined,
                ['**/*'],
                ['**/node_modules/**', '**/.git/**'],
                new Date(),
                new Date()
            );

            mockProjectsRepository.findAll.mockResolvedValue([]);
            mockProjectsRepository.create.mockResolvedValue(autoCreatedProject);
            require('fs').existsSync.mockImplementation((path: string) => {
                if (path.includes('package.json')) return true;
                return false;
            });

            const result = await service.detectProject();

            expect(repository.create).toHaveBeenCalled();
            expect(result.project).toEqual(autoCreatedProject);
            expect(result.workingDirectory.path).toBe(cwd);
            expect(result.workingDirectory.projectType).toBe('javascript');
        });

        it('should auto-create project with python type when requirements.txt exists', async () => {
            const cwd = '/Users/tomzohar/projects/python-app';
            jest.spyOn(process, 'cwd').mockReturnValue(cwd);

            const autoCreatedProject = new Project(
                1,
                'python-app',
                'projects-python-app',
                cwd,
                undefined,
                ['**/*'],
                ['**/node_modules/**', '**/.git/**'],
                new Date(),
                new Date()
            );

            mockProjectsRepository.findAll.mockResolvedValue([]);
            mockProjectsRepository.create.mockResolvedValue(autoCreatedProject);
            require('fs').existsSync.mockImplementation((path: string) => {
                if (path.includes('requirements.txt')) return true;
                return false;
            });

            const result = await service.detectProject();

            expect(repository.create).toHaveBeenCalled();
            expect(result.project).toEqual(autoCreatedProject);
            expect(result.workingDirectory.path).toBe(cwd);
            expect(result.workingDirectory.projectType).toBe('python');
        });

        it('should return unknown type when no marker files exist', async () => {
            const cwd = '/Users/tomzohar/projects/unknown';
            jest.spyOn(process, 'cwd').mockReturnValue(cwd);

            mockProjectsRepository.findAll.mockResolvedValue([]);
            require('fs').existsSync.mockReturnValue(false);

            const result = await service.detectProject();

            expect(result.project).toBeNull();
            expect(result.workingDirectory.path).toBe(cwd);
            expect(result.workingDirectory.projectType).toBe('unknown');
        });

        it('should not match project when path does not equal exactly', async () => {
            const cwd = '/Users/tomzohar/projects/orca/apps/api';
            jest.spyOn(process, 'cwd').mockReturnValue(cwd);

            const project = new Project(
                1,
                'Orca',
                'orca',
                '/Users/tomzohar/projects/orca',
                'Main project',
                ['**/*'],
                ['**/node_modules/**'],
                new Date(),
                new Date()
            );

            mockProjectsRepository.findAll.mockResolvedValue([project]);
            require('fs').existsSync.mockReturnValue(false);

            const result = await service.detectProject();

            expect(result.project).toBeNull();
            expect(result.workingDirectory.path).toBe(cwd);
        });

        it('should handle file system errors gracefully', async () => {
            const cwd = '/Users/tomzohar/projects/test';
            jest.spyOn(process, 'cwd').mockReturnValue(cwd);

            mockProjectsRepository.findAll.mockResolvedValue([]);
            require('fs').existsSync.mockImplementation(() => {
                throw new Error('File system error');
            });

            const result = await service.detectProject();

            expect(result.project).toBeNull();
            expect(result.workingDirectory.path).toBe(cwd);
            expect(result.workingDirectory.projectType).toBe('unknown');
        });
    });
});
