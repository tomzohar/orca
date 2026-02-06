import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    @ApiOperation({ summary: 'Check the health of the application and database' })
    @ApiResponse({ status: 200, description: 'Application is healthy' })
    async getHealth() {
        let dbStatus = 'up';
        try {
            await this.prisma.$queryRaw`SELECT 1`;
        } catch (e) {
            dbStatus = 'down';
        }

        return {
            status: 'ok',
            database: dbStatus,
            timestamp: new Date().toISOString(),
        };
    }
}
