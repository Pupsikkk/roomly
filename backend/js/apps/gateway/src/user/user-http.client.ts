import { HttpException, Injectable } from '@nestjs/common';
import { RoomlyConfigService } from '@roomly/common';
import {
  USER_HTTP_PATHS,
  type CreateUserRequest,
  type UserResponse,
} from '@roomly/contracts';

@Injectable()
export class UserHttpClient {
  constructor(private readonly config: RoomlyConfigService) {}

  private get baseUrl(): string {
    return this.config.services.userServiceUrl.replace(/\/$/, '');
  }

  async createUser(body: CreateUserRequest): Promise<UserResponse> {
    return this.request<UserResponse>(`/${USER_HTTP_PATHS.root}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  async getUserById(id: string): Promise<UserResponse> {
    return this.request<UserResponse>(`/${USER_HTTP_PATHS.root}/${id}`, {
      method: 'GET',
    });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, init);
    const text = await response.text();
    const payload = text ? safeJson(text) : null;

    if (!response.ok) {
      throw new HttpException(
        payload ?? { message: response.statusText },
        response.status,
      );
    }

    return payload as T;
  }
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}
