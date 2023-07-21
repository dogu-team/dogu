import { MutableVariableReplacements, VariableReplacementProvider, VariableReplacements } from '@dogu-tech/common';
import { delimiter } from 'path';
import { newCleanNodeEnv } from '../clean-env';

export class EnvironmentVariableReplacementProvider implements VariableReplacementProvider {
  constructor(private readonly replacements: VariableReplacements) {}

  provideSync(key: string): string | null {
    return this.replacements[key] ?? null;
  }

  provide(key: string): Promise<string | null> {
    return Promise.resolve(this.provideSync(key));
  }

  export(): VariableReplacements {
    return this.replacements;
  }
}

export class StackEnvironmentVariableReplacementProvider implements VariableReplacementProvider {
  constructor(private readonly providers: EnvironmentVariableReplacementProvider[]) {}

  provideSync(key: string): string | null {
    for (let i = this.providers.length - 1; i >= 0; i--) {
      const provider = this.providers[i];
      const value = provider.provideSync(key);
      if (value !== null) {
        return value;
      }
    }
    return null;
  }

  provide(key: string): Promise<string | null> {
    return Promise.resolve(this.provideSync(key));
  }

  push(provider: EnvironmentVariableReplacementProvider): void {
    this.providers.push(provider);
  }

  pop(): VariableReplacementProvider | null {
    return this.providers.pop() ?? null;
  }

  export(): VariableReplacements {
    let replacements: MutableVariableReplacements = {};
    for (let i = this.providers.length - 1; i >= 0; i--) {
      const provider = this.providers[i];
      const providerReplacements = provider.export();
      for (const key of Object.keys(providerReplacements)) {
        if (Object.hasOwn(replacements, key)) {
          continue;
        }
        replacements[key] = providerReplacements[key];
      }
    }
    if (replacements['Path'] && replacements['PATH']) {
      replacements['PATH'] = replacements['PATH'] + delimiter + replacements['Path'];
    }
    return replacements;
  }
}

export class NodeJsProcessEnvironmentVariableReplacementProvider extends EnvironmentVariableReplacementProvider {
  constructor() {
    super(process.env);
  }
}

export class CleanNodeJsProcessEnvironmentVariableReplacementProvider extends EnvironmentVariableReplacementProvider {
  constructor() {
    super(newCleanNodeEnv());
  }
}
export class WindowsDefaultEnvironmentVariableReplacementProvider extends EnvironmentVariableReplacementProvider {
  constructor() {
    super({
      HOME: process.env.HOME ? process.env.HOME : process.env.USERPROFILE,
    });
  }
}
