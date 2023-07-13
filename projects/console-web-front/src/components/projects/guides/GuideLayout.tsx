import styled from 'styled-components';

interface Props {
  sidebar: React.ReactNode;
  content: React.ReactNode;
}

const GuideLayout = ({ sidebar, content }: Props) => {
  return (
    <Box>
      <StickyBox>{sidebar}</StickyBox>
      <GuideBox>{content}</GuideBox>
    </Box>
  );
};

export default GuideLayout;

const Box = styled.div`
  display: flex;
`;

const StickyBox = styled.div`
  position: sticky;
  width: 20%;
  min-width: 220px;
  top: 20px;
  height: 100%;
`;

const GuideBox = styled.div`
  width: 80%;
  margin-left: 2rem;
  max-width: 1000px;
`;
