import { StepSchema, ROUTINE_STEP_NAME_MAX_LENGTH } from '@dogu-private/types';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';
import { Input, Radio } from 'antd';

import { PREPARE_ACTION_NAME, RUN_TEST_ACTION_NAME } from '../../../../types/routine';
import ActionSelector from './ActionSelector';
import ContainerMenu from './ContainerMenu';
import NameEditor from './NameEditor';
import useProjectContext from '../../../../hooks/context/useProjectContext';
import ErrorBox from '../../../common/boxes/ErrorBox';
import StepActionArgumentContainer from './StepActionArgumentContainer';
import WorkingDirectoryContainer from './WorkingDirectoryContainer';

interface Props {
  jobName: string;
  step: StepSchema;
  index: number;
  updateStep: (step: StepSchema, index: number) => void;
  deleteStep: (index: number) => void;
  moveStep: (index: number, direction: 'up' | 'down') => void;
}

enum StepType {
  ACTION = 'action',
  SHELL = 'shell',
}

const StepContainer = ({ jobName, step, index, updateStep, deleteStep, moveStep }: Props) => {
  const { project } = useProjectContext();
  // const [type, setType] = useState<StepType | null>(
  //   step.uses !== undefined ? StepType.ACTION : step.run !== undefined ? StepType.SHELL : null,
  // );
  // const type = StepType.ACTION;

  const updateStepName = useCallback(
    (value: string) => {
      updateStep({ ...step, name: value }, index);
    },
    [updateStep, step, index],
  );
  const { t } = useTranslation('routine');

  const updateAction = useCallback(
    (value: typeof PREPARE_ACTION_NAME | typeof RUN_TEST_ACTION_NAME) => {
      updateStep({ ...step, uses: value, with: undefined }, index);
    },
    [updateStep, index, step],
  );

  if (!project) {
    return <ErrorBox title="Something went wrong" desc="Cannot find project" />;
  }

  return (
    <Box>
      <ContainerMenu
        onDeleteClicked={() => deleteStep(index)}
        onMoveDownClicked={() => moveStep(index, 'down')}
        onMoveUpClicked={() => moveStep(index, 'up')}
      />

      <Content style={{ fontWeight: '600', paddingRight: '4rem' }}>
        <NameEditor defaultValue={step.name} onSave={updateStepName} maxLength={ROUTINE_STEP_NAME_MAX_LENGTH} />
      </Content>

      {/* <Content>
        <ContentTitle>{t('routine:routineGuiEditorStepTypeLabel')}</ContentTitle>
        <div>
          <Radio.Group
            value={type}
            onChange={(e) => {
              if (e.target.value === StepType.ACTION) {
                updateStep({ ...step, uses: RUN_TEST_ACTION_NAME, run: undefined }, index);
              } else if (e.target.value === StepType.SHELL) {
                updateStep({ ...step, uses: undefined, run: '', with: undefined, cwd: undefined }, index);
              }
            }}
          >
            <Radio value={StepType.ACTION}>Action</Radio>
            <Radio value={StepType.SHELL}>Shell</Radio>
          </Radio.Group>
        </div>
      </Content> */}

      {/* {type === StepType.SHELL && (
        <>
          <Content>
            <ContentTitle>Run</ContentTitle>
            <div>
              <Input.TextArea
                value={step.run}
                placeholder={`echo Hello
echo Dogu!`}
                autoSize
                onChange={(e) => {
                  updateStep(
                    {
                      ...step,
                      run: `${e.target.value}`,
                    },
                    index,
                  );
                }}
              />
            </div>
          </Content>
        </>
      )} */}

      {/* {type === StepType.ACTION && (
        <> */}
      {/* <Content>
        <ContentTitle>{t('routineGuiEditorStepActionLabel')}</ContentTitle>
        <div>
          <ActionSelector
            value={step.uses}
            optionLabelProp="title"
            style={{ width: '200px' }}
            onChange={updateAction}
          />
        </div>
      </Content> */}

      {step.uses === RUN_TEST_ACTION_NAME && (
        <Content>
          <ContentTitle>{t('routine:routineGuiEditorStepWorkingDirLabel')}</ContentTitle>
          <ContentDesc>{t('routine:routineGuiEditorStepWorkingDirDescription')}</ContentDesc>
          <SelectWrapper>
            <WorkingDirectoryContainer
              value={step.cwd}
              onChange={(value) => updateStep({ ...step, cwd: value }, index)}
            />
          </SelectWrapper>
        </Content>
      )}

      <Content>
        <ContentTitle>{t('routine:routineGuiEditorStepArgumentLabel')}</ContentTitle>
        <div>
          <StepActionArgumentContainer
            step={step}
            onUpdate={(stepWith) => updateStep({ ...step, with: stepWith }, index)}
          />
        </div>
      </Content>
      {/* </>
      )} */}
    </Box>
  );
};

export default React.memo(StepContainer);

const Box = styled.div`
  position: relative;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid ${(props) => props.theme.colors.gray4};
  border-radius: 0.5rem;
  background-color: #efefef88;
  font-size: 0.9rem;
`;

const Content = styled.div`
  margin-bottom: 0.5rem;
`;

const ContentTitle = styled.p`
  margin-bottom: 0.25rem;
`;

const ContentDesc = styled.p`
  font-size: 0.8rem;
  color: ${(props) => props.theme.main.colors.gray3};
  margin-bottom: 0.25rem;
`;

const SelectWrapper = styled.div`
  max-width: 500px;
`;

const CloseButton = styled.button`
  padding: 0.25rem;
  margin-left: 0.25rem;
  border: none;
  background-color: transparent;
  cursor: pointer;
`;
