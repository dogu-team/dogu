import { replaceString, stringify } from '../strings/functions';
import { MatchVariableResult, VariableMatcher, VariableReplacementProvider } from './types';

export function replaceVariableSync(target: string, matcher: VariableMatcher, provider: VariableReplacementProvider): string {
  let replaced = '';
  let toReplace = target;
  for (;;) {
    const matchVariableResult = matcher.matchSync(toReplace);
    if (matchVariableResult === null) {
      return replaced + toReplace;
    }
    const { variable, index, key } = matchVariableResult;
    const replacement = provider.provideSync(key);
    let length = variable.length;
    if (replacement !== null) {
      const replacedReplacement = replaceVariableSync(replacement, matcher, provider);
      toReplace = replaceString(toReplace, index, length, replacedReplacement);
      length = replacement.length;
    }
    const end = index + length;
    replaced += toReplace.slice(0, end);
    toReplace = toReplace.slice(end);
  }
}

export async function replaceVariable(target: string, matcher: VariableMatcher, provider: VariableReplacementProvider): Promise<string> {
  let replaced = '';
  let toReplace = target;
  for (;;) {
    const matchVariableResult = await matcher.match(toReplace);
    if (matchVariableResult === null) {
      return replaced + toReplace;
    }
    const { variable, index, key } = matchVariableResult;
    const replacement = await provider.provide(key);
    let length = variable.length;
    if (replacement !== null) {
      const replacedReplacement = await replaceVariable(replacement, matcher, provider);
      toReplace = replaceString(toReplace, index, length, replacedReplacement);
      length = replacement.length;
    }
    const end = index + length;
    replaced += toReplace.slice(0, end);
    toReplace = toReplace.slice(end);
  }
}

export function matchSync(target: string, pattern: RegExp): MatchVariableResult | null {
  const it = target.matchAll(pattern);
  const first = it.next();
  if (first.done === true) {
    return null;
  }
  const result = first.value;
  const variable = result[0];
  const { index } = result;
  if (index === undefined) {
    throw new Error(`Unexpected match. target: ${target}, result: ${stringify(result)}`);
  }
  const key = result[1];
  if (key === undefined) {
    throw new Error(`Unexpected match. target: ${target}, result: ${stringify(result)}`);
  }
  return { variable, index, key };
}
