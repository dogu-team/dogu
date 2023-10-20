import { PrivateProtocol } from '@dogu-private/types';
import { Tooltip } from 'antd';
import styled from 'styled-components';
import Image from 'next/image';

import useDeviceInput from '../../hooks/streaming/useDeviceInput';
import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import resources from '../../resources';

const DeviceControlKeycode = PrivateProtocol.DeviceControlKeycode;
const DeviceControlAction = PrivateProtocol.DeviceControlAction;

const DeviceHelperButtonGroup: React.FC = () => {
  const { deviceRTCCaller } = useDeviceStreamingContext();
  const { sendAndroidKeycode } = useDeviceInput(deviceRTCCaller ?? undefined);

  return (
    <Box>
      <Tooltip title="RN Devtools">
        <Button
          onClick={(e) => {
            sendAndroidKeycode(
              DeviceControlAction.DEVICE_CONTROL_ACTION_AOS_KEYEVENT_ACTION_UP,
              DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_MENU,
            );
          }}
        >
          <Image
            src={resources.icons.reactNative}
            width={24}
            height={24}
            style={{ objectFit: 'contain' }}
            alt="React Native"
          />
        </Button>
      </Tooltip>
    </Box>
  );
};

export default DeviceHelperButtonGroup;

const Box = styled.div`
  display: flex;
`;

const Button = styled.button`
  display: inline-flex;
  font-size: 0.9rem;
  padding: 0.5rem;
  border-radius: 0.25rem;
  margin: 0.25rem;
  background-color: #fff;
  color: #000;
  border: 1px solid #ddd;

  &:hover {
    background-color: #efefef;
  }

  div {
    white-space: pre-wrap;
    font-size: 0.75rem;
    color: #999;
  }
`;
