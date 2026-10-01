import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
  type GetObjectCommandOutput,
} from '@aws-sdk/client-s3';
import {
  DynamicModule,
  Injectable,
  Logger,
  Module,
  OnModuleInit,
} from '@nestjs/common';
import { RoomlyConfigService } from '@roomly/common';
import { Readable } from 'node:stream';
import { S3_CLIENT } from './tokens';

export interface S3ModuleOptions {
  isGlobal?: boolean;
  /** Ensure bucket exists on init (default: true) */
  ensureBucket?: boolean;
}

export type PutObjectInput = {
  key: string;
  body: Buffer;
  contentType: string;
};

export type GetObjectResult = {
  body: Readable;
  contentType: string;
  contentLength?: number;
};

@Injectable()
export class S3StorageService implements OnModuleInit {
  private readonly logger = new Logger(S3StorageService.name);
  private readonly ensureBucket: boolean;

  constructor(
    private readonly config: RoomlyConfigService,
    readonly client: S3Client,
    options: S3ModuleOptions = {},
  ) {
    this.ensureBucket = options.ensureBucket ?? true;
  }

  get bucket(): string {
    return this.config.s3.bucket;
  }

  async onModuleInit() {
    if (!this.ensureBucket) return;
    await this.ensureBucketExists();
  }

  async putObject(input: PutObjectInput): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: input.key,
        Body: input.body,
        ContentType: input.contentType,
      }),
    );
  }

  async getObject(key: string): Promise<GetObjectResult> {
    const out: GetObjectCommandOutput = await this.client.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
    if (!out.Body) {
      throw new Error(`Empty body for key ${key}`);
    }
    // Node.js runtime: Body is a Readable stream (SdkStream mixin).
    const body = out.Body as Readable;
    return {
      body,
      contentType: out.ContentType ?? 'application/octet-stream',
      contentLength: out.ContentLength,
    };
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  private async ensureBucketExists() {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`S3 bucket ready: ${this.bucket}`);
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`S3 bucket created: ${this.bucket}`);
    }
  }
}

@Module({})
export class S3Module {
  static forRoot(options: S3ModuleOptions = {}): DynamicModule {
    return {
      module: S3Module,
      global: options.isGlobal ?? false,
      providers: [
        {
          provide: S3_CLIENT,
          useFactory: (config: RoomlyConfigService) => {
            const { endpoint, accessKey, secretKey } = config.s3;
            return new S3Client({
              endpoint,
              region: 'us-east-1',
              forcePathStyle: true,
              credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
              },
            });
          },
          inject: [RoomlyConfigService],
        },
        {
          provide: S3StorageService,
          useFactory: (config: RoomlyConfigService, client: S3Client) =>
            new S3StorageService(config, client, options),
          inject: [RoomlyConfigService, S3_CLIENT],
        },
      ],
      exports: [S3StorageService, S3_CLIENT],
    };
  }
}
