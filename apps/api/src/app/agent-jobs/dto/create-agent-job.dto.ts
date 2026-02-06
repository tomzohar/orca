import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAgentJobDto {
    @IsString()
    @IsNotEmpty()
    prompt: string;

    @IsString()
    @IsOptional()
    assignee?: string;
}
