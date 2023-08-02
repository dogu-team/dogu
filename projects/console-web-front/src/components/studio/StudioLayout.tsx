import { ProjectBase } from '@dogu-private/console';
import React from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { FaRegHandPaper } from 'react-icons/fa';

import Header from '../layouts/Header';
import { flexRowCenteredStyle } from '../../styles/box';
import Link from 'next/link';
import { Tooltip } from 'antd';

interface Props {
  children: React.ReactNode;
  project: ProjectBase;
}

const StudioLayout = ({ children, project }: Props) => {
  return (
    <>
      <Head>
        <title>Studio - {project.name} | Dogu</title>
      </Head>
      <Box>
        <Header />
        <FlexRow>
          <Side>
            <Tooltip title="Manual Testing" placement="right">
              <StyledLink href={`/dashboard/${project.organizationId}/projects/${project.projectId}/studio/manual`} style={{ display: 'block' }}>
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
  display: flex;
  flex-direction: column;
`;

const FlexRow = styled.div`
  display: flex;
  flex: 1;
`;

const Side = styled.aside`
  position: sticky;
  padding: 1rem;
  top: 0;
  width: 100px;
  border-right: 1px solid #eaeaea;
`;

const Main = styled.main`
  padding: 1rem;
  flex: 1;
`;

const IconWrapper = styled.div`
  ${flexRowCenteredStyle}
`;

const StyledLink = styled(Link)`
  display: block;
  padding: 0.5rem;
  color: #000;
  border-radius: 0.25rem;

  &:hover {
    color: #000;
    background-color: ${(props) => props.theme.colorPrimary}22;
  }
`;
