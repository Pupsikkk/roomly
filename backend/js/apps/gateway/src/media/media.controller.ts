import {
  Controller,
  Get,
  Header,
  HttpStatus,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { MediaHttpClient } from '@roomly/clients/media/http';
import {
  AUTH_COOKIE_NAMES,
  MEDIA_HTTP_PATHS,
  type AccessTokenClaims,
  type MediaResponse,
  type MediaUploadResponse,
} from '@roomly/contracts';
import type { Response } from 'express';
import { memoryStorage } from 'multer';
import { Readable } from 'node:stream';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MediaResponseDto } from './dto/media-response.dto';
import { MediaUploadResponseDto } from './dto/media-upload-response.dto';

const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

@ApiTags('media')
@Controller(MEDIA_HTTP_PATHS.root)
export class MediaController {
  constructor(private readonly media: MediaHttpClient) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: DEFAULT_MAX_BYTES },
    }),
  )
  @ApiCookieAuth(AUTH_COOKIE_NAMES.access)
  @ApiOperation({
    summary: 'Upload media; returns UUID for domain services to store',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiCreatedResponse({ type: MediaUploadResponseDto })
  @ApiUnauthorizedResponse()
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
    @CurrentUser() user: AccessTokenClaims,
  ): Promise<MediaUploadResponse> {
    return this.media.upload(file, user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Media metadata for UI (resolved on gateway)' })
  @ApiOkResponse({ type: MediaResponseDto })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MediaResponse> {
    const record = await this.media.getById(id);
    return toMediaResponse(record);
  }

  @Get(':id/content')
  @Header('Cross-Origin-Resource-Policy', 'cross-origin')
  @Header('Cache-Control', 'public, max-age=86400')
  @ApiOperation({ summary: 'Stream media bytes' })
  @ApiOkResponse({ description: 'Raw file bytes' })
  async content(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ): Promise<void> {
    const obj = await this.media.openContent(id);
    res.status(HttpStatus.OK);
    res.setHeader('Content-Type', obj.contentType);
    if (obj.contentLength != null) {
      res.setHeader('Content-Length', String(obj.contentLength));
    }
    if (!obj.body) {
      res.end();
      return;
    }
    Readable.fromWeb(obj.body as import('node:stream/web').ReadableStream).pipe(
      res,
    );
  }
}

function toMediaResponse(
  record: Awaited<ReturnType<MediaHttpClient['getById']>>,
): MediaResponse {
  return {
    id: record.id,
    url: `/${MEDIA_HTTP_PATHS.root}/${record.id}/content`,
    contentType: record.contentType,
    size: record.size,
    originalName: record.originalName,
    status: record.status,
    createdAt: record.createdAt,
  };
}
