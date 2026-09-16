import { Injectable } from '@nestjs/common';
import { RoomlyConfigService } from '@roomly/common';

@Injectable()
export class GatewayService {
  constructor(private readonly config: RoomlyConfigService) {}

  getInfo() {
    return {
      service: 'gateway',
      message: 'API Gateway is running',
      userServiceUrl: this.config.services.userServiceUrl,
    };
  }
}
