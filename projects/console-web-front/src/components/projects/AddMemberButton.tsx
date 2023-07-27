import { OrganizationId, ProjectId } from '@dogu-private/types';
import { Button } from 'antd';
import useTranslation from 'next-translate/useTranslation';

import AddMemberModal from './AddMemberModal';
import useModal from 'src/hooks/useModal';

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
}

const AddMemberButton = ({ organizationId, projectId }: Props) => {
  const { t } = useTranslation('project');
  const [isOpen, openModal, closeModal] = useModal();

  return (
    <>
      <Button type="primary" onClick={() => openModal()} access-id="add-project-org-member-btn">
        {t('project-member:addProjectOrgMemberMember')}
      </Button>

      <AddMemberModal organizationId={organizationId} projectId={projectId} isOpen={isOpen} close={closeModal} />
    </>
  );
};

export default AddMemberButton;
