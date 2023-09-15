import { UserAndResetPasswordTokenPropCamel, UserAndResetPasswordTokenPropSnake } from '@dogu-private/console';
import { UserId, USER_RESET_PASSWORD_STATUS } from '@dogu-private/types';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { UserAndResetPasswordToken } from '../../db/entity/relations/user-and-reset-password-token.entity';
import { Token } from '../../db/entity/token.entity';
import { User } from '../../db/entity/user.entity';
import { EmailService } from '../email/email.service';
import { TokenService } from '../token/token.service';
import { ResetPasswordWithToken, ValidationResetPasswordDto } from './dto/registery.dto';

@Injectable()
export class ResetPasswordService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(EmailService)
    private readonly emailService: EmailService,
  ) {}

  async findResetPasswordWithAllRelations(userId: UserId, withDeleted: boolean): Promise<UserAndResetPasswordToken | null> {
    const resetPasswordSelectQueryBuilder = withDeleted //
      ? this.dataSource.getRepository(UserAndResetPasswordToken).createQueryBuilder('resetPassword').withDeleted()
      : this.dataSource.getRepository(UserAndResetPasswordToken).createQueryBuilder('resetPassword');

    const resetPassword = await resetPasswordSelectQueryBuilder //
      .leftJoinAndSelect(`resetPassword.${UserAndResetPasswordTokenPropCamel.token}`, UserAndResetPasswordTokenPropCamel.token)
      .where(`resetPassword.${UserAndResetPasswordTokenPropSnake.user_id} = :userId`, { userId })
      .getOne();

    return resetPassword;
  }

  async sendResetPasswordEmail(email: string): Promise<void> {
    const user = await this.dataSource.getRepository(User).findOne({ where: { email } });
    if (!user) {
      throw new HttpException(`User not found. Email: ${email}`, HttpStatus.NOT_FOUND);
    }

    const resetPassword = await this.findResetPasswordWithAllRelations(user.userId, false);
    await this.dataSource.transaction(async (manager) => {
      const hour = 1000 * 60 * 60;
      const tokenData = this.dataSource.getRepository(Token).create({
        token: TokenService.createToken(),
        expiredAt: TokenService.createExpiredAt(hour),
      });
      const token = await manager.getRepository(Token).save(tokenData);

      if (!resetPassword) {
        const resetPasswordData = manager.getRepository(UserAndResetPasswordToken).create({
          userId: user.userId,
          tokenId: token.tokenId,
          status: USER_RESET_PASSWORD_STATUS.PENDING,
        });
        await manager.getRepository(UserAndResetPasswordToken).save(resetPasswordData);
      } else {
        await manager.getRepository(UserAndResetPasswordToken).update({ userId: user.userId }, { tokenId: token.tokenId, status: USER_RESET_PASSWORD_STATUS.PENDING });
        await manager.getRepository(Token).softDelete({ tokenId: resetPassword.tokenId });
      }

      await this.emailService.sendResetPasswordEmail(user.email, token.token);
    });

    return;
  }

  async resetPasswordWithToken(dto: ResetPasswordWithToken): Promise<void> {
    const { email, token, newPassword, confirmPassword } = dto;
    if (newPassword !== confirmPassword) {
      throw new HttpException('Password does not match', HttpStatus.BAD_REQUEST);
    }

    const user = await this.dataSource.getRepository(User).findOne({ where: { email } });
    if (!user) {
      throw new HttpException(`User not found. Email: ${email}`, HttpStatus.NOT_FOUND);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const resetPassword = await this.dataSource.getRepository(UserAndResetPasswordToken).findOne({
      where: {
        userId: user.userId,
        status: USER_RESET_PASSWORD_STATUS.PENDING,
      },
      relations: [`${UserAndResetPasswordTokenPropCamel.token}`],
    });

    if (!resetPassword) {
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }

    const storedToken = resetPassword.token;
    if (!storedToken) {
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }
    if (storedToken.token !== token) {
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }
    if (TokenService.isExpired(storedToken.expiredAt)) {
      throw new HttpException('Token is expired', HttpStatus.BAD_REQUEST);
    }

    await this.dataSource.transaction(async (manager) => {
      await manager.getRepository(User).update({ userId: user.userId }, { password: hashedPassword });
      await manager.getRepository(UserAndResetPasswordToken).update({ userId: user.userId }, { status: USER_RESET_PASSWORD_STATUS.CONFIRMED });
    });
  }

  async validateResetPassword(dto: ValidationResetPasswordDto): Promise<boolean> {
    const { email, token } = dto;

    const resetPassword = await this.dataSource.getRepository(UserAndResetPasswordToken).findOne({
      where: {
        userId: email,
        status: USER_RESET_PASSWORD_STATUS.PENDING,
      },
      relations: [`${UserAndResetPasswordTokenPropCamel.token}`],
    });
    if (!resetPassword) {
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }

    const storedToken = resetPassword.token;
    if (!storedToken) {
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }
    if (storedToken.token !== token) {
      throw new HttpException('Invalid token', HttpStatus.BAD_REQUEST);
    }
    if (TokenService.isExpired(storedToken.expiredAt)) {
      throw new HttpException('Token is expired', HttpStatus.BAD_REQUEST);
    }
    return true;
  }
}
