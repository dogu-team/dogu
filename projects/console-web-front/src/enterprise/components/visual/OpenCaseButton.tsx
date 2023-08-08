import { FolderOpenOutlined } from '@ant-design/icons';
import { ProjectBase, RecordTestCaseBase } from '@dogu-private/console';
import { Button, Modal } from 'antd';

import useModal from '../../../hooks/useModal';
import CaseSelector from './CaseSelector';

interface Props {
  project: ProjectBase;
  onSelect: (testCase: RecordTestCaseBase) => void;
}

const OpenCaseButton = ({ project, onSelect }: Props) => {
  const [isOpen, openModal, closeModal] = useModal();

  return (
    <>
      <Button icon={<FolderOpenOutlined />} onClick={() => openModal()}>
        Open existing case
      </Button>

      <Modal open={isOpen} centered title="Select case" footer={null} closable onCancel={closeModal} destroyOnClose>
        <div>
          <CaseSelector organizationId={project.organizationId} projectId={project.projectId} onSelect={onSelect} />
        </div>
      </Modal>
    </>
  );
};

export default OpenCaseButton;
