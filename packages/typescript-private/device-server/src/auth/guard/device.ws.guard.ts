import { Inject } from '@nestjs/common';
import { IncomingMessage } from 'http';
import { AuthService } from '../auth.service';
import { PermissionOptions } from '../options';

const AuthIncomingMessageDecoratorKey = Symbol('AuthIncomingMessage');

export function AuthIncomingMessage(): ParameterDecorator {
  return function (target: object, propertyKey: string | symbol, parameterIndex: number): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const existingRequiredParameters: number[] = Reflect.getOwnMetadata(AuthIncomingMessageDecoratorKey, target, propertyKey) || [];
    existingRequiredParameters.push(parameterIndex);
    Reflect.defineMetadata(AuthIncomingMessageDecoratorKey, existingRequiredParameters, target, propertyKey);
  };
}

/*
 * @caution This decorator injects AuthService to the class instance. so you should have dependency to AuthModule in your module.
 * Use This decorator with AuthIncomingMessage parameter decorator.
 */
export function DeviceWsPermission(options: PermissionOptions): MethodDecorator {
  const injectAuthService = Inject(AuthService);

  // eslint-disable-next-line @typescript-eslint/ban-types
  return (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const method = descriptor.value;

    injectAuthService(target, '__authService');

    descriptor.value = function (): unknown {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const authService = this.__authService as AuthService;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const paramIndexes: number[] = Reflect.getOwnMetadata(AuthIncomingMessageDecoratorKey, target, propertyKey);
      if (paramIndexes) {
        for (const parameterIndex of paramIndexes) {
          // eslint-disable-next-line prefer-rest-params
          if (parameterIndex >= arguments.length || arguments[parameterIndex] === undefined) {
            throw new Error(`Missing ${AuthIncomingMessageDecoratorKey.toString()} parameter`);
          }
        }
        paramIndexes.forEach((parameterIndex) => {
          // eslint-disable-next-line prefer-rest-params
          const request = arguments[parameterIndex] as IncomingMessage;
          if (!request) {
            throw new Error(`Missing ${AuthIncomingMessageDecoratorKey.toString()} parameter`);
          }
          const authField = request.headers.authorization;
          if (!authField) {
            throw new Error(`No authorization header found`);
          }
          const token = authField.replace('Custom ', '');
          const serialField = request.headers.serial;
          if (serialField instanceof Array) {
            throw new Error(`Multiple serial header found`);
          }
          if (!authService.validate({ value: token }, serialField, options)) {
            throw new Error(`Invalid token`);
          }
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, prefer-rest-params
      return method.apply(this, arguments);
    };
  };
}
