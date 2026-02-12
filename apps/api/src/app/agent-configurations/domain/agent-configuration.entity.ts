import { AgentType } from '../../agent-jobs/domain/entities/agent-job.entity';

export class AgentConfiguration {
    constructor(
        public readonly id: number,
        public name: string,
        public slug: string,
        public description: string | null,
        public systemPrompt: string,
        public rules: string | null,
        public skills: string[],
        public agentType: AgentType,
        public projectId: number,
        public userId: number,
        public isActive: boolean,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    static create(
        name: string,
        slug: string,
        systemPrompt: string,
        agentType: AgentType,
        projectId: number,
        userId: number,
        description?: string,
        rules?: string,
        skills?: string[]
    ): AgentConfiguration {
        return new AgentConfiguration(
            0, // temporary ID
            name,
            slug,
            description || null,
            systemPrompt,
            rules || null,
            skills || [],
            agentType,
            projectId,
            userId,
            true, // isActive defaults to true
            new Date(),
            new Date()
        );
    }
}
