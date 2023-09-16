import { RemoteDestBase } from '@dogu-private/console';
import styled from 'styled-components';

import DestUnit from '../reports/DestUnit';

interface Props {
  dest: RemoteDestBase;
}

const RemoteDestUnit = ({ dest }: Props) => {
  return (
    <StyledDestUnit state={dest.state} name={dest.name} startedAt={dest.inProgressAt} endedAt={dest.completedAt} />
  );
};

export default RemoteDestUnit;

const StyledDestUnit = styled(DestUnit)`
  cursor: default;
  border: 1px solid ${(props) => props.theme.main.colors.gray6};
`;
