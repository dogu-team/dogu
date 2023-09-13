import { CreateLicenseDto, FindLicenseDtoBase, FindLicenseWithCloudDto, LicenseBase, LicenseId } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { FeatureTable } from '../../../feature.config';

@Injectable()
export abstract class FeatureLicenseService {
  constructor(protected readonly key: FeatureTable['licenseVerification']) {}

  abstract setLicense(manager: EntityManager, organizationId: OrganizationId, dto: FindLicenseWithCloudDto | FindLicenseDtoBase): Promise<LicenseBase>;
  abstract createLicense(manager: EntityManager, dto: CreateLicenseDto): Promise<string>;
  abstract renewLicense(manager: EntityManager, organizationId: OrganizationId, dto: FindLicenseDtoBase): Promise<LicenseBase>;
  abstract deleteLicense(licenseId: LicenseId): Promise<void>;
  abstract getLicense(organizationId: OrganizationId): Promise<LicenseBase>;
}
