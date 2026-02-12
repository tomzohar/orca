import { Injectable, Logger, Inject } from '@nestjs/common';
import { User } from '../domain/user.entity';
import { UserType } from '../domain/user-type.enum';
import type { IUsersRepository } from '../domain/users.repository.interface';
import { USERS_REPOSITORY } from '../domain/users.repository.interface';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly repository: IUsersRepository,
  ) {}

  /**
   * Ensures the global Coding Agent exists.
   * Called during application initialization.
   * Idempotent: safe to call multiple times.
   */
  async ensureGlobalAgents(): Promise<void> {
    const existing = await this.repository.findByNameAndType(
      'Coding Agent',
      UserType.AGENT,
    );

    if (existing) {
      this.logger.log('Coding Agent already exists');
      return;
    }

    const agent = User.createAgent('Coding Agent');
    await this.repository.create(agent);
    this.logger.log('Created Coding Agent user');
  }

  /**
   * Gets or creates a Human user for a project.
   * Each project gets its own "Human" user.
   *
   * @param projectIdentifier - Unique identifier for the project (e.g., slug or rootPath)
   * @returns The Human user for this project
   */
  async ensureProjectOwner(projectIdentifier: string): Promise<User> {
    // For Phase 1, all projects use a user named "Human"
    // In the future, we could use projectIdentifier to create per-project users
    const existing = await this.repository.findByNameAndType(
      'Human',
      UserType.HUMAN,
    );

    if (existing) {
      return existing;
    }

    const human = User.createHuman('Human');
    const created = await this.repository.create(human);
    this.logger.log(`Created Human user for project: ${projectIdentifier}`);
    return created;
  }

  /**
   * Returns the Coding Agent user.
   * Used by the orchestrator to assign jobs to the agent.
   */
  async getCodingAgent(): Promise<User> {
    const agent = await this.repository.findByNameAndType(
      'Coding Agent',
      UserType.AGENT,
    );

    if (!agent) {
      throw new Error('Coding Agent not found. Initialization may have failed.');
    }

    return agent;
  }

  /**
   * Find user by ID.
   * Used when loading job relations.
   */
  async findById(id: number): Promise<User | null> {
    return this.repository.findById(id);
  }
}
