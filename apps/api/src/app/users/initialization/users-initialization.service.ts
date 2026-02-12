import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { UsersService } from '../application/users.service';

@Injectable()
export class UsersInitializationService implements OnModuleInit {
  private readonly logger = new Logger(UsersInitializationService.name);

  constructor(private readonly usersService: UsersService) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.usersService.ensureGlobalAgents();
      this.logger.log('Users module initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize users module', error);
      // Don't re-throw to prevent app startup failure
      // The system can still function, but jobs might fail without the Coding Agent
    }
  }
}
