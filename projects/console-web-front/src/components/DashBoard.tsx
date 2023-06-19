import { FunctionComponent } from 'react';
import styled from 'styled-components';

import H5 from 'src/components/common/headings/H5';
import { CommonUIProps } from '../types/common';

interface Props extends CommonUIProps {
  title: string;
  children: React.ReactNode;
  flex: number;
}

const DashBoard: FunctionComponent<Props> = ({ title, children, flex, className }) => {
  return (
    <Box flex={flex} className={className}>
      <Header>
        <H5>{title}</H5>
      </Header>
      <Content>{children}</Content>
    </Box>
  );
};

export default DashBoard;

const Box = styled.div<{ flex: number }>`
  margin: 12px;
  flex: ${(props) => props.flex};
`;

const Header = styled.div`
  margin-bottom: 1rem;
`;

const Content = styled.div`
  padding: 1rem;
  box-shadow: 0 0 8px 2px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
`;
