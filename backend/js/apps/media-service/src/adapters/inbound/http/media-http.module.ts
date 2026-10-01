import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { MediaAppService } from '../../../application/media-app.service';
import { PersistenceModule } from '../../outbound/persistence/persistence.module';

@Module({
  imports: [PersistenceModule],
  controllers: [MediaController],
  providers: [MediaAppService],
})
export class MediaHttpModule {}
