import useTutorialContext from '../../hooks/useTutorialContext';
import { GuideSupportSdk } from '../../resources/guide';
import ErrorBox from '../common/boxes/ErrorBox';
import AppiumGuide from './AppiumGuide';
import GamiumGuide from './GamiumGuide';
import SeleniumGuide from './SeleniumGuide';
import WebdriverIoGuide from './WebdriverIoGuide';

interface Props {
  selectedSdk: GuideSupportSdk;
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
      {selectedSdk === GuideSupportSdk.WEBDRIVERIO && <WebdriverIoGuide organizationId={organization.organizationId} projectId={project.projectId} />}
      {selectedSdk === GuideSupportSdk.APPIUM && <AppiumGuide organizationId={organization.organizationId} projectId={project.projectId} />}
      {selectedSdk === GuideSupportSdk.GAMIUM && <GamiumGuide organizationId={organization.organizationId} projectId={project.projectId} />}
      {selectedSdk === GuideSupportSdk.SELENIUM && <SeleniumGuide organizationId={organization.organizationId} projectId={project.projectId} />}
    </>
  );
};

export default RemoteTestTutorial;
