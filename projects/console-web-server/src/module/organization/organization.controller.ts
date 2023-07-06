import {
  OrganizationBase,
  OrganizationPropCamel,
  OrganizationResponse,
  UserAndInvitationTokenBase,
  UserAndInvitationTokenPropCamel,
  UserBase,
  UserPropCamel,
} from '@dogu-private/console';
import { OrganizationId, UserId, UserPayload } from '@dogu-private/types';
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Inject, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FeatureConfig } from '../../feature.config';
import { EMAIL_VERIFICATION, ORGANIZATION_ROLE } from '../../module/auth/auth.types';
import { EmailVerification, OrganizationPermission, User } from '../../module/auth/decorators';
import { ImageFileParser } from '../../utils/file';
import { Page } from '../common/dto/pagination/page';
import { FindUsersByOrganizationIdDto } from '../user/dto/user.dto';
import { UserService } from '../user/user.service';
import { createOrganizationDto, FindInvitationsDto, InviteEmailDto, UpdateOrganizationDto, UpdateOrganizationOwnerDto, UpdateOrganizationRoleDto } from './dto/organization.dto';
import { OrganizationService } from './organization.service';

@Controller('organizations')
export class OrganizationController {
  constructor(
    @Inject(OrganizationService)
    private organizationService: OrganizationService,
    @Inject(UserService)
    private readonly userService: UserService,
  ) {}

  @Post('')
  @EmailVerification(EMAIL_VERIFICATION.VERIFIED)
  async createOrganization(@User() userPayload: UserPayload, @Body() dto: createOrganizationDto): Promise<OrganizationBase> {
    const rv = await this.organizationService.createOrganization(userPayload.userId, dto);
    return rv;
  }

  @Get(':organizationId')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findOrganizationByOrganizationId(@Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId): Promise<OrganizationResponse> {
    const rv = await this.organizationService.findOrganizationByOrganizationId(organizationId);
    return rv;
  }

  @Get(':organizationId/public')
  async findOrganizationByOrganizationIdPublic(@Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId): Promise<OrganizationResponse> {
    const rv = await this.organizationService.findOrganizationByIdPublic(organizationId);
    return rv;
  }

  @Patch(':organizationId')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async updateOrganization(
    @User() userPayload: UserPayload,
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<OrganizationResponse> {
    const rv = await this.organizationService.updateOrganization(userPayload, organizationId, dto);
    return rv;
  }

  @Post(':organizationId/image')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  async uploadOrganizationImage(
    @User() userPayload: UserPayload,
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @UploadedFile(ImageFileParser) image: Express.Multer.File,
  ): Promise<OrganizationResponse> {
    const rv = await this.organizationService.uploadOrganizationImage(userPayload, organizationId, image);
    return rv;
  }

  @Get(':organizationId/api-token')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async findApiToken(
    @User() userPayload: UserPayload, //
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
  ): Promise<string> {
    const rv = await this.organizationService.findApiToken(organizationId);
    return rv;
  }

  @Post(':organizationId/api-token')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async regenerateApiToken(
    @User() userPayload: UserPayload, //
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
  ): Promise<string> {
    const rv = await this.organizationService.regenerateToken(organizationId, userPayload.userId);
    return rv;
  }

  @Delete(':organizationId/api-token')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async softRemoveApiToken(
    @User() userPayload: UserPayload, //
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
  ): Promise<void> {
    await this.organizationService.deleteApiToken(organizationId, userPayload.userId);
  }

  @Delete(':organizationId')
  @OrganizationPermission(ORGANIZATION_ROLE.OWNER)
  async softRemoveOrganization(@User() userPayload: UserPayload, @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId): Promise<void> {
    await this.organizationService.softRemoveOrganization(userPayload, organizationId);
  }

  // Member API
  @Get(':organizationId/users')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findUsersByOrganizationId(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Query() dto: FindUsersByOrganizationIdDto,
  ): Promise<Page<UserBase>> {
    const rv = await this.userService.findUsersByOrganizationId(organizationId, dto);
    return rv;
  }

  @Patch(':organizationId/owner')
  @OrganizationPermission(ORGANIZATION_ROLE.OWNER)
  async updateOwner(
    @User() userPayload: UserPayload,
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId,
    @Body() dto: UpdateOrganizationOwnerDto,
  ): Promise<void> {
    await this.organizationService.updateOwner(userPayload.userId, organizationId, dto);
  }

  @Patch(':organizationId/users/:userId/role')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async updateOrganizationUserRole(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param(UserPropCamel.userId) userId: UserId,
    @User() userPayload: UserPayload,
    @Body() dto: UpdateOrganizationRoleDto,
  ): Promise<void> {
    if (userPayload.userId === userId) {
      throw new HttpException('You can not change your own role', HttpStatus.BAD_REQUEST);
    }
    await this.organizationService.updateOrganizationUserRole(userId, organizationId, dto);
  }

  // invitation
  @Get(':organizationId/invitations')
  @OrganizationPermission(ORGANIZATION_ROLE.MEMBER)
  async findInvitationsByOrganizationId(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Query() dto: FindInvitationsDto,
  ): Promise<Page<UserAndInvitationTokenBase>> {
    const rv = await this.organizationService.findInvitationsByOrganizationId(organizationId, dto);
    return rv;
  }

  @Post(':organizationId/invitations/emails')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  @EmailVerification(EMAIL_VERIFICATION.VERIFIED)
  async sendInviteEmail(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @User() userPayload: UserPayload,
    @Body() dto: InviteEmailDto,
  ): Promise<void> {
    if (FeatureConfig.get('forceInvitation')) {
      await this.organizationService.forceInviteUser(organizationId, userPayload.userId, dto);
    } else {
      await this.organizationService.sendInviteEmail(organizationId, userPayload.userId, dto);
    }
    return;
  }

  @Delete(':organizationId/invitations/emails/:email')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async softDeleteInviteEmail(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param(UserAndInvitationTokenPropCamel.email) email: string,
    // @User() userPayload: UserPayload,
  ): Promise<void> {
    await this.organizationService.softRemoveInvitation(organizationId, email);
    return;
  }

  @Delete(':organizationId/users/:userId')
  @OrganizationPermission(ORGANIZATION_ROLE.ADMIN)
  async softRemoveMember(
    @Param(OrganizationPropCamel.organizationId) organizationId: OrganizationId, //
    @Param(UserPropCamel.userId) userId: UserId,
    @User() user: UserPayload,
  ): Promise<void> {
    if (userId === user.userId) {
      throw new HttpException('You can not remove yourself', HttpStatus.BAD_REQUEST);
    }

    await this.userService.softRemoveUserFromOrganization(organizationId, userId);
    return;
  }
}
