import * as MonacoType from 'monaco-editor';

export abstract class MonacoSetter {
  protected monaco: typeof MonacoType;

  constructor(monaco: typeof MonacoType) {
    this.monaco = monaco;
  }

  protected abstract addExtraLib(): void;
  protected abstract setCompilerOptions(): void;
  protected abstract defineTheme(): void;

  public set() {
    this.addExtraLib();
    this.setCompilerOptions();
    this.defineTheme();
  }
}
