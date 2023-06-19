import { Class } from '@dogu-tech/common';

export interface ActionInput {
  description: string;
  required: boolean;
  default?: unknown;
}

export interface ActionMeta<T extends Class<T>> {
  name: string;
  url: string;
  inputsConstructor: T;
}
