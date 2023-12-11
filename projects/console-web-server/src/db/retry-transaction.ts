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
