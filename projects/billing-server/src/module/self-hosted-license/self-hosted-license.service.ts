import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class SelfHostedLicenseService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  // async getLicense(dto: LicensePayload): Promise<LicenseBase> {
  //   const { licenseToken } = dto;
  //   const companyName = 'companyName' in dto ? dto.companyName : null;
  //   const organizationId = 'organizationId' in dto ? dto.organizationId : null;

  //   if (companyName && organizationId) {
  //     throw new HttpException(`companyName and organizationId are mutually exclusive. companyName: ${companyName}, organizationId: ${organizationId}`, HttpStatus.BAD_REQUEST);
  //   } else if (!companyName && !organizationId) {
  //     throw new HttpException(`companyName or organizationId is required.`, HttpStatus.BAD_REQUEST);
  //   }

  //   const token = await this.dataSource.manager.getRepository(LicenseToken).findOne({ where: { token: licenseToken! } });

  //   const license = await this.dataSource.manager
  //     .getRepository(License) //
  //     .createQueryBuilder('license')
  //     .innerJoinAndSelect(`license.${LicensePropCamel.licenseToken}`, 'licenseToken')
  //     .where({ licenseTokenId: token!.licenseTokenId })
  //     .andWhere({ companyName: companyName ?? IsNull() })
  //     .andWhere({ organizationId: organizationId ?? IsNull() })
  //     .getOne();

  //   if (!license) {
  //     throw new HttpException(`license not found. licenseToken: ${licenseToken!}`, HttpStatus.BAD_REQUEST);
  //   }

  //   await this.dataSource.manager.getRepository(License).update({ licenseId: license.licenseId }, { lastAccessedAt: new Date() });

  //   if (license.type === 'self-hosted') {
  //     const licenseTier = await this.dataSource.manager.getRepository(LicenseSelfHostedTier).findOne({ where: { licenseSelfHostedTierId: license.licenseTierId } });
  //     if (!licenseTier) {
  //       throw new HttpException(`licenseTier not found. licenseTierId: ${license.licenseTierId}`, HttpStatus.BAD_REQUEST);
  //     }
  //     license.licenseTier = licenseTier;
  //   } else {
  //     throw new HttpException('not implemented', HttpStatus.NOT_IMPLEMENTED);
  //   }

  //   return license;
  // }

  // async createLicense(manager: EntityManager, dto: CreateLicenseDto): Promise<string> {
  //   const { licenseInfo } = dto;
  //   const { licenseType, durationDate } = licenseInfo;
  //   const licenseId = v4();
  //   const token = LicenseTokenService.createLicensToken(licenseType);
  //   const licenseTokenId = v4();

  //   const expiredAt = durationDate ? LicenseTokenService.createExpiredAt({ days: durationDate }) : null;

  //   const tokenData = manager.getRepository(LicenseToken).create({ licenseTokenId, token, expiredAt });
  //   await manager.getRepository(LicenseToken).save(tokenData);

  //   if (licenseType === 'cloud') {
  //     throw new HttpException('not implemented', HttpStatus.NOT_IMPLEMENTED);
  //   } else {
  //     const { companyName, enabledBrowserCount, enabledMobileCount, licenseTierName } = licenseInfo;
  //     const tierData = manager
  //       .getRepository(LicenseSelfHostedTier)
  //       .create({ enabledBrowserCount, enabledMobileCount, name: licenseTierName, openApiEnabled: true, doguAgentAutoUpdateEnabled: true });

  //     const licenseTier = await manager.getRepository(LicenseSelfHostedTier).save(tierData);

  //     const newData = manager.getRepository(License).create({ licenseId, licenseTierId: licenseTier.licenseSelfHostedTierId, companyName, type: licenseType, licenseTokenId });
  //     await manager.getRepository(License).save(newData);
  //   }

  //   return token;
  // }

  // async deleteLicense(manager: EntityManager, licenseId: LicenseId): Promise<void> {
  //   const license = await manager.getRepository(License).findOne({ where: { licenseId }, relations: [TOKEN_TABEL_NAME] });

  //   if (!license) {
  //     throw new HttpException(`license not found. licenseId: ${licenseId}`, HttpStatus.NOT_FOUND);
  //   }
  //   const token = license.licenseToken!;

  //   await manager.getRepository(License).softDelete(licenseId);
  //   await manager.getRepository(LicenseToken).softDelete(token.licenseTokenId);
  // }
}
