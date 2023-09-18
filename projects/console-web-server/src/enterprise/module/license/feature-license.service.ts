import { CreateLicenseDto, FindLicenseDtoBase, FindLicenseWithCloudDto, LicenseId, LicenseResponse } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { FeatureTable } from '../../../feature.config';

@Injectable()
export abstract class FeatureLicenseService {
  constructor(protected readonly key: FeatureTable['licenseModule']) {}

  abstract setLicense(manager: EntityManager, dto: FindLicenseWithCloudDto | FindLicenseDtoBase): Promise<LicenseResponse>;
  abstract createLicense(manager: EntityManager, dto: CreateLicenseDto): Promise<string>;
  abstract renewLicense(manager: EntityManager, dto: FindLicenseWithCloudDto | FindLicenseDtoBase): Promise<LicenseResponse>;
  abstract deleteLicense(licenseId: LicenseId): Promise<void>;
  abstract getLicense(organizationId: OrganizationId | null): Promise<LicenseResponse>;
}
