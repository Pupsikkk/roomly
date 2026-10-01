import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RoomlyConfigService } from '@roomly/common';
import type { MediaRecord, MediaStatus } from '@roomly/contracts';
import { S3StorageService } from '@roomly/infra';
import { randomUUID } from 'node:crypto';
import { In, Repository } from 'typeorm';
import { MediaOrmEntity } from '../adapters/outbound/persistence/typeorm/media/media.orm-entity';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

export type UploadInput = {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
  ownerId?: string | null;
};

@Injectable()
export class MediaAppService {
  constructor(
    @InjectRepository(MediaOrmEntity)
    private readonly repo: Repository<MediaOrmEntity>,
    private readonly s3: S3StorageService,
    private readonly config: RoomlyConfigService,
  ) {}

  async upload(input: UploadInput): Promise<{ id: string }> {
    const maxBytes = this.config.s3.maxBytes;
    if (input.size > maxBytes) {
      throw new BadRequestException(`File too large (max ${maxBytes} bytes)`);
    }
    if (!ALLOWED_MIME.has(input.mimetype)) {
      throw new BadRequestException(
        `Unsupported content type: ${input.mimetype}`,
      );
    }

    const id = randomUUID();
    const ext = extensionFor(input.originalname, input.mimetype);
    const storageKey = `uploads/${id}${ext}`;

    await this.s3.putObject({
      key: storageKey,
      body: input.buffer,
      contentType: input.mimetype,
    });

    const row = this.repo.create({
      id,
      storageKey,
      contentType: input.mimetype,
      size: String(input.size),
      originalName: truncateName(input.originalname),
      status: 'ready' satisfies MediaStatus,
      ownerId: input.ownerId ?? null,
    });
    await this.repo.save(row);

    return { id };
  }

  async getById(id: string): Promise<MediaRecord> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Media not found');
    return toRecord(row);
  }

  async lookup(ids: string[]): Promise<MediaRecord[]> {
    const unique = [...new Set(ids.filter(Boolean))];
    if (unique.length === 0) return [];
    const rows = await this.repo.find({ where: { id: In(unique) } });
    const byId = new Map(rows.map((r) => [r.id, r]));
    return unique
      .map((id) => byId.get(id))
      .filter((r): r is MediaOrmEntity => r != null)
      .map(toRecord);
  }

  async openContent(id: string): Promise<{
    body: import('node:stream').Readable;
    contentType: string;
    contentLength: number;
  }> {
    const row = await this.repo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Media not found');

    try {
      const obj = await this.s3.getObject(row.storageKey);
      return {
        body: obj.body,
        contentType: obj.contentType || row.contentType,
        contentLength: obj.contentLength ?? Number(row.size),
      };
    } catch (err) {
      const name = (err as { name?: string; Code?: string })?.name;
      const code = (err as { Code?: string })?.Code;
      if (name === 'NoSuchKey' || name === 'NotFound' || code === 'NoSuchKey') {
        throw new NotFoundException('Media file missing in storage');
      }
      throw err;
    }
  }
}

function toRecord(row: MediaOrmEntity): MediaRecord {
  return {
    id: row.id,
    contentType: row.contentType,
    size: Number(row.size),
    originalName: row.originalName,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

function extensionFor(originalName: string, mime: string): string {
  const fromName = originalName.includes('.')
    ? originalName.slice(originalName.lastIndexOf('.')).toLowerCase()
    : '';
  if (/^\.[a-z0-9]{1,8}$/.test(fromName)) return fromName;
  switch (mime) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/webp':
      return '.webp';
    case 'image/gif':
      return '.gif';
    case 'application/pdf':
      return '.pdf';
    default:
      return '';
  }
}

function truncateName(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? 'file';
  return base.slice(0, 255);
}
