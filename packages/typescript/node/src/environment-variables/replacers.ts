import { replaceVariable, replaceVariableSync, VariableMatcher, VariableReplacementProvider, VariableReplacer } from '@dogu-tech/common';
import { PosixEnvironmentVariableMatcher, StackEnvironmentVariableMatcher, WindowsEnvironmentVariableMatcher } from './matchers';
import {
  NodeJsProcessEnvironmentVariableReplacementProvider,
  StackEnvironmentVariableReplacementProvider,
  WindowsDefaultEnvironmentVariableReplacementProvider,
} from './replacement-providers';

export class EnvironmentVariableReplacer implements VariableReplacer {
  constructor(private readonly matcher: VariableMatcher, private readonly provider: VariableReplacementProvider) {}

  replaceSync(target: string): string {
    return replaceVariableSync(target, this.matcher, this.provider);
  }

  replace(target: string): Promise<string> {
    return replaceVariable(target, this.matcher, this.provider);
  }

  replaceEnvSync(target: Record<string, string | undefined>): Record<string, string | undefined> {
    return Object.entries(target).reduce((result, [key, value]) => {
      Reflect.set(result, key, value === undefined ? undefined : this.replaceSync(value));
      return result;
    }, {} as Record<string, string | undefined>);
  }

  async replaceEnv(target: Record<string, string | undefined>): Promise<Record<string, string | undefined>> {
    return Promise.all(
      Object.entries(target).map(async ([key, value]) => {
        const replacedValue = value === undefined ? undefined : await this.replace(value);
        return [key, replacedValue] as const;
      }),
    ).then((entries) => Object.fromEntries(entries));
  }
}

export class StackEnvironmentVariableReplacer extends EnvironmentVariableReplacer {
  constructor(readonly stackMatcher: StackEnvironmentVariableMatcher, readonly stackProvider: StackEnvironmentVariableReplacementProvider) {
    super(stackMatcher, stackProvider);
  }
}

export class PosixEnvironmentVariableReplacer extends StackEnvironmentVariableReplacer {
  constructor() {
    super(
      new StackEnvironmentVariableMatcher([new PosixEnvironmentVariableMatcher()]),
      new StackEnvironmentVariableReplacementProvider([new NodeJsProcessEnvironmentVariableReplacementProvider()]),
    );
  }
}

export class WindowsEnvironmentVariableReplacer extends StackEnvironmentVariableReplacer {
  constructor() {
    super(
      new StackEnvironmentVariableMatcher([new WindowsEnvironmentVariableMatcher()]),
      new StackEnvironmentVariableReplacementProvider([new NodeJsProcessEnvironmentVariableReplacementProvider(), new WindowsDefaultEnvironmentVariableReplacementProvider()]),
    );
  }
}

export class MultiPlatformEnvironmentVariableReplacer extends StackEnvironmentVariableReplacer {
  constructor() {
    super(
      new StackEnvironmentVariableMatcher([new PosixEnvironmentVariableMatcher(), new WindowsEnvironmentVariableMatcher()]),
      new StackEnvironmentVariableReplacementProvider([new NodeJsProcessEnvironmentVariableReplacementProvider(), new WindowsDefaultEnvironmentVariableReplacementProvider()]),
    );
  }
}
