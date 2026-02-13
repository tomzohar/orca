import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { AgentJobsModule } from './agent-jobs/agent-jobs.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { AgentConfigurationsModule } from './agent-configurations/agent-configurations.module';
import { SkillsModule } from './skills/skills.module';
import { GitModule } from './git/git.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ResponseLoggerInterceptor } from './shared/interceptors/response-logger.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    UsersModule,
    ProjectsModule,
    AgentJobsModule,
    AgentConfigurationsModule,
    SkillsModule,
    GitModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseLoggerInterceptor,
    },
  ],
})
export class AppModule { }
