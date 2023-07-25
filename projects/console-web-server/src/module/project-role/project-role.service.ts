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

    // const findRoleGroupDao: FindRoleGroupDao = new FindRoleGroupDao(organizationId, dto.name, NaN, NaN);

    // const raws = await this.dataSource.getRepository(RoleGroup).findRoleGroups(findRoleGroupDao);
    // const roleGroups: RoleGroupResponse[] = raws.map((raw) => rawToRoleGroup(raw));

    // if (roleGroups.length > 0) {
    //   throw new HttpException(`role group name: ${dto.name} already exists`, HttpStatus.BAD_REQUEST);
    // }

    // const newRoleGroup = this.dataSource.getRepository(RoleGroup).create({ organizationId, name: dto.name, customise: 1 });
    // const rv = await this.dataSource.getRepository(RoleGroup).save(newRoleGroup);
    // return rv;
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
    // role group 존재 여부 확인
    const projectRole = await this.dataSource.getRepository(ProjectRole).findOne({ where: { projectRoleId, organizationId, customise: 1 } });
    if (!projectRole) {
      throw new HttpException(`projectRoleId: ${projectRoleId} not found`, HttpStatus.NOT_FOUND);
    }

    // role group 이름 중복 확인
    const projectRoleByName = await this.dataSource.getRepository(ProjectRole).findOne({ where: { organizationId, name: dto.name, customise: 1 } });
    if (projectRoleByName) {
      throw new HttpException(`project-role name: ${dto.name} already exists`, HttpStatus.BAD_REQUEST);
    }

    const newData = Object.assign(projectRole, dto);
    const updatedProjectRole = await this.dataSource.getRepository(ProjectRole).save(newData);
    return updatedProjectRole;
  }

  /**
   * fixme: join table remove
   */

  // async deleteRoleGroup(organizationId: OrganizationId, roleGroupId: RoleGroupId): Promise<RoleGroupResponse> {
  //   // role group 존재 여부 확인
  //   const roleGroup = await this.dataSource.getRepository(RoleGroup).findOne({ where: { roleGroupId, organizationId, customise: 1 } });
  //   if (!roleGroup) {
  //     throw new HttpException(`roleGroupId: ${roleGroupId} not found`, HttpStatus.NOT_FOUND);
  //   }

  //   // role group - user 확인
  //   const userRoleGroup = await this.dataSource.getRepository(UserAndRoleGroup).findOne({ where: { roleGroupId } });
  //   if (userRoleGroup) {
  //     throw new HttpException(`roleGroupId: ${roleGroupId} is used by user`, HttpStatus.BAD_REQUEST);
  //   }

  //   // role group - team 확인
  //   const teamRoleGroup = await this.dataSource.getRepository(TeamAndRoleGroup).findOne({ where: { roleGroupId } });
  //   if (teamRoleGroup) {
  //     throw new HttpException(`roleGroupId: ${roleGroupId} is used by team`, HttpStatus.BAD_REQUEST);
  //   }

  //   // role group - project role mapping 데이터 삭제
  //   const projectRoleAndRoleGroups = await this.dataSource.getRepository(ProjectRoleAndRoleGroup).find({ where: { roleGroupId } });
  //   await this.dataSource.getRepository(ProjectRoleAndRoleGroup).remove(projectRoleAndRoleGroups);

  //   // role group 삭제
  //   const deletedRoleGroup = await this.dataSource.getRepository(RoleGroup).remove(roleGroup);
  //   return deletedRoleGroup;
  // }

  // async attachProjectRole(organizationId: OrganizationId, roleGroupId: RoleGroupId, dto: AddProjectRoleDto): Promise<void> {
  //   // role group 존재 여부 확인
  //   const roleGroup = await this.dataSource.getRepository(RoleGroup).findOne({ where: { roleGroupId, organizationId, customise: 1 } });
  //   if (!roleGroup) {
  //     throw new HttpException(`roleGroupId: ${roleGroupId} not found`, HttpStatus.NOT_FOUND);
  //   }

  //   const projectRole = await this.dataSource.getRepository(ProjectRole).findOne({ where: { projectRoleId: dto.projectRoleId } });
  //   if (!projectRole) {
  //     throw new HttpException(`projectRoleId: ${dto.projectRoleId} not found`, HttpStatus.NOT_FOUND);
  //   }

  //   const projectRoleAndRoleGroup = await this.dataSource.getRepository(ProjectRoleAndRoleGroup).findOne({
  //     where: { roleGroupId, projectRoleId: dto.projectRoleId },
  //   });

  //   if (projectRoleAndRoleGroup) {
  //     throw new HttpException(`projectRoleId: ${dto.projectRoleId} already exists`, HttpStatus.CONFLICT);
  //   }
  // }

  // async detachProjectRole(organizationId: OrganizationId, roleGroupId: RoleGroupId, projectRoleId: ProjectRoleId): Promise<void> {
  //   // role group 존재 여부 확인
  //   const roleGroup = await this.dataSource.getRepository(RoleGroup).findOne({ where: { roleGroupId, organizationId, customise: 1 } });
  //   if (!roleGroup) {
  //     throw new HttpException(`roleGroupId: ${roleGroupId} not found`, HttpStatus.NOT_FOUND);
  //   }

  //   const projectRole = await this.dataSource.getRepository(ProjectRole).findOne({ where: { projectRoleId } });
  //   if (!projectRole) {
  //     throw new HttpException(`projectRoleId: ${projectRoleId} not found`, HttpStatus.NOT_FOUND);
  //   }

  //   const projectRoleAndRoleGroup = await this.dataSource.getRepository(ProjectRoleAndRoleGroup).findOne({
  //     where: { roleGroupId, projectRoleId },
  //   });

  //   if (!projectRoleAndRoleGroup) {
  //     throw new HttpException(`projectRoleId: ${projectRoleId} not found`, HttpStatus.NOT_FOUND);
  //   }

  //   await this.dataSource.getRepository(ProjectRoleAndRoleGroup).remove(projectRoleAndRoleGroup);

  //   return;
  // }
}
