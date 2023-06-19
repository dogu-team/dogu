import { Layout } from 'antd';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';
import { scrollbarStyle } from '../../styles/common';

interface Props {
  header: React.ReactNode;
  children: React.ReactNode;
  footer: React.ReactNode;
}

const BasicLayout = ({ children, header, footer }: Props) => {
  return (
    <StyledLayout>
      <Box>
        {header}
        <Content>
          <StyledLayoutContent>{children}</StyledLayoutContent>
        </Content>
        {footer}
      </Box>
    </StyledLayout>
  );
};

export default BasicLayout;

const StyledLayout = styled(Layout)`
  height: 100%;
`;

const Box = styled(Layout)`
  display: flex;
  height: 100%;
  margin: 0;
  background-color: #ffffff;
  flex-direction: column;

  & > * {
    flex-shrink: 0;
  }

  ${scrollbarStyle}
`;

const StyledLayoutContent = styled(Layout.Content)`
  display: flex;
  flex: 1;
  flex-direction: column;
  background-color: #fff;
`;

const Content = styled.div`
  display: flex;
  flex: 1 !important;
  flex-direction: column;
`;
