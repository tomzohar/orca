import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import type { ProjectType } from '../types';
import { Project } from '../project.entity';

/**
 * Working directory information DTO
 */
export class WorkingDirectoryDto {
    @ApiProperty({
        description: 'Current working directory path',
        example: '/Users/user/projects/myproject'
    })
    @IsString()
    @IsNotEmpty()
    path: string;

    @ApiProperty({
        description: 'Detected project type',
        enum: ['javascript', 'typescript', 'python', 'unknown'],
        example: 'typescript'
    })
    @IsEnum(['javascript', 'typescript', 'python', 'unknown'])
    projectType: ProjectType;
}

/**
 * Response DTO for project detection endpoint
 */
export class DetectProjectResponseDto {
    @ApiProperty({
        description: 'Matched project, or null if no match found',
        required: false,
        nullable: true
    })
    @IsObject()
    project: Project | null;

    @ApiProperty({
        description: 'Current working directory information',
        type: WorkingDirectoryDto
    })
    @ValidateNested()
    @Type(() => WorkingDirectoryDto)
    workingDirectory: WorkingDirectoryDto;
}
