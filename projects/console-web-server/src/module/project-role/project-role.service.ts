import { ProjectRoleBase, ProjectRolePropCamel, ProjectRolePropSnake } from '@dogu-private/console';
import { OrganizationId, ProjectRoleId } from '@dogu-private/types';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { Brackets, DataSource } from 'typeorm';
import { ProjectRole } from '../../db/entity/project-role.entity';
import { EMPTY_PAGE, Page } from '../common/dto/pagination/page';
import { FindProjectRoleDto, UpdateProjectRoleDto } from './dto/project-role.dto';

@Injectable()
export class ProjectRoleService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async createProjectRole(organizationId: OrganizationId, dto: UpdateProjectRoleDto): Promise<ProjectRoleBase> {
    const projejctRoles = await this.dataSource
      .getRepository(ProjectRole) //
      .createQueryBuilder('projectRole')
      .where(
        new Brackets((qb) => {
          qb.where(`projectRole.${ProjectRolePropSnake.organization_id} = :${ProjectRolePropCamel.organizationId}`, { organizationId })
            .andWhere(`projectRole.${ProjectRolePropSnake.name} = :name`, { name: dto.name })
            .andWhere(`projectRole.${ProjectRolePropSnake.customise} = :${ProjectRolePropCamel.customise}`, { customise: 1 });
        }),
      )
      .orWhere(
        new Brackets((qb) => {
          qb.where(`projectRole.${ProjectRolePropSnake.name} = :name`, { name: dto.name }) //
            .andWhere(`projectRole.${ProjectRolePropSnake.customise} = :${ProjectRolePropCamel.customise}`, { customise: 0 });
        }),
      )
      .getMany();

    if (projejctRoles.length > 0) {
      throw new HttpException(`project-role name: ${dto.name} already exists`, HttpStatus.BAD_REQUEST);
    }

    const newData = this.dataSource.getRepository(ProjectRole).create({ organizationId, name: dto.name, customise: 1 });
    const rv = await this.dataSource.getRepository(ProjectRole).save(newData);
    return rv;
  }

  async findProjectRole(organizationId: OrganizationId, dto: FindProjectRoleDto): Promise<Page<ProjectRoleBase>> {
    const rv = await this.dataSource
      .getRepository(ProjectRole) //
      .createQueryBuilder('projectRole')
      .where(
        new Brackets((qb) => {
          qb.where(`projectRole.${ProjectRolePropSnake.organization_id} = :${ProjectRolePropCamel.organizationId}`, { organizationId })
            .andWhere(`projectRole.${ProjectRolePropSnake.name} ILIKE :keyword`, { keyword: `%${dto.keyword}%` })
            .andWhere(`projectRole.${ProjectRolePropSnake.customise} = :${ProjectRolePropCamel.customise}`, { customise: 1 });
        }),
      )
      .orWhere(
        new Brackets((qb) => {
          qb.where(`projectRole.${ProjectRolePropSnake.name} ILIKE :keyword`, { keyword: `%${dto.keyword}%` }) //
            .andWhere(`projectRole.${ProjectRolePropSnake.customise} = :${ProjectRolePropCamel.customise}`, { customise: 0 });
        }),
      )
      .orderBy(`projectRole.${ProjectRolePropCamel.projectRoleId}`, 'ASC')
      .skip(dto.getDBOffset())
      .take(dto.getDBLimit())
      .getManyAndCount();

    const projectRole = rv[0];
    if (projectRole.length === 0) {
      return EMPTY_PAGE;
    }

    const count = rv[1];
    const page = new Page<ProjectRoleBase>(dto.page, dto.offset, count, projectRole);
    return page;
  }

  async updateProjectRole(organizationId: string, projectRoleId: ProjectRoleId, dto: UpdateProjectRoleDto): Promise<ProjectRoleBase> {
    const projectRole = await this.dataSource.getRepository(ProjectRole).findOne({ where: { projectRoleId, organizationId, customise: 1 } });
    if (!projectRole) {
      throw new HttpException(`projectRoleId: ${projectRoleId} not found`, HttpStatus.NOT_FOUND);
    }

    const projectRoleByName = await this.dataSource.getRepository(ProjectRole).findOne({ where: { organizationId, name: dto.name, customise: 1 } });
    if (projectRoleByName) {
      throw new HttpException(`project-role name: ${dto.name} already exists`, HttpStatus.BAD_REQUEST);
    }

    const newData = Object.assign(projectRole, dto);
    const updatedProjectRole = await this.dataSource.getRepository(ProjectRole).save(newData);
    return updatedProjectRole;
  }
}
