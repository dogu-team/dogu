import { Button, Select, SelectProps } from 'antd';
import { useRouter } from 'next/router';
import { isAxiosError } from 'axios';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { UploadOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useState } from 'react';
import Image from 'next/image';

import { mobileGuideData, SAMPLE_GIT_URL } from '../../../resources/guide';
import { flexRowBaseStyle } from '../../../styles/box';
import CopyButtonContainer from './CopyButtonContainer';
import useRequest from '../../../hooks/useRequest';
import { uploadSampleApplication } from '../../../api/project-application';
import { sendErrorNotification, sendSuccessNotification } from '../../../utils/antd';
import { getErrorMessage } from '../../../utils/error';
import GuideAnchor from './GuideAnchor';

const GameGuide = () => {
  return (
    <Box>
      <div>We&apos;re working on it!</div>
      {/* <StickyBox></StickyBox> */}
      {/* <GuideBox></GuideBox> */}
    </Box>
  );
};

export default GameGuide;

const Box = styled.div`
  display: flex;
`;

const StickyBox = styled.div`
  position: sticky;
  width: 20%;
  min-width: 220px;
  top: 20px;
  height: 100%;
`;

const GuideBox = styled.div`
  width: 80%;
  margin-left: 1rem;
  max-width: 1000px;
`;

const Step = styled.div`
  margin-bottom: 2rem;
`;

const StepTitle = styled.h4`
  font-size: 1.25rem;
  font-weight: 600;
`;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;
