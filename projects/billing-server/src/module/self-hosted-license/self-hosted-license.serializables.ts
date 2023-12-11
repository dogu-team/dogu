import { CreateSelfHostedLicenseDto } from '@dogu-private/console';
import { stringify } from '@dogu-tech/common';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { v4 } from 'uuid';

import { SelfHostedLicense } from '../../db/entity/self-hosted-license.entity';
import { RetryTransactionContext } from '../../db/retry-transaction';
import { createBillingOrganization } from '../billing-organization/billing-organization.serializables';
import { LicenseKeyService } from '../common/license-key.service';
import { FindSelfHostedLicenseQueryDto } from './self-hosted-license.dto';

export async function findSelfHostedLicense(context: RetryTransactionContext, dto: FindSelfHostedLicenseQueryDto): Promise<SelfHostedLicense> {
  const { manager } = context;
  const { organizationId, licenseKey } = dto;
  const selfHostedLicense = await manager.getRepository(SelfHostedLicense).findOne({
    where: {
      organizationId,
      licenseKey,
    },
    relations: {
      billingOrganization: true,
    },
  });

  if (!selfHostedLicense) {
    throw new NotFoundException(`Organization does not have a self-hosted license. organizationId: ${organizationId}`);
  }

  return selfHostedLicense;
}

export async function createSelfHostedLicense(context: RetryTransactionContext, dto: CreateSelfHostedLicenseDto, now: Date): Promise<SelfHostedLicense> {
  const { manager } = context;
  const { organizationId, expiredAt } = dto;
  const existingLicense = await manager.getRepository(SelfHostedLicense).findOne({ where: { organizationId } });

  if (existingLicense) {
    throw new ConflictException(`Organization already has a self-hosted license. organizationId: ${stringify(organizationId)}`);
  }

  const billingOrganization = await createBillingOrganization(context, { organizationId, category: 'self-hosted' });
  const licenseKey = LicenseKeyService.createLicensKey(now);
  const license = manager.getRepository(SelfHostedLicense).create({
    selfHostedLicenseId: v4(),
    organizationId,
    billingOrganization,
    expiredAt,
    licenseKey,
    category: 'self-hosted',
  });
  const rv = await manager.getRepository(SelfHostedLicense).save(license);
  return rv;
}
