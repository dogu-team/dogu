import * as MonacoType from 'monaco-editor';

export abstract class EditorSetter {
  protected editor: MonacoType.editor.IStandaloneCodeEditor;

  constructor(editor: MonacoType.editor.IStandaloneCodeEditor) {
    this.editor = editor;
  }

  protected abstract onKey(): void;

  public set() {
    this.onKey();
  }
}
