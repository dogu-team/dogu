import styled from 'styled-components';

import StepEditor from './StepEditor';
import StepNavigator from './StepNavigator';
import StepPreviewBar from './StepPreviewBar';

const VisualTestingEditor = () => {
  return (
    <Box>
      <EditorWrapper>
        <StepWrapper>
          <StepEditor />
        </StepWrapper>
        <NavigatorWrapper>
          <StepNavigator />
        </NavigatorWrapper>
      </EditorWrapper>
      <PreviewSidebar>
        <StepPreviewBar />
      </PreviewSidebar>
    </Box>
  );
};

export default VisualTestingEditor;

const Box = styled.div`
  display: flex;
  height: 100%;
`;

const Wrapper = styled.div`
  padding: 0 1rem;
`;

const EditorWrapper = styled(Wrapper)`
  flex: 4;
  display: flex;
  flex-direction: column;
`;

const PreviewSidebar = styled(Wrapper)`
  width: 20%;
  min-width: 250px;
  border-left: 1px solid #e5e5e5;
  height: 100%;
  flex-shrink: 0;
  flex: 1;
`;

const StepWrapper = styled.div`
  flex: 1;
`;

const NavigatorWrapper = styled.div`
  margin-top: 0.5rem;
  height: 2rem;
`;
