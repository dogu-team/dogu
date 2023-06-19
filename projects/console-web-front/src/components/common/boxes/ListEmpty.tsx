import { Empty, EmptyProps } from 'antd';
import styled from 'styled-components';

const ListEmpty = (props: EmptyProps) => {
  return <StyledEmpty {...props} />;
};

export default ListEmpty;

const StyledEmpty = styled(Empty)`
  margin-top: 6rem;
`;
