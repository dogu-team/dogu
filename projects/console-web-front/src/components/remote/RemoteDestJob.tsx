import { RightOutlined } from '@ant-design/icons';
import { RemoteDestBase } from '@dogu-private/console';
import { DEST_TYPE } from '@dogu-private/types';
import { useState } from 'react';
import styled from 'styled-components';

import DestJob from '../reports/DestJob';
import RemoteDestUnit from './RemoteDestUnit';

interface Props {
  dest: RemoteDestBase;
}

const RemoteDestJob = ({ dest }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <DestJob
        state={dest.state}
        name={dest.name}
        startedAt={dest.inProgressAt}
        endedAt={dest.completedAt}
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
        icon={
          <ButtonIconWrapper isOpen={isOpen}>
            <RightOutlined />
          </ButtonIconWrapper>
        }
      />

      {isOpen && (
        <ChildrenWrapper>
          {dest.children?.map((item) => {
            if (item.type === DEST_TYPE.JOB) {
              return <RemoteDestJob key={`job-${item.remoteDestId}`} dest={item} />;
            }
            return <RemoteDestUnit key={`unit-${item.remoteDestId}`} dest={item} />;
          })}
        </ChildrenWrapper>
      )}
    </>
  );
};

export default RemoteDestJob;

const ButtonIconWrapper = styled.div<{ isOpen: boolean }>`
  margin-right: 0.75rem;
  transform: ${(props) => (props.isOpen ? 'rotate(90deg)' : 'rotate(0deg)')};
  transition: transform 0.3s;
`;

const ChildrenWrapper = styled.div`
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 2px solid ${(props) => props.theme.main.colors.gray4};
`;
