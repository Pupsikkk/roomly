import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomlyTypeOrmModule } from '@roomly/infra';
import { MediaOrmEntity } from './typeorm/media/media.orm-entity';

@Module({
  imports: [
    RoomlyTypeOrmModule.forRoot({
      database: 'media',
      entities: [MediaOrmEntity],
      logging: false,
    }),
    TypeOrmModule.forFeature([MediaOrmEntity]),
  ],
  exports: [TypeOrmModule],
})
export class PersistenceModule {}
