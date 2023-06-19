import * as MonacoType from 'monaco-editor';
import MonacoEditorComponent from '@monaco-editor/react';
import { forwardRef, MutableRefObject, useRef } from 'react';
import styled from 'styled-components';
import { LoadingOutlined } from '@ant-design/icons';

interface Props {
  editorRef: MutableRefObject<MonacoType.editor.IStandaloneCodeEditor | null>;
  value: string;
  onChanged: () => void;
  width?: string;
  height?: string;
}

const YamlEditor = (props: Props) => {
  const monacoRef = useRef<typeof MonacoType>();

  const options: MonacoType.editor.IStandaloneEditorConstructionOptions = {
    readOnly: false,
    minimap: { enabled: false },
    overviewRulerBorder: false,
    occurrencesHighlight: false,
    hideCursorInOverviewRuler: true,
    language: 'yaml',
  };

  function handleEditorOnMount(editor: MonacoType.editor.IStandaloneCodeEditor, Monaco: typeof MonacoType) {
    props.editorRef.current = editor;
    monacoRef.current = Monaco;
  }

  if (props.value === undefined) {
    return null;
  }

  return (
    <MonacoEditorComponent
      loading={
        <p>
          <LoadingOutlined />
          &nbsp;Loading...
        </p>
      }
      access-id="test"
      path={'index.yaml'}
      height={'65vh'}
      value={props.value}
      options={options}
      onMount={handleEditorOnMount}
      onChange={props.onChanged}
    />
  );
};

YamlEditor.displayName = 'Yaml Editor';

export default YamlEditor;
