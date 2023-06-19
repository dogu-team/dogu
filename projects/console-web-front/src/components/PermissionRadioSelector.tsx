import { LoadingOutlined } from '@ant-design/icons';
import { PageBase, ProjectRoleBase } from '@dogu-private/console';
import { ProjectRoleId } from '@dogu-private/types';
import { OrganizationId } from '@dogu-private/types';
import { Radio, Space } from 'antd';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from '../api';

interface Props {
  organizationId: OrganizationId;
  defaultRoleId?: ProjectRoleId;
  onChange: (value: ProjectRoleId) => void;
}

const PermissionRadioSelector = ({ organizationId, defaultRoleId, onChange }: Props) => {
  const { data, error, isLoading } = useSWR<PageBase<ProjectRoleBase>>(`/organizations/${organizationId}/project-roles`, swrAuthFetcher);
  const { t } = useTranslation();

  const roleDescriptions: { [key: number]: string } = {
    1: 'Admin has full access to the project. Admin can add or remove members, change project settings.',
    2: "Write has full access to the project. But can't add or remove members, change project settings.",
    3: 'Read has read-only access to the project.',
  };

  if (isLoading) {
    return <LoadingOutlined />;
  }

  if (!data || error) {
    return <div>something went wrong...</div>;
  }

  return (
    <Box defaultValue={1} onChange={(e) => onChange(e.target.value)}>
      <Inner direction="vertical">
        {data?.items.map((item) => {
          return (
            <Item key={`role-group-${item.projectRoleId}`} value={item.projectRoleId}>
              <StyledPermission>{item.name}</StyledPermission>
              <StyledDescription>{roleDescriptions[item.projectRoleId]}</StyledDescription>
            </Item>
          );
        })}
      </Inner>
    </Box>
  );
};

export default PermissionRadioSelector;

const Box = styled(Radio.Group)`
  width: 100%;
`;

const Inner = styled(Space)`
  width: 100%;
`;

const Item = styled(Radio)`
  width: 100%;
  margin: 0.25rem 0;
`;

const StyledPermission = styled.p`
  font-weight: 500;
  line-height: 1.5;
`;

const StyledDescription = styled.p`
  font-size: 0.8rem;
`;
