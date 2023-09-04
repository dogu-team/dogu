import { Select, SelectProps } from 'antd';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import {
  Guide,
  GuideSupportFramework,
  GuideSupportLanguage,
  guideSupportLanguageText,
  GuideSupportPlatform,
  guideSupportPlatformText,
  GuideSupportTarget,
  guideSupportTargetText,
} from '../../resources/guide';
import PlatformIcon from './PlatformIcon';
import TargetIcon from './TargetIcon';
import { flexRowBaseStyle } from '../../styles/box';
import FrameworkIcon from './FrameworkIcon';
import useTutorialContext from '../../hooks/useTutorialContext';
import { PROJECT_TYPE } from '@dogu-private/types';

interface Props {
  guideData: Guide;
  selectedFramwork: GuideSupportFramework;
  selectedPlatform: GuideSupportPlatform;
  selectedTarget: GuideSupportTarget;
}

const RemoteTestOptionSelectors = ({ guideData, selectedFramwork, selectedPlatform, selectedTarget }: Props) => {
  const router = useRouter();
  const { project } = useTutorialContext();
  const availabePlatforms = Object.keys(guideData.platformAndTarget).filter((platform) => guideData.platformAndTarget[platform as GuideSupportPlatform]?.includes(selectedTarget));
  const availableTargets = guideData.platformAndTarget[selectedPlatform];
  const frameworkOptions: SelectProps['options'] = Object.keys(guideData.supportFrameworks).map((language) => {
    const lang = language as GuideSupportLanguage;

    return {
      label: guideSupportLanguageText[lang],
      options: guideData.supportFrameworks[lang]?.map((framework) => ({
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
        <PlatformIcon platform={platform as GuideSupportPlatform} />
        &nbsp;&nbsp;
        {guideSupportPlatformText[platform as GuideSupportPlatform]}
      </FlexRow>
    ),
    value: platform,
  }));

  const targetOptions: SelectProps['options'] = availableTargets?.map((target: GuideSupportTarget) => ({
    label: (
      <FlexRow>
        <TargetIcon target={target} />
        &nbsp;&nbsp;
        {guideSupportTargetText[target]}
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
