import { BillingResult, CreateOrUpdateMethodPaddleDto, UpdateBillingMethodResponse, UpdateMethodNiceDto } from '@dogu-private/console';
import { Body, Controller, Put } from '@nestjs/common';
import { BillingMethodPaddle } from '../../db/entity/billing-method-paddle.entity';

import { BillingTokenPermission } from '../auth/guard/billing-token.guard';
import { BillingMethodNiceService } from './billing-method-nice.service';
import { BillingMethodPaddleService } from './billing-method-paddle.service';

@Controller('billing/methods')
export class BillingMethodController {
  constructor(
    private readonly billingMethodNiceService: BillingMethodNiceService,
    private readonly billingMethodPaddleService: BillingMethodPaddleService,
  ) {}

  @Put()
  @BillingTokenPermission()
  async updateBillingMethod(@Body() dto: UpdateMethodNiceDto): Promise<UpdateBillingMethodResponse> {
    return await this.billingMethodNiceService.updateBillingMethod(dto);
  }

  @Put('/paddle')
  @BillingTokenPermission()
  async createOrUpdateBillingMethodPaddle(@Body() dto: CreateOrUpdateMethodPaddleDto): Promise<BillingResult<BillingMethodPaddle>> {
    return await this.billingMethodPaddleService.createOrUpdate(dto);
  }
}
