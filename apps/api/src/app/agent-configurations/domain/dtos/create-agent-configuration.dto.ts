import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AgentType } from '../../../agent-jobs/domain/entities/agent-job.entity';

export class CreateAgentConfigurationDto {
    @ApiProperty({ description: 'Display name of the agent configuration' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Detailed description of what this agent does', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: 'System prompt for the agent', example: 'You are a code review assistant...' })
    @IsString()
    @IsNotEmpty()
    systemPrompt: string;

    @ApiProperty({ description: 'Additional rules and constraints', required: false })
    @IsString()
    @IsOptional()
    rules?: string;

    @ApiProperty({
        description: 'References to Claude skills (files in .claude/skills/)',
        type: [String],
        example: ['interview', 'storybook', 'generate-component'],
        required: false
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    skills?: string[];

    @ApiProperty({
        description: 'Execution environment',
        enum: AgentType,
        example: 'DOCKER'
    })
    @IsEnum(AgentType)
    agentType: AgentType;

    @ApiProperty({ description: 'Project ID this configuration belongs to' })
    @IsNotEmpty()
    projectId: number;

    @ApiProperty({ description: 'User ID of the creator' })
    @IsNotEmpty()
    userId: number;

    @ApiProperty({ description: 'Whether the agent is active', default: true, required: false })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
