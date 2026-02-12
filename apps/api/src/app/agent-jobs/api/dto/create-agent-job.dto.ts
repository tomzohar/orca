import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt } from 'class-validator';
import { AgentType } from '../../domain/entities/agent-job.entity';

export class CreateAgentJobDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsInt()
  @IsOptional()
  createdById?: number;

  @IsInt()
  @IsOptional()
  assignedAgentId?: number;

  @IsOptional()
  @IsEnum(AgentType)
  type?: AgentType;

  @IsOptional()
  projectId?: number;
}
