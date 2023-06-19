import { matchSync, MatchVariableResult, stringify, VariableMatcher } from '@dogu-tech/common';

export class PosixEnvironmentVariableMatcher implements VariableMatcher {
  private static pattern = /\$(?:(\w+)|{(\w+)})/g;

  matchSync(target: string): MatchVariableResult | null {
    const it = target.matchAll(PosixEnvironmentVariableMatcher.pattern);
    const first = it.next();
    if (first.done === true) {
      return null;
    }
    const result = first.value;
    const variable = result[0];
    const { index } = result;
    if (index === undefined) {
      throw new Error(`Unexpected match pattern. target: ${target}, result: ${stringify(result)}`);
    }
    if (result[1] !== undefined && result[2] === undefined) {
      return { variable, index, key: result[1] };
    } else if (result[1] === undefined && result[2] !== undefined) {
      return { variable, index, key: result[2] };
    } else {
      throw new Error(`Unexpected match pattern. target: ${target}, result: ${stringify(result)}`);
    }
  }

  match(target: string): Promise<MatchVariableResult | null> {
    return Promise.resolve(this.matchSync(target));
  }
}

export class WindowsEnvironmentVariableMatcher implements VariableMatcher {
  private static pattern = /%(\w+)%/g;

  matchSync(target: string): MatchVariableResult | null {
    return matchSync(target, WindowsEnvironmentVariableMatcher.pattern);
  }

  match(target: string): Promise<MatchVariableResult | null> {
    return Promise.resolve(this.matchSync(target));
  }
}

export class StackEnvironmentVariableMatcher implements VariableMatcher {
  constructor(private readonly matchers: VariableMatcher[]) {}

  matchSync(target: string): MatchVariableResult | null {
    for (let i = this.matchers.length - 1; i >= 0; i--) {
      const matcher = this.matchers[i];
      const result = matcher.matchSync(target);
      if (result !== null) {
        return result;
      }
    }
    return null;
  }

  match(target: string): Promise<MatchVariableResult | null> {
    return Promise.resolve(this.matchSync(target));
  }

  push(matcher: VariableMatcher): void {
    this.matchers.push(matcher);
  }

  pop(): VariableMatcher | null {
    return this.matchers.pop() ?? null;
  }
}
