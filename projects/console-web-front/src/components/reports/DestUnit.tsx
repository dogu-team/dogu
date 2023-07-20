import { FieldTimeOutlined } from '@ant-design/icons';
import { DEST_STATE, DEST_TYPE } from '@dogu-private/types';
import styled from 'styled-components';

import { flexRowBaseStyle, flexRowSpaceBetweenStyle } from '../../styles/box';
import DestRuntimeTimer from './DestRuntimeTimer';
import DestStatusIcon from './DestStatusIcon';
import DestTypeTag from './DestTypeTag';

interface Props {
  state: DEST_STATE;
  name: string;
  startedAt: Date | null;
  endedAt: Date | null;
  onClick?: () => void;
  children?: React.ReactNode;
  icon?: React.ReactNode;
}

const DestUnit = ({ state, name, startedAt, endedAt, onClick, children, icon }: Props) => {
  return (
    <>
      <Box onClick={onClick}>
        <FlexRow>
          {icon}
          <IconWrapper>
            <DestStatusIcon state={state} />
          </IconWrapper>
          <div>
            <DestTypeTag type={DEST_TYPE.UNIT} />
            <Name>{name}</Name>
          </div>
        </FlexRow>

        <FlexRow>
          <FieldTimeOutlined style={{ marginRight: '.25rem' }} />
          <DestRuntimeTimer state={state} inProgressAt={startedAt} completedAt={endedAt} />
        </FlexRow>
      </Box>

      {children}
    </>
  );
};

export default DestUnit;

const Box = styled.button`
  ${flexRowSpaceBetweenStyle}
  width: 100%;
  padding: 0.5rem 1rem;
  margin: 0.25rem 0;
  background-color: ${(props) => props.theme.main.colors.white};
  border-radius: 0.5rem;
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const IconWrapper = styled.div`
  margin-right: 0.5rem;
`;

const Name = styled.p`
  display: inline-block;
  line-height: 1.4;
  font-size: 0.9rem;
`;
