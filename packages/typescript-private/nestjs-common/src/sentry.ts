import { stringify } from '@dogu-tech/common';
import { Logger } from '@dogu-tech/node';
import * as Sentry from '@sentry/node';
import Transport from 'winston-transport';

export function initSentry(useSentry: boolean, option: Sentry.NodeOptions): void {
  if (!useSentry) {
    return;
  }
  Sentry.init(option);
}

export function handleLoggerCreateWithSentry(useSentry: boolean, logger: Logger): void {
  if (!useSentry) {
    return;
  }
  logger.winstonLogger().add(new SentryBreadCrumbTrasponrt(logger.category));
}

export class SentryBreadCrumbTrasponrt extends Transport {
  constructor(private readonly category: string) {
    super();
  }

  override log(info: Record<string, unknown>, callback: () => void): void {
    Sentry.addBreadcrumb({
      type: 'default',
      category: this.category,
      message: stringify(info.message),
      level: stringify(info.level) as Sentry.SeverityLevel,
      data: (info?.meta as Record<string, unknown>) ?? {},
    });
    callback();
  }
}

export class SentryExceptionLimiter {
  constructor(
    private useSentry: boolean,
    private sendRatio: number = 0.2,
  ) {}

  sendException(exception: unknown): void {
    if (!this.useSentry) {
      return;
    }
    const rand = Math.random();
    if (rand < this.sendRatio) {
      Sentry.captureException(exception);
    }
  }
}
