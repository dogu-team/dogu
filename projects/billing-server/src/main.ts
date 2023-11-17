import { handleLoggerCreateWithSentry, initSentry } from '@dogu-private/nestjs-common';
import { errorify, stringify } from '@dogu-tech/common';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import * as Sentry from '@sentry/node';
import pg from 'pg';
import { env } from './env';
import { AllExceptionsFilter } from './filter/exception.filter';
import { AppModule } from './module/app/app.module';
import { logger } from './module/logger/logger.instance';
import { isSentryEnabled } from './sentry';

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise: stringify(promise), reason: stringify(reason) });
});
process.on('uncaughtException', (error, origin) => {
  logger.error('Uncaught Exception thrown:', { error: stringify(error), origin: stringify(origin) });
});

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const httpAdapterHost = app.get(HttpAdapterHost);

  const expressApp = app.getHttpAdapter().getInstance() as { use: (arg0: unknown) => void };

  initSentry(isSentryEnabled(), {
    dsn: 'https://fb8a1da7ed97b84d5aaaeed1f1fa3171@o4505097685565440.ingest.sentry.io/4506240840695808',
    integrations: [
      ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
      new Sentry.Integrations.Http({ tracing: true }),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      new Sentry.Integrations.Express({ app: expressApp }),
      new Sentry.Integrations.Postgres({ usePgNative: false, module: pg }),
    ],
    environment: env.DOGU_BILLING_RUN_TYPE,
    maxBreadcrumbs: 10000,
    tracesSampleRate: 0.1,
  });
  handleLoggerCreateWithSentry(isSentryEnabled(), logger);

  expressApp.use(Sentry.Handlers.requestHandler());
  expressApp.use(Sentry.Handlers.tracingHandler());
  expressApp.use(Sentry.Handlers.errorHandler());

  app
    .useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true })) //
    .useGlobalFilters(new AllExceptionsFilter(httpAdapterHost))
    .useWebSocketAdapter(new WsAdapter(app))
    .enableCors({
      origin: true,
      preflightContinue: false,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      optionsSuccessStatus: 200,
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

  const port = process.env.PORT || '4001';
  await app.listen(port);
  logger.info(`ready - started server on ${port}`);

  const shutdownSignals = ['SIGINT', 'SIGTERM', 'SIGQUIT'];
  app.enableShutdownHooks(shutdownSignals);
  shutdownSignals.forEach((signal) => {
    process.on(signal, () => {
      logger.info(`shutdown - received ${signal}`);
    });
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to start server', { error: errorify(error) });
  process.exit(1);
});
