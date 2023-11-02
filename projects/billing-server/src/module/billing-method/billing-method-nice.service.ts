import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BillingHistoryService } from '../billing-history/billing-history.service';
import { BillingOrganizationService } from '../billing-organization/billing-organization.service';
import { DoguLogger } from '../logger/logger';
import { BillingMethodNiceCaller } from './billing-method-nice.caller';

@Injectable()
export class BillingMethodNiceService {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly billingMethodNiceCaller: BillingMethodNiceCaller,
    @Inject(forwardRef(() => BillingOrganizationService))
    private readonly billingOrganizationService: BillingOrganizationService,
    private readonly billingHistoryService: BillingHistoryService,
  ) {}
}
