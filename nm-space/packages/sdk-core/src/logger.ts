import winston, { format } from 'winston';

export interface CreateOptions {
  label: string;
}

export class Logger extends winston.Logger {
  static instance = winston.createLogger({
    level: 'verbose',
    format: format.combine(
      format.errors({ stack: true }), //
      format.timestamp(),
      format.json(),
    ),
    transports: [
      new winston.transports.Console({
        format: format.combine(
          format.errors({ stack: true }), //
          format.timestamp(),
          format.simple(),
          format.colorize({ all: true }),
        ),
      }),
    ],
  });

  static create(label: string): winston.Logger;
  static create(func: Function): winston.Logger;
  static create(options: CreateOptions): winston.Logger;
  static create(labelOrOptions: string | Function | CreateOptions): winston.Logger {
    if (typeof labelOrOptions === 'string') {
      const label = labelOrOptions;
      return Logger.instance.child({ label });
    } else if (typeof labelOrOptions === 'function') {
      const func = labelOrOptions;
      return Logger.instance.child({ label: func.name });
    }

    const options = labelOrOptions;
    return Logger.instance.child({ label: options.label });
  }
}
