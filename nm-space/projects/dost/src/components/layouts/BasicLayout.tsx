import { styled } from 'styled-components';
import Header from './Header';

interface Props {
  header: React.ReactNode;
  children: React.ReactNode;
}

const BasicLayout = ({ header, children }: Props) => {
  return (
    <Box>
      {header}
      <ChildrenWrapper>{children}</ChildrenWrapper>
    </Box>
  );
};

export default BasicLayout;

const Box = styled.div`
  width: 100vw;
  height: 100vh;
`;

const ChildrenWrapper = styled.div`
  width: 100%;
  height: calc(100% - 42px);
  overflow: auto;

  &::-webkit-scrollbar {
    width: 7px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--chakra-colors-gray-400);
    border-radius: 7px;
  }
`;
