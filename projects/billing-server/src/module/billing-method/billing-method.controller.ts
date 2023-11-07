import { UpdateBillingMethodResponse, UpdateMethodNiceDto } from '@dogu-private/console';
import { Body, Controller, Put } from '@nestjs/common';

import { BillingTokenPermission } from '../auth/guard/billing-token.guard';
import { BillingMethodNiceService } from './billing-method-nice.service';

@Controller('billing/methods')
export class BillingMethodController {
  constructor(private readonly billingMethodNiceService: BillingMethodNiceService) {}

  @Put()
  @BillingTokenPermission()
  async updateBillingMethod(@Body() dto: UpdateMethodNiceDto): Promise<UpdateBillingMethodResponse> {
    return await this.billingMethodNiceService.updateBillingMethod(dto);
  }
}
