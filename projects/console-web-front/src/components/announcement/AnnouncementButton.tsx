import { TfiAnnouncement } from 'react-icons/tfi';
import styled from 'styled-components';

import { flexRowCenteredStyle } from '../../styles/box';
import { useState } from 'react';
import { Drawer, Empty } from 'antd';

const AnnouncementButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => {
    setIsOpen(true);
  };

  return (
    <>
      <StyledButton onClick={handleOpen}>
        <TfiAnnouncement />
      </StyledButton>

      <StyledDrawer placement="right" title="What's new" onClose={() => setIsOpen(false)} open={isOpen}>
        <Centered>
          <Empty description="No announcements" />
        </Centered>
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
    background-color: ${(props) => props.theme.colorPrimary}11;
  }
`;

const Centered = styled.div`
  ${flexRowCenteredStyle}
  height: 100%;
`;
