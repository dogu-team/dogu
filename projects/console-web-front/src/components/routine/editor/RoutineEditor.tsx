import styled from 'styled-components';

import { RoutineEditMode } from '../../../types/routine';

interface Props {
  mode: RoutineEditMode;
  menu: React.ReactNode;
  scriptEditor: React.ReactNode;
  guiEditor: React.ReactNode;
  preview: React.ReactNode;
}

const RoutineEditor = ({ mode, menu, scriptEditor, guiEditor, preview }: Props) => {
  return (
    <Box>
      {menu}

      <EditorWrapper>
        {mode === RoutineEditMode.SCRIPT && scriptEditor}
        {mode === RoutineEditMode.GUI && guiEditor}
        {mode === RoutineEditMode.PREVIEW && preview}
      </EditorWrapper>
    </Box>
  );
};

export default RoutineEditor;

const Box = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const EditorWrapper = styled.div`
  flex: 1;
  height: 100%;
`;
