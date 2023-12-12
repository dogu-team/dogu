import { WarningFilled, WarningOutlined } from '@ant-design/icons';
import { DeviceBase } from '@dogu-private/console';
import { Platform } from '@dogu-private/types';
import { Tooltip } from 'antd';
import Link from 'next/link';
import styled from 'styled-components';
import { DoguDocsUrl } from '../../utils/url';

interface Props {
  device: DeviceBase;
}

const ANDROID_MINIMUM_VERSION = 8;
const IOS_MINIMUM_VERSION = 14;
const MACOS_MINIMUM_VERSION = 11;

const docsLink: { [key in Platform]?: string } = {
  [Platform.PLATFORM_ANDROID]: DoguDocsUrl['device-farm'].device.settings(),
  [Platform.PLATFORM_IOS]: DoguDocsUrl['device-farm'].device.settings(),
  [Platform.PLATFORM_WINDOWS]: DoguDocsUrl['device-farm'].host.windows.installation(),
  [Platform.PLATFORM_MACOS]: DoguDocsUrl['device-farm'].host.macos.installation(),
};

const DeviceVersionAlertIcon = ({ device }: Props) => {
  const version = device.version;
  const platform = device.platform;

  if (platform === Platform.PLATFORM_WINDOWS) {
    return null;
  }

  const majorVersionString = version.split('.')[0].match(/\d+/g)?.[0];

  if (!majorVersionString) {
    return null;
  }

  const majorVersion = majorVersionString ? parseInt(majorVersionString) : 0;

  const isLow = () => {
    switch (platform) {
      case Platform.PLATFORM_ANDROID:
        if (majorVersion < ANDROID_MINIMUM_VERSION) {
          return true;
        }
        return false;
      case Platform.PLATFORM_IOS:
        if (majorVersion < IOS_MINIMUM_VERSION) {
          return true;
        }
        return false;
      case Platform.PLATFORM_MACOS:
        if (majorVersion < MACOS_MINIMUM_VERSION) {
          return true;
        }
        return false;
      default:
        return false;
    }
  };

  if (!!majorVersion && isLow()) {
    return (
      <Tooltip
        title={
          <Centered>
            Device version is lower than the minimum version.
            <br />
            <Link
              href={docsLink[device.platform] ?? DoguDocsUrl['device-farm']._index()}
              target="_blank"
              style={{ textDecoration: 'underline' }}
            >
              Click here
            </Link>{' '}
            to check the minimum version.
          </Centered>
        }
      >
        <WarningFilled style={{ color: '#fcba03' }} />
      </Tooltip>
    );
  }

  return null;
};

export default DeviceVersionAlertIcon;

const Centered = styled.p`
  text-align: center;
  font-size: 0.8rem;
`;
