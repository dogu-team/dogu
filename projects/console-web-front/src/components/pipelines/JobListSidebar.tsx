import { ArrowLeftOutlined } from '@ant-design/icons';
import { RoutinePipelineBase } from '@dogu-private/console';
import { OrganizationId, RoutinePipelineId, ProjectId } from '@dogu-private/types';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { flexRowBaseStyle } from '../../styles/box';
import H6 from '../common/headings/H6';
import JobListController from './JobListController';

interface Props {
  pipeline: RoutinePipelineBase;
}

const JobListSideBar = ({ pipeline }: Props) => {
  const router = useRouter();
  const { t } = useTranslation();

  const orgId = router.query.orgId;
  const projectId = router.query.pid;
  const pipelineId = router.query.pipelineId;

  if (!(orgId && projectId && pipelineId)) {
    return null;
  }

  return (
    <Box>
      <BackButtonWrapper>
        <BackButton href={`/dashboard/${orgId}/projects/${projectId}/routines?routine=${pipeline.routineId}`}>
          <ArrowLeftOutlined />
          &nbsp;{pipeline.routine?.name}
        </BackButton>
      </BackButtonWrapper>
      <TitleWrapper>
        <H6>{t('routine:jobSidebarTitle')}</H6>
      </TitleWrapper>
      <JobContainer>
        <JobListController
          orgId={orgId as OrganizationId}
          projectId={projectId as ProjectId}
          pipelineId={Number(pipelineId) as RoutinePipelineId}
        />
      </JobContainer>
    </Box>
  );
};

export default JobListSideBar;

const Box = styled.div``;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const JobContainer = styled.div`
  margin-top: 1rem;
`;

const BackButtonWrapper = styled.div`
  margin-bottom: 0.5rem;
`;

const BackButton = styled(Link)`
  ${flexRowBaseStyle}
  padding: 0.25rem 0;
  background-color: #fff;
  color: #000;
  font-size: 0.9rem;
`;
