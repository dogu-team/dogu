import { OrganizationId } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/smtp-transport';
import { Client } from 'pg';

import { BillingCurrency } from '@dogu-private/console';
import { BillingHistory } from '../../db/entity/billing-history.entity';
import { BillingSubscriptionPlanInfo } from '../../db/entity/billing-subscription-plan-info.entity';
import { env } from '../../env';
import { BillingSubscriptionPlanInfoCommonModule } from '../common/plan-info-common.module';
import { DoguLogger } from '../logger/logger';
import { getPurcaseSuccessEmailTemplate } from './emails/purchase-success.tmpl';

@Injectable()
export class ConsoleService {
  private readonly consolePgClient: Client;

  constructor(private readonly logger: DoguLogger) {
    this.consolePgClient = new Client({
      user: 'admin',
      password: 'dogutech',
      database: 'console_web',
      host: 'localhost',
      port: 5432,
    });

    this.consolePgClient.connect().catch((err) => {
      this.logger.error(`Failed to connect console DB`);
    });
  }

  async sendSubscriptionSuccessEmailToOwner(
    organizationId: OrganizationId,
    param: {
      planHistory: BillingHistory;
      plan: BillingSubscriptionPlanInfo;
    },
  ): Promise<void> {
    const ownerUser = await this.consolePgClient.query<{ user_email: string }>(`SELECT u.email as user_email
FROM organization_and_user_and_organization_role ouor
JOIN organization o ON ouor.organization_id = o.organization_id
JOIN "user" u ON ouor.user_id = u.user_id
WHERE o.organization_id = '${organizationId}'
AND ouor.organization_role_id = 1`);

    if (ownerUser.rowCount === 0) {
      throw new Error(`Owner user not found for organization ${organizationId}`);
    }

    const { planHistory, plan } = param;
    const email: string = ownerUser.rows[0].user_email;
    this.sendEmail({
      from: 'Dogu Technologies <no-reply@dogutech.io>',
      to: email,
      subject: '[Dogu] Payment has been successfully completed.',
      html: getPurcaseSuccessEmailTemplate({
        planHistoryId: planHistory.billingHistoryId,
        planName: BillingSubscriptionPlanInfoCommonModule.planTypeDescriptionMap[plan.type],
        optionName:
          plan.option > 1
            ? `${plan.option} ${BillingSubscriptionPlanInfoCommonModule.planOptionDescriptionMap[plan.type].plural}`
            : `${plan.option} ${BillingSubscriptionPlanInfoCommonModule.planOptionDescriptionMap[plan.type].singular}`,
        months: plan.period === 'monthly' ? 1 : 12,
        cardLast4Digits: planHistory.cardNumberLast4Digits ?? '',
        cardName: planHistory.cardName ?? '',
        amount: this.getTotalAmount(plan.currency, planHistory.purchasedAmount ?? 0),
        purchaseDate: planHistory.createdAt,
      }),
    }).catch((err) => {
      this.logger.error(`Failed to send email to ${email}`);
    });
  }

  private async sendEmail(mailOption: MailOptions): Promise<void> {
    try {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: env.DOGU_EMAIL_ID,
          pass: env.DOGU_EMAIL_PW,
        },
      });

      await transporter.sendMail(mailOption);
    } catch (e) {
      this.logger.error(e);
    }
  }

  private getTotalAmount(currency: BillingCurrency, amount: number): string {
    switch (currency) {
      case 'KRW':
        return `₩${amount.toLocaleString('ko-KR')}`;
      case 'USD':
        return `$${amount.toLocaleString('en-US')}`;
      default:
        return `${amount}`;
    }
  }
}
