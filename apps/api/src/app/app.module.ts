import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AgentJobsModule } from './agent-jobs/agent-jobs.module';
import { ProjectsModule } from './projects/projects.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    ProjectsModule,
    AgentJobsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
