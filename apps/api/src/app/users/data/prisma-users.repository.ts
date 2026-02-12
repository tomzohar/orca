import { Injectable } from '@nestjs/common';
import { UserType as PrismaUserType } from '../../../../prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { User } from '../domain/user.entity';
import { UserType } from '../domain/user-type.enum';
import type { IUsersRepository } from '../domain/users.repository.interface';

@Injectable()
export class PrismaUsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        name: user.name,
        type: PrismaUserType[user.type],
        avatar: user.avatar,
        systemPrompt: user.systemPrompt,
      },
    });
    return this.mapToEntity(created);
  }

  async findById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    return user ? this.mapToEntity(user) : null;
  }

  async findByNameAndType(name: string, type: UserType): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { name, type: PrismaUserType[type] },
    });
    return user ? this.mapToEntity(user) : null;
  }

  async findByType(type: UserType): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where: { type: PrismaUserType[type] },
    });
    return users.map((u) => this.mapToEntity(u));
  }

  private mapToEntity(prismaUser: {
    id: number;
    name: string;
    type: PrismaUserType;
    avatar: string | null;
    systemPrompt: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      prismaUser.id,
      prismaUser.name,
      UserType[prismaUser.type],
      prismaUser.avatar,
      prismaUser.systemPrompt,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }
}
