import { UserType } from './user-type.enum';

export class User {
  constructor(
    public readonly id: number,
    public name: string,
    public type: UserType,
    public avatar: string | null,
    public systemPrompt: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static createHuman(name: string): User {
    return new User(
      0, // ID assigned by persistence layer
      name,
      UserType.HUMAN,
      null, // No avatar
      null, // No systemPrompt
      new Date(),
      new Date(),
    );
  }

  static createAgent(name: string): User {
    return new User(
      0,
      name,
      UserType.AGENT,
      null,
      null, // SystemPrompt not used in Phase 1
      new Date(),
      new Date(),
    );
  }
}
