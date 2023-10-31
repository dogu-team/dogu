import { Controller, Get, Patch } from '@nestjs/common';

import { ORGANIZATION_ROLE } from '../auth/auth.types';
import { OrganizationPermission } from '../auth/decorators';
import { BillingService } from './billing.service';

@Controller('billing')
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Get('payment-method')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  getPaymentMethod(): any {
    return this.billingService.getPaymentMethod();
  }

  @Patch('payment-method')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  updatePaymentMethod(): any {
    return this.billingService.updatePaymentMethod();
  }

  @Get('invoices')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  getBillingHistory(): any {
    return this.billingService.getBillingHistory();
  }
}
