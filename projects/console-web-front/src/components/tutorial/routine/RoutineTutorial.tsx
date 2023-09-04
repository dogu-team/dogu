import useTutorialContext from '../../../hooks/useTutorialContext';
import { TutorialSupportSdk } from '../../../resources/tutorials';
import ErrorBox from '../../common/boxes/ErrorBox';
import AppiumRoutineTutorial from './AppiumRoutineTutorial';
import GamiumRoutineTutorial from './GamiumRoutineTutorial';
import SeleniumRoutineTutorial from './SeleniumRoutineTutorial';
import WebdriverIoRoutineTutorial from './WebdriverIoRoutineTutorial';

interface Props {
  selectedSdk: TutorialSupportSdk;
}

const RoutineTutorial = ({ selectedSdk }: Props) => {
  const { organization, project } = useTutorialContext();

  if (!organization) {
    return <ErrorBox title="Something went wrong" desc="Cannot find organization information" />;
  }

  if (!project) {
    return <ErrorBox title="Something went wrong" desc="Cannot find project information" />;
  }

  return (
    <>
      {selectedSdk === TutorialSupportSdk.WEBDRIVERIO && <WebdriverIoRoutineTutorial />}
      {selectedSdk === TutorialSupportSdk.APPIUM && <AppiumRoutineTutorial />}
      {selectedSdk === TutorialSupportSdk.GAMIUM && <GamiumRoutineTutorial />}
      {selectedSdk === TutorialSupportSdk.SELENIUM && <SeleniumRoutineTutorial />}
    </>
  );
};

export default RoutineTutorial;
