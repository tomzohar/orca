import { Test, TestingModule } from '@nestjs/testing';
import { SimulatedAgentRunner } from './simulated-agent-runner';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AGENT_JOBS_REPOSITORY } from '../repositories/agent-jobs.repository.interface';
import { ARTIFACT_STORAGE } from '../interfaces/artifact-storage.interface';
import { AgentJobEntity, AgentJobStatus } from '../entities/agent-job.entity';

describe('SimulatedAgentRunner', () => {
    let runner: SimulatedAgentRunner;
    let eventEmitter: EventEmitter2;
    let repository: any;
    let artifactStorage: any;

    beforeEach(async () => {
        repository = {
            update: jest.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
            addLog: jest.fn().mockImplementation((id, msg) => Promise.resolve({
                id,
                logs: [{ id: 1, message: msg, timestamp: new Date() }]
            })),
            addArtifact: jest.fn(),
        };

        artifactStorage = {
            store: jest.fn().mockResolvedValue('db://123'),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SimulatedAgentRunner,
                {
                    provide: AGENT_JOBS_REPOSITORY,
                    useValue: repository,
                },
                {
                    provide: ARTIFACT_STORAGE,
                    useValue: artifactStorage,
                },
                {
                    provide: EventEmitter2,
                    useValue: {
                        emit: jest.fn(),
                    },
                },
            ],
        }).compile();

        runner = module.get<SimulatedAgentRunner>(SimulatedAgentRunner);
        eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    });

    it('should run a job successfully', async () => {
        const job = new AgentJobEntity({
            id: 1,
            prompt: 'test prompt',
            status: AgentJobStatus.PENDING,
            logs: [],
            artifacts: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        // Mock setTimeout to speed up test
        jest.spyOn(global, 'setTimeout').mockImplementation((cb: any) => {
            cb();
            return {} as any;
        });

        await runner.run(job);

        // Verify Status updates
        expect(repository.update).toHaveBeenCalledWith(1, { status: AgentJobStatus.RUNNING });
        expect(repository.update).toHaveBeenCalledWith(1, { status: AgentJobStatus.COMPLETED });

        // Verify Logs
        expect(repository.addLog).toHaveBeenCalledTimes(5); // 4 steps + 1 completion

        // Verify Artifact
        expect(artifactStorage.store).toHaveBeenCalledWith(1, 'main.py', expect.stringContaining('test prompt'));

        // Verify Events
        expect(eventEmitter.emit).toHaveBeenCalledWith('agent-job.status-changed', expect.any(Object));
        expect(eventEmitter.emit).toHaveBeenCalledWith('agent-job.log-added', expect.any(Object));
        expect(eventEmitter.emit).toHaveBeenCalledWith('agent-job.artifact-added', expect.any(Object));


    });
});
