import styled from 'styled-components';

import ConsoleLayout, { ConsoleLayoutProps } from './ConsoleLayout';
import ProjectSideBar from './ProjectSideBar';

interface Props extends Omit<ConsoleLayoutProps, 'sidebar'> {
  innerSidebar?: React.ReactNode;
}

const ProjectLayoutWithSidebar = ({ children, innerSidebar, ...props }: Props) => {
  return (
    <ConsoleLayout sidebar={<ProjectSideBar />} {...props} padding="2rem 2rem 0">
      <FlexRow>
        {!!innerSidebar && <SideBar offset={56}>{innerSidebar}</SideBar>}
        <Content hasSidebar={!!innerSidebar}>{children}</Content>
      </FlexRow>
    </ConsoleLayout>
  );
};

const FlexRow = styled.div`
  display: flex;
  width: 100%;
  flex: 1;
`;

const SideBar = styled.div<{ offset: number }>`
  position: sticky;
  top: 0px;
  width: 300px;
  height: 100dvh;
  padding: 1rem 1rem 0 0;
  flex-shrink: 0;
  overflow-y: auto;
  border-right: 1px solid ${(props) => props.theme.colors.gray2};
  padding-bottom: 1rem;
  z-index: 1;
`;

const Content = styled.div<{ hasSidebar: boolean }>`
  flex: 1;
  padding: 1rem 0 1rem ${(props) => (props.hasSidebar ? '1rem' : '0')};
`;

export default ProjectLayoutWithSidebar;
