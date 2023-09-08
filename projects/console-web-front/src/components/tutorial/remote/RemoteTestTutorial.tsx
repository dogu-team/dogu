import useTutorialContext from '../../../hooks/context/useTutorialContext';
import { TutorialSupportSdk } from '../../../resources/tutorials/index';
import ErrorBox from '../../common/boxes/ErrorBox';
import AppiumRemoteTutorial from './AppiumRemoteTutorial';
import GamiumRemoteTutorial from './GamiumRemoteTutorial';
import SeleniumRemoteTutorial from './SeleniumRemoteTutorial';
import WebdriverIoRemoteTutorial from './WebdriverIoRemoteTutorial';

interface Props {
  selectedSdk: TutorialSupportSdk;
}

const RemoteTestTutorial = ({ selectedSdk }: Props) => {
  const { organization, project } = useTutorialContext();

  if (!organization) {
    return <ErrorBox title="Something went wrong" desc="Cannot find organization information" />;
  }

  if (!project) {
    return <ErrorBox title="Something went wrong" desc="Cannot find project information" />;
  }

  return (
    <>
      {selectedSdk === TutorialSupportSdk.WEBDRIVERIO && <WebdriverIoRemoteTutorial organizationId={organization.organizationId} projectId={project.projectId} />}
      {selectedSdk === TutorialSupportSdk.APPIUM && <AppiumRemoteTutorial organizationId={organization.organizationId} projectId={project.projectId} />}
      {selectedSdk === TutorialSupportSdk.GAMIUM && <GamiumRemoteTutorial organizationId={organization.organizationId} projectId={project.projectId} />}
      {selectedSdk === TutorialSupportSdk.SELENIUM && <SeleniumRemoteTutorial organizationId={organization.organizationId} projectId={project.projectId} />}
    </>
  );
};

export default RemoteTestTutorial;
