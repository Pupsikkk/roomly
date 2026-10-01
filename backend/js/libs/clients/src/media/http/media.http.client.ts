import { HttpException, Injectable } from '@nestjs/common';
import { RoomlyConfigService } from '@roomly/common';
import {
  MEDIA_HTTP_PATHS,
  MEDIA_OWNER_HEADER,
  type MediaLookupRequest,
  type MediaRecord,
  type MediaUploadResponse,
} from '@roomly/contracts';

@Injectable()
export class MediaHttpClient {
  constructor(private readonly config: RoomlyConfigService) {}

  private get baseUrl(): string {
    return this.config.services.mediaServiceUrl.replace(/\/$/, '');
  }

  async upload(
    file: Express.Multer.File,
    ownerId?: string,
  ): Promise<MediaUploadResponse> {
    const form = new FormData();
    form.append(
      'file',
      new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }),
      file.originalname || 'file',
    );
    const headers: Record<string, string> = {};
    if (ownerId) headers[MEDIA_OWNER_HEADER] = ownerId;

    const response = await fetch(`${this.baseUrl}/${MEDIA_HTTP_PATHS.root}`, {
      method: 'POST',
      headers,
      body: form,
    });
    return this.readJson<MediaUploadResponse>(response);
  }

  getById(id: string): Promise<MediaRecord> {
    return this.getJson<MediaRecord>(`/${MEDIA_HTTP_PATHS.root}/${id}`);
  }

  lookup(ids: string[]): Promise<MediaRecord[]> {
    return this.postJson<MediaRecord[]>(`/${MEDIA_HTTP_PATHS.lookup}`, {
      ids,
    } satisfies MediaLookupRequest);
  }

  async openContent(id: string): Promise<{
    body: ReadableStream<Uint8Array> | null;
    contentType: string;
    contentLength?: number;
  }> {
    const response = await fetch(
      `${this.baseUrl}/${MEDIA_HTTP_PATHS.root}/${id}/content`,
    );
    if (!response.ok) {
      const payload = await response.json().catch(() => null);
      throw new HttpException(
        payload ?? { message: response.statusText },
        response.status,
      );
    }
    const len = response.headers.get('content-length');
    return {
      body: response.body,
      contentType:
        response.headers.get('content-type') ?? 'application/octet-stream',
      contentLength: len ? Number(len) : undefined,
    };
  }

  private getJson<T>(path: string): Promise<T> {
    return this.requestJson<T>(path, { method: 'GET' });
  }

  private postJson<T>(path: string, body: unknown): Promise<T> {
    return this.requestJson<T>(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  private async requestJson<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, init);
    return this.readJson<T>(response);
  }

  private async readJson<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type') ?? '';
    const payload = contentType.includes('application/json')
      ? await response.json().catch(() => null)
      : await response.text().then((t) => (t ? { message: t } : null));

    if (!response.ok) {
      throw new HttpException(
        payload ?? { message: response.statusText },
        response.status,
      );
    }
    return payload as T;
  }
}
