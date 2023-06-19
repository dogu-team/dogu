export interface MatchVariableResult {
  /**
   * @example hello $USER! -> $USER
   */
  variable: string;

  /**
   * @example hello $USER! -> 6
   */
  index: number;

  /**
   * @example hello $USER! -> USER
   */
  key: string;
}

export interface VariableMatcher {
  matchSync(target: string): MatchVariableResult | null;
  match(target: string): Promise<MatchVariableResult | null>;
}

export interface VariableReplacementProvider {
  provideSync(key: string): string | null;
  provide(key: string): Promise<string | null>;
}

export interface VariableReplacer {
  replaceSync(target: string): string;
  replace(target: string): Promise<string>;
}

export type MutableVariableReplacements = Record<string, string | undefined>;
export type VariableReplacements = Readonly<MutableVariableReplacements>;
