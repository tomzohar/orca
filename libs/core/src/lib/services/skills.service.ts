import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { Skill } from '../types/skill.types';

@Injectable({ providedIn: 'root' })
export class SkillsService {
    private http = inject(HttpClient);

    /**
     * Fetches all available Claude skills from the .claude/skills directory
     * @returns Promise with list of available skills
     */
    async getSkills(): Promise<Skill[]> {
        return firstValueFrom(
            this.http.get<Skill[]>('/api/skills')
        );
    }
}
