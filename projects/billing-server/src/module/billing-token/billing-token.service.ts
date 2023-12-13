import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { IncomingMessage } from 'http';
import { DateTime, DurationLike } from 'luxon';
import { Brackets, DataSource, IsNull, Like, MoreThan } from 'typeorm';
import { v4 } from 'uuid';
import { BillingToken } from '../../db/entity/billing-token.entity';
import { env } from '../../env';
import { DateTimeSimulatorService } from '../date-time-simulator/date-time-simulator.service';
import { DoguLogger } from '../logger/logger';

const billingTokenPrefix = 'billing-token-';
const billingTokenDevelopment = 'billing-token-development';

@Injectable()
export class BillingTokenService implements OnModuleInit {
  constructor(
    private readonly logger: DoguLogger,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly dateTimeSimulatorService: DateTimeSimulatorService,
  ) {}

  async onModuleInit(): Promise<void> {
    const now = this.dateTimeSimulatorService.now();
    await this.createBillingTokenForDevelopment();
    await this.createBillingTokenIfNotExists(now);
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

  private async createBillingTokenIfNotExists(now: Date): Promise<void> {
    const token = await this.dataSource
      .getRepository(BillingToken)
      .createQueryBuilder(BillingToken.name)
      .where({ token: Like(`${billingTokenPrefix}%`) })
      .andWhere(new Brackets((qb) => qb.where({ expiredAt: MoreThan(now) }).orWhere({ expiredAt: IsNull() })))
      .getOne();
    if (!token) {
      const newBillingToken = await this.createBillingToken();
      this.logger.debug(`Created new billing token: ${newBillingToken.token}`);
    }
  }

  async findValidBillingToken(token: string, now: Date): Promise<BillingToken | null> {
    const billingToken = await this.dataSource
      .getRepository(BillingToken)
      .createQueryBuilder(BillingToken.name)
      .where({ token })
      .andWhere(new Brackets((qb) => qb.where({ expiredAt: MoreThan(now) }).orWhere({ expiredAt: IsNull() })))
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
    const now = this.dateTimeSimulatorService.now();
    const parsedUrl = new URL(request.url ?? '', 'http://localhost');
    const token = parsedUrl.searchParams.get('token');
    if (!token) {
      throw new Error(`token is required`);
    }

    const billingToken = await this.findValidBillingToken(token, now);
    if (!billingToken) {
      throw new Error(`token is invalid`);
    }
  }

  static createToken(): string {
    return v4();
  }

  static createExpiredAt(duration: DurationLike, now: Date): Date {
    return DateTime.fromJSDate(now).plus(duration).toJSDate();
  }

  static createBillingToken(): string {
    const token = this.createToken();
    return `${billingTokenPrefix}${token}`;
  }
}
