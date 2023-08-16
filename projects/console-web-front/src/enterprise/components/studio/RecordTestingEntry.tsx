import { FolderOpenOutlined, PlusOutlined } from '@ant-design/icons';
import { ProjectBase, RecordTestCaseBase } from '@dogu-private/console';
import { Button } from 'antd';
import { isAxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import useDeviceStreamingContext from '../../../hooks/streaming/useDeviceStreamingContext';
import useRequest from '../../../hooks/useRequest';

import { flexRowBaseStyle, flexRowCenteredStyle } from '../../../styles/box';
import { sendErrorNotification } from '../../../utils/antd';
import { getErrorMessageFromAxios } from '../../../utils/error';
import { createNewSession } from '../../api/record';
import CreateCaseButton from '../record/CreateCaseButton';
import OpenCaseButton from '../record/OpenCaseButton';

interface Props {
  project: ProjectBase;
}

const RecordTestingEntry = ({ project }: Props) => {
  const router = useRouter();
  const { device } = useDeviceStreamingContext();
  const [loading, request] = useRequest(createNewSession);

  const moveAfterCreateSession = async (testCase: RecordTestCaseBase) => {
    if (!device) {
      return;
    }

    try {
      const testCaseWithSession = await request(project.organizationId, project.projectId, testCase.recordTestCaseId, { deviceId: device?.deviceId });
      router.push({ query: { ...router.query, caseId: testCaseWithSession.recordTestCaseId } }, undefined, { shallow: true });
    } catch (e) {
      if (isAxiosError(e)) {
        sendErrorNotification(`Failed to create session.\n${getErrorMessageFromAxios(e)}`);
      }
    }
  };

  if (!device) {
    return (
      <div>
        No device selected... <Link href={`/dashboard/${project.organizationId}/projects/${project.projectId}/studio`}>Move studio</Link>
      </div>
    );
  }

  return (
    <Box>
      <Head>
        <Title>Create or open test case and make your tests easily!</Title>
      </Head>
      <ButtonWrapper>
        <CreateCaseButton project={project} icon={<PlusOutlined />} type="primary" onCreate={moveAfterCreateSession} device={device} isSessionCreating={loading}>
          Create new
        </CreateCaseButton>
        <Divider style={{ margin: '0 .5rem' }}>or</Divider>
        <OpenCaseButton project={project} onSelect={moveAfterCreateSession} isSessionCreating={loading} />
      </ButtonWrapper>
    </Box>
  );
};

export default RecordTestingEntry;

const Box = styled.div`
  ${flexRowCenteredStyle}
  flex-direction: column;
  width: 100%;
  height: 100%;
  line-height: 1.5;
`;

const Head = styled.div`
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  font-size: 1.2rem;
  font-weight: 600;
`;

const ButtonWrapper = styled.div`
  ${flexRowBaseStyle}
`;

const Divider = styled.div`
  margin: 0 0.5rem;
  color: ${(props) => props.theme.colors.gray5};
  font-size: 0.85rem;
`;
