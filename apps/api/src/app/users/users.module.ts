import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersService } from './application/users.service';
import { PrismaUsersRepository } from './data/prisma-users.repository';
import { USERS_REPOSITORY } from './domain/users.repository.interface';
import { UsersInitializationService } from './initialization/users-initialization.service';

@Module({
  imports: [PrismaModule],
  providers: [
    UsersService,
    UsersInitializationService,
    {
      provide: USERS_REPOSITORY,
      useClass: PrismaUsersRepository,
    },
  ],
  exports: [UsersService],
})
export class UsersModule {}
