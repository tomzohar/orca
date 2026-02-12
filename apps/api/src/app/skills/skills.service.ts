import { Injectable, Logger } from '@nestjs/common';
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';

export interface Skill {
    name: string;
    path: string;
}

@Injectable()
export class SkillsService {
    private readonly logger = new Logger(SkillsService.name);

    /**
     * Gets all available Claude skills from the .claude/skills directory
     * Expects structure: .claude/skills/skill-name/SKILL.md
     * @returns Array of skills with name and path
     */
    getAvailableSkills(): Skill[] {
        try {
            // Get the current working directory (project root)
            const cwd = process.cwd();
            const skillsDir = join(cwd, '.claude', 'skills');

            // Check if .claude/skills directory exists
            if (!existsSync(skillsDir)) {
                this.logger.log('No .claude/skills directory found');
                return [];
            }

            // Read all entries in the skills directory
            const entries = readdirSync(skillsDir, { withFileTypes: true });

            // Filter for directories that contain a SKILL.md file
            const skills = entries
                .filter(entry => {
                    if (!entry.isDirectory()) return false;

                    // Check if this directory has a SKILL.md file
                    const skillFilePath = join(skillsDir, entry.name, 'SKILL.md');
                    return existsSync(skillFilePath);
                })
                .map(dir => {
                    const skillFilePath = join(skillsDir, dir.name, 'SKILL.md');
                    return {
                        name: dir.name,
                        path: skillFilePath,
                    };
                })
                .sort((a, b) => a.name.localeCompare(b.name));

            this.logger.log(`Found ${skills.length} skills in ${skillsDir}`);
            return skills;
        } catch (error) {
            this.logger.error(`Error reading skills directory: ${error.message}`);
            return [];
        }
    }
}
