import * as MonacoType from 'monaco-editor';

import { EditorSetter } from '../common/editor-setter';

export class ViewerSetter extends EditorSetter {
  constructor(editor: MonacoType.editor.IStandaloneCodeEditor) {
    super(editor);
  }

  onKey() {
    this.editor.onKeyUp((e) => {
      if (e.keyCode === 90) {
        this.editor.trigger('', 'editor.action.triggerSuggest', '');
      }
    });
  }
}
