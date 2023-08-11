import { FolderOpenOutlined, PlusOutlined } from '@ant-design/icons';
import { ProjectBase } from '@dogu-private/console';
import { Button } from 'antd';
import { useRouter } from 'next/router';
import styled from 'styled-components';

import { flexRowBaseStyle, flexRowCenteredStyle } from '../../../styles/box';
import CreateCaseButton from '../visual/CreateCaseButton';
import OpenCaseButton from '../visual/OpenCaseButton';

interface Props {
  project: ProjectBase;
}

const VisualTestingEntry = ({ project }: Props) => {
  const router = useRouter();

  return (
    <Box>
      <Head>
        <Title>Start visual testing!</Title>
      </Head>
      <ButtonWrapper>
        <CreateCaseButton
          project={project}
          icon={<PlusOutlined />}
          type="primary"
          onCreate={(rv) => {
            router.push({ query: { ...router.query, caseId: rv.recordTestCaseId } }, undefined, { shallow: true });
          }}
        >
          Create new
        </CreateCaseButton>
        <Divider style={{ margin: '0 .5rem' }}>or</Divider>
        <OpenCaseButton
          project={project}
          onSelect={(rv) => {
            router.push({ query: { ...router.query, caseId: rv.recordTestCaseId } }, undefined, { shallow: true });
          }}
        />
      </ButtonWrapper>
    </Box>
  );
};

export default VisualTestingEntry;

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