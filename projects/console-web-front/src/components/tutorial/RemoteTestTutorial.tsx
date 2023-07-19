import useTutorialContext from '../../hooks/useTutorialContext';
import { GuideSupportSdk } from '../../resources/guide';
import AppiumGuide from '../projects/guides/AppiumGuide';
import GamiumGuide from '../projects/guides/GamiumGuide';
import WebdriverIoGuide from '../projects/guides/WebdriverIoGuide';

interface Props {
  selectedSdk: GuideSupportSdk;
}

const RemoteTestTutorial = ({ selectedSdk }: Props) => {
  const { organization, project } = useTutorialContext();

  if (!organization || !project) {
    return <div>Something went wrong... please contact us</div>;
  }

  return (
    <>
      {selectedSdk === GuideSupportSdk.WEBDRIVERIO && <WebdriverIoGuide organizationId={organization.organizationId} projectId={project.projectId} />}
      {selectedSdk === GuideSupportSdk.APPIUM && <AppiumGuide organizationId={organization.organizationId} projectId={project.projectId} />}
      {selectedSdk === GuideSupportSdk.GAMIUM && <GamiumGuide organizationId={organization.organizationId} projectId={project.projectId} />}
    </>
  );
};

export default RemoteTestTutorial;
