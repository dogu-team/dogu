// import { Type } from 'class-transformer';
// import { Equals, IsEnum, IsIn, IsNumber, IsString, IsUUID, ValidateNested } from 'class-validator';
// import { LicenseType, LicenseTypeKey } from 'src/db/model/license';
// import { OrganizationId } from 'src/db/model/license-cloud';
// import { LICENSE_TIER_TYPE } from 'src/db/model/license-tier';

// export class LicenseDtoBase {
//   @IsIn([LicenseTypeKey])
//   licenseType!: LicenseType;

//   @IsEnum(LICENSE_TIER_TYPE)
//   tierType!: LICENSE_TIER_TYPE;

//   @IsNumber()
//   @Type(() => Number)
//   durationDate?: number;
// }

// export class CreateLicenseWithCloudDto extends LicenseDtoBase {
//   @Equals('cloud')
//   declare licenseType: 'cloud';

//   @IsUUID()
//   organizationId!: OrganizationId;
// }

// export class CreateLicenseWithSelfHostedDto extends LicenseDtoBase {
//   @Equals('self-hosted')
//   declare licenseType: 'self-hosted';

//   @IsString()
//   companyName!: string;
// }

// export class CreateLicenseDto {
//   @ValidateNested()
//   @Type(() => LicenseDtoBase, {
//     discriminator: {
//       property: 'licenseType',
//       subTypes: [
//         { value: CreateLicenseWithCloudDto, name: 'cloud' },
//         { value: CreateLicenseWithSelfHostedDto, name: 'self-hosted' },
//       ],
//     },
//     keepDiscriminatorProperty: true,
//   })
//   liceseInfo!: CreateLicenseWithCloudDto | CreateLicenseWithSelfHostedDto;
// }

// // export class CreateLicenseWithCloudDto extends BaseCreateLicenseDto {
// //   @IsUUID()
// //   organizationId!: OrganizationId;

// //   companyName?: never;
// // }

// // export class CreateLicenseWithSelfHostedDto extends BaseCreateLicenseDto {
// //   organizationId?: never;

// //   @IsString()
// //   companyName!: string;
// // }

// // export class CreateLicenseDto {
// //   @IsUUID()
// //   organizationId?: OrganizationId;

// //   @IsString()
// //   companyName?: string;

// //   @IsEnum(LICENSE_TIER_TYPE)
// //   licenseTierId!: LicenseTierId;

// //   constructor(licenseTierId: LicenseTierId, organizationId?: OrganizationId, companyName?: string) {
// //     if ((organizationId && companyName) || (!organizationId && !companyName)) {
// //       throw new Error('Exactly one of organization ID and company name must be provided');
// //     }

// //     this.organizationId = organizationId;
// //     this.companyName = companyName;
// //     this.licenseTierId = licenseTierId;
// //   }
// // }

// // export class RecordTestAction implements RecordTestActionBase {
// //   @IsIn(RecordTestActionTypes)
// //   type!: RecordTestActionType;
// // }

// // export class CreateRecordTestActionWebdriverClickDto extends RecordTestAction implements CreateRecordTestActionWebdriverClickDtoBase {
// //   @Equals('WEBDRIVER_CLICK')
// //   declare type: 'WEBDRIVER_CLICK';
// //   @IsNumber()
// //   videoScreenPositionX!: number;
// //   @IsNumber()
// //   videoScreenPositionY!: number;
// //   @IsNumber()
// //   videoScreenSizeX!: number;
// //   @IsNumber()
// //   videoScreenSizeY!: number;
// // }

// // export class CreateRecordTestActionWebdriverInputDto extends RecordTestAction implements CreateRecordTestActionWebdriverInputDtoBase {
// //   @Equals('WEBDRIVER_INPUT')
// //   declare type: 'WEBDRIVER_INPUT';
// //   @IsString()
// //   value!: string;
// // }

// // export class CreateRecordTestStepDto implements CreateRecordTestStepDtoBase {
// //   @IsUUID()
// //   @ValidateIf((object, value) => value !== null)
// //   prevRecordTestStepId!: RecordTestStepId | null;

// //   @ValidateNested()
// //   @Type(() => RecordTestAction, {
// //     discriminator: {
// //       property: 'type',
// //       subTypes: [
// //         { value: CreateRecordTestActionWebdriverClickDto, name: 'WEBDRIVER_CLICK' },
// //         { value: CreateRecordTestActionWebdriverInputDto, name: 'WEBDRIVER_INPUT' },
// //       ],
// //     },
// //     keepDiscriminatorProperty: true,
// //   })
// //   actionInfo!: CreateRecordTestActionWebdriverClickDto | CreateRecordTestActionWebdriverInputDto;
// // }
