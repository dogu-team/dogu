import styled from 'styled-components';
import { INVITATION_STATUS } from '../../types/organization';

interface Props {
  status: INVITATION_STATUS;
}

const InvitationStatusTag = ({ status }: Props) => {
  if (status === INVITATION_STATUS.PENDING) {
    return <Box style={{ backgroundColor: '#fcba0322', color: '#fcba03' }}>Pending</Box>;
  }

  if (status === INVITATION_STATUS.EXPIRED) {
    return <Box style={{ backgroundColor: '#ff4d4f22', color: '#ff4d4f' }}>Expired</Box>;
  }

  return null;
};

export default InvitationStatusTag;

const Box = styled.div`
  display: inline-flex;
  padding: 4px 8px;
  border-radius: 20px;
  align-items: center;
`;
