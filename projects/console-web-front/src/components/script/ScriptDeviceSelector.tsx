import { DeviceBase, PageBase } from '@dogu-private/console';
import { DeviceConnectionState, OrganizationId, ProjectId } from '@dogu-private/types';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';
import useSWR from 'swr';

import { swrAuthFetcher } from 'src/api';
import DeviceSelector from 'src/components/device/DeviceSelector';
import useDebouncedInputValues from 'src/hooks/useDebouncedInputValues';
import { useState } from 'react';

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
  onSelectedDeviceChanged: (device: DeviceBase | undefined) => void;
}

const ScriptDeviceSeletor = ({ organizationId, projectId, onSelectedDeviceChanged }: Props) => {
  const [open, setOpen] = useState(false);
  const { inputValue, debouncedValue, handleChangeValues } = useDebouncedInputValues();
  const { data, isLoading, error } = useSWR<PageBase<DeviceBase>>(
    open && `/organizations/${organizationId}/projects/${projectId}/devices?keyword=${debouncedValue}&connectionState=${DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED}`,
    swrAuthFetcher,
    { revalidateOnFocus: false },
  );
  const { t } = useTranslation();

  return (
    <StyledDeviceSelector
      devices={data?.items ?? []}
      filterValue={inputValue ?? ''}
      onFilterChanged={handleChangeValues}
      loading={isLoading}
      onDeviceSelected={onSelectedDeviceChanged}
      placeholder={t('project-script:deviceSelectPlaceholder')}
      open={open}
      onClick={() => setOpen((prev) => !prev)}
      onBlur={() => setOpen(false)}
    />
  );
};

export default ScriptDeviceSeletor;

const StyledDeviceSelector = styled(DeviceSelector)`
  flex: 1;
  max-width: 20rem;
`;
