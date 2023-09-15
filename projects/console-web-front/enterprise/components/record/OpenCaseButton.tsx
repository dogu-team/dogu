import { FolderOpenOutlined, LoadingOutlined } from '@ant-design/icons';
import { ProjectBase, RecordTestCaseBase } from '@dogu-private/console';
import { Button, Modal } from 'antd';
import styled from 'styled-components';

import useModal from '../../../src/hooks/useModal';
import { flexRowBaseStyle } from '../../../src/styles/box';
import CaseSelector from './CaseSelector';

interface Props {
  project: ProjectBase;
  onSelect: (testCase: RecordTestCaseBase) => void | Promise<void>;
  isSessionCreating?: boolean;
}

const OpenCaseButton = ({ project, onSelect, isSessionCreating }: Props) => {
  const [isOpen, openModal, closeModal] = useModal();

  return (
    <>
      <Button icon={<FolderOpenOutlined />} onClick={() => openModal()}>
        Open existing case
      </Button>

      <Modal open={isOpen} centered title="Select case" footer={null} closable onCancel={closeModal} destroyOnClose>
        <div>
          <CaseSelector
            organizationId={project.organizationId}
            projectId={project.projectId}
            onSelect={onSelect}
            disabled={isSessionCreating}
          />
        </div>

        {isSessionCreating && (
          <FlexRow>
            <LoadingOutlined /> Opening app...
          </FlexRow>
        )}
      </Modal>
    </>
  );
};

export default OpenCaseButton;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;
