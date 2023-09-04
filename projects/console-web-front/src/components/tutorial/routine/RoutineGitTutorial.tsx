import { PROJECT_SCM_TYPE } from '@dogu-private/types';
import styled from 'styled-components';

import useTutorialContext from '../../../hooks/useTutorialContext';
import { getRepositoyUrl } from '../../../utils/url';
import ErrorBox from '../../common/boxes/ErrorBox';
import BitbucketButton from '../../integration/BitbucketButton';
import GithubButton from '../../integration/GithubButton';
import GitlabButton from '../../integration/GitlabButton';

const RoutineGitTutorial = () => {
  const { project } = useTutorialContext();

  if (!project) {
    return <ErrorBox title="Something went wrong" desc="Cannot find project" />;
  }

  return (
    <Box>
      <div>
        <GithubButton
          isConnected={project.projectScms?.[0]?.type === PROJECT_SCM_TYPE.GITHUB}
          disabled={!!project.projectScms && project.projectScms.length > 0 && project.projectScms[0].type !== PROJECT_SCM_TYPE.GITHUB}
          organizationId={project.organizationId}
          projectId={project.projectId}
          description={
            project.projectScms?.[0]?.type === PROJECT_SCM_TYPE.GITHUB ? (
              <>
                Integrated with{' '}
                <a href={project.projectScms[0].url} target="_blank">
                  {getRepositoyUrl(project.projectScms[0].url)}
                </a>
              </>
            ) : undefined
          }
        />
      </div>
      <div style={{ marginTop: '1rem' }}>
        <GitlabButton
          isConnected={project.projectScms?.[0]?.type === PROJECT_SCM_TYPE.GITLAB}
          disabled={!!project.projectScms && project.projectScms.length > 0 && project.projectScms[0].type !== PROJECT_SCM_TYPE.GITLAB}
          organizationId={project.organizationId}
          projectId={project.projectId}
          description={
            project.projectScms?.[0]?.type === PROJECT_SCM_TYPE.GITLAB ? (
              <>
                Integrated with{' '}
                <a href={project.projectScms[0].url} target="_blank">
                  {getRepositoyUrl(project.projectScms[0].url)}
                </a>
              </>
            ) : undefined
          }
        />
      </div>
      <div style={{ marginTop: '1rem' }}>
        <BitbucketButton
          isConnected={project.projectScms?.[0]?.type === PROJECT_SCM_TYPE.BITBUCKET}
          disabled={!!project.projectScms && project.projectScms.length > 0 && project.projectScms[0].type !== PROJECT_SCM_TYPE.BITBUCKET}
          organizationId={project.organizationId}
          projectId={project.projectId}
          description={
            project.projectScms?.[0]?.type === PROJECT_SCM_TYPE.BITBUCKET ? (
              <>
                Integrated with{' '}
                <a href={project.projectScms[0].url} target="_blank">
                  {getRepositoyUrl(project.projectScms[0].url)}
                </a>
              </>
            ) : undefined
          }
        />
      </div>
    </Box>
  );
};

export default RoutineGitTutorial;

const Box = styled.div`
  max-width: 600px;
`;
