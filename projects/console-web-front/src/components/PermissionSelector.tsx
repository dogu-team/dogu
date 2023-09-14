import { CheckOutlined } from '@ant-design/icons';
import { PageBase, ProjectRoleBase } from '@dogu-private/console';
import { ProjectRoleId } from '@dogu-private/types';
import { OrganizationId } from '@dogu-private/types';
import { Select, SelectProps } from 'antd';
import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { debounce } from 'lodash';
import styled from 'styled-components';

import { swrAuthFetcher } from 'src/api';

interface Props {
  organizationId: OrganizationId;
  defaultRoleId?: ProjectRoleId;
  onSelectRole: (roleId: ProjectRoleId, onError: () => void) => Promise<void> | void;
}

const PermissionSelector = ({ organizationId, defaultRoleId, onSelectRole }: Props) => {
  const [role, setRole] = useState(defaultRoleId);
  const [keyword, setKeyword] = useState('');
  const { data, error, isLoading } = useSWR<PageBase<ProjectRoleBase>>(
    `/organizations/${organizationId}/project-roles?page=1&offset=10&keyword=${keyword}`,
    swrAuthFetcher,
  );

  const debouncedUpdate = useMemo(() => debounce((value: string) => setKeyword(value), 250), []);

  const roleOption: SelectProps['options'] = data?.items.map((item) => ({
    label: item.name,
    value: item.projectRoleId,
  }));

  const resetValue = () => setRole(defaultRoleId);

  return (
    <StyledSelect
      showSearch
      onSearch={debouncedUpdate}
      dropdownMatchSelectWidth={100}
      placeholder={!!error ? 'Error!' : 'Select'}
      value={role}
      onChange={async (value) => {
        setRole(value);
        await onSelectRole(value, resetValue);
        setKeyword('');
      }}
      menuItemSelectedIcon={<CheckOutlined />}
      options={roleOption}
      defaultValue={defaultRoleId}
      loading={isLoading}
      filterOption={false}
      disabled={!!error}
    />
  );
};

export default React.memo(PermissionSelector);

const StyledSelect = styled(Select<ProjectRoleId>)`
  min-width: 100px;
`;
