import { Injectable } from '@nestjs/common';

@Injectable()
export class UserServiceService {
  getInfo() {
    return {
      service: 'user-service',
      message: 'User service is running',
    };
  }
}
