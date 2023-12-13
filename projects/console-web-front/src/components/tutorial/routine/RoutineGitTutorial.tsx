import styled from 'styled-components';
import { useRouter } from 'next/router';

import ScmIntegrationButton from '../../integration/ScmIntegrationButton';

const RoutineGitTutorial = () => {
  const router = useRouter();

  return (
    <Box>
      <ScmIntegrationButton />
    </Box>
  );
};

export default RoutineGitTutorial;

const Box = styled.div`
  max-width: 600px;
`;
