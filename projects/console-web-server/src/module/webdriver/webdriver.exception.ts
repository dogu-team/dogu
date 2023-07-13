import { stringify } from '@dogu-tech/common';
import { HttpException } from '@nestjs/common';

export class WebDriverException extends HttpException {
  constructor(status: number, error: Error | unknown, data: Object) {
    if (error instanceof Error) {
      super(`${error.name}: ${error.message} ${stringify(data, { colors: false })}`, status);
    } else {
      super(`${stringify(error, { colors: false })} ${stringify(data, { colors: false })}`, status);
    }
  }
}
