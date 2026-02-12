import type { User } from './user.entity';
import type { UserType } from './user-type.enum';

export interface IUsersRepository {
  create(user: User): Promise<User>;
  findById(id: number): Promise<User | null>;
  findByNameAndType(name: string, type: UserType): Promise<User | null>;
  findByType(type: UserType): Promise<User[]>;
}

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');
