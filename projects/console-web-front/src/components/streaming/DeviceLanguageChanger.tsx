import { LoadingOutlined } from '@ant-design/icons';
import { LocaleInfos, LocaleInfo } from '@dogu-private/types';
import { Input, Radio, RadioChangeEvent } from 'antd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';

interface Props {}

const DeviceLanguageChanger: React.FC<Props> = () => {
  const { deviceService, device } = useDeviceStreamingContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [selectedLocale, setSelectedLocale] = useState<LocaleInfo | undefined>(undefined);

  useEffect(() => {
    (async () => {
      if (!deviceService?.deviceClient || !device?.serial) {
        return;
      }

      setLoading(true);
      try {
        const locale = await deviceService.deviceClient.getLocale(device.serial);
        const localeInfo = LocaleInfos.find((info) => {
          return (
            info.code.language === locale.language &&
            info.code.region === locale.region &&
            info.code.script === locale.script
          );
        });
        setSelectedLocale(localeInfo);
      } catch (e) {}
      setLoading(false);
    })();
  }, [deviceService?.deviceClient, device?.serial]);

  const handleChange = async (e: RadioChangeEvent) => {
    if (!deviceService?.deviceClient || !device) {
      return;
    }

    setLoading(true);
    try {
      const localeInfo = LocaleInfos.find((info) => {
        return createRadioValue(info) === e.target.value;
      });

      if (!localeInfo) {
        return;
      }

      await deviceService.deviceClient.setLocale(device.serial, localeInfo.code);
      setSelectedLocale(localeInfo);
    } catch (e) {}
    setLoading(false);
  };

  const createRadioValue = (locale: LocaleInfo) => {
    return `${locale.code.language}${locale.code.region ?? ''}${locale.code.script ?? ''}`;
  };

  return (
    <Box>
      <div style={{ marginBottom: '.25rem' }}>
        <Input.Search
          placeholder="Search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          allowClear
        />

        <CurrentLocale>Current: {selectedLocale?.description ?? '-'}</CurrentLocale>
      </div>

      <StyledRadioGroup onChange={handleChange} value={selectedLocale ? createRadioValue(selectedLocale) : null}>
        {LocaleInfos.filter((info) => info.description.match(new RegExp(searchValue, 'ig'))).map((info) => {
          const value = createRadioValue(info);
          return (
            <StyledRadio key={value} value={value}>
              {info.description}
            </StyledRadio>
          );
        })}
      </StyledRadioGroup>

      {loading && (
        <LoadingBox>
          <LoadingOutlined style={{ fontSize: '2rem' }} />
        </LoadingBox>
      )}
    </Box>
  );
};

export default DeviceLanguageChanger;

const Box = styled.div`
  position: relative;
`;

const StyledRadioGroup = styled(Radio.Group)`
  width: 100%;
  max-height: 15rem;
  overflow-y: auto;
`;

const StyledRadio = styled(Radio)`
  display: flex;
  padding: 0.25rem 0;
`;

const LoadingBox = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CurrentLocale = styled.div`
  font-size: 0.8rem;
  color: ${(props) => props.theme.colors.gray6};
  line-height: 1.5;
`;
