import { FieldTimeOutlined, RightOutlined } from '@ant-design/icons';
import { DestBase } from '@dogu-private/console';
import { DEST_STATE, DEST_TYPE } from '@dogu-private/types';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styled from 'styled-components';
import useLivePipelineStore from '../../stores/live-pipeline';

import { flexRowBaseStyle } from '../../styles/box';
import DestRuntimeTimer from './DestRuntimeTimer';
import DestStatusIcon from './DestStatusIcon';
import DestTypeTag from './DestTypeTag';
import DestUnit from './DestUnit';
import RuntimeTimer from './RuntimeTimer';

interface Props {
  destJob: DestBase;
}

const DestJob = ({ destJob }: Props) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Box
        onClick={() => {
          setIsOpen((prev) => !prev);
          // router.push(
          //   { pathname: router.pathname, query: { ...router.query, dest: router.query.dest ? `${router.query.dest}:${destJob.destId}` : `${destJob.destId}` } },
          //   undefined,
          //   { shallow: true },
          // );
        }}
      >
        <FlexRowSpaceBetween>
          <FlexRow>
            <ButtonIconWrapper isOpen={isOpen}>
              <RightOutlined />
            </ButtonIconWrapper>
            <IconWrapper>
              <DestStatusIcon state={destJob.state} />
            </IconWrapper>
            <div>
              <DestTypeTag type={destJob.type} />
              <Name>{destJob.name}</Name>
            </div>
          </FlexRow>
          <FlexRow>
            <FieldTimeOutlined style={{ marginRight: '.25rem' }} />
            <DestRuntimeTimer dest={destJob} />
          </FlexRow>
        </FlexRowSpaceBetween>
      </Box>

      {isOpen && (
        <ChildrenWrapper>
          {destJob.children?.map((item) => {
            if (item.type === DEST_TYPE.JOB) {
              return <DestJob key={`job ${item.destId}`} destJob={item} />;
            }

            return <DestUnit key={`unit ${item.destId}`} destUnit={item} />;
          })}
        </ChildrenWrapper>
      )}
    </>
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
