import { PROJECT_TYPE } from '@dogu-private/types';
import styled from 'styled-components';
import { Divider } from 'antd';

import { tutorialSdkSupportInfo, TutorialSupportLanguage, tutorialSupportLanguageText, TutorialSupportSdk, tutorialSupportSdkText } from '../../resources/tutorials';
import LanguageIcon from './LanguageIcon';
import SdkIcon from './SdkIcon';
import useTutorialContext from '../../hooks/useTutorialContext';
import { remoteTutorialData } from '../../resources/tutorials/remote';

interface Props {
  onClickSdk: (sdk: TutorialSupportSdk) => void;
  selectedSdk: TutorialSupportSdk;
  onClickFramework: (framework: string) => void;
}

const FrameworkSelectTable = ({ selectedSdk, onClickFramework, onClickSdk }: Props) => {
  const { project } = useTutorialContext();

  const getAvailableSdk = () => {
    switch (project?.type) {
      case PROJECT_TYPE.WEB:
        return [TutorialSupportSdk.WEBDRIVERIO, TutorialSupportSdk.SELENIUM, TutorialSupportSdk.APPIUM];
      case PROJECT_TYPE.APP:
        return [TutorialSupportSdk.WEBDRIVERIO, TutorialSupportSdk.APPIUM];
      case PROJECT_TYPE.GAME:
        return [TutorialSupportSdk.GAMIUM];
      default:
        return [TutorialSupportSdk.WEBDRIVERIO, TutorialSupportSdk.SELENIUM, TutorialSupportSdk.APPIUM, TutorialSupportSdk.GAMIUM];
    }
  };

  if (!project) {
    return null;
  }

  return (
    <FlexTable>
      <div>
        {getAvailableSdk().map((sdk) => {
          return (
            <SdkItem key={sdk} onClick={() => onClickSdk(sdk)} isSelected={selectedSdk === sdk}>
              <SdkIcon sdk={sdk} size={32} />
              <p>{tutorialSupportSdkText[sdk]}</p>
            </SdkItem>
          );
        })}
      </div>

      <ColContainer>
        {Object.keys(tutorialSdkSupportInfo[selectedSdk].frameworksPerLang).map((lang) => {
          const language = lang as TutorialSupportLanguage;

          return (
            <Col key={language}>
              <FlexColCenter>
                <LanguageIcon language={language} size={32} />
                <p style={{ marginTop: '.25rem', fontWeight: '500' }}>{tutorialSupportLanguageText[language]}</p>
              </FlexColCenter>

              <Divider />

              <FlexColCenter>
                {tutorialSdkSupportInfo[selectedSdk].frameworksPerLang[language]?.map((framework: string) => {
                  return (
                    <FrameworkItem key={framework} onClick={() => onClickFramework(framework)}>
                      {framework}
                    </FrameworkItem>
                  );
                })}
              </FlexColCenter>
            </Col>
          );
        })}
      </ColContainer>
    </FlexTable>
  );
};

export default FrameworkSelectTable;

const FlexTable = styled.div`
  display: flex;
  margin-top: 1rem;
`;

const SdkItem = styled.button<{ isSelected: boolean }>`
  position: relative;
  padding: 0.5rem;
  display: flex;
  width: 15rem;
  cursor: pointer;
  background-color: ${(props) => (props.isSelected ? props.theme.main.colors.blue6 : 'transparent')};
  color: #000;
  text-decoration: none;
  align-items: center;

  p {
    margin-left: 0.5rem;
  }

  &:hover {
    background-color: ${(props) => props.theme.main.colors.blue6};
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    width: 2px;
    height: 100%;
    background-color: ${(props) => (props.isSelected ? props.theme.main.colors.blue5 : 'transparent')};
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    right: 0.5rem;
    transform: translateY(-50%);
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 5px solid #000;
  }
`;

const ColContainer = styled.div`
  padding-left: 1.5rem;
  display: flex;
`;

const Col = styled.div`
  width: 9rem;
  min-height: 15rem;
`;

const FlexColCenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const FrameworkItem = styled.button`
  padding: 0.25rem;
  width: 100%;
  background-color: #fff;
  color: ${(props) => props.theme.colorPrimary};

  &:hover {
    text-decoration: underline;
  }
`;
