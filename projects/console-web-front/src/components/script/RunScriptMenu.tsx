import { DeviceBase, ProjectApplicationWithIcon, ProjectBase } from '@dogu-private/console';
import useTranslation from 'next-translate/useTranslation';
import React from 'react';
import styled from 'styled-components';
import useDebouncedInputValues from '../../hooks/useDebouncedInputValues';
import useSelect from '../../hooks/useSelect';

import { flexRowBaseStyle } from '../../styles/box';
import { getAvailableApplicationExtension } from '../../utils/streaming';
import ProjectApplicationSelector from '../project-application/ProjectApplicationSelector';
import ScriptDeviceSeletor from './ScriptDeviceSelector';

interface Props {
  project: ProjectBase;
  selectedApp: ProjectApplicationWithIcon | undefined;
  selectedDevice: DeviceBase | undefined;
  onSelectApp: (app: ProjectApplicationWithIcon | undefined) => void;
  onSelectDevice: (device: DeviceBase | undefined) => void;
  button: React.ReactNode;
}

const RunScriptMenu = ({ project, selectedApp, selectedDevice, button, onSelectApp, onSelectDevice }: Props) => {
  const { isOpen: isAppSelectOpen, toggle: toggleAppSelect, close: closeAppSelect } = useSelect();
  const {} = useDebouncedInputValues();

  const { t } = useTranslation();

  return (
    <FlexRow>
      <SelectWrapper>
        <SelectWrapperInner>
          <div style={{ width: '150px' }}>
            <ScriptDeviceSeletor organizationId={project.organizationId} projectId={project.projectId} onSelectedDeviceChanged={onSelectDevice} />
          </div>
          <div style={{ width: '150px', marginLeft: '.5rem' }}>
            <ProjectApplicationSelector
              selectedApplication={selectedApp}
              organizationId={project.organizationId}
              projectId={project.projectId}
              extension={selectedDevice ? getAvailableApplicationExtension(selectedDevice.platform).slice(1) : undefined}
              onSelectApp={onSelectApp}
              open={isAppSelectOpen}
              toggleOpen={toggleAppSelect}
              close={closeAppSelect}
              disabled={!selectedDevice}
              placeholder={t('project-script:appVersionSelectPlaceholder')}
            />
          </div>
        </SelectWrapperInner>

        {!selectedApp && <SelectHint>{t('project-script:appVersionSelectDescription')}</SelectHint>}
      </SelectWrapper>

      {button}
    </FlexRow>
  );
};

export default React.memo(RunScriptMenu);

const FlexRow = styled.div`
  ${flexRowBaseStyle}
  margin-bottom: 1rem;
  align-items: flex-start;
`;

const SelectWrapper = styled.div`
  ${flexRowBaseStyle}
  flex: 1;
  margin-right: 0.5rem;
  flex-direction: column;
  flex-wrap: wrap;
`;

const SelectWrapperInner = styled.div`
  width: 100%;
  ${flexRowBaseStyle}
  flex: 1;
`;

const SelectHint = styled.p`
  width: 100%;
  margin-top: 0.25rem;
  line-height: 1.4;
  font-size: 0.8rem;
  color: #555;
`;
