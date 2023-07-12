import { stringify } from '@dogu-tech/common';
import { HttpException } from '@nestjs/common';

export class WebDriverException extends HttpException {
  constructor(status: number, error: Error | unknown, data: Object) {
    if (error instanceof Error) {
      super(
        {
          error: error.name,
          message: error.message,
          stacktrace: '',
          data: data ? JSON.stringify(data) : {},
        },
        status,
      );
    } else {
      super(
        {
          error: stringify(error, { colors: false }),
          message: stringify(error, { colors: false }),
          stacktrace: '',
          data: {},
        },
        status,
      );
    }
  }
}
