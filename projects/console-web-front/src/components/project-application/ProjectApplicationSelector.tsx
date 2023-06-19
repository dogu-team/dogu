import { PageBase, ProjectApplicationWithIcon } from '@dogu-private/console';
import { OrganizationId, ProjectId } from '@dogu-private/types';
import { Select, SelectProps } from 'antd';
import useSWR from 'swr';

import { swrAuthFetcher } from '../../api';
import useDebouncedInputValues from '../../hooks/useDebouncedInputValues';
import ProjectApplicationOptionItem from './ProjectApplicationOptionItem';

interface Props extends Omit<SelectProps<number>, 'options'> {
  selectedApplication: ProjectApplicationWithIcon | undefined;
  organizationId: OrganizationId;
  projectId: ProjectId;
  onSelectApp: (app: ProjectApplicationWithIcon | undefined) => void;
  toggleOpen: () => void;
  close: () => void;
  extension?: string;
}

const ProjectApplicationSelector = ({ selectedApplication, organizationId, projectId, extension, toggleOpen, close, onSelectApp, ...props }: Props) => {
  const { debouncedValue, handleChangeValues } = useDebouncedInputValues();
  const { data, isLoading, error } = useSWR<PageBase<ProjectApplicationWithIcon>>(
    props.open && `/organizations/${organizationId}/projects/${projectId}/applications?version=${debouncedValue}${extension ? `&extension=${extension}` : ''}`,
    swrAuthFetcher,
    {
      revalidateOnFocus: false,
    },
  );

  const applications = selectedApplication ? [selectedApplication, ...(data?.items || [])] : data?.items;
  const options: SelectProps['options'] = applications?.map((item) => {
    return {
      label: <ProjectApplicationOptionItem app={item} />,
      value: item.projectApplicationId,
    };
  });

  return (
    <Select<number>
      loading={isLoading}
      options={options}
      style={{ width: '100%' }}
      showSearch
      onSearch={handleChangeValues}
      onChange={(e) => {
        const selected = data?.items.find((item) => item.projectApplicationId === e);
        onSelectApp(selected);
      }}
      onClear={() => onSelectApp(undefined)}
      dropdownMatchSelectWidth={false}
      filterOption={false}
      allowClear
      onClick={() => toggleOpen()}
      onBlur={() => close()}
      defaultValue={selectedApplication?.projectApplicationId}
      value={selectedApplication?.projectApplicationId}
      {...props}
    />
  );
};

export default ProjectApplicationSelector;
