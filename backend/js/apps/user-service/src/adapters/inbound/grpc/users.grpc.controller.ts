import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { userV1 } from '@roomly/contracts';
import { GetUserByIdUseCase } from '../../../application/index';
import { rethrowAsRpc } from './rethrow-as-rpc';

@Controller()
export class UsersGrpcController implements userV1.UserServiceController {
  constructor(private readonly getUserByIdUseCase: GetUserByIdUseCase) {}

  @GrpcMethod('UserService', 'GetUserById')
  async getUserById(
    data: userV1.GetUserByIdRequest,
  ): Promise<userV1.UserResponse> {
    try {
      const user = await this.getUserByIdUseCase.execute(data.id ?? '');
      return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      };
    } catch (err) {
      rethrowAsRpc(err);
    }
  }
}
