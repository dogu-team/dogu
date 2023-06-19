import { ActionConfig } from './config';

export class ActionInputAccessor {
  private readonly inputs: Record<string, unknown>;

  constructor(private readonly config: ActionConfig, private readonly DOGU_ACTION_INPUTS: string) {
    this.inputs = JSON.parse(DOGU_ACTION_INPUTS);
  }

  get<T>(name: string): T {
    const configInput = this.config.input(name);
    const value = Reflect.get(this.inputs, name);
    if (configInput.required) {
      if (value === undefined) {
        throw new Error(`Input is required. name: ${name}`);
      } else {
        return value as T;
      }
    } else {
      if (value === undefined) {
        if (configInput.default === undefined) {
          throw new Error(`Input is not required but default is not defined. name: ${name}`);
        } else {
          return configInput.default as T;
        }
      } else {
        return value as T;
      }
    }
  }
}
