import { Module } from '@nestjs/common';
import { RabbitmqModule } from '@roomly/infra';
import { UserCreatedConsumer } from './user-created.consumer';

@Module({
  imports: [RabbitmqModule.forRoot()],
  providers: [UserCreatedConsumer],
})
export class EventsModule {}
