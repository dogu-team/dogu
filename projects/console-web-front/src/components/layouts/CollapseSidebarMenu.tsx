import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import styled from 'styled-components';

import useCollapsibleSidebar from '../../stores/collapsible-sidebar';

const CollpaseSidebarMenu = () => {
  const { collapsed, updateCollapsed } = useCollapsibleSidebar();

  return (
    <Box>
      <Button onClick={updateCollapsed}>
        <div />
      </Button>
      <CollapseButton onClick={updateCollapsed} collapsed={collapsed}>{collapsed ? <RightOutlined style={{ fontSize: '.8rem' }} /> : <LeftOutlined style={{ fontSize: '.8rem' }} />}</CollapseButton>
    </Box>
  );
};

export default CollpaseSidebarMenu;

const CollapseButton = styled.button<{collapsed: boolean}>`
  position: fixed;
  top: calc(50% - 0.875rem);
  left: ${props => props.collapsed ? '4rem' : '15rem'};
  opacity: 0;
  width: 1.75rem;
  height: 1.75rem;
  background-color: ${(props) => props.theme.colorPrimary};
  z-index: 9999;
  color: #fff;
  box-shadow: ${(props) => props.theme.main.shadows.blackBold};
  border: 1px solid #fdfdfd;
  border-radius: 50%;
  transition: all 0.25s;

  @media only screen and (max-width: 1023px) {
    left: ${props => props.collapsed ? '4.25rem' : '13rem'};
  }
`;

const Button = styled.button`
  width: 100%;
  height: 100%;
  opacity: 0;
  background-color: transparent;
  transition: all 0.2s;
  margin: -1px 0 0 0;

  div {
    margin-left: calc(0.5rem - 1.5px);
    width: 3px;
    height: 100%;
    background-color: ${(props) => props.theme.colorPrimary};
  }
`;

const Box = styled.div`
  width: 1rem;
  height: 100%;

  &:hover ${CollapseButton}, &:hover ${Button} {
    opacity: 1;
  }
`;
