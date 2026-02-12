export interface AgentConfiguration {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    systemPrompt: string;
    rules: string | null;
    skills: string[];
    agentType: 'DOCKER' | 'FILE_SYSTEM';
    projectId: number;
    userId: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}
