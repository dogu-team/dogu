import { OrganizationId, ProjectId } from '@dogu-private/types';
import { Button } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';

import useModal from 'src/hooks/useModal';
import AddTeamModal from './AddTeamModal';

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
}

const AddTeamButton = ({ organizationId, projectId }: Props) => {
  const { t } = useTranslation();
  const [isOpen, openModal, closeModal] = useModal();

  return (
    <>
      <Button type="primary" onClick={() => openModal()} access-id="add-project-team-btn">
        {t('project-member:addProjectTeamMember')}
      </Button>

      <AddTeamModal isOpen={isOpen} close={closeModal} organizationId={organizationId} projectId={projectId} />
    </>
  );
};

export default AddTeamButton;

const ListContainer = styled.div`
  margin-top: 1rem;
`;
