import _ from 'lodash';

export interface RetryTransactionOptions {
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

export function defaultRetryTransactionOptions(): Required<RetryTransactionOptions> {
  return {
    retryCount: 3,
    retryInterval: 300,
  };
}

export type OnAfterRollback = (error: Error) => Promise<void>;

export interface RetryTransactionHandler {
  onAfterRollback?: OnAfterRollback;
}

export class RollbackWithReturnError<T> extends Error {
  constructor(readonly returnValue: T) {
    super('RollbackWithReturnError');
  }
}

/**
 * @see https://www.postgresql.org/docs/13/errcodes-appendix.html
 * @description
 *  40001 serialization_failure
 *  40P01 deadlock_detected
 *  23505 unique_violation
 *  23P01 exclusion_violation
 */
export function isRetryCode(error: Error): boolean {
  const code = _.get(error, 'code', '') as string;
  const retryCodes = ['40001', '40P01', '23505', '23P01'];
  return retryCodes.includes(code);
}

export const AvailableIsolationLevel = ['REPEATABLE READ', 'SERIALIZABLE'] as const;
export type AvailableIsolationLevel = (typeof AvailableIsolationLevel)[number];
