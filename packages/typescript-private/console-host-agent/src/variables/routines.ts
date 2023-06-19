import { matchSync, MatchVariableResult, replaceVariable, replaceVariableSync, stringify, VariableMatcher, VariableReplacementProvider, VariableReplacer } from '@dogu-tech/common';

export class RoutineVariableMatcher implements VariableMatcher {
  private static pattern = /\${{\s*?([\w.]+)\s*?}}/g;

  matchSync(target: string): MatchVariableResult | null {
    return matchSync(target, RoutineVariableMatcher.pattern);
  }

  match(target: string): Promise<MatchVariableResult | null> {
    return Promise.resolve(this.matchSync(target));
  }
}

class RoutineVariableReplacementProvider implements VariableReplacementProvider {
  constructor(private readonly schema: Record<string, unknown>) {}

  provideSync(key: string): string | null {
    const { schema } = this;
    const spliteds = key.split('.');
    if (spliteds.length === 0) {
      throw new Error(`Unexpected key. key: ${key}, schema: ${stringify(schema)}`);
    }
    let current = schema;
    let value: string | null = null;
    spliteds.forEach((splited, index, array) => {
      const propertyDescriptor = Object.getOwnPropertyDescriptor(current, splited);
      if (propertyDescriptor === undefined) {
        throw new Error(`Unexpected property. key: ${key}, schema: ${stringify(schema)}`);
      }

      if (index === array.length - 1) {
        if (propertyDescriptor.value === undefined || typeof propertyDescriptor.value === 'object') {
          throw new Error(`Unexpected property. key: ${key}, schema: ${stringify(schema)}`);
        }
        value = String(propertyDescriptor.value);
        return;
      } else {
        if (typeof propertyDescriptor.value !== 'object') {
          throw new Error(`Unexpected property. key: ${key}, schema: ${stringify(schema)}`);
        }
        current = propertyDescriptor.value as Record<string, unknown>;
      }
    });
    return value;
  }

  provide(key: string): Promise<string | null> {
    return Promise.resolve(this.provideSync(key));
  }
}

export class RoutineVariableReplacer implements VariableReplacer {
  private readonly matcher: VariableMatcher = new RoutineVariableMatcher();
  private readonly provider: VariableReplacementProvider;

  constructor(schema: Record<string, unknown>) {
    this.provider = new RoutineVariableReplacementProvider(schema);
  }

  replaceSync(target: string): string {
    return replaceVariableSync(target, this.matcher, this.provider);
  }

  replace(target: string): Promise<string> {
    return replaceVariable(target, this.matcher, this.provider);
  }
}
