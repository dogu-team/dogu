import { ErrorResultError } from '@dogu-private/types';
import { stringify } from '@dogu-tech/common';
import { HttpException } from '@nestjs/common';

export class RemoteException extends HttpException {
  constructor(status: number, public readonly error: Error | unknown, public readonly data: Object) {
    super(RemoteException.createErrorMessage(error, data), status);
  }

  private static createErrorMessage(error: Error | unknown, data: Object, count = 0): string {
    if (error instanceof RemoteException) {
      if (count > 10) {
        return `RemoteException deep: ${error.message} ${stringify({ ...error.data, ...data }, { colors: false })}`;
      }
      return RemoteException.createErrorMessage(error.error, error.data, count + 1);
    }
    if (error instanceof ErrorResultError) {
      return `${error.name}: ${error.message} ${stringify({ ...error.details, ...data }, { colors: false })}`;
    } else if (error instanceof Error) {
      return `${error.name}: ${error.message} ${stringify(data, { colors: false })}`;
    } else {
      return `${stringify(error, { colors: false })} ${stringify(data, { colors: false })}`;
    }
  }
}
