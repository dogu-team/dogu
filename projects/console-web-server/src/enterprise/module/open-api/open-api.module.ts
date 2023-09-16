import { Module } from '@nestjs/common';
import { V1OpenApiMoudule } from './v1/open-api.module';

@Module({
  imports: [V1OpenApiMoudule],
  exports: [],
})
export class OpenApiMoudule {}
