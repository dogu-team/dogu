import * as MonacoType from 'monaco-editor';

import { MonacoSetter } from '../common/monaco-setter';

export class TypescriptMonacoSetter extends MonacoSetter {
  constructor(monaco: typeof MonacoType) {
    super(monaco);
  }

  addExtraLib(): void {
    this.monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
  }

  setCompilerOptions(): void {
    this.monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      allowSyntheticDefaultImports: true,
      esModuleInterop: true,
    });
  }

  defineTheme(): void {}
}
