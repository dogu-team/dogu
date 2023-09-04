import styled from 'styled-components';

import useTutorialSelector from '../../../hooks/useTutorialSelector';
import { ROUTINE_SAMPLE_GIT_URL, tutorialSdkSupportInfo, TutorialSupportLanguage, TutorialSupportSdk } from '../../../resources/tutorials';
import { gamiumRoutineTutorialData } from '../../../resources/tutorials/routine';
import CodeWithCopyButton from '../../common/CodeWithCopyButton';
import DoneStep from './DoneStep';
import GuideAnchor from '../GuideAnchor';
import GuideLayout from '../GuideLayout';
import GuideStep from '../GuideStep';
import TutorialOptionSelectors from '../TutorialOptionSelectors';
import RoutineGitTutorial from './RoutineGitTutorial';
import PipelineListController from '../../pipelines/PipelineListController';
import useTutorialContext from '../../../hooks/useTutorialContext';
import ErrorBox from '../../common/boxes/ErrorBox';
import RunRoutineButton from '../../pipelines/RunRoutineButton';
import TableListView from '../../common/TableListView';
import RefreshButton from '../../buttons/RefreshButton';
import { flexRowSpaceBetweenStyle } from '../../../styles/box';

const CLONE_GIT_ID = 'clone-git';
const INTEGRATE_WITH_GIT_ID = 'integrate-with-git';
const CREATE_ROUTINE_ID = 'create-routine';
const RUN_ROUTINE_ID = 'run-routine';
const DONE_ID = 'done';

const GamiumRoutineTutorial = () => {
  const { project } = useTutorialContext();
  const { framework, platform, target } = useTutorialSelector({
    defaultFramework: tutorialSdkSupportInfo[TutorialSupportSdk.GAMIUM].defaultOptions.framework,
    defaultPlatform: tutorialSdkSupportInfo[TutorialSupportSdk.GAMIUM].defaultOptions.platform,
    defaultTarget: tutorialSdkSupportInfo[TutorialSupportSdk.GAMIUM].defaultOptions.target,
  });
  const selectedGuide = gamiumRoutineTutorialData.guides.find((data) => data.framework === framework && data.target === target && data.platform === platform);
  const frameworkLanguage = Object.keys(tutorialSdkSupportInfo[TutorialSupportSdk.APPIUM].frameworksPerLang).find((language) =>
    tutorialSdkSupportInfo[TutorialSupportSdk.APPIUM].frameworksPerLang[language as TutorialSupportLanguage]?.includes(framework),
  );

  if (!project) {
    return <ErrorBox title="Something went wrong" desc="Project not found" />;
  }

  return (
    <GuideLayout
      sidebar={
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <TutorialOptionSelectors sdk={TutorialSupportSdk.GAMIUM} selectedFramwork={framework} selectedPlatform={platform} selectedTarget={target} />
          </div>

          <GuideAnchor
            items={[
              { id: CLONE_GIT_ID, title: 'Clone example and create repo' },
              {
                id: INTEGRATE_WITH_GIT_ID,
                title: 'Integrate repository with project',
              },
              { id: CREATE_ROUTINE_ID, title: 'Create a routine' },
              { id: RUN_ROUTINE_ID, title: 'Run a routine' },
              { id: DONE_ID, title: 'Done! Next Step 🚀' },
            ]}
          />
        </div>
      }
      content={
        <div>
          <GuideStep
            id={CLONE_GIT_ID}
            title="Clone example repository and create repository"
            description={<p>Clone or fork example repository and create your own repository. We support GitHub, GitLab, Bitbucket for integration.</p>}
            content={
              <div>
                <CodeWithCopyButton language="bash" code={`git clone ${ROUTINE_SAMPLE_GIT_URL}`} />
              </div>
            }
          />
          <GuideStep
            id={INTEGRATE_WITH_GIT_ID}
            title="Integrate your repository with project"
            description={<p>Routine will execute test scripts from the remote repository.</p>}
            content={<RoutineGitTutorial />}
          />
          <GuideStep id={CREATE_ROUTINE_ID} title="Create a routine" description={<p>Create a routine for your automated tests</p>} content={<div>Routine creator...</div>} />
          <GuideStep
            id={RUN_ROUTINE_ID}
            title="Run a routine"
            description={<p>Run a routine for your automated tests</p>}
            content={
              <TableListView
                top={
                  <FlexSpaceBetween>
                    <RunRoutineButton orgId={project.organizationId} projectId={project.projectId} />
                    <RefreshButton />
                  </FlexSpaceBetween>
                }
                table={<PipelineListController organizationId={project.organizationId} projectId={project.projectId} hideEmpty />}
              />
            }
          />
          <DoneStep id={DONE_ID} />
        </div>
      }
    />
  );
};

export default GamiumRoutineTutorial;

const FlexSpaceBetween = styled.div`
  ${flexRowSpaceBetweenStyle}
`;
