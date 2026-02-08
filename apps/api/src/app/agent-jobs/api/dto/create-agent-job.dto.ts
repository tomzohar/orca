import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { AgentType } from '../../domain/entities/agent-job.entity';

export class CreateAgentJobDto {
    @IsString()
    @IsNotEmpty()
    prompt: string;

    @IsString()
    @IsOptional()
    assignee?: string;

    @IsOptional()
    @IsEnum(AgentType)
    type?: AgentType;
}
