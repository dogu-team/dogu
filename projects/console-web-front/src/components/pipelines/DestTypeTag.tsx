import { DEST_TYPE } from '@dogu-private/types';
import { Tag } from 'antd';
import styled from 'styled-components';

interface Props {
  type: DEST_TYPE;
}

const DestTypeTag = ({ type }: Props) => {
  switch (type) {
    case DEST_TYPE.JOB:
      return (
        <StyledTag style={{ border: 'none' }} color="blue">
          Job
        </StyledTag>
      );
    case DEST_TYPE.UNIT:
      return (
        <StyledTag style={{ border: 'none' }} color="purple">
          Test
        </StyledTag>
      );
    default:
      return null;
  }
};

const StyledTag = styled(Tag)`
  margin-right: 0.25rem;
`;

export default DestTypeTag;
