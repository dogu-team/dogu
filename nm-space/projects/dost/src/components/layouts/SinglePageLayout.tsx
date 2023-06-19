import { Divider } from '@chakra-ui/react';
import styled from 'styled-components';
import BasicLayout from './BasicLayout';
import HeaderWithMenu from './HeaderWithMenu';

interface Props {
  title: React.ReactNode;
  children: React.ReactNode;
}

const SinglePageLayout = ({ title, children }: Props) => {
  return (
    <BasicLayout header={<HeaderWithMenu />}>
      <TitleWrapper>{title}</TitleWrapper>

      <Divider mb={4} />

      <ChildrenWrapper>{children}</ChildrenWrapper>
    </BasicLayout>
  );
};

export default SinglePageLayout;

const TitleWrapper = styled.div`
  padding: 16px 24px;
`;

const ChildrenWrapper = styled.div`
  padding: 0 24px 24px;
`;
