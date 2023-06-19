import { ErrorResultError } from '@dogu-private/types';
import { stringify } from '@dogu-tech/common';
import { Result } from './types/built-in-messages';

export function parseEventResult(result: Result): void {
  const { value } = result;
  const { kind } = value;
  if (kind === 'EventResult') {
    return;
  } else if (kind === 'ErrorResult') {
    const errorResult = value.value;
    throw new ErrorResultError(errorResult.code, errorResult.message, errorResult.details);
  }

  throw new Error(`Unexpected result kind ${stringify(result)}`);
}
