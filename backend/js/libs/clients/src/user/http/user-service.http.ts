import { HttpException, Injectable } from '@nestjs/common';
import { RoomlyConfigService } from '@roomly/common';

/**
 * Outbound HTTP to user-service: JSON body/response by default.
 * Empty / 204 responses resolve to `undefined`.
 */
@Injectable()
export class UserServiceHttp {
  constructor(private readonly config: RoomlyConfigService) {}

  private get baseUrl(): string {
    return this.config.services.userServiceUrl.replace(/\/$/, '');
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      headers:
        body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, init);

    if (response.status === 204 || response.status === 205) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await readOptionalText(response);

    if (!response.ok) {
      throw new HttpException(
        payload ?? { message: response.statusText },
        response.status,
      );
    }

    return payload as T;
  }
}

async function readOptionalText(response: Response): Promise<unknown> {
  const text = await response.text();
  return text ? { message: text } : null;
}
