import * as MonacoType from 'monaco-editor';
import MonacoEditorComponent from '@monaco-editor/react';
import { createContext, MutableRefObject, useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

import { ExplorerNode } from 'src/components/explorer/type';
import { ViewerMonacoSetter } from './monaco';
import { ViewerSetter } from './editor';
import { RepositoryRawFile } from '@dogu-private/console';
import { convertExtensionToLanguage } from '../common/language-convertor';

export type IContext = {
  nodeQueue: ExplorerNode[];
  currentFile: RepositoryRawFile;
  selectedNode: ExplorerNode;
};

export const Context = createContext<IContext>({
  nodeQueue: [],
  currentFile: {
    file_name: '',
    file_path: '',
    size: 0,
    encoding: '',
    content: '',
    content_sha256: '',
    ref: '',
    blob_id: '',
    commit_id: '',
    last_commit_id: '',
  },
  selectedNode: { type: 'dir', name: '', path: '' },
});

type ScrollPositionStorage = {
  [path: string]: { scrollLeft: number; scrollTop: number };
};

interface Props {
  editorRef: MutableRefObject<MonacoType.editor.IStandaloneCodeEditor | null>;
  headerMenu: JSX.Element;
  width?: string;
  height?: string;
}

const FileViewer = (props: Props) => {
  const scrollPositionStorage = useRef<ScrollPositionStorage>({});
  const monacoRef = useRef<typeof MonacoType>();
  const context = useContext(Context);

  const options: MonacoType.editor.IStandaloneEditorConstructionOptions = {
    readOnly: true,
    domReadOnly: true,
    minimap: { enabled: false },
    overviewRulerBorder: false,
    occurrencesHighlight: false,
    hideCursorInOverviewRuler: true,
  };

  function handleChange() {
    const editor = props.editorRef.current;
    if (!editor) {
      return;
    }

    const moveToScrollPosition = () => {
      const path = context.nodeQueue[context.nodeQueue.length - 1].path;
      const position = scrollPositionStorage.current[path];

      if (position) {
        editor.setScrollPosition(position);
      } else {
        editor.setScrollPosition({ scrollLeft: 0, scrollTop: 0 });
      }
    };

    moveToScrollPosition();
  }

  function handleMonacoBeforeMount(Monaco: typeof MonacoType) {
    monacoRef.current = Monaco;
    new ViewerMonacoSetter(Monaco).set();
  }

  function handleEditorOnMount(Editor: MonacoType.editor.IStandaloneCodeEditor) {
    props.editorRef.current = Editor;
    new ViewerSetter(Editor).set();
  }

  return (
    <Box>
      <Sidebar>{props.headerMenu}</Sidebar>
      <MonacoEditorComponent
        width={props.width}
        height={props.height}
        options={options}
        path={context.currentFile.file_path}
        value={Buffer.from(context.currentFile.content, 'base64').toString()}
        language={convertExtensionToLanguage(context.currentFile.file_path)}
        beforeMount={handleMonacoBeforeMount}
        onMount={handleEditorOnMount}
        onChange={handleChange}
      />
    </Box>
  );
};

FileViewer.displayName = 'File Viewer';

export default FileViewer;

const Box = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;

  .monaco-editor,
  .overflow-guard,
  .view-lines.monaco-mouse-cursor-text {
    width: 100% !important;
    height: 100% !important;
  }

  .glyph-margin,
  .minimap.slider-mouseover {
    height: 100% !important;
  }

  .monaco-scrollable-element.editor-scrollable.vs {
    height: 100% !important;
    width: calc(100% - 62px) !important;
  }

  .scrollbar.horizontal {
    width: calc(100% - 14px) !important;
  }

  .overlayWidgets,
  .view-overlays,
  .current-line {
    width: 100% !important;
  }

  .overflow-guard > div:nth-child(3) {
    width: 100% !important;
  }
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-bottom: 1rem;
`;
