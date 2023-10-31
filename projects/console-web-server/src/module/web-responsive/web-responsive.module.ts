import { Module } from '@nestjs/common';
import { WebResponsiveController } from './web-responsive.controller';
import { WebResponsiveService } from './web-responsive.service';

@Module({
  imports: [],
  controllers: [WebResponsiveController],
  providers: [WebResponsiveService],
})
export class WebResponsiveModule {}
