import { errorify, stringify } from '@dogu-tech/common';
import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { WsAdapter } from '@nestjs/platform-ws';
import { AllExceptionsFilter } from './filter/exception.filter';
import { AppModule } from './module/app/app.module';
import { logger } from './module/logger/logger.instance';

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', { promise: stringify(promise), reason: stringify(reason) });
});
process.on('uncaughtException', (error, origin) => {
  logger.error('Uncaught Exception thrown:', { error: stringify(error), origin: stringify(origin) });
});

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const httpAdapterHost = app.get(HttpAdapterHost);
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
