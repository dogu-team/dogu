import { LastAccessOrganizationResponse, UserResponse } from '@dogu-private/console';
import { GoogleOAuthPayload, UserPayload } from '@dogu-private/types';
import { Body, Controller, Get, Head, HttpException, HttpStatus, Inject, NotFoundException, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { env } from '../../env';
import { EmailVerification, GoogleOAuth, GoogleUser, User } from '../../module/auth/decorators';
import { ResetPasswordWithToken, SendVerifyEmailDto, ValidationResetPasswordDto, VerifyEmailDto } from '../../module/registery/dto/registery.dto';
import { clearSignCookiesInResponse, setSignCookiesInResponse } from '../../utils/cookie';
import { EMAIL_VERIFICATION } from '../auth/auth.types';
import { GitlabService } from '../gitlab/gitlab.service';
import { CreateAdminDto, SignInDto } from '../user/dto/user.dto';
import { UserService } from '../user/user.service';
import { RegisteryService } from './registery.service';
import { ResetPasswordService } from './reset-password.service';

@Controller('registery')
export class RegisteryController {
  constructor(
    @Inject(RegisteryService)
    private readonly registeryService: RegisteryService,
    @Inject(UserService)
    private readonly userService: UserService,
    @Inject(GitlabService)
    private readonly gitlabService: GitlabService,
    @Inject(ResetPasswordService)
    private readonly resetPasswordService: ResetPasswordService,
  ) {}

  @Post('signup')
  async signup(
    @Body() createRootUserDto: CreateAdminDto, //
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const { accessToken, refreshToken, userId, organizationId } = await this.registeryService.signUp(createRootUserDto);
    setSignCookiesInResponse(response, accessToken, refreshToken, userId);
    response.send({ organizationId });
  }

  @Post('signin')
  async signIn(
    @Body() signInDto: SignInDto, //
    @Res({ passthrough: true }) response: Response<LastAccessOrganizationResponse>,
  ): Promise<void> {
    const { accessToken, refreshToken, userId } = await this.registeryService.signIn(signInDto);
    const lastAccessOrganizationId = await this.userService.findLastAccessOrganizationId(signInDto.email);
    const res = setSignCookiesInResponse(response, accessToken, refreshToken, userId);
    res.send({ lastAccessOrganizationId });
  }

  @Post('signout')
  signOut(@Res({ passthrough: true }) response: Response): void {
    clearSignCookiesInResponse(response);
    return;
  }

  @Get('access/google')
  @GoogleOAuth()
  async googleAuth(): Promise<void> {}

  @Get('google/callback')
  @GoogleOAuth()
  async googleAuthCallback(@GoogleUser() googleOAuthPayload: GoogleOAuthPayload, @Res() response: Response): Promise<any> {
    const result = await this.registeryService.accessWithThirdParty(googleOAuthPayload);
    setSignCookiesInResponse(response, result.accessToken, result.refreshToken, result.userId);
    const redirectUrl = 'organizationId' in result ? `${env.DOGU_CONSOLE_URL}/dashboard/${result.organizationId}` : `${env.DOGU_CONSOLE_URL}`;
    response.redirect(redirectUrl);
  }

  @Get('check')
  @EmailVerification(EMAIL_VERIFICATION.UNVERIFIED)
  async me(@User() user: UserPayload): Promise<UserResponse> {
    const rv = await this.userService.findOne(user.userId);
    if (rv) {
      return rv;
    }

    throw new NotFoundException();
  }

  @Get('verification')
  async sendVerifyEmail(@Query() dto: SendVerifyEmailDto): Promise<void> {
    return await this.registeryService.sendVerifyEmail(dto);
  }

  @Post('verification')
  async verifyEmail(@Body() dto: VerifyEmailDto): Promise<boolean> {
    const rv = await this.registeryService.vefiryEmail(dto);
    return rv;
  }

  @Post('/password/:email')
  async sendResetPasswordEmail(@Param('email') email: string): Promise<void> {
    await this.resetPasswordService.sendResetPasswordEmail(email);
    return;
  }

  @Head('/password')
  async checkValidResetPassword(@Query() dto: ValidationResetPasswordDto): Promise<boolean> {
    const { email, token } = dto;
    if (await this.resetPasswordService.validateResetPassword(dto)) {
      return true;
    }
    throw new HttpException(`Invalid token`, HttpStatus.BAD_REQUEST);
  }

  @Post('/password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordWithToken): Promise<boolean> {
    await this.resetPasswordService.resetPasswordWithToken(resetPasswordDto);
    return true;
  }
}
