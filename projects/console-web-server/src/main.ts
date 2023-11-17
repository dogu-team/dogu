import 'reflect-metadata';

import { handleLoggerCreateWithSentry, initSentry } from '@dogu-private/nestjs-common';
import { stringify } from '@dogu-tech/common';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory, Reflector } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { json } from 'body-parser';
import cookieParser from 'cookie-parser';
import { Server } from 'http';
import { WinstonModule } from 'nest-winston';
import pg from 'pg';
import { env } from './env';
import { AllExceptionsFilter } from './filter/exception.filter';
import { AppModule } from './module/app/app.module';
import { logger } from './module/logger/logger.instance';
import { isSentryEnabled } from './utils/sentry';
import { PatternBasedWsAdapter } from './ws/common/pattern-based-ws-adaptor';

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise: stringify(promise), reason: stringify(reason) });
});
process.on('uncaughtException', (error, origin) => {
  logger.error('Uncaught Exception thrown:', { error: stringify(error), origin: stringify(origin) });
});

async function bootstrap(): Promise<void> {
  if (env.DOGU_USE_FILE_LOG === 1) {
    logger.addFileTransports();
  }
  handleLoggerCreateWithSentry(isSentryEnabled(), logger);

  const winstonLogger = logger.winstonLogger();
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      instance: winstonLogger,
    }),
  });

  const httpAdapterHost = app.get(HttpAdapterHost);
  const httpServer: Server = httpAdapterHost.httpAdapter.getHttpServer() as Server;
  // ref: https://ivorycirrus.github.io/TIL/aws-alb-502-bad-gateway/
  httpServer.keepAliveTimeout = 65000;
  httpServer.headersTimeout = 65000;

  const expressApp = app.getHttpAdapter().getInstance() as { use: (arg0: unknown) => void };

  initSentry(isSentryEnabled(), {
    dsn: 'https://b57ff386286740dfb9ab8e84b0f886cb@o4505097685565440.ingest.sentry.io/4505101334413312',
    integrations: [
      ...Sentry.autoDiscoverNodePerformanceMonitoringIntegrations(),
      new Sentry.Integrations.Http({ tracing: true }),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      new Sentry.Integrations.Express({ app: expressApp }),
      new Sentry.Integrations.Postgres({ usePgNative: false, module: pg }),
    ],
    environment: env.DOGU_RUN_TYPE,
    maxBreadcrumbs: 10000,
    tracesSampleRate: 0.1,
  });

  expressApp.use(Sentry.Handlers.requestHandler());
  expressApp.use(Sentry.Handlers.tracingHandler());

  app
    .use(cookieParser())
    .use(json({ limit: '1024mb' }))
    // .use(urlencoded({ limit: '20mb', extended: true }))
    .useGlobalFilters(new AllExceptionsFilter(httpAdapterHost))
    .useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)))
    .useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
    .useWebSocketAdapter(new PatternBasedWsAdapter(app, logger))
    .enableCors({
      origin: true,
      preflightContinue: false,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
      optionsSuccessStatus: 200,
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });
  expressApp.use(Sentry.Handlers.errorHandler());

  await app.listen(env.DOGU_CONSOLE_WEB_SERVER_PORT);
  logger.info(`ready - started server on ${env.DOGU_CONSOLE_WEB_SERVER_PORT}`);
}

bootstrap().catch((error) => {
  logger.error(error);
  logger.winstonLogger().on('finish', () => {
    logger.winstonLogger().end();
    process.exit(1);
  });
});
