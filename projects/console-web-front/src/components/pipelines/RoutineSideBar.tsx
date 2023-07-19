import { OrganizationId, ProjectId } from '@dogu-private/types';
import useTranslation from 'next-translate/useTranslation';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import H6 from '../common/headings/H6';
import GitIntegrationTag from '../projects/GitIntegrationTag';
import RoutineListController from 'src/components/routine/RoutineListController';
import CreateRoutineButton from '../routine/CreateRoutineButton';
import { flexRowBaseStyle } from '../../styles/box';

interface Props {
  isGitIntegrated: boolean;
}

const RoutineSideBar = ({ isGitIntegrated }: Props) => {
  const router = useRouter();
  const { t } = useTranslation();

  const orgId = router.query.orgId as OrganizationId;
  const projectId = router.query.pid as ProjectId;

  return (
    <Box>
      <TitleWrapper>
        <FlexRow>
          <H6>{t('routine:routineSidebarTitle')}</H6>
          <div style={{ marginLeft: '.5rem' }}>
            <GitIntegrationTag isGitIntegrated={isGitIntegrated} />
          </div>
        </FlexRow>

        <CreateRoutineButton organizationId={orgId} projectId={projectId} />
      </TitleWrapper>
      <RoutineWrapper>
        <RoutineListController organizationId={orgId} projectId={projectId} />
      </RoutineWrapper>
    </Box>
  );
};

export default RoutineSideBar;

const Box = styled.div`
  overflow-y: auto;
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RoutineWrapper = styled.div`
  margin-top: 1rem;
`;
