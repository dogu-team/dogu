import { CloseOutlined } from '@ant-design/icons';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { flexRowBaseStyle } from '../../../../styles/box';
import WorkingDirectorySelector from './WorkingDirectorySelector';

interface Props {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

const WorkingDirectoryContainer = ({ value, onChange }: Props) => {
  const router = useRouter();

  if (value) {
    return (
      <FlexRow>
        <p>{value}</p>
        <CloseButton onClick={() => onChange(undefined)}>
          <CloseOutlined />
        </CloseButton>
      </FlexRow>
    );
  }

  return (
    <WorkingDirectorySelector
      onChange={onChange}
      organizationId={router.query.orgId as OrganizationId}
      projectId={router.query.pid as ProjectId}
      placeholder="workingDirPaths in dogu.config.json"
    />
  );
};

export default WorkingDirectoryContainer;

const FlexRow = styled.div`
  ${flexRowBaseStyle}
`;

const CloseButton = styled.button`
  padding: 0.25rem;
  margin-left: 0.25rem;
  border: none;
  background-color: transparent;
  cursor: pointer;
`;
