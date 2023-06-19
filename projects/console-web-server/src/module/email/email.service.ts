import { OrganizationBase, UserBase } from '@dogu-private/console';
import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/smtp-transport';
import { User } from '../../db/entity/user.entity';
import { getInvitationEmailTemplate } from '../../module/email/tmpl/invite.tmpl';

import { getVerifyEmailTemplate } from '../../module/email/tmpl/verify-email.tmpl';
import { DoguLogger } from '../logger/logger';
import { getResetPasswordEmailTemplate } from './tmpl/reset-password.tmpl';
import { getWelcomeEmailTemplate } from './tmpl/welcome.tmpl';

@Injectable()
export class EmailService {
  constructor(private readonly logger: DoguLogger) {}

  async sendWelcomeEmail(user: User): Promise<void> {
    const mailOption: MailOptions = {
      from: 'Dogu Technologies <no-reply@dogutech.io>',
      to: user.email,
      subject: '[Dogu] Welcome to Dogu!',
      html: getWelcomeEmailTemplate(user),
    };
    await this.sendEmail(mailOption);
  }

  async sendVerifyEmail(user: User, token: string): Promise<void> {
    const mailOption: MailOptions = {
      from: 'Dogu Technologies <no-reply@dogutech.io>',
      to: user.email,
      subject: '[Dogu] Verify your email',
      html: getVerifyEmailTemplate(user, token),
    };
    await this.sendEmail(mailOption);
  }

  async sendInvitationEmail(
    organization: OrganizationBase, //
    inviter: UserBase,
    email: string,
    token: string,
  ): Promise<void> {
    const mailOption: MailOptions = {
      from: 'Dogu Technologies <no-reply@dogutech.io>',
      to: email,
      subject: `[Dogu] You're invited by ${organization.name}`,
      html: getInvitationEmailTemplate(organization, inviter, email, token),
    };
    await this.sendEmail(mailOption);
  }

  async sendResetPasswordEmail(email: string, token: string): Promise<void> {
    const mailOption: MailOptions = {
      from: 'Dogu Technologies <no-reply@dogutech.io>',
      to: email,
      subject: '[Dogu] Reset your password',
      html: getResetPasswordEmailTemplate(email, token),
    };
    await this.sendEmail(mailOption);
  }

  private async sendEmail(mailOption: MailOptions): Promise<void> {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.DOGU_EMAIL_ID,
          pass: process.env.DOGU_EMAIL_PW,
        },
      });

      await transporter.sendMail(mailOption);
    } catch (e) {
      this.logger.error(e);
    }
  }
}
