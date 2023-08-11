import { PageBase, RecordTestCaseBase } from '@dogu-private/console';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { Select } from 'antd';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../../api';
import useDebouncedInputValues from '../../../hooks/useDebouncedInputValues';

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
  onSelect: (testCase: RecordTestCaseBase) => void;
}

const CaseSelector = ({ organizationId, projectId, onSelect }: Props) => {
  const { debouncedValue, handleChangeValues } = useDebouncedInputValues();
  const { data, isLoading, error } = useSWR<PageBase<RecordTestCaseBase>>(
    `/organizations/${organizationId}/projects/${projectId}/record-test-cases?keyword=${debouncedValue}`,
    swrAuthFetcher,
    {
      revalidateOnFocus: false,
    },
  );

  const options = data?.items.map((item) => ({
    label: item.name,
    value: item.recordTestCaseId,
    children: item,
  }));

  return (
    <Select
      style={{ width: '100%' }}
      options={options}
      showSearch
      onSelect={(value) => {
        onSelect(options?.find((option) => option.value === value)?.children!);
      }}
      placeholder="Select test case..."
      onSearch={(value) => handleChangeValues(value)}
      loading={isLoading}
      filterOption={false}
    />
  );
};

export default CaseSelector;