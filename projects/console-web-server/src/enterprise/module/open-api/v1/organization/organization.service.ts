import { CREATOR_TYPE, OrganizationId, UserId } from '@dogu-private/types';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Organization } from '../../../../../db/entity/organization.entity';
import { OrganizationApplicationService } from '../../../../../module/organization/application/application.service';

@Injectable()
export class V1OrganizationService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(OrganizationApplicationService)
    private readonly applicationService: OrganizationApplicationService,
  ) {}

  async uploadApplication(file: Express.Multer.File, organizationId: OrganizationId, creatorUserId: UserId | null, creatorType: CREATOR_TYPE): Promise<void> {
    const organization = await this.dataSource.getRepository(Organization).findOne({
      where: { organizationId },
    });

    if (!organization) {
      throw new NotFoundException(`Organization is not found: ${organizationId}`);
    }

    await this.dataSource.transaction(async (manager) => {
      await this.applicationService.uploadApplication(manager, file, creatorUserId, creatorType, organizationId);
    });
  }
}
