import { CreateWebResponsiveDtoBase, getWebResponsiveListDtoBase, GetWebResponsiveSnapshotsDtoBase } from '@dogu-private/console';
import { Vendor } from '@dogu-private/device-data';
import { OrganizationId } from '@dogu-private/types';

import { IsArray, IsNotEmpty, IsString } from 'class-validator';
import { PageDto } from '../common/dto/pagination/page.dto';

export class GetWebResponsiveSnapshotsDto implements GetWebResponsiveSnapshotsDtoBase {
  @IsNotEmpty()
  @IsString()
  organizationId!: OrganizationId;

  @IsNotEmpty()
  @IsString()
  testExecutorId!: string;
}

export class GetWebResponsiveListDto extends PageDto implements getWebResponsiveListDtoBase {
  @IsNotEmpty()
  @IsString()
  organizationId!: OrganizationId;
}

export class CreateWebResponsiveDto implements CreateWebResponsiveDtoBase {
  @IsNotEmpty()
  @IsString()
  organizationId!: OrganizationId;

  @IsNotEmpty()
  @IsArray()
  vendors!: Vendor[];

  @IsNotEmpty()
  @IsArray()
  urls!: string[];
}
