import { inject } from '@angular/core';
import { injectMutation, injectQuery, injectQueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';
import { AgentConfigsService } from './agent-configs.service';
import type { CreateAgentConfigRequest, UpdateAgentConfigRequest } from './agent-configs.service';

export const agentConfigsKeys = {
    all: ['agentConfigs'] as const,
    byProject: (projectId: number) => [...agentConfigsKeys.all, 'project', projectId] as const,
    detail: (id: number) => [...agentConfigsKeys.all, 'detail', id] as const,
};

export function injectAgentConfigsQuery(projectIdSignal: () => number | null | undefined) {
    const service = inject(AgentConfigsService);
    return injectQuery(() => {
        const projectId = projectIdSignal();
        return {
            queryKey: projectId ? agentConfigsKeys.byProject(projectId) : agentConfigsKeys.all,
            queryFn: async () => {
                if (!projectId) return [];
                return lastValueFrom(service.getConfigs(projectId));
            },
            enabled: !!projectId,
            staleTime: 1000 * 60 * 5, // 5 minutes
        };
    });
}

export function injectCreateAgentConfigMutation() {
    const service = inject(AgentConfigsService);
    const queryClient = injectQueryClient();

    return injectMutation(() => ({
        mutationFn: (request: CreateAgentConfigRequest) => lastValueFrom(service.createConfig(request)),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: agentConfigsKeys.byProject(data.projectId) });
        },
    }));
}

export function injectUpdateAgentConfigMutation() {
    const service = inject(AgentConfigsService);
    const queryClient = injectQueryClient();

    return injectMutation(() => ({
        mutationFn: ({ id, request }: { id: number; request: UpdateAgentConfigRequest }) =>
            lastValueFrom(service.updateConfig(id, request)),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: agentConfigsKeys.byProject(data.projectId) });
            queryClient.invalidateQueries({ queryKey: agentConfigsKeys.detail(data.id) });
        },
    }));
}

export function injectDeleteAgentConfigMutation() {
    const service = inject(AgentConfigsService);
    const queryClient = injectQueryClient();

    return injectMutation(() => ({
        mutationFn: ({ id, projectId }: { id: number; projectId: number }) =>
            lastValueFrom(service.deleteConfig(id)),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: agentConfigsKeys.byProject(projectId) });
        },
    }));
}
