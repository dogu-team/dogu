import { PROJECT_TYPE } from '@dogu-private/types';
import { Select, SelectProps } from 'antd';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import {
  tutorialSdkSupportInfo,
  TutorialSupportFramework,
  TutorialSupportLanguage,
  tutorialSupportLanguageText,
  TutorialSupportPlatform,
  tutorialSupportPlatformText,
  TutorialSupportSdk,
  TutorialSupportTarget,
  tutorialSupportTargetText,
} from '../../resources/tutorials';
import PlatformIcon from './PlatformIcon';
import TargetIcon from './TargetIcon';
import { flexRowBaseStyle } from '../../styles/box';
import FrameworkIcon from './FrameworkIcon';
import useTutorialContext from '../../hooks/useTutorialContext';
import { RemoteTutorial } from '../../resources/tutorials/remote';

interface Props {
  sdk: TutorialSupportSdk;
  selectedFramwork: TutorialSupportFramework;
  selectedPlatform: TutorialSupportPlatform;
  selectedTarget: TutorialSupportTarget;
}

const RemoteTestOptionSelectors = ({ sdk, selectedFramwork, selectedPlatform, selectedTarget }: Props) => {
  const router = useRouter();
  const { project } = useTutorialContext();
  const availabePlatforms = Object.keys(tutorialSdkSupportInfo[sdk].targetsPerPlatform).filter((platform) =>
    tutorialSdkSupportInfo[sdk].targetsPerPlatform[platform as TutorialSupportPlatform]?.includes(selectedTarget),
  );
  const availableTargets = tutorialSdkSupportInfo[sdk].targetsPerPlatform[selectedPlatform];
  const frameworkOptions: SelectProps['options'] = Object.keys(tutorialSdkSupportInfo[sdk].frameworksPerLang).map((language) => {
    const lang = language as TutorialSupportLanguage;

    return {
      label: tutorialSupportLanguageText[lang],
      options: tutorialSdkSupportInfo[sdk].frameworksPerLang[lang]?.map((framework) => ({
        label: (
          <FlexRow>
            <FrameworkIcon framework={framework} size={16} />
            &nbsp;&nbsp;
            {framework}
          </FlexRow>
        ),
        value: framework,
      })),
    };
  });

  const platformOptions: SelectProps['options'] = availabePlatforms?.map((platform) => ({
    label: (
      <FlexRow>
        <PlatformIcon platform={platform as TutorialSupportPlatform} />
        &nbsp;&nbsp;
        {tutorialSupportPlatformText[platform as TutorialSupportPlatform]}
      </FlexRow>
    ),
    value: platform,
  }));

  const targetOptions: SelectProps['options'] = availableTargets?.map((target: TutorialSupportTarget) => ({
    label: (
      <FlexRow>
        <TargetIcon target={target} />
        &nbsp;&nbsp;
        {tutorialSupportTargetText[target]}
      </FlexRow>
    ),
    value: target,
  }));

  return (
    <>
      <Select
        options={frameworkOptions}
        value={selectedFramwork}
        onChange={(value: string) => {
          router.replace({ query: { ...router.query, framework: value } }, undefined, { shallow: true, scroll: true });
        }}
        dropdownMatchSelectWidth={false}
        style={{ width: '100%', marginBottom: '.5rem' }}
        id="framework-selector"
      />
      <Select
        options={platformOptions}
        value={selectedPlatform}
        onChange={(value) => {
          router.replace({ query: { ...router.query, platform: value } }, undefined, { shallow: true, scroll: true });
        }}
        dropdownMatchSelectWidth={false}
        style={{ width: '100%', marginBottom: '.5rem' }}
        id="platform-selector"
      />
      {(project?.type === PROJECT_TYPE.GAME || project?.type === PROJECT_TYPE.CUSTOM) && (
        <Select
          options={targetOptions}
          value={selectedTarget}
          onChange={(value) => {
            router.replace({ query: { ...router.query, target: value } }, undefined, { shallow: true, scroll: true });
          }}
          dropdownMatchSelectWidth={false}
          style={{ width: '100%' }}
          id="target-selector"
        />
      )}
    </>
  );
};

export default RemoteTestOptionSelectors;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;
