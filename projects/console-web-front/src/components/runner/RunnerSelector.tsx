import { DeviceBase } from '@dogu-private/console';
import { Select, SelectProps } from 'antd';
import styled from 'styled-components';

import PlatformIcon from 'src/components/runner/PlatformIcon';
import { flexRowBaseStyle } from 'src/styles/box';

export interface RunnerSelectorProps {
  runners: DeviceBase[];
  filterValue: string;
  onFilterChanged: (value: string) => void;
  onDeviceSelected: (runner: DeviceBase | undefined) => void;
  defaultSelectedDevice?: DeviceBase;
  loading?: boolean;
  className?: string;
  placeholder?: string;
  open: boolean;
  onClick: () => void;
  onBlur?: () => void;
}

const RunnerSelector = ({
  runners,
  filterValue,
  defaultSelectedDevice,
  loading,
  onDeviceSelected,
  onFilterChanged,
  className,
  placeholder,
  open,
  onClick,
  onBlur,
}: RunnerSelectorProps) => {
  const options: SelectProps['options'] = runners.map((runner) => ({
    value: runner.deviceId,
    label: (
      <DeviceLabel>
        <DeviceNameWrapper>
          <DeviceName>{runner.name}</DeviceName>
          <DeviceModel>{runner.modelName ? `${runner.modelName}(${runner.model})` : runner.model}</DeviceModel>
        </DeviceNameWrapper>

        <Flexbox>
          <PlatformIcon platform={runner.platform} />
          {runner.version}
        </Flexbox>
      </DeviceLabel>
    ),
  }));

  return (
    <Select
      className={className}
      options={options}
      showSearch
      dropdownMatchSelectWidth={false}
      style={{ width: '100%' }}
      placeholder={placeholder}
      onSearch={onFilterChanged}
      filterOption={false}
      optionLabelProp="label"
      loading={loading}
      onChange={(value) => {
        onDeviceSelected(runners.find((item) => item.deviceId === value));
        onFilterChanged('');
      }}
      allowClear
      onClear={() => onDeviceSelected(undefined)}
      onClick={onClick}
      open={open}
      onBlur={onBlur}
    />
  );
};

export default RunnerSelector;

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
