import { PROJECT_TYPE } from '@dogu-private/types';
import { Divider } from 'antd';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useState } from 'react';

import { flexRowSpaceBetweenStyle } from '../../styles/box';
import GuideBanner from './GuideBanner';
import DoguText from '../common/DoguText';
import FrameworkSelectTable from './FrameworkSelectTable';
import { TutorialSupportSdk } from '../../resources/tutorials';
import useTutorialContext from '../../hooks/useTutorialContext';

interface Props {
  skipButton: React.ReactNode;
}

const FrameworkSelectContainer = ({ skipButton }: Props) => {
  const router = useRouter();
  const { project } = useTutorialContext();
  const [selectedSdk, setSelectedSdk] = useState<TutorialSupportSdk>(() => {
    if (project?.type === PROJECT_TYPE.WEB) {
      return TutorialSupportSdk.WEBDRIVERIO;
    }

    if (project?.type === PROJECT_TYPE.APP) {
      return TutorialSupportSdk.APPIUM;
    }

    if (project?.type === PROJECT_TYPE.GAME) {
      return TutorialSupportSdk.GAMIUM;
    }

    return TutorialSupportSdk.WEBDRIVERIO;
  });

  const handleClickFramework = (framework: string) => {
    if (!selectedSdk) return;
    router.push({ query: { ...router.query, sdk: selectedSdk, framework } }, undefined, { shallow: true });
  };

  return (
    <Box>
      <TitleWrapper>
        <div style={{ marginRight: '.5rem' }}>
          <StyledH1>
            Get started with <DoguText />!
          </StyledH1>
          <Description>Run automated testings for your web, app and game!</Description>
        </div>

        <div>{skipButton}</div>
      </TitleWrapper>

      <Divider style={{ margin: '2rem 0' }} />

      <TableWrapper>
        <StyledH2>Select test framework!</StyledH2>

        <FrameworkSelectTable selectedSdk={selectedSdk} onClickSdk={setSelectedSdk} onClickFramework={handleClickFramework} />
      </TableWrapper>

      <Divider />

      <BannerBox>
        <GuideBanner />
      </BannerBox>
    </Box>
  );
};

export default FrameworkSelectContainer;

const Box = styled.div`
  padding: 3rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  line-height: 1.5;
  box-shadow: ${(props) => props.theme.main.shadows.blackLight};
  border-radius: 6px;
  background-color: #fff;
`;

const TitleWrapper = styled.div`
  ${flexRowSpaceBetweenStyle}
`;

const StyledH1 = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
`;

const Description = styled.p`
  color: ${(props) => props.theme.main.colors.gray3};
`;

const StyledH2 = styled.h2`
  font-weight: 600;
`;

const TableWrapper = styled.div``;

const BannerBox = styled.div`
  & > div {
    background-color: #fff;
  }
`;
