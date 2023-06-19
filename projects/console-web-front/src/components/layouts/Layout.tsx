import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  margin: 0 auto;
  height: 100%;
`;

interface Props {
  children: React.ReactNode;
}

const Layout = (props: Props) => {
  return <Container>{props.children}</Container>;
};

export default Layout;
