import {
  DynamicModule,
  Injectable,
  Logger,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { RoomlyConfigService } from '@roomly/common';
import amqp, { type Channel, type ChannelModel } from 'amqplib';
import { RABBITMQ_CONNECTION } from './tokens';

export interface RabbitmqModuleOptions {
  isGlobal?: boolean;
  /** Connect on module init (default: true) */
  connectOnInit?: boolean;
}

@Injectable()
export class RabbitmqConnectionService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(RabbitmqConnectionService.name);
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  constructor(
    private readonly config: RoomlyConfigService,
    private readonly options: RabbitmqModuleOptions = {},
  ) {}

  async onModuleInit() {
    if (this.options.connectOnInit ?? true) {
      await this.connect();
    }
  }

  async connect(): Promise<ChannelModel> {
    if (this.connection) return this.connection;
    this.connection = await amqp.connect(this.config.rabbitmqUrl);
    this.logger.log('RabbitMQ connected');
    return this.connection;
  }

  async getChannel(): Promise<Channel> {
    const connection = await this.connect();
    if (!this.channel) {
      this.channel = await connection.createChannel();
    }
    return this.channel;
  }

  getConnection(): ChannelModel | null {
    return this.connection;
  }

  async onModuleDestroy() {
    try {
      await this.channel?.close();
    } catch {
      /* ignore */
    }
    try {
      await this.connection?.close();
    } catch {
      /* ignore */
    }
    this.channel = null;
    this.connection = null;
  }
}

@Module({})
export class RabbitmqModule {
  static forRoot(options: RabbitmqModuleOptions = {}): DynamicModule {
    return {
      module: RabbitmqModule,
      global: options.isGlobal ?? false,
      providers: [
        {
          provide: RabbitmqConnectionService,
          useFactory: (config: RoomlyConfigService) =>
            new RabbitmqConnectionService(config, options),
          inject: [RoomlyConfigService],
        },
        {
          provide: RABBITMQ_CONNECTION,
          useExisting: RabbitmqConnectionService,
        },
      ],
      exports: [RabbitmqConnectionService, RABBITMQ_CONNECTION],
    };
  }
}
