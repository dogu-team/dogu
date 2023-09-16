import { OrganizationId, TeamId } from '@dogu-private/types';
import { Button, ButtonProps } from 'antd';

import useModal from 'src/hooks/useModal';
import AddMemberModal from './AddMemberModal';

interface Props extends ButtonProps {
  organizationId: OrganizationId;
  teamId: TeamId;
}

const AddMemberButton = ({ organizationId, teamId, ...buttonProps }: Props) => {
  const [isOpen, openModal, closeModal] = useModal();

  return (
    <>
      <Button
        {...buttonProps}
        onClick={() => openModal()}
        access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'add-team-member-btn' : undefined}
      />

      <AddMemberModal isOpen={isOpen} close={closeModal} organizationId={organizationId} teamId={teamId} />
    </>
  );
};

export default AddMemberButton;
