import styled from 'styled-components';

import StepEditor from './StepEditor';
import StepNavigator from './StepNavigator';
import StepThumbnailBar from './StepThumbnailBar';

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
      <ThumbnailWrapper>
        <StepThumbnailBar />
      </ThumbnailWrapper>
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

const ThumbnailWrapper = styled(Wrapper)`
  min-width: 200px;
  border-left: 1px solid #e5e5e5;
  height: 100%;
  flex-shrink: 0;
  flex: 1;
`;

const StepWrapper = styled.div`
  flex: 1;
`;

const NavigatorWrapper = styled.div`
  height: 2rem;
`;
