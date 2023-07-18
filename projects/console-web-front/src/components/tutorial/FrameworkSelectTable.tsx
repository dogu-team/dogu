import styled from 'styled-components';
import Image from 'next/image';

import { GuideSupportLanguage, guideSupportLanguageText, GuideSupportSdk, tutorialData } from '../../resources/guide';
import resources from '../../resources';
import Link from 'next/link';
import LanguageImage from './LanguageImage';
import { Divider } from 'antd';

interface Props {
  onClickSdk: (sdk: GuideSupportSdk) => void;
  selectedSdk: GuideSupportSdk;
  onClickFramework: (framework: string) => void;
}

const FrameworkSelectTable = ({ selectedSdk, onClickFramework, onClickSdk }: Props) => {
  return (
    <FlexTable>
      <div>
        <SdkItem onClick={() => onClickSdk(GuideSupportSdk.WEBDRIVERIO)} isSelected={selectedSdk === GuideSupportSdk.WEBDRIVERIO}>
          <Image src={resources.icons.webdriverio} width={32} height={32} alt="webdriverio" />
          <p>WebdriverIO</p>
        </SdkItem>
        <SdkItem onClick={() => onClickSdk(GuideSupportSdk.APPIUM)} isSelected={selectedSdk === GuideSupportSdk.APPIUM}>
          <Image src={resources.icons.appium} width={32} height={32} alt="appium" />
          <p>Appium</p>
        </SdkItem>
        <SdkItem onClick={() => onClickSdk(GuideSupportSdk.GAMIUM)} isSelected={selectedSdk === GuideSupportSdk.GAMIUM}>
          <Image src={resources.icons.gamium} width={32} height={32} alt="gamium" />
          <p>Gamium</p>
        </SdkItem>
      </div>

      <ColContainer>
        {Object.keys(tutorialData[selectedSdk].supportFrameworks).map((lang) => {
          const language = lang as GuideSupportLanguage;

          return (
            <Col key={language}>
              <FlexColCenter>
                <LanguageImage language={language} size={32} />
                <p style={{ marginTop: '.25rem', fontWeight: '500' }}>{guideSupportLanguageText[language]}</p>
              </FlexColCenter>

              <Divider />

              <FlexColCenter>
                {tutorialData[selectedSdk].supportFrameworks[language].map((framework: string) => {
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
