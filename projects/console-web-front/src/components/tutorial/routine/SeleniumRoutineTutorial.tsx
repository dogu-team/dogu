import useTutorialSelector from '../../../hooks/useTutorialSelector';
import { ROUTINE_SAMPLE_GIT_URL, tutorialSdkSupportInfo, TutorialSupportLanguage, TutorialSupportSdk } from '../../../resources/tutorials';
import { seleniumRoutineTutorialData } from '../../../resources/tutorials/routine';
import CodeWithCopyButton from '../../common/CodeWithCopyButton';
import GuideAnchor from '../GuideAnchor';
import GuideLayout from '../GuideLayout';
import GuideStep from '../GuideStep';
import TutorialOptionSelectors from '../TutorialOptionSelectors';
import DoneStep from './DoneStep';
import RoutineGitTutorial from './RoutineGitTutorial';

const CLONE_GIT_ID = 'clone-git';
const INTEGRATE_WITH_GIT_ID = 'integrate-with-git';
const CREATE_ROUTINE_ID = 'create-routine';
const RUN_ROUTINE_ID = 'run-routine';
const DONE_ID = 'done';

const SeleniumRoutineTutorial = () => {
  const { framework, platform, target } = useTutorialSelector({
    defaultFramework: tutorialSdkSupportInfo[TutorialSupportSdk.SELENIUM].defaultOptions.framework,
    defaultPlatform: tutorialSdkSupportInfo[TutorialSupportSdk.SELENIUM].defaultOptions.platform,
    defaultTarget: tutorialSdkSupportInfo[TutorialSupportSdk.SELENIUM].defaultOptions.target,
  });
  const selectedGuide = seleniumRoutineTutorialData.guides.find((data) => data.framework === framework && data.target === target && data.platform === platform);
  const frameworkLanguage = Object.keys(tutorialSdkSupportInfo[TutorialSupportSdk.APPIUM].frameworksPerLang).find((language) =>
    tutorialSdkSupportInfo[TutorialSupportSdk.APPIUM].frameworksPerLang[language as TutorialSupportLanguage]?.includes(framework),
  );

  return (
    <GuideLayout
      sidebar={
        <div>
          <div style={{ marginBottom: '1rem' }}>
            <TutorialOptionSelectors sdk={TutorialSupportSdk.SELENIUM} selectedFramwork={framework} selectedPlatform={platform} selectedTarget={target} />
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
          <GuideStep id={RUN_ROUTINE_ID} title="Run a routine" description={<p>Run a routine for your automated tests</p>} content={<div>Run routine button, pipeline list</div>} />
          <DoneStep id={DONE_ID} />
        </div>
      }
    />
  );
};

export default SeleniumRoutineTutorial;
