import {
  DeviceControl,
  DeviceControlAction,
  DeviceControlButton,
  DeviceControlCopyKey,
  DeviceControlKeycode,
  DeviceControlMetaState,
  DeviceControlType,
} from '../protocol/generated/tsproto/inner/types/device_control';

export const DefaultDeviceControl: () => DeviceControl = () => {
  return {
    type: DeviceControlType.DEVICE_CONTROL_TYPE_UNSPECIFIED,
    text: '',
    metaState: DeviceControlMetaState.DEVICE_CONTROL_META_STATE_UNSPECIFIED,
    action: DeviceControlAction.DEVICE_CONTROL_ACTION_UNSPECIFIED,
    keycode: DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_UNSPECIFIED,
    key: '',
    buttons: DeviceControlButton.DEVICE_CONTROL_BUTTON_UNSPECIFIED,
    pointerId: 0,
    pressure: 0,
    position: {
      x: 0,
      y: 0,
      screenWidth: 0,
      screenHeight: 0,
    },
    hScroll: 0,
    vScroll: 0,
    copyKey: DeviceControlCopyKey.DEVICE_CONTROL_COPY_KEY_UNSPECIFIED,
    paste: false,
    repeat: 0,
    sequence: 0,
    timeStamp: 0,
  };
};
