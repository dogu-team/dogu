import { CreateLicenseDto, LicenseBase, LicenseId } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { FeatureTable } from '../../../feature.config';

@Injectable()
export abstract class FeatureLicenseService {
  constructor(protected readonly key: FeatureTable['licenseVerification']) {}

  abstract createLicense(manager: EntityManager, dto: CreateLicenseDto): Promise<string>;
  abstract renewLicense(licenseId: LicenseId, dto: CreateLicenseDto): Promise<string>;
  abstract deleteLicense(licenseId: LicenseId): Promise<void>;
  abstract getLicense(organizationId: OrganizationId, licenseId: LicenseId): Promise<LicenseBase>;
}
