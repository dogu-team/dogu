import { DeviceBase } from '@dogu-private/console';
import { EDITION_TYPE } from '@dogu-private/types';
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import Header from '../../../src/components/layouts/Header';
import resources from '../../../src/resources/index';
import { flexRowCenteredStyle } from '../../../src/styles/box';

interface Props {
  children: React.ReactNode;
  // project: ProjectBase;
  device: DeviceBase | null;
  headerRight?: React.ReactNode;
}

const StudioLayout = ({ children, device, headerRight }: Props) => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Studio - {device?.modelName ?? device?.name} | Dogu</title>t
      </Head>
      <Box>
        <Header
          image={
            <Image src={resources.icons.studioLogo} height={48} width={170} alt="Dogu Studio" unoptimized priority />
          }
          right={headerRight}
        />
        <FlexRow>
          {/* <Side>
            <Tooltip title="Manual Testing" placement="right">
              <StyledLink
                href={{
                  pathname: '/dashboard/[orgId]/projects/[pid]/studio/[deviceId]/manual',
                  query: {
                    orgId: router.query.orgId,
                    pid: router.query.pid,
                    deviceId: deviceId ?? undefined,
                  },
                }}
                style={{ display: 'block' }}
                isSelected={router.asPath.includes('manual')}
                shallow
              >
                <IconWrapper>
                  <FaRegHandPaper style={{ fontSize: '1.5rem' }} />
                </IconWrapper>
              </StyledLink>
            </Tooltip>
            <Tooltip title="Record Testing" placement="right">
              <StyledLink
                href={{
                  pathname: '/dashboard/[orgId]/projects/[pid]/studio/[deviceId]/record',
                  query: { orgId: router.query.orgId, pid: router.query.pid, deviceId: deviceId ?? undefined },
                }}
                style={{ display: 'block' }}
                isSelected={router.asPath.includes('record')}
                shallow
              >
                <IconWrapper>
                  <BiVideoRecording style={{ fontSize: '1.5rem' }} />
                </IconWrapper>
              </StyledLink>
            </Tooltip>
          </Side> */}
          <Main>{children}</Main>
        </FlexRow>
      </Box>
    </>
  );
};

export default StudioLayout;

const Box = styled.div`
  min-height: 100dvh;
  height: 100%;
  width: 100dvw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const FlexRow = styled.div`
  display: flex;
  width: 100%;
  height: calc(100dvh - 57px);
`;

const Side = styled.aside`
  position: sticky;
  padding: 1rem;
  top: 0;
  width: 100px;
  border-right: 1px solid #eaeaea;
  flex-shrink: 0;
`;

const Main = styled.main`
  display: flex;
  /* padding: 1rem; */
  width: 100%;
  flex: 1;
`;

const IconWrapper = styled.div`
  ${flexRowCenteredStyle}
`;

const StyledLink = styled(Link)<{ isSelected: boolean }>`
  display: block;
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  color: #000;
  border-radius: 0.25rem;
  background-color: ${(props) => (props.isSelected ? `${props.theme.colorPrimary}44` : '#fff')};

  &:hover {
    color: #000;
    background-color: ${(props) => props.theme.colorPrimary}22;
  }
`;
