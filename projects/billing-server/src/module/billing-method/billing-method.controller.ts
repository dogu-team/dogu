import { FindBillingMethodDto, FindBillingMethodResponse, UpdateBillingMethodResponse, UpdateMethodNiceDto } from '@dogu-private/console';
import { Body, Controller, Get, Put, Query } from '@nestjs/common';

import { BillingTokenPermission } from '../auth/guard/billing-token.guard';
import { BillingMethodNiceService } from './billing-method-nice.service';

@Controller('billing/methods')
export class BillingMethodController {
  constructor(private readonly billingMethodNiceService: BillingMethodNiceService) {}

  @Get()
  @BillingTokenPermission()
  /**
   * 나중에 다른 PG사를 추가하면, billing-organization에 어떤 pg사를 사용하는지 저장해야함.
   * 그리고 이 API에서는 해당 pg사의 카드정보가 저장된 billing-method를 리턴해야함.
   * 현재는 NICE만 사용하므로, NICE의 billing-method를 리턴
   */
  async findBillingMethod(@Query() dto: FindBillingMethodDto): Promise<FindBillingMethodResponse> {
    return await this.billingMethodNiceService.findBillingMethods(dto);
  }

  @Put()
  @BillingTokenPermission()
  async updateBillingMethod(@Body() dto: UpdateMethodNiceDto): Promise<UpdateBillingMethodResponse> {
    return await this.billingMethodNiceService.updateBillingMethod(dto);
  }
}
