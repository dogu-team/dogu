import { Select, SelectProps } from 'antd';
import { useRouter } from 'next/router';

import {
  Guide,
  GuideSupportFramework,
  GuideSupportLanguage,
  guideSupportLanguageText,
  GuideSupportPlatform,
  guideSupportPlatformText,
  GuideSupportTarget,
  guideSupportTargetText,
} from '../../../resources/guide';
import GuidePlatformIcon from './GuidePlatformIcon';
import GuideTargetIcon from './GuideTargetIcon';
import styled from 'styled-components';
import { flexRowBaseStyle } from '../../../styles/box';

interface Props {
  guideData: Guide;
  selectedFramwork: GuideSupportFramework;
  selectedPlatform: GuideSupportPlatform;
  selectedTarget: GuideSupportTarget;
}

const GuideSelectors = ({ guideData, selectedFramwork, selectedPlatform, selectedTarget }: Props) => {
  const router = useRouter();
  const availabePlatforms = Object.keys(guideData.platformAndTarget).filter((platform) => guideData.platformAndTarget[platform as GuideSupportPlatform]?.includes(selectedTarget));
  const availableTargets = guideData.platformAndTarget[selectedPlatform];
  const frameworkOptions: SelectProps['options'] = Object.keys(guideData.supportFrameworks).map((language) => {
    const lang = language as GuideSupportLanguage;

    return {
      label: guideSupportLanguageText[lang],
      options: guideData.supportFrameworks[lang]?.map((framework) => ({
        label: <div>{framework}</div>,
        value: framework,
      })),
    };
  });

  const platformOptions: SelectProps['options'] = availabePlatforms?.map((platform) => ({
    label: (
      <FlexRow>
        <GuidePlatformIcon platform={platform as GuideSupportPlatform} />
        &nbsp;&nbsp;
        {guideSupportPlatformText[platform as GuideSupportPlatform]}
      </FlexRow>
    ),
    value: platform,
  }));

  const targetOptions: SelectProps['options'] = availableTargets?.map((target: GuideSupportTarget) => ({
    label: (
      <FlexRow>
        <GuideTargetIcon target={target} />
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
          router.push({ query: { ...router.query, framework: value } }, undefined, { shallow: true, scroll: true });
        }}
        dropdownMatchSelectWidth={false}
        style={{ width: '100%', marginBottom: '.5rem' }}
      />
      <Select
        options={platformOptions}
        value={selectedPlatform}
        onChange={(value) => {
          router.push({ query: { ...router.query, platform: value } }, undefined, { shallow: true, scroll: true });
        }}
        dropdownMatchSelectWidth={false}
        style={{ width: '100%', marginBottom: '.5rem' }}
      />
      <Select
        options={targetOptions}
        value={selectedTarget}
        onChange={(value) => {
          router.push({ query: { ...router.query, target: value } }, undefined, { shallow: true, scroll: true });
        }}
        dropdownMatchSelectWidth={false}
        style={{ width: '100%' }}
      />
    </>
  );
};

export default GuideSelectors;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;
