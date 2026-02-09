import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProjectDto {
    @ApiProperty({ description: 'Display name of the project' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ description: 'Root directory path on the server filesystem' })
    @IsString()
    @IsNotEmpty()
    rootPath: string;

    @ApiProperty({ description: 'Unique identifier for routing/CLI', required: false })
    @IsString()
    @IsOptional()
    slug?: string;

    @ApiProperty({ description: 'Project description', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ description: 'File patterns to include', default: ['**/*'] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    includes?: string[];

    @ApiProperty({ description: 'File patterns to exclude', default: ['**/node_modules/**', '**/.git/**'] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    excludes?: string[];
}
