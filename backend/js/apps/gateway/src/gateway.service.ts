import { Injectable } from '@nestjs/common';

@Injectable()
export class GatewayService {
  getInfo() {
    return {
      service: 'gateway',
      message: 'API Gateway is running',
    };
  }
}
