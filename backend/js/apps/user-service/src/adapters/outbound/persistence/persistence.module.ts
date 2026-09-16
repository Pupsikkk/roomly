import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomlyTypeOrmModule } from '@roomly/infra';
import { USER_REPOSITORY } from '../../../application/ports/user.repository';
import { UserOrmEntity } from './typeorm/user/user.orm-entity';
import { UserTypeOrmRepository } from './typeorm/user/user.typeorm-repository';

@Module({
  imports: [
    RoomlyTypeOrmModule.forRoot({
      database: 'user',
      entities: [UserOrmEntity],
      logging: false,
    }),
    TypeOrmModule.forFeature([UserOrmEntity]),
  ],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: UserTypeOrmRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class PersistenceModule {}
