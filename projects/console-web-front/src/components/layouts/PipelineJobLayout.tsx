import { ExclamationCircleFilled, LoadingOutlined } from '@ant-design/icons';
import { OrganizationBase, ProjectBase, RoutinePipelineBase } from '@dogu-private/console';
import { PIPELINE_STATUS } from '@dogu-private/types';
import { Divider } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import useWebSocket from '../../hooks/useWebSocket';
import useLivePipelineStore from '../../stores/live-pipeline';
import { flexRowBaseStyle, flexRowSpaceBetweenStyle } from '../../styles/box';
import { clickableTextStyle } from '../../styles/text';
import { isPipelineInProgress } from '../../utils/pipeline';
import ErrorBox from '../common/boxes/ErrorBox';
import H5 from '../common/headings/H5';
import CancelPipelineButton from '../pipelines/CancelPipelineButton';
import JobListSideBar from '../pipelines/JobListSidebar';
import PipelineRuntime from '../pipelines/PipelineRuntime';
import PipelineStatusIcon from '../pipelines/PipelineStatusIcon';
import ProfileImage from '../ProfileImage';
import ProjectLayoutWithSidebar from './ProjectLayoutWithSidebar';

interface Props {
  children: React.ReactNode;
  organization: OrganizationBase;
  project: ProjectBase;
}

const PipelineJobLayout = ({ children, organization, project }: Props) => {
  const router = useRouter();
  const orgId = router.query.orgId;
  const projectId = router.query.pid;
  const pipelineId = router.query.pipelineId;
  const {
    data: pipeline,
    error: pipelineError,
    isLoading: pipelineLoading,
  } = useSWR<RoutinePipelineBase>(!!pipelineId && `/organizations/${orgId}/projects/${projectId}/pipelines/${pipelineId}`, swrAuthFetcher);
  const [livePipeline, updateLivePipeline] = useLivePipelineStore((state) => [state.pipeline, state.setPipeline]);
  const { t } = useTranslation();

  const canceler = livePipeline?.canceler ?? pipeline?.canceler;

  const statusSocketRef = useWebSocket(
    pipeline?.status === PIPELINE_STATUS.IN_PROGRESS || pipeline?.status === PIPELINE_STATUS.WAITING
      ? `/ws/live-pipeline-status?organization=${orgId}&project=${projectId}&pipeline=${pipelineId}`
      : null,
  );

  useEffect(() => {
    return () => {
      updateLivePipeline(null);
    };
  }, [pipelineId]);

  useEffect(() => {
    if (pipeline && isPipelineInProgress(pipeline.status) && statusSocketRef.current) {
      statusSocketRef.current.onmessage = (e) => {
        const parsedData: RoutinePipelineBase = JSON.parse(e.data);
        updateLivePipeline(parsedData);
      };
    }

    return () => {
      if (statusSocketRef.current) {
        statusSocketRef.current.close();
      }
    };
  }, [pipeline?.routinePipelineId]);

  if (pipelineLoading) {
    return <LoadingOutlined />;
  }

  if (!pipeline || pipelineError) {
    return <ErrorBox title="Something went wrong..." desc="ohoh..." />;
  }

  return (
    <ProjectLayoutWithSidebar organization={organization} project={project} innerSidebar={<JobListSideBar pipeline={pipeline} />} titleI18nKey="project:tabMenuRoutineTitle">
      <PipelineContainer>
        <PipelineHeadContainer>
          <FlexRowBase>
            <PipelineStatusIcon status={livePipeline?.status ?? pipeline.status} />
            <H5>
              {`${pipeline.routine?.name}`}&nbsp;<PipelineCounter>#{pipeline.index}</PipelineCounter>
            </H5>
          </FlexRowBase>

          <div>{pipeline.routine && isPipelineInProgress(livePipeline?.status ?? pipeline.status) && <CancelPipelineButton pipeline={pipeline} />}</div>
        </PipelineHeadContainer>
        <PipelineBodyContainer>
          {pipeline.creator && (
            <PipelineDesc>
              <PipelineDescTitle>{t('routine:pipelineSummaryRunByTitle')}</PipelineDescTitle>
              <PipelineDescContent>
                <PipelineCreatorContainer>
                  <ProfileImage size={24} profileImageUrl={pipeline.creator.profileImageUrl} name={pipeline.creator.name} style={{ fontSize: '12px' }} />
                  <p>{pipeline.creator.name}</p>
                </PipelineCreatorContainer>
              </PipelineDescContent>
            </PipelineDesc>
          )}
          <PipelineDesc>
            <PipelineDescTitle>{t('routine:pipelineSummaryRuntimeTitle')}</PipelineDescTitle>
            <PipelineDescContent>
              <PipelineRuntime
                status={livePipeline?.status ?? pipeline.status}
                startedAt={pipeline.inProgressAt && new Date(pipeline.inProgressAt)}
                endedAt={pipeline.completedAt && new Date(pipeline.completedAt)}
              />
            </PipelineDescContent>
          </PipelineDesc>
          <PipelineDesc>
            <PipelineDescTitle>{t('routine:pipelineSummaryRoutineTitle')}</PipelineDescTitle>
            <PipelineDescContent>{pipeline.routine?.name}</PipelineDescContent>
          </PipelineDesc>
        </PipelineBodyContainer>
      </PipelineContainer>

      {!!canceler && (
        <CancelBox>
          <ExclamationCircleFilled style={{ color: '#f26a5e', fontSize: '1.2rem', marginRight: '.25rem' }} />
          <p>This pipeline was cancelled by&nbsp;</p>
          <CancelerBox>
            <ProfileImage size={24} profileImageUrl={canceler.profileImageUrl} name={canceler.name} style={{ fontSize: '12px' }} />
            <p>{canceler.name}</p>
          </CancelerBox>
        </CancelBox>
      )}

      <Divider />

      <div>{children}</div>
    </ProjectLayoutWithSidebar>
  );
};

export default PipelineJobLayout;

const Box = styled.div``;

const StyledLink = styled(Link)`
  ${clickableTextStyle}
`;

const PipelineContainer = styled.div``;

const PipelineHeadContainer = styled.div`
  ${flexRowSpaceBetweenStyle}

  h5 {
    margin-left: 0.5rem;
  }
`;

const FlexRowBase = styled.div`
  ${flexRowBaseStyle}
`;

const PipelineCounter = styled.b`
  font-size: 1.05rem;
  font-weight: 500;
`;

const PipelineBodyContainer = styled.div`
  display: flex;
  margin-top: 1rem;
`;

const PipelineCreatorContainer = styled.div`
  display: flex;
  align-items: center;

  & > p {
    margin-left: 0.25rem;
  }
`;

const PipelineDesc = styled.div`
  max-width: 150px;
  margin-right: 4rem;
`;

const PipelineDescTitle = styled.p`
  margin-bottom: 0.5rem;
  color: #00000066;
  font-size: 0.8rem;
`;

const PipelineDescContent = styled.div`
  line-height: 24px;
  font-weight: 500;
  font-size: 1rem;
`;

const CancelBox = styled.div`
  ${flexRowBaseStyle}
  margin-top: 1rem;
  padding: 0.5rem;
  border: 1px solid #f2958d;
  border-radius: 0.25rem;
`;

const CancelerBox = styled.div`
  ${flexRowBaseStyle}

  p {
    font-weight: 500;
    margin-left: 0.25rem;
  }
`;
