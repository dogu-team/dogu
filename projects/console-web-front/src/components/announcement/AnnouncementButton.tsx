import { TfiAnnouncement } from 'react-icons/tfi';
import styled from 'styled-components';
import { useState } from 'react';
import { Drawer } from 'antd';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import { flexRowCenteredStyle } from '../../styles/box';
import AnnouncementCard from './AnnouncementCard';

const AnnouncementButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data, isLoading, error } = useSWR(`/change-logs`, swrAuthFetcher);

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      <StyledButton onClick={handleOpen}>
        <TfiAnnouncement />
      </StyledButton>

      <StyledDrawer placement="right" title="What's new" onClose={() => setIsOpen(false)} open={isOpen}>
        {/* <Centered>
          <Empty description="No announcements" />
        </Centered> */}
        <AnnouncementCard title="Dogu Studio is now available!" tags={['announcement', 'release', 'feature']} article={<div>hello...</div>} />
      </StyledDrawer>
    </>
  );
};

export default AnnouncementButton;

const StyledButton = styled.button`
  ${flexRowCenteredStyle}
  width: 2rem;
  height: 2rem;
  margin-right: 0.75rem;
  border-radius: 50%;
  color: #000;
  font-size: 1.2rem;
  background-color: #fff;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const StyledDrawer = styled(Drawer)`
  .ant-drawer-body {
    padding: 1rem;
    background-color: ${(props) => props.theme.colorPrimary}18;
  }
`;

const Centered = styled.div`
  ${flexRowCenteredStyle}
  height: 100%;
`;
