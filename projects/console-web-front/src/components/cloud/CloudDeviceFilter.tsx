import { Input } from 'antd';
import { useEffect } from 'react';
import { shallow } from 'zustand/shallow';

import useDebouncedInputValues from '../../hooks/useDebouncedInputValues';
import useCloudDeviceFilterStore from '../../stores/cloud-device-filter';

const CloudDeviceFilter: React.FC = () => {
  const { inputValue, debouncedValue, handleChangeValues } = useDebouncedInputValues();
  const updateFilter = useCloudDeviceFilterStore((state) => state.updateFilter, shallow);

  useEffect(() => {
    updateFilter({ keyword: () => debouncedValue });
  }, [debouncedValue]);

  return (
    <Input.Search
      placeholder="Brand or name"
      allowClear
      value={inputValue}
      onChange={(e) => handleChangeValues(e.target.value)}
    />
  );
};

export default CloudDeviceFilter;
