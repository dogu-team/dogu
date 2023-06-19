import { OrganizationId, TeamId } from '@dogu-private/types';
import { Button } from 'antd';
import useTranslation from 'next-translate/useTranslation';

import useModal from 'src/hooks/useModal';
import AddProjectModal from './AddProjectModal';

interface Props {
  organizationId: OrganizationId;
  teamId: TeamId;
}

const AddProjectButton = ({ organizationId, teamId }: Props) => {
  const [isOpen, openModal, closeModal] = useModal();
  const { t } = useTranslation();

  return (
    <>
      <Button type="primary" onClick={() => openModal()}>
        {t('team:addProjectButtonTitle')}
      </Button>

      <AddProjectModal close={closeModal} isOpen={isOpen} organizationId={organizationId} teamId={teamId} />
    </>
  );
};

export default AddProjectButton;
