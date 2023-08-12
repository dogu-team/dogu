import { ErrorResult, UpdateAgent } from '@dogu-private/console-host-agent';
import { Code } from '@dogu-private/types';
import { Injectable } from '@nestjs/common';
import { DoguLogger } from '../logger/logger';
import { CommandProcessRegistry } from './command.process-registry';

@Injectable()
export class UpdateProcessor {
  constructor(private readonly commandProcessRegistry: CommandProcessRegistry, private readonly logger: DoguLogger) {}

  update(msg: UpdateAgent): Promise<ErrorResult> {
    return Promise.resolve({
      kind: 'ErrorResult',
      value: {
        code: Code.CODE_SUCCESS_COMMON_BEGIN_UNSPECIFIED,
        message: '',
        details: {
          stack: '',
          cause: '',
        },
      },
    });
  }
}
