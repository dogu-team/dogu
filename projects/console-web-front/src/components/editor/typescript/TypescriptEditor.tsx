import * as MonacoType from 'monaco-editor';
import MonacoEditorComponent from '@monaco-editor/react';
import { createContext, MutableRefObject, useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import useExitBlocker from 'src/hooks/useExitBlocker';
import { ExplorerNode } from 'src/components/explorer/type';
import { TypescriptMonacoSetter } from './monaco';
import { TypescriptEditorSetter } from './editor';
import { RepositoryFileData } from '@dogu-private/console';

export type IContext = {
  nodeQueue: ExplorerNode[];
  currentFile: RepositoryFileData;
};

export const Context = createContext<IContext>({ nodeQueue: [], currentFile: { id: '', name: '', type: 'blob', path: '', mode: '', data: '' } });

type ScrollPositionStorage = {
  [path: string]: { scrollLeft: number; scrollTop: number };
};

interface Props {
  editorRef: MutableRefObject<MonacoType.editor.IStandaloneCodeEditor | null>;
  value: string;
  cancelComponent: JSX.Element;
  confirmComponent: JSX.Element;
  width?: string;
  height?: string;
}

const TypescriptEditor = (props: Props) => {
  const scrollPositionStorage = useRef<ScrollPositionStorage>({});
  const monacoRef = useRef<typeof MonacoType>();
  const [isChanged, setChanged] = useState<boolean>(false);
  const context = useContext(Context);

  const options: MonacoType.editor.IStandaloneEditorConstructionOptions = {
    readOnly: false,
    minimap: { enabled: false },
    overviewRulerBorder: false,
    occurrencesHighlight: false,
    hideCursorInOverviewRuler: true,
    language: 'typescript',
  };

  useExitBlocker(isChanged);

  useEffect(() => {
    const editor = props.editorRef.current;
    if (!editor) {
      return;
    }

    const value = editor.getValue();
    const isChangedValue = value !== context.currentFile.data;

    if (isChangedValue) {
      const hasHistoryNode = context.nodeQueue.length > 1;
      if (hasHistoryNode) {
        const path = context.nodeQueue[context.nodeQueue.length - 2].path;
        scrollPositionStorage.current[path] = {
          scrollLeft: editor.getScrollLeft(),
          scrollTop: editor.getScrollTop(),
        };
      }

      editor.setValue(context.currentFile.data);
    }
  }, [context]);

  function handleChange() {
    const editor = props.editorRef.current;
    if (!editor) {
      return;
    }

    const handleExitBlocker = () => {
      const value = editor.getValue();
      if (value !== '') {
        setChanged(true);
        return;
      }

      setChanged(false);
    };

    const moveToScrollPosition = () => {
      const path = context.nodeQueue[context.nodeQueue.length - 1].path;
      const position = scrollPositionStorage.current[path];

      if (position) {
        editor.setScrollPosition(position);
      } else {
        editor.setScrollPosition({ scrollLeft: 0, scrollTop: 0 });
      }
    };

    handleExitBlocker();
    moveToScrollPosition();
  }

  function handleMonacoBeforeMount(Monaco: typeof MonacoType) {
    monacoRef.current = Monaco;
    new TypescriptMonacoSetter(Monaco).set();
  }

  function handleEditorOnMount(Editor: MonacoType.editor.IStandaloneCodeEditor) {
    props.editorRef.current = Editor;
    new TypescriptEditorSetter(Editor).set();
  }

  return (
    <Box>
      <Sidebar>
        {props.cancelComponent}
        {props.confirmComponent}
      </Sidebar>
      <MonacoEditorComponent
        width={props.width}
        height={props.height}
        path={'index.ts'}
        value={props.value}
        options={options}
        beforeMount={handleMonacoBeforeMount}
        onMount={handleEditorOnMount}
        onChange={handleChange}
      />
    </Box>
  );
};

TypescriptEditor.displayName = 'Typescript Editor';

export default TypescriptEditor;

const Box = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-bottom: 1rem;
`;
