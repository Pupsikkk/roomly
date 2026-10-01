import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  StreamableFile,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  MEDIA_HTTP_PATHS,
  MEDIA_OWNER_HEADER,
  type MediaRecord,
  type MediaUploadResponse,
} from '@roomly/contracts';
import { memoryStorage } from 'multer';
import { MediaAppService } from '../../../application/media-app.service';
import { MediaLookupDto } from './dto/media-lookup.dto';

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

@Controller(MEDIA_HTTP_PATHS.root)
export class MediaController {
  constructor(private readonly media: MediaAppService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: DEFAULT_MAX_BYTES },
    }),
  )
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: DEFAULT_MAX_BYTES }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Headers(MEDIA_OWNER_HEADER) ownerId?: string,
  ): Promise<MediaUploadResponse> {
    return this.media.upload({
      buffer: file.buffer,
      mimetype: file.mimetype,
      originalname: file.originalname,
      size: file.size,
      ownerId: ownerId || null,
    });
  }

  @Post('lookup')
  lookup(@Body() body: MediaLookupDto): Promise<MediaRecord[]> {
    return this.media.lookup(body.ids);
  }

  @Get(':id/content')
  @Header('Cache-Control', 'public, max-age=86400')
  async content(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<StreamableFile> {
    const { body, contentType, contentLength } =
      await this.media.openContent(id);
    return new StreamableFile(body, {
      type: contentType,
      length: contentLength,
    });
  }

  @Get(':id')
  getById(@Param('id', ParseUUIDPipe) id: string): Promise<MediaRecord> {
    return this.media.getById(id);
  }
}
