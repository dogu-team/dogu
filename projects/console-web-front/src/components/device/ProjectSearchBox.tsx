import { Input, message } from 'antd';
import { useRouter } from 'next/router';
import { swrAuthFetcher } from 'src/api';
import styled from 'styled-components';
import useSWR from 'swr';
import shallow from 'zustand/shallow';
import { MAX_PROJECT_IDS_FILTER_LENGTH, PageBase, ProjectBase } from '@dogu-private/console';
import { useCallback } from 'react';
import { ProjectId } from '@dogu-private/types';
import useTranslation from 'next-translate/useTranslation';

import useDebouncedInputValues from 'src/hooks/useDebouncedInputValues';
import useDeviceFilterStore from 'src/stores/device-filter';
import { FilterSelectedTag, FilterSelectOption, SelectFilterDropdownMenu } from '../SelectFilterDropdown';
import { sendErrorNotification } from '../../utils/antd';

const ProjectSearchBox = () => {
  const router = useRouter();
  const organizationId = router.query.orgId;
  const { inputValue, debouncedValue, handleChangeValues } = useDebouncedInputValues();
  const { data, isLoading, error } = useSWR<PageBase<ProjectBase>>(
    organizationId && `/organizations/${organizationId}/projects?keyword=${debouncedValue}&page=1&offset=5`,
    swrAuthFetcher,
    { keepPreviousData: true },
  );
  const [selectedProjects, updateFilter] = useDeviceFilterStore((state) => [state.filterValue.projects, state.updateFilter], shallow);
  const { t } = useTranslation();

  const handleRemoveFilter = useCallback((name: string) => {
    updateFilter({ projects: (prev) => prev.filter((ft) => ft.name !== name) });
  }, []);

  const handleToggleOption = (item: { name: string; projectId: ProjectId }, selected: boolean) => {
    if (selected) {
      updateFilter({ projects: (prev) => prev.filter((t) => t.projectId !== item.projectId) });
    } else {
      updateFilter({
        projects: (prev) => {
          if (prev.length >= MAX_PROJECT_IDS_FILTER_LENGTH) {
            sendErrorNotification(`You can select max ${MAX_PROJECT_IDS_FILTER_LENGTH}`);
            return prev;
          }

          return [...prev, { name: item.name, projectId: item.projectId }];
        },
      });
    }
  };

  return (
    <StyledSelectFilterDropdownMenu
      title={t('device:runnerFilterProjectSearchTitle')}
      input={
        <Input.Search
          value={inputValue}
          onChange={(e) => handleChangeValues(e.target.value)}
          loading={isLoading}
          allowClear
          placeholder={t('device:runnerFilterProjectSearchPlaceholder')}
        />
      }
      selectedItems={selectedProjects.map((item) => {
        return <FilterSelectedTag key={`project-filter-${item.projectId}`} value={item.name} onClick={handleRemoveFilter} />;
      })}
      optionItems={data?.items.map((item) => {
        const selected = !!selectedProjects.find((sp) => sp.projectId === item.projectId);

        return (
          <FilterSelectOption key={`search-${item.projectId}`} checked={selected} onClick={() => handleToggleOption(item, selected)}>
            {item.name}
          </FilterSelectOption>
        );
      })}
    />
  );
};

export default ProjectSearchBox;

const StyledSelectFilterDropdownMenu = styled(SelectFilterDropdownMenu)`
  width: 250px;
`;
