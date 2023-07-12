import { useRouter } from 'next/router';
import styled from 'styled-components';

const WebGuide = () => {
  const router = useRouter();

  return (
    <Box>
      <Box>
        <div>We&apos;re working on it!</div>
        {/* <StickyBox></StickyBox> */}
        {/* <GuideBox></GuideBox> */}
      </Box>
    </Box>
  );
};

export default WebGuide;

const Box = styled.div`
  display: flex;
`;

const StickyBox = styled.div`
  width: 20%;
  position: sticky;
  top: 0;
`;

const GuideBox = styled.div`
  width: 80%;
  margin-left: 1rem;
  max-width: 1000px;
`;

const Step = styled.div`
  margin-bottom: 2rem;
`;

const StepTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: 600;
`;
