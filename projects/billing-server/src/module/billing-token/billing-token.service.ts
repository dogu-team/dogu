import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { IncomingMessage } from 'http';
import { DateTime, DurationLike } from 'luxon';
import { Brackets, DataSource, IsNull, Like, MoreThan } from 'typeorm';
import { v4 } from 'uuid';
import { BillingToken } from '../../db/entity/billing-token.entity';
import { env } from '../../env';
import { DoguLogger } from '../logger/logger';

const billingTokenPrefix = 'billing-token-';
const billingTokenDevelopment = 'billing-token-development';

@Injectable()
export class BillingTokenService implements OnModuleInit {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly logger: DoguLogger,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.createBillingTokenForDevelopment();
    await this.createBillingTokenIfNotExists();
  }

  private async createBillingTokenForDevelopment(): Promise<void> {
    if (env.DOGU_BILLING_RUN_TYPE === 'production' || env.DOGU_BILLING_RUN_TYPE === 'self-hosted') {
      return;
    }

    const token = await this.dataSource //
      .getRepository(BillingToken)
      .createQueryBuilder(BillingToken.name)
      .where({ token: billingTokenDevelopment })
      .getOne();
    if (!token) {
      const newBillingToken = this.dataSource.getRepository(BillingToken).create({
        billingTokenId: v4(),
        token: billingTokenDevelopment,
        expiredAt: null,
      });
      const saved = await this.dataSource.getRepository(BillingToken).save(newBillingToken);
      this.logger.debug(`Created new billing token for development: ${saved.token}`);
    }
  }

  private async createBillingTokenIfNotExists(): Promise<void> {
    const token = await this.dataSource
      .getRepository(BillingToken)
      .createQueryBuilder(BillingToken.name)
      .where({ token: Like(`${billingTokenPrefix}%`) })
      .andWhere(new Brackets((qb) => qb.where({ expiredAt: MoreThan(new Date()) }).orWhere({ expiredAt: IsNull() })))
      .getOne();
    if (!token) {
      const newBillingToken = await this.createBillingToken();
      this.logger.debug(`Created new billing token: ${newBillingToken.token}`);
    }
  }

  async findValidBillingToken(token: string): Promise<BillingToken | null> {
    const billingToken = await this.dataSource
      .getRepository(BillingToken)
      .createQueryBuilder(BillingToken.name)
      .where({ token })
      .andWhere(new Brackets((qb) => qb.where({ expiredAt: MoreThan(new Date()) }).orWhere({ expiredAt: IsNull() })))
      .getOne();
    return billingToken;
  }

  async createBillingToken(): Promise<BillingToken> {
    const billingToken = this.dataSource.getRepository(BillingToken).create({
      billingTokenId: v4(),
      token: BillingTokenService.createBillingToken(),
      expiredAt: null,
    });
    const saved = await this.dataSource.getRepository(BillingToken).save(billingToken);
    return saved;
  }

  async validateBillingApiTokenFromRequest(request: IncomingMessage): Promise<void> {
    const parsedUrl = new URL(request.url ?? '', 'http://localhost');
    const token = parsedUrl.searchParams.get('auth');
    if (!token) {
      throw new Error(`token is required`);
    }

    const billingToken = await this.findValidBillingToken(token);
    if (!billingToken) {
      throw new Error(`token is invalid`);
    }
  }

  static createToken(): string {
    return v4();
  }

  static createExpiredAt(duration: DurationLike): Date {
    return DateTime.now().plus(duration).toJSDate();
  }

  static isExpired(expiredAt: Date | null | string): boolean {
    if (!expiredAt) return false;

    if (typeof expiredAt === 'string') expiredAt = new Date(expiredAt);
    if (expiredAt && expiredAt.getTime() < new Date().getTime()) {
      return true;
    }
    return false;
  }

  static createBillingToken(): string {
    const token = this.createToken();
    return `${billingTokenPrefix}${token}`;
  }
}
