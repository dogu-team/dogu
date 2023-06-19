import { ActionInput } from '@dogu-tech/action-common';
import { stringify } from '@dogu-tech/common';
import lodash from 'lodash';

export const RunsUsing = ['node16'] as const;
export type RunsUsing = (typeof RunsUsing)[number];

export class ActionConfigNotFoundError extends Error {
  constructor(readonly path: string) {
    super(`Action config key ${path} not found`);
  }
}

export class ActionConfigTypeError extends Error {
  constructor(readonly path: string, readonly value: unknown) {
    super(`Action config key ${path} value ${stringify(value)} is not valid`);
  }
}

export class ActionConfig {
  constructor(private readonly config: Record<string, unknown>) {}

  get version(): number {
    return this.get('version', (value) => typeof value === 'number');
  }

  get name(): string {
    return this.get('name', (value) => typeof value === 'string');
  }

  get description(): string {
    return this.get('description', (value) => typeof value === 'string');
  }

  get author(): string {
    return this.get('author', (value) => typeof value === 'string');
  }

  input(name: string): ActionInput {
    return this.get(`inputs.${name}`, (value) => {
      if (!(typeof value === 'object' && value !== null)) {
        return false;
      }
      const description = lodash.get(value, 'description') as string | undefined;
      if (description === undefined || typeof description !== 'string') {
        return false;
      }
      const required = lodash.get(value, 'required') as boolean | undefined;
      if (required === undefined || typeof required !== 'boolean') {
        return false;
      }
      if (required === true) {
        const default_ = lodash.get(value, 'default');
        if (default_ !== undefined) {
          return false;
        }
      }
      return true;
    });
  }

  get runs_using(): RunsUsing {
    return this.get('runs.using', (value) => {
      if (typeof value !== 'string') {
        return false;
      }
      return RunsUsing.includes(value as RunsUsing);
    });
  }

  get runs_main(): string {
    return this.get('runs.main', (value) => typeof value === 'string');
  }

  get runs_pre(): string | undefined {
    try {
      return this.get('runs.pre', (value) => typeof value === 'string');
    } catch (error) {
      if (error instanceof ActionConfigNotFoundError) {
        return undefined;
      }
      throw error;
    }
  }

  get runs_post(): string | undefined {
    try {
      return this.get('runs.post', (value) => typeof value === 'string');
    } catch (error) {
      if (error instanceof ActionConfigNotFoundError) {
        return undefined;
      }
      throw error;
    }
  }

  private get<T>(path: string, validate: (value: unknown) => boolean): T {
    const value = lodash.get(this.config, path) as T | undefined;
    if (value === undefined) {
      throw new ActionConfigNotFoundError(path);
    }
    if (!validate(value)) {
      throw new ActionConfigTypeError(path, value);
    }
    return value;
  }
}
