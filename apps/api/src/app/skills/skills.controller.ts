import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkillsService, type Skill } from './skills.service';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
    constructor(private readonly skillsService: SkillsService) {}

    @Get()
    @ApiOperation({ summary: 'List all available Claude skills from .claude/skills directory' })
    @ApiResponse({ status: 200, description: 'Returns list of available skills' })
    getSkills(): Skill[] {
        return this.skillsService.getAvailableSkills();
    }
}

