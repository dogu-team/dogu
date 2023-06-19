import { ClockCircleOutlined, MinusCircleFilled, QuestionCircleFilled } from '@ant-design/icons';
import { DEST_STATE } from '@dogu-private/types';
import { CSSProperties } from 'react';
import styled from 'styled-components';
import { flexRowCenteredStyle } from '../../styles/box';
import { destStatusColor } from '../../utils/mapper';

interface Props {
  status: DEST_STATE;
}

const DestEmptyData = ({ status }: Props) => {
  const iconStyle: CSSProperties = { color: destStatusColor[status], fontSize: '3rem' };

  switch (status) {
    case DEST_STATE.PENDING:
      return (
        <Box>
          <ClockCircleOutlined style={iconStyle} />
          <Description>This test doesn&apos;t start yet</Description>
        </Box>
      );
    case DEST_STATE.RUNNING:
      return (
        <Box>
          <Description>This test is running...</Description>
        </Box>
      );
    case DEST_STATE.SKIPPED:
      return (
        <Box>
          <MinusCircleFilled style={iconStyle} />
          <Description>This test has been skipped.</Description>
        </Box>
      );
    case DEST_STATE.UNSPECIFIED:
      return (
        <Box>
          <QuestionCircleFilled style={iconStyle} />
          <Description>This test status unknown...</Description>
        </Box>
      );
    default:
      return null;
  }
};

export default DestEmptyData;

const Box = styled.div`
  ${flexRowCenteredStyle}
  flex-direction: column;
`;

const Description = styled.p`
  margin-top: 1rem;
  font-weight: 500;
  text-align: center;
`;
