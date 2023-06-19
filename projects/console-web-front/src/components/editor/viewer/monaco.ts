import * as MonacoType from 'monaco-editor';

import { MonacoSetter } from '../common/monaco-setter';

export class ViewerMonacoSetter extends MonacoSetter {
  constructor(monaco: typeof MonacoType) {
    super(monaco);
  }

  addExtraLib(): void {}

  setCompilerOptions(): void {}

  defineTheme(): void {}
}
