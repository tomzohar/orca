import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { AgentConfiguration } from '@orca/orchestration-types';

export interface CreateAgentConfigRequest {
    name: string;
    description?: string;
    systemPrompt: string;
    rules?: string;
    skills?: string[];
    agentType: 'DOCKER' | 'FILE_SYSTEM';
    projectId: number;
    userId: number;
    isActive?: boolean;
}

export interface UpdateAgentConfigRequest extends Partial<CreateAgentConfigRequest> {}

@Injectable({ providedIn: 'root' })
export class AgentConfigsService {
    private readonly http = inject(HttpClient);

    getConfigs(projectId?: number): Observable<AgentConfiguration[]> {
        const options = projectId ? { params: { projectId: projectId.toString() } } : {};
        return this.http.get<AgentConfiguration[]>('/api/agent-configurations', options);
    }

    getConfig(idOrSlug: string | number): Observable<AgentConfiguration> {
        return this.http.get<AgentConfiguration>(`/api/agent-configurations/${idOrSlug}`);
    }

    createConfig(request: CreateAgentConfigRequest): Observable<AgentConfiguration> {
        return this.http.post<AgentConfiguration>('/api/agent-configurations', request);
    }

    updateConfig(id: number, request: UpdateAgentConfigRequest): Observable<AgentConfiguration> {
        return this.http.put<AgentConfiguration>(`/api/agent-configurations/${id}`, request);
    }

    deleteConfig(id: number): Observable<void> {
        return this.http.delete<void>(`/api/agent-configurations/${id}`);
    }
}
