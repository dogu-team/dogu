import { UpdateOrganizationScmDto } from '@dogu-private/console';
import { OrganizationId } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';
import { OrganizationScm } from '../../../db/entity/organization-scm.entity';
import { EncryptService } from '../../encrypt/encrypt.service';

@Injectable()
export class OrganizationScmService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async updateOrganizationScm(organizationId: OrganizationId, dto: UpdateOrganizationScmDto): Promise<OrganizationScm> {
    const { serviceType, token } = dto;
    const existingScm = await this.dataSource.manager.findOne(OrganizationScm, { where: { organizationId } });

    return await this.dataSource.manager.transaction(async (manager) => {
      const encryptedToken = await EncryptService.encryptToken(manager, organizationId, token);
      if (existingScm) {
        await manager.softRemove(OrganizationScm, existingScm);
        const newScm = manager.create(OrganizationScm, { organizationScmId: v4(), organizationId, serviceType, token: encryptedToken, type: 'git' });
        return await manager.save(OrganizationScm, newScm);
      } else {
        const newScm = manager.create(OrganizationScm, { organizationScmId: v4(), organizationId, serviceType, token: encryptedToken, type: 'git' });
        return await manager.save(OrganizationScm, newScm);
      }
    });
  }

  async deleteOrganizationScm(organizationId: OrganizationId): Promise<void> {
    const existingScm = await this.dataSource.manager.findOne(OrganizationScm, { where: { organizationId } });
    if (existingScm) {
      await this.dataSource.manager.softRemove(OrganizationScm, existingScm);
    }
  }
}
