import { JobSchema, StepSchema } from '@dogu-private/types';
import styled from 'styled-components';
import { RoutineGUIEditorNodeType } from '../../../../types/routine';

const GUISidebar = () => {
  const handleDragStart = (event: React.DragEvent<HTMLDivElement>, data: string) => {
    event.dataTransfer.setData('application/reactflow', data);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleDragJob = (event: React.DragEvent<HTMLDivElement>) => {
    const tempJob: JobSchema = {
      'runs-on': {
        group: [],
      },
      steps: [
        {
          name: 'prepare',
        },
      ],
    };

    handleDragStart(event, JSON.stringify({ nodeType: RoutineGUIEditorNodeType.JOB, job: tempJob }));
  };

  const handleDragStep = (event: React.DragEvent<HTMLDivElement>) => {
    const tempStep: StepSchema = {
      name: 'New step',
    };

    handleDragStart(event, JSON.stringify({ nodeType: RoutineGUIEditorNodeType.STEP, step: tempStep }));
  };

  return (
    <Box>
      <div style={{ marginBottom: '1rem' }}>
        <p>Drag and drop to create</p>
      </div>
      <DraggableItem onDragStart={handleDragJob} draggable bgColor="#9ef0a033">
        Job
      </DraggableItem>
      <DraggableItem onDragStart={handleDragStep} draggable bgColor="#dfdfdf88">
        Step
      </DraggableItem>
    </Box>
  );
};

export default GUISidebar;

const Box = styled.div`
  width: 20%;
  max-width: 15rem;
  height: 100%;
  padding: 1rem;
  padding-left: 0;
`;

const DraggableItem = styled.div<{ bgColor: string }>`
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: ${(props) => props.bgColor};
  text-align: center;
  border: 1px solid ${(props) => props.theme.colors.gray4};
  margin-bottom: 1rem;

  cursor: move;
`;
