import { AppstoreOutlined } from '@ant-design/icons';
import { BsBrowserChrome, BsBrowserFirefox, BsBrowserSafari } from 'react-icons/bs';
import styled from 'styled-components';
import { flexRowBaseStyle } from '../../styles/box';

interface Props {
  doguOptions: Record<string, unknown>;
}

const DoguOptions = ({ doguOptions }: Props) => {
  const { browserName, appVersion, browserVersion } = doguOptions as { browserName: string | undefined; appVersion: string | undefined; browserVersion: string | undefined };

  const getIcon = () => {
    if (browserName === 'chrome') {
      return <BsBrowserChrome />;
    }

    if (browserName === 'firefox') {
      return <BsBrowserFirefox />;
    }

    if (browserName === 'safari') {
      return <BsBrowserSafari />;
    }

    if (!!appVersion) {
      return <AppstoreOutlined />;
    }

    return null;
  };

  return (
    <Flex>
      <div style={{ marginRight: '.25rem', flexShrink: 0 }}>{getIcon()}</div>
      {!!browserName ? (
        <p>
          <b style={{ textTransform: 'capitalize' }}>{browserName}</b>,&nbsp;
          {browserVersion ?? 'Latest'}
        </p>
      ) : (
        <p>{appVersion}</p>
      )}
    </Flex>
  );
};

export default DoguOptions;

const Flex = styled.div`
  ${flexRowBaseStyle}
`;
