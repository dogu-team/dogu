import { errorify } from '@dogu-tech/common';
import _ from 'lodash';
import { DataSource, EntityManager } from 'typeorm';
import { DoguLogger } from '../module/logger/logger';

export interface SerializableTransactionOptions {
  /**
   * @description The number of times to retry the transaction when serialization failure occurs.
   * @default 3
   */
  retryCount?: number;

  /**
   * @description The interval between retries.
   * @default 300
   * @unit milliseconds
   */
  retryInterval?: number;
}

function defaultSerializableTransactionOptions(): Required<SerializableTransactionOptions> {
  return {
    retryCount: 3,
    retryInterval: 300,
  };
}

export type OnAfterRollback = (error: Error) => Promise<void>;

export interface RetrySerializeHandler {
  onAfterRollback?: OnAfterRollback;
}

export interface RetrySerializeContext {
  logger: DoguLogger;
  manager: EntityManager;
  registerOnAfterRollback: (onAfterRollback: OnAfterRollback) => void;
}

export type RetrySerializeFunction<T> = (context: RetrySerializeContext) => Promise<T>;

export async function retrySerialize<T>(
  logger: DoguLogger, //
  dataSource: DataSource,
  fn: RetrySerializeFunction<T>,
  options?: SerializableTransactionOptions,
): Promise<T> {
  const { retryCount, retryInterval } = { ...defaultSerializableTransactionOptions(), ...options };
  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    for (let tryCount = 1; tryCount <= retryCount; tryCount++) {
      const onAfterRollbacks = new Set<OnAfterRollback>();
      try {
        await queryRunner.startTransaction('SERIALIZABLE');
        const result = await fn({
          logger,
          manager: queryRunner.manager,
          registerOnAfterRollback: (onAfterRollback) => {
            onAfterRollbacks.add(onAfterRollback);
          },
        });
        await queryRunner.commitTransaction();
        return result;
      } catch (e) {
        const error = errorify(e);
        logger.warn('retrySerialize.catch transaction failed', { tryCount, error });
        await queryRunner.rollbackTransaction();

        for (const onAfterRollback of onAfterRollbacks) {
          try {
            await onAfterRollback(error);
          } catch (e) {
            logger.error('retrySerialize.catch onAfterRollback failed', { error: errorify(e) });
          }
        }

        if (tryCount === retryCount) {
          throw error;
        }

        /**
         * @see https://www.postgresql.org/docs/13/errcodes-appendix.html
         * @description
         *  40001 serialization_failure
         *  40P01 deadlock_detected
         */
        const code = _.get(error, 'code') as string | undefined;
        if (code === '40001' || code === '40P01') {
          logger.warn(`retrySerialize.catch serialization failure. retry after`, { tryCount, retryCount, retryInterval, error });
          await new Promise((resolve) => setTimeout(resolve, retryInterval));
        }
      }
    }
  } finally {
    await queryRunner.release();
  }

  throw new Error('Must not reach here');
}
