import { QuestionCircleFilled } from '@ant-design/icons';
import { JobSchema, ROUTINE_JOB_NAME_MAX_LENGTH, StepSchema } from '@dogu-private/types';
import { Switch, Tag, Tooltip } from 'antd';
import { useCallback } from 'react';
import { move, update } from 'ramda';
import styled from 'styled-components';
import useTranslation from 'next-translate/useTranslation';

import { flexRowBaseStyle } from '../../../../styles/box';
import AddDeviceTagButton from './AddDeviceTagButton';
import AddNeedButton from './AddNeedButton';
import ContainerMenu from './ContainerMenu';
import NameEditor from './NameEditor';
import StepContainer from './StepContainer';
import { RUN_TEST_ACTION_NAME } from '../../../../types/routine';

interface NeedsProps {
  needs: JobSchema['needs'];
  onDelete: (need: string) => void;
}

const Needs = ({ needs, onDelete }: NeedsProps) => {
  if (!needs) {
    return null;
  }

  if (typeof needs === 'string') {
    return (
      <Tag color="cyan" closable onClose={() => onDelete(needs)}>
        {needs}
      </Tag>
    );
  }

  return (
    <>
      {needs.map((need) => {
        return (
          <Tag key={need} color="cyan" closable onClose={() => onDelete(need)}>
            {need}
          </Tag>
        );
      })}
    </>
  );
};

interface RunsOnProps {
  runsOn: JobSchema['runs-on'];
  onDelete: (tag: string) => void;
}

const RunsOn = ({ runsOn, onDelete }: RunsOnProps) => {
  if (typeof runsOn === 'string') {
    return (
      <Tag color="pink" closable onClose={() => onDelete(runsOn)}>
        {runsOn}
      </Tag>
    );
  }

  if ('group' in runsOn) {
    if (typeof runsOn.group === 'string') {
      return (
        <Tag color="pink" closable onClose={() => onDelete(runsOn.group as string)}>
          {runsOn.group}
        </Tag>
      );
    }

    return (
      <>
        {runsOn.group.map((tag) => {
          return (
            <Tag key={tag} color="pink" closable onClose={() => onDelete(tag)}>
              {tag}
            </Tag>
          );
        })}
      </>
    );
  }

  return (
    <>
      {runsOn.map((tag) => {
        return (
          <Tag key={tag} color="pink" closable onClose={() => onDelete(tag)}>
            {tag}
          </Tag>
        );
      })}
    </>
  );
};

interface Props {
  name: string;
  job: JobSchema;
  updateJob: (job: JobSchema, name: string) => void;
  updateJobName: (originName: string, newName: string) => void;
  deleteJob: (name: string) => void;
  updateJobOrder: (name: string, direction: 'up' | 'down') => void;
}

