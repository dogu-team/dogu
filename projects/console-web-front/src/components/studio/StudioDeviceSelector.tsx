import { DeviceBase, PageBase } from '@dogu-private/console';
import { DeviceConnectionState, OrganizationId, ProjectId } from '@dogu-private/types';
import useTranslation from 'next-translate/useTranslation';
import styled from 'styled-components';
import useSWR from 'swr';
import { useState } from 'react';

import { swrAuthFetcher } from 'src/api';
import DeviceSelector from 'src/components/device/DeviceSelector';
import useDebouncedInputValues from 'src/hooks/useDebouncedInputValues';

interface Props {
  organizationId: OrganizationId;
  projectId: ProjectId;
  selectedDevice: DeviceBase | undefined;
  onSelectedDeviceChanged: (device: DeviceBase | undefined) => void;
}

const StudioDeviceSelector = ({ organizationId, projectId, onSelectedDeviceChanged, selectedDevice }: Props) => {
  const [open, setOpen] = useState(false);
  const { debouncedValue, handleChangeValues } = useDebouncedInputValues();
  const { data, isLoading, error } = useSWR<PageBase<DeviceBase>>(
    open &&
      `/organizations/${organizationId}/projects/${projectId}/devices?keyword=${debouncedValue}&connectionState=${DeviceConnectionState.DEVICE_CONNECTION_STATE_CONNECTED}&offset=99`,
    swrAuthFetcher,
    { revalidateOnFocus: false },
  );
  const { t } = useTranslation();

  return (
    <StyledDeviceSelector
      devices={data?.items ?? []}
      onFilterChanged={handleChangeValues}
      loading={isLoading}
      onDeviceSelected={onSelectedDeviceChanged}
      selectedDevice={selectedDevice}
      placeholder={'Select your device'}
      open={open}
      onClick={() => setOpen((prev) => !prev)}
      onBlur={() => setOpen(false)}
    />
  );
};

export default StudioDeviceSelector;

const StyledDeviceSelector = styled(DeviceSelector)`
  max-width: 20rem;
`;
