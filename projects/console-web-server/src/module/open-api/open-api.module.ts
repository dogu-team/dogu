import { Module } from '@nestjs/common';
import { OpenApiV1Moudule } from './v1/open-api-v1.module';

@Module({
  imports: [OpenApiV1Moudule],
  exports: [],
})
export class OpenApiMoudule {}
