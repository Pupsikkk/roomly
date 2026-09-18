import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { getPrometheusExporter } from '../tracing/start-tracing';

@Controller('metrics')
export class MetricsController {
  @ApiExcludeEndpoint()
  @Get()
  scrape(@Req() req: Request, @Res() res: Response): void {
    const exporter = getPrometheusExporter();
    if (!exporter) {
      res.status(503).type('text/plain').send('# otel metrics disabled\n');
      return;
    }
    exporter.getMetricsRequestHandler(req, res);
  }
}
