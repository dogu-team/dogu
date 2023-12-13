import { AvailableIsolationLevel, defaultRetryTransactionOptions, isRetryCode, OnAfterRollback, RetryTransactionOptions, RollbackWithReturnError } from '@dogu-private/console';
import { errorify } from '@dogu-tech/common';
import { Client } from 'pg';
import { DataSource, EntityManager } from 'typeorm';
import { DoguLogger } from '../module/logger/logger';

export interface RetryTransactionContext {
  logger: DoguLogger;
  manager: EntityManager;
  registerOnAfterRollback: (onAfterRollback: OnAfterRollback) => void;
  setTriggerRollbackBeforeReturn: () => void;
}

export type RetryTransactionFunction<T> = (context: RetryTransactionContext) => Promise<T>;

export class RetryTransaction {
  private readonly options: Required<RetryTransactionOptions>;

  constructor(
    private readonly logger: DoguLogger,
    private readonly dataSource: DataSource,
    options?: RetryTransactionOptions,
  ) {
    this.options = { ...defaultRetryTransactionOptions(), ...options };
  }

  private async execute<T>(isolationLevel: AvailableIsolationLevel, fn: RetryTransactionFunction<T>): Promise<T> {
    const { retryCount, retryInterval } = this.options;
    const { logger, dataSource } = this;
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      for (let tryCount = 1; tryCount <= retryCount; tryCount++) {
        const onAfterRollbacks = new Array<OnAfterRollback>();
        try {
          await queryRunner.startTransaction(isolationLevel);

          let triggerRollbackBeforeReturn: boolean = false;
          const result = await fn({
            logger,
            manager: queryRunner.manager,
            registerOnAfterRollback: (onAfterRollback) => {
              onAfterRollbacks.push(onAfterRollback);
            },
            setTriggerRollbackBeforeReturn: () => {
              triggerRollbackBeforeReturn = true;
            },
          });

          if (triggerRollbackBeforeReturn) {
            throw new RollbackWithReturnError(result);
          }

          await queryRunner.commitTransaction();
          return result;
        } catch (e) {
          const error = errorify(e);
          logger.warn('retrySerialize.catch transaction failed', { tryCount, retryCount, retryInterval, error });
          await queryRunner.rollbackTransaction();

          onAfterRollbacks.reverse();
          for (const onAfterRollback of onAfterRollbacks) {
            try {
              await onAfterRollback(error);
            } catch (e) {
              logger.error('retrySerialize.catch onAfterRollback failed', { error: errorify(e) });
            }
          }

          if (error instanceof RollbackWithReturnError<T>) {
            return error.returnValue as T;
          }

          if (tryCount === retryCount) {
            logger.error('retrySerialize.catch transaction failed. retry count exceeded', { tryCount, retryCount, retryInterval });
            throw error;
          }

          if (isRetryCode(error)) {
            logger.warn(`retrySerialize.catch serialization failure. retry after`, { tryCount, retryCount, retryInterval });
            await new Promise((resolve) => setTimeout(resolve, retryInterval));
            continue;
          }

          throw error;
        }
      }
    } finally {
      await queryRunner.release();
    }

    throw new Error('Must not reach here');
  }

  async repeatableRead<T>(fn: RetryTransactionFunction<T>): Promise<T> {
    return await this.execute('REPEATABLE READ', fn);
  }

  async serializable<T>(fn: RetryTransactionFunction<T>): Promise<T> {
    return await this.execute('SERIALIZABLE', fn);
  }
}

export async function getClient(dataSource: DataSource): Promise<Client> {
  const [client, _] = (await dataSource.driver.obtainMasterConnection()) as [Client, unknown];
  return client;
}

export type Message<T extends object = object> =
  | {
      event: 'created';
      data: T;
    }
  | {
      event: 'updated';
      data: T;
    }
  | {
      event: 'deleted';
      data: T;
    };

export async function subscribe(logger: DoguLogger, dataSource: DataSource, tableName: string, fn: (message: Message) => void): Promise<void> {
  const client = await getClient(dataSource);
  const channelName = `${tableName}_event`;
  const functionName = `${tableName}_notify`;
  await client.query(`
CREATE OR REPLACE FUNCTION ${functionName}()
RETURNS TRIGGER AS $$
DECLARE
  payload TEXT;

BEGIN
  IF (TG_OP = 'INSERT') THEN
    payload := json_build_object(
      'event', 'created',
      'data', row_to_json(NEW)
    )::text;
    PERFORM pg_notify('${channelName}', payload);
    RETURN NEW;
  ELSIF (TG_OP = 'UPDATE') THEN
    payload := json_build_object(
      'event', 'updated',
      'data', row_to_json(NEW)
    )::text;
    PERFORM pg_notify('${channelName}', payload);
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    payload := json_build_object(
      'event', 'deleted',
      'data', row_to_json(OLD)
    )::text;
    PERFORM pg_notify('${channelName}', payload);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER ${tableName}_after_insert
AFTER INSERT ON "${tableName}"
FOR EACH ROW EXECUTE FUNCTION ${functionName}();

CREATE OR REPLACE TRIGGER ${tableName}_after_update
AFTER UPDATE ON "${tableName}"
FOR EACH ROW EXECUTE FUNCTION ${functionName}();

CREATE OR REPLACE TRIGGER ${tableName}_after_delete
AFTER DELETE ON "${tableName}"
FOR EACH ROW EXECUTE FUNCTION ${functionName}();

LISTEN ${channelName};
`);

  client.on('notification', (notification) => {
    if (notification.channel !== channelName) {
      return;
    }

    if (!notification.payload) {
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const message = JSON.parse(notification.payload);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      fn(message);
    } catch (e) {
      logger.error('Failed to handle notification', {
        channel: notification.channel,
        payload: notification.payload,
        error: errorify(e),
      });
    }
  });
}