const JobContainer = ({ name, job, updateJob, updateJobName, deleteJob, updateJobOrder }: Props) => {
  const { t } = useTranslation();

  const handleAddNeeds = useCallback(
    (need: string) => {
      const needs = job.needs;

      if (!needs) {
        updateJob({ ...job, needs: [need] }, name);
        return;
      }

      if (typeof needs === 'string') {
        if (needs === need) {
          return;
        }

        updateJob({ ...job, needs: [needs, need] }, name);
        return;
      }

      const newNeeds = [...needs, need];
      updateJob({ ...job, needs: newNeeds }, name);
    },
    [updateJob, job, name],
  );

  const handleAddRunsOn = useCallback(
    (tag: string) => {
      const runsOn = job['runs-on'];

      if (!runsOn) {
        updateJob({ ...job, 'runs-on': { group: [tag] } }, name);
        return;
      }

      if (typeof runsOn === 'string') {
        if (runsOn === tag) {
          return;
        }

        updateJob({ ...job, 'runs-on': { group: [runsOn, tag] } }, name);
        return;
      }

      if ('group' in runsOn) {
        if (typeof runsOn.group === 'string') {
          if (runsOn.group === tag) {
            return;
          }

          updateJob({ ...job, 'runs-on': { group: [runsOn.group, tag] } }, name);
          return;
        }

        if (runsOn.group.includes(tag)) {
          return;
        }

        const newRunsOn = [...runsOn.group, tag];
        updateJob({ ...job, 'runs-on': { group: newRunsOn } }, name);
        return;
      }
    },
    [updateJob, job, name],
  );

  const handleRemoveNeed = useCallback(
    (need: string) => {
      const needs = job.needs;

      if (!needs) {
        return;
      }

      if (typeof needs === 'string') {
        updateJob({ ...job, needs: [] }, name);
        return;
      }

      const newNeeds = needs.filter((n) => n !== need);
      updateJob({ ...job, needs: newNeeds }, name);
    },
    [updateJob, job, name],
  );

  const handleRemoveRunsOn = useCallback(
    (tag: string) => {
      const runsOn = job['runs-on'];

      if (!runsOn) {
        return;
      }

      if (typeof runsOn === 'string') {
        updateJob({ ...job, ['runs-on']: [] }, name);
        return;
      }

      if ('group' in runsOn) {
        if (typeof runsOn.group === 'string') {
          updateJob({ ...job, ['runs-on']: { group: [] } }, name);
          return;
        }

        const newRunsOn = runsOn.group.filter((t) => t !== tag);

        updateJob({ ...job, 'runs-on': { group: newRunsOn } }, name);
        return;
      }

      const newRunsOn = runsOn.filter((t) => t !== tag);
      updateJob({ ...job, 'runs-on': newRunsOn }, name);
    },
    [updateJob, job, name],
  );

  const handleUpdateRecord = useCallback(
    (checked: boolean) => {
      updateJob({ ...job, record: checked }, name);
    },
    [updateJob, job, name],
  );

  const handleAddStep = useCallback(() => {
    const steps = job.steps;
    const newSteps: StepSchema[] = [...steps, { name: 'New step', uses: RUN_TEST_ACTION_NAME }];
    updateJob({ ...job, steps: newSteps }, name);
  }, [job, name, updateJob]);

  const deleteStep = useCallback(
    (index: number) => {
      const steps = job.steps;
      const newSteps = steps.filter((_, i) => i !== index);
      updateJob({ ...job, steps: newSteps }, name);
    },
    [job, name, updateJob],
  );

  const moveStep = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const steps = job.steps;

      if (direction === 'up') {
        if (index === 0) {
          return;
        }

        const newSteps = move(index, index - 1, steps);
        updateJob({ ...job, steps: newSteps }, name);
      } else {
        if (index === steps.length - 1) {
          return;
        }

        const newSteps = move(index, index + 1, steps);
        updateJob({ ...job, steps: newSteps }, name);
      }
    },
    [job, name, updateJob],
  );

  const updateStep = useCallback(
    (step: StepSchema, index: number) => {
      const steps = job.steps;
      const newSteps = update(index, step, steps);
      updateJob({ ...job, steps: newSteps }, name);
    },
    [job, name, updateJob],
  );

  return (
    <Box>
      <ContainerMenu onDeleteClicked={() => deleteJob(name)} onMoveDownClicked={() => updateJobOrder(name, 'down')} onMoveUpClicked={() => updateJobOrder(name, 'up')} />
      <Content>
        <JobNameTitle style={{ paddingRight: '4rem' }}>
          <NameEditor
            defaultValue={name}
            onSave={(value) => updateJobName(name, value)}
            maxLength={ROUTINE_JOB_NAME_MAX_LENGTH}
            placeholder={t('routine:routineGuiEditorJobNamePlaceholder')}
          />
        </JobNameTitle>
      </Content>
      <Content>
        <div>
          {t('routine:routineGuiEditorJobNeedLabel')}{' '}
          <Tooltip overlayInnerStyle={{ fontSize: '.8rem' }} title={t('routine:routineGuiEditorJobNeedDescription')}>
            <QuestionCircleFilled />
          </Tooltip>
        </div>
        <ContentInner>
          <Needs needs={job.needs} onDelete={handleRemoveNeed} />
          <AddNeedButton onSelect={handleAddNeeds} excludeNames={[name]} />
        </ContentInner>
      </Content>
      <Content>
        <div>
          {t('routine:routineGuiEditorJobDeviceTagLabel')}{' '}
          <Tooltip overlayInnerStyle={{ fontSize: '.8rem' }} title={t('routine:routineGuiEditorJobDeviceTagDescription')}>
            <QuestionCircleFilled />
          </Tooltip>
        </div>
        <ContentInner>
          <RunsOn runsOn={job['runs-on']} onDelete={handleRemoveRunsOn} />
          <AddDeviceTagButton onSelect={handleAddRunsOn} />
        </ContentInner>
      </Content>
      <Content>
        <div>
          {t('routine:routineGuiEditorJobScreenRecordLabel')}{' '}
          <Tooltip overlayInnerStyle={{ fontSize: '.8rem' }} title={t('routine:routineGuiEditorJobScreenRecordDescription')}>
            <QuestionCircleFilled />
          </Tooltip>
        </div>
        <ContentInner>
          <Switch checked={job.record} onChange={handleUpdateRecord} />
        </ContentInner>
      </Content>
      <Content>
        <div>{t('routine:routineGuiEditorStepLabel')}</div>
        <StepWrapper>
          {job.steps.map((step, i) => {
            return (
              <StepContainer key={`job-${name}-step-${step.name}-${i}`} jobName={name} step={step} index={i} updateStep={updateStep} deleteStep={deleteStep} moveStep={moveStep} />
            );
          })}
          <AddStepButton onClick={handleAddStep}>{t('routine:routineGuiEditorAddStepButtonTitle')}</AddStepButton>
        </StepWrapper>
      </Content>
    </Box>
  );
};

export default JobContainer;

const Box = styled.div`
  position: relative;
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid ${(props) => props.theme.colors.gray4};
  border-radius: 0.5rem;
  font-size: 1rem;
  user-select: none;

  p {
    user-select: text;
  }
`;

const Content = styled.div`
  margin-bottom: 0.5rem;
`;

const ContentInner = styled.div`
  ${flexRowBaseStyle}
  flex-wrap: wrap;
  margin-top: 0.25rem;
`;

const JobNameTitle = styled.div`
  font-weight: bold;
`;

const StepWrapper = styled.div`
  padding: 1rem;
`;

const AddStepButton = styled.div`
  padding: 0.5rem;
  border: 1px dashed ${(props) => props.theme.colors.gray4};
  border-radius: 0.5rem;
  background-color: #ffffff;
  font-size: 0.9rem;
  text-align: center;
  cursor: pointer;
`;
