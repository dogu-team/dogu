import { DeviceBase } from '@dogu-private/console';
import { Select, SelectProps } from 'antd';
import PlatformIcon from 'src/components/device/PlatformIcon';
import styled from 'styled-components';

import { flexRowBaseStyle } from 'src/styles/box';

interface LabelProps {
  device: DeviceBase;
}

const SelectLabel = ({ device }: LabelProps) => {
  return (
    <DeviceLabel>
      <DeviceNameWrapper>
        <DeviceName>{device.name}</DeviceName>
        <DeviceModel>{device.modelName ? `${device.modelName}(${device.model})` : device.model}</DeviceModel>
      </DeviceNameWrapper>

      <Flexbox>
        <PlatformIcon platform={device.platform} />
        {device.version}
      </Flexbox>
    </DeviceLabel>
  );
};

export interface DeviceSelectorProps {
  devices: DeviceBase[];
  onFilterChanged: (value: string) => void;
  onDeviceSelected: (device: DeviceBase | undefined) => void;
  selectedDevice: DeviceBase | undefined;
  loading?: boolean;
  className?: string;
  placeholder?: string;
  open: boolean;
  onClick: () => void;
  onBlur?: () => void;
}

const DeviceSelector = ({
  devices,
  selectedDevice,
  loading,
  onDeviceSelected,
  onFilterChanged,
  className,
  placeholder,
  open,
  onClick,
  onBlur,
}: DeviceSelectorProps) => {
  const listOptions: SelectProps['options'] = devices.map((device) => ({
    value: device.deviceId,
    label: <SelectLabel device={device} />,
  }));
  const options: SelectProps['options'] = selectedDevice
    ? [
        { value: selectedDevice.deviceId, label: <SelectLabel device={selectedDevice} /> },
        ...listOptions.filter((item) => item.value !== selectedDevice.deviceId),
      ]
    : listOptions;

  return (
    <Select
      className={className}
      options={options}
      showSearch
      dropdownMatchSelectWidth={false}
      style={{ width: '100%' }}
      value={selectedDevice?.deviceId}
      placeholder={placeholder}
      onSearch={onFilterChanged}
      filterOption={false}
      loading={loading}
      onChange={(value) => {
        onDeviceSelected(devices.find((item) => item.deviceId === value));
        onFilterChanged('');
      }}
      allowClear
      onClear={() => onDeviceSelected(undefined)}
      onClick={onClick}
      open={open}
      onBlur={onBlur}
      dropdownStyle={{ maxHeight: '15rem' }}
      virtual={false}
    />
  );
};

export default DeviceSelector;

const Flexbox = styled.div`
  ${flexRowBaseStyle}
`;

const DeviceLabel = styled(Flexbox)`
  justify-content: space-between;
`;

const DeviceName = styled.b`
  font-size: 0.85rem;
  font-weight: 500;
  margin-right: 0.25rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DeviceModel = styled.span`
  font-size: 0.75rem;
  color: #999;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DeviceNameWrapper = styled.p`
  margin-right: 0.5rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
`;
