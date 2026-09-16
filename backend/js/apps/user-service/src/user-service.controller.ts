import { Controller, Get } from '@nestjs/common';
import { UserServiceService } from './user-service.service';

@Controller()
export class UserServiceController {
  constructor(private readonly userServiceService: UserServiceService) {}

  @Get()
  getInfo() {
    return this.userServiceService.getInfo();
  }
}
