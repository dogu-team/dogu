import { OrganizationId } from '@dogu-private/types';
import { Button, Divider, Modal } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { SiWebdriverio } from 'react-icons/si';
import styled from 'styled-components';
import Image from 'next/image';
import { isAxiosError } from 'axios';

import { updateOrganizationTutorial } from '../../api/organization';
import useRequest from '../../hooks/useRequest';
import { GuideSupportSdk } from '../../resources/guide';
import { flexRowCenteredStyle, flexRowSpaceBetweenStyle } from '../../styles/box';
import resources from '../../resources';
import { sendErrorNotification } from '../../utils/antd';
import GuideBanner from '../projects/guides/GuideBanner';
import SkipTutorialButton from './SkipTutorialButton';

const SdkSelectBox = () => {
  const router = useRouter();
  const [loading, request] = useRequest(updateOrganizationTutorial);
  const orgId = router.query.orgId as OrganizationId;

  const handleClickSkip = async () => {
    try {
      await request(orgId, { isTutorialCompleted: 1 });
      router.push(`/dashboard/${orgId}`);
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification('Failed to skip tutorial');
      }
    }
  };

  return (
    <Box>
      <TitleWrapper>
        <div style={{ marginRight: '.5rem' }}>
          <StyledH1>Get started with Dogu!</StyledH1>
          <Description>Run automated testings for your web, app and game!</Description>
        </div>

        <div>
          <SkipTutorialButton orgId={orgId}>Skip tutorial</SkipTutorialButton>
        </div>
      </TitleWrapper>

      <Divider />

      <TableWrapper>
        <StyledH2>Select SDK</StyledH2>

        <FlexTable>
          <TableItem>
            <StyledLink href={{ query: { orgId, sdk: GuideSupportSdk.WEBDRIVERIO } }} shallow>
              <SiWebdriverio style={{ fontSize: '32px' }} />
              WebdriverIO
            </StyledLink>
          </TableItem>
          <TableItem>
            <StyledLink href={{ query: { orgId, sdk: GuideSupportSdk.APPIUM } }} shallow>
              <Image src={resources.icons.appium} width={32} height={32} alt="appium" />
              Appium
            </StyledLink>
          </TableItem>
          <TableItem>
            <StyledLink href={{ query: { orgId, sdk: GuideSupportSdk.GAMIUM } }} shallow>
              <Image src={resources.icons.gamium} width={32} height={32} alt="gamium" />
              Gamium
            </StyledLink>
          </TableItem>
        </FlexTable>
      </TableWrapper>

      <Divider />

      <BannerBox>
        <GuideBanner />
      </BannerBox>
    </Box>
  );
};

export default SdkSelectBox;

const Box = styled.div`
  padding: 2rem;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  line-height: 1.5;
  box-shadow: ${(props) => props.theme.main.shadows.blackLight};
  border-radius: 6px;
`;

const TitleWrapper = styled.div`
  margin-bottom: 1rem;
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

const FlexTable = styled.div`
  ${flexRowCenteredStyle}
  margin-top: 1rem;
  flex-wrap: wrap;
`;

const TableItem = styled.div`
  width: 20%;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background-color: #f5f5f5;
  }
`;

const StyledLink = styled(Link)`
  padding: 4%;
  display: flex;
  flex-direction: column;
  color: #000;
  text-decoration: none;
  align-items: center;
`;

const StyledButton = styled.button`
  width: 100%;
  padding: 4%;
  display: flex;
  flex-direction: column;
  color: #000;
  text-decoration: none;
  align-items: center;
  background-color: inherit;
`;

const BannerBox = styled.div`
  & > div {
    background-color: #fff;
  }
`;

const ModalTitle = styled.p`
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 1rem;
`;
