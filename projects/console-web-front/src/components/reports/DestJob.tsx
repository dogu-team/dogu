import { FieldTimeOutlined } from '@ant-design/icons';
import { DEST_STATE, DEST_TYPE } from '@dogu-private/types';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';
import DestRuntimeTimer from './DestRuntimeTimer';
import DestStatusIcon from './DestStatusIcon';
import DestTypeTag from './DestTypeTag';

interface Props {
  state: DEST_STATE;
  name: string;
  startedAt: Date | null;
  endedAt: Date | null;
  onClick?: () => void;
  icon?: React.ReactNode;
}

const DestJob = ({ state, name, startedAt, endedAt, onClick, icon }: Props) => {
  return (
    <Box onClick={onClick}>
      <FlexRowSpaceBetween>
        <FlexRow>
          {icon}
          <IconWrapper>
            <DestStatusIcon state={state} />
          </IconWrapper>
          <div>
            <DestTypeTag type={DEST_TYPE.JOB} />
            <Name>{name}</Name>
          </div>
        </FlexRow>
        <FlexRow>
          <FieldTimeOutlined style={{ marginRight: '.25rem' }} />
          <DestRuntimeTimer state={state} inProgressAt={startedAt} completedAt={endedAt} />
        </FlexRow>
      </FlexRowSpaceBetween>
    </Box>
  );
};

export default DestJob;

const Box = styled.button`
  display: block;
  width: 100%;
  margin: 0.5rem 0;
  padding: 0.5rem 1rem;
  background-color: ${(props) => props.theme.main.colors.white};
  border-radius: 0.5rem;
  overflow: hidden;
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const FlexRowSpaceBetween = styled(FlexRow)`
  justify-content: space-between;
`;

const ChildrenWrapper = styled.div`
  padding-left: 1rem;
  border-left: 2px solid ${(props) => props.theme.main.colors.gray4};
`;

const ButtonIconWrapper = styled.div<{ isOpen: boolean }>`
  margin-right: 0.75rem;
  transform: ${(props) => (props.isOpen ? 'rotate(90deg)' : 'rotate(0deg)')};
  transition: transform 0.3s;
`;

const IconWrapper = styled.div`
  margin-right: 0.5rem;
`;

const Name = styled.p`
  display: inline-block;
  line-height: 1.4;
  font-size: 0.9rem;
`;
