import { OrganizationId, PlatformType, ProjectId, StepSchema, ROUTINE_STEP_NAME_MAX_LENGTH, Platform } from '@dogu-private/types';
import { useRouter } from 'next/router';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import { AppVersion } from '@dogu-tech/action-common';
import useTranslation from 'next-translate/useTranslation';
import { CloseOutlined } from '@ant-design/icons';
import { Input, Radio } from 'antd';

import { CHECKOUT_ACTION_NAME, PREPARE_ACTION_NAME, RUN_TEST_ACTION_NAME } from '../../../../types/routine';
import ActionSelector from './ActionSelector';
import ContainerMenu from './ContainerMenu';
import NameEditor from './NameEditor';
import TestScriptSelector from './TestScriptSelector';
import PlatformAppVersionSelector from './PlatformAppVersionSelector';
import useProjectContext from '../../../../hooks/context/useProjectContext';
import ErrorBox from '../../../common/boxes/ErrorBox';

interface AppVersionProps {
  step: StepSchema;
  onUpdate: (platform: PlatformType, version: string | undefined) => void;
  onClose: (platform: PlatformType) => void;
}

const AppVersionContainer = ({ step, onUpdate, onClose }: AppVersionProps) => {
  const appVersion = step.with?.appVersion as AppVersion | undefined;

  if (!appVersion) {
    onUpdate('android', undefined);
    onUpdate('ios', undefined);

    return null;
  }

  if (typeof appVersion === 'string' || typeof appVersion === 'number') {
    return <p>{appVersion}</p>;
  }

  return (
    <div>
      {Object.keys(appVersion).map((platform) => {
        return (
          <PlatformAppVersionSelector key={platform} version={appVersion[platform as PlatformType]} platform={platform as PlatformType} onReset={onClose} onChange={onUpdate} />
        );
      })}
    </div>
  );
};

interface ScriptProps {
  step: StepSchema;
  onUpdate: (path: string) => void;
  onClose: () => void;
}

const ScriptContainer = ({ step, onUpdate, onClose }: ScriptProps) => {
  const script = step.with?.script as string | undefined;
  const router = useRouter();

  if (!script) {
    return (
      <TestScriptSelector
        organizationId={router.query.orgId as OrganizationId}
        projectId={router.query.pid as ProjectId}
        style={{ maxWidth: '20rem', width: '100%' }}
        placeholder="Select script"
        onChange={onUpdate}
      />
    );
  }

  return (
    <div>
      {script}
      <CloseButton onClick={onClose}>
        <CloseOutlined />
      </CloseButton>
    </div>
  );
};

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
  const [type, setType] = useState<StepType | null>(step.uses !== undefined ? StepType.ACTION : step.run !== undefined ? StepType.SHELL : null);

  const updateStepName = useCallback(
    (value: string) => {
      updateStep({ ...step, name: value }, index);
    },
    [updateStep, step, index],
  );
  const { t } = useTranslation('routine');

  const updateAppVersion = useCallback(
    (platform: PlatformType, version: string | undefined) => {
      if (!version) {
        return;
      }

      const existAppVersion = step.with?.appVersion as AppVersion | undefined;

      if (existAppVersion) {
        if (typeof existAppVersion === 'string' || typeof existAppVersion === 'number') {
          updateStep({ ...step, with: { appVersion: { [platform]: version } } }, index);
        } else {
          updateStep({ ...step, with: { appVersion: { ...existAppVersion, [platform]: version } } }, index);
        }
      } else {
        updateStep({ ...step, with: { appVersion: { [platform]: version } } }, index);
      }
    },
    [updateStep, index, step],
  );

  const updateAction = useCallback(
    (value: typeof PREPARE_ACTION_NAME | typeof RUN_TEST_ACTION_NAME) => {
      updateStep({ ...step, uses: value, with: undefined }, index);
    },
    [updateStep, index, step],
  );

  const updateScript = useCallback(
    (path: string) => {
      updateStep({ ...step, with: { script: path } }, index);
    },
    [updateStep, index, step],
  );

  const removeStepWith = useCallback(() => {
    updateStep({ ...step, with: {} }, index);
  }, [updateStep, index, step]);

  const removeAppVersion = useCallback(
    (platform: PlatformType) => {
      const appVersion = step.with?.appVersion as AppVersion | undefined;

      if (!appVersion) {
        return;
      }

      if (typeof appVersion === 'string') {
        return;
      }

      if (typeof appVersion === 'object') {
        updateStep({ ...step, with: { appVersion: { ...appVersion, [platform]: undefined } } }, index);
      }
    },
    [updateStep, step, index],
  );

  if (!project) {
    return <ErrorBox title="Something went wrong" desc="Cannot find project" />;
  }

  return (
    <Box>
      <ContainerMenu onDeleteClicked={() => deleteStep(index)} onMoveDownClicked={() => moveStep(index, 'down')} onMoveUpClicked={() => moveStep(index, 'up')} />

      <Content style={{ fontWeight: '600', paddingRight: '4rem' }}>
        <NameEditor defaultValue={step.name} onSave={updateStepName} maxLength={ROUTINE_STEP_NAME_MAX_LENGTH} />
      </Content>

      <Content>
        <ContentTitle>Step type</ContentTitle>
        <div>
          <Radio.Group
            value={type}
            onChange={(e) => {
              if (e.target.value === StepType.ACTION) {
                updateStep({ ...step, uses: RUN_TEST_ACTION_NAME, run: undefined, with: {} }, index);
              } else if (e.target.value === StepType.SHELL) {
                updateStep({ ...step, uses: undefined, run: '', with: undefined }, index);
              }
              setType(e.target.value);
            }}
          >
            <Radio value={StepType.ACTION}>Action</Radio>
            <Radio value={StepType.SHELL}>Shell</Radio>
          </Radio.Group>
        </div>
      </Content>

      {type === 'shell' && (
        <>
          <Content>
            <ContentTitle>Run</ContentTitle>
            <div>
              <Input.TextArea
                value={step.run}
                placeholder={`npm install
npm run test:web
-----or-----
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest app/test_android.py`}
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
      )}

      {type === 'action' && (
        <>
          <Content>
            <ContentTitle>{t('routineGuiEditorStepActionLabel')}</ContentTitle>
            <div>
              {!!step.uses && [PREPARE_ACTION_NAME, CHECKOUT_ACTION_NAME, RUN_TEST_ACTION_NAME].includes(step.uses) ? (
                <ActionSelector value={step.uses} optionLabelProp="title" style={{ width: '200px' }} onChange={updateAction} />
              ) : (
                <p>{step.uses}</p>
              )}
            </div>
          </Content>

          {step.uses === PREPARE_ACTION_NAME && (
            <Content>
              <ContentTitle>{t('routineGuiEditorStepAppVersionLabel')}</ContentTitle>
              <SelectWrapper>
                <AppVersionContainer step={step} onUpdate={updateAppVersion} onClose={removeAppVersion} />
              </SelectWrapper>
            </Content>
          )}

          {step.uses === RUN_TEST_ACTION_NAME && (
            <Content>
              <ContentTitle>{t('routineGuiEditorStepScriptLabel')}</ContentTitle>
              <SelectWrapper>
                <ScriptContainer step={step} onUpdate={updateScript} onClose={removeStepWith} />
              </SelectWrapper>
            </Content>
          )}
        </>
      )}
    </Box>
  );
};

export default React.memo(StepContainer);

const Box = styled.div`
  position: relative;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
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
