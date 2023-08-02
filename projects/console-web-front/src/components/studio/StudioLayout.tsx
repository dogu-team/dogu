import { ProjectBase } from '@dogu-private/console';
import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { FaRegHandPaper } from 'react-icons/fa';
import Link from 'next/link';
import { Tooltip } from 'antd';
import { DeviceId } from '@dogu-private/types';
import { useRouter } from 'next/router';
import Image from 'next/image';

import Header from '../layouts/Header';
import { flexRowCenteredStyle } from '../../styles/box';
import resources from '../../resources';

interface Props {
  children: React.ReactNode;
  project: ProjectBase;
  deviceId: DeviceId | null;
}

const StudioLayout = ({ children, project, deviceId }: Props) => {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Studio - {project.name} | Dogu</title>
      </Head>
      <Box>
        <Header image={<Image src={resources.icons.studioLogo} height={48} width={170} alt="Dogu Studio" unoptimized />} />
        <FlexRow>
          <Side>
            <Tooltip title="Manual Testing" placement="right">
              <StyledLink
                href={{ pathname: '/dashboard/[orgId]/projects/[pid]/studio/manual', query: { orgId: router.query.orgId, pid: router.query.pid, deviceId: deviceId ?? undefined } }}
                style={{ display: 'block' }}
                isSelected={router.asPath.includes('manual')}
              >
                <IconWrapper>
                  <FaRegHandPaper style={{ fontSize: '1.5rem' }} />
                </IconWrapper>
              </StyledLink>
            </Tooltip>
          </Side>
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
  padding: 1rem;
  width: calc(100% - 100px);
`;

const IconWrapper = styled.div`
  ${flexRowCenteredStyle}
`;

const StyledLink = styled(Link)<{ isSelected: boolean }>`
  display: block;
  padding: 0.5rem;
  color: #000;
  border-radius: 0.25rem;
  background-color: ${(props) => (props.isSelected ? `${props.theme.colorPrimary}44` : '#fff')};

  &:hover {
    color: #000;
    background-color: ${(props) => props.theme.colorPrimary}22;
  }
`;
