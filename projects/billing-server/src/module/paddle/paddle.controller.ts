import { FindPaddlePriceDto, FindPaddlePriceResponse } from '@dogu-private/console';
import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { DoguLogger } from '../logger/logger';
import { PaddleNotificationService } from './paddle.notification.service';
import { PaddleService } from './paddle.service';

@Controller('/paddle')
export class PaddleController {
  constructor(
    private readonly logger: DoguLogger,
    private readonly paddleNotificationService: PaddleNotificationService,
    private readonly paddleService: PaddleService,
  ) {}

  @Post('/on-notification')
  async onNotification(@Headers('Paddle-Signature') paddleSignature: string, @Body() body: unknown): Promise<void> {
    await this.paddleNotificationService.onNotification(paddleSignature, body);
  }

  @Get('/prices')
  async findPrice(@Query() dto: FindPaddlePriceDto): Promise<FindPaddlePriceResponse> {
    return await this.paddleService.findPrice(dto);
  }
}
