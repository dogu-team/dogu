import { DeviceConnectionState, DeviceId, Platform, PrivateProtocol } from '@dogu-private/types';

type CfGdcDaControlParam = PrivateProtocol.CfGdcDaControlParam;
type CfGdcDaParam = PrivateProtocol.CfGdcDaParam;
const CfGdcDaParam = PrivateProtocol.CfGdcDaParam;
type DeviceControl = PrivateProtocol.DeviceControl;
const DeviceControlMetaState = PrivateProtocol.DeviceControlMetaState;
type DeviceControlKeycode = PrivateProtocol.DeviceControlKeycode;
const DeviceControlKeycode = PrivateProtocol.DeviceControlKeycode;
type DeviceControlButton = PrivateProtocol.DeviceControlButton;
const DeviceControlButton = PrivateProtocol.DeviceControlButton;

export const convertDeviceControl = (deviceId: DeviceId, deviceControl: DeviceControl) => {
  const deviceControlParamKey = 'cfGdcDaControlParam';
  const paramObj: { $case: typeof deviceControlParamKey; [deviceControlParamKey]: CfGdcDaControlParam } = {
    $case: deviceControlParamKey,
    [deviceControlParamKey]: { control: deviceControl },
  };
  // FIXME(henry):
  const serial = deviceId;
  const castedParam: CfGdcDaParam = {
    seq: 1,
    serial,
    value: paramObj,
  };

  const inputBuffer = CfGdcDaParam.encode(castedParam).finish();
  return inputBuffer;
};

export const mapWebMetaKeyToDeviceMetaState = (event: React.KeyboardEvent) => {
  let metakey = DeviceControlMetaState.DEVICE_CONTROL_META_STATE_UNSPECIFIED;

  if (event.shiftKey) {
    metakey = metakey | DeviceControlMetaState.DEVICE_CONTROL_META_STATE_AOS_SHIFT_ON;
  }

  if (event.ctrlKey) {
    metakey = metakey | DeviceControlMetaState.DEVICE_CONTROL_META_STATE_AOS_CTRL_ON;
  }

  if (event.altKey) {
    metakey = metakey | DeviceControlMetaState.DEVICE_CONTROL_META_STATE_AOS_ALT_ON;
  }

  if (event.metaKey) {
    metakey = metakey | DeviceControlMetaState.DEVICE_CONTROL_META_STATE_AOS_META_ON;
  }

  if (event.getModifierState('CapsLock')) {
    metakey = metakey | DeviceControlMetaState.DEVICE_CONTROL_META_STATE_AOS_CAPS_LOCK_ON;
  }

  return metakey;
};

export const mapWebKeyboardToDeviceKeyboard = (event: React.KeyboardEvent): DeviceControlKeycode => {
  switch (event.code) {
    // number
    case 'Digit1':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_1;
    case 'Digit2':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_2;
    case 'Digit3':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_3;
    case 'Digit4':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_4;
    case 'Digit5':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_5;
    case 'Digit6':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_6;
    case 'Digit7':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_7;
    case 'Digit8':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_8;
    case 'Digit9':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_9;
    case 'Digit0':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_0;

    // numpad
    case 'NumLock':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_NUM_LOCK;
    case 'Numpad0':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_NUMPAD_0;
    case 'Numpad1':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_NUMPAD_1;
    case 'Numpad2':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_NUMPAD_2;
    case 'Numpad3':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_NUMPAD_3;
    case 'Numpad4':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_NUMPAD_4;
    case 'Numpad5':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_NUMPAD_5;
    case 'Numpad6':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_NUMPAD_6;
    case 'Numpad7':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_NUMPAD_7;
    case 'Numpad8':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_NUMPAD_8;
    case 'Numpad9':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_NUMPAD_9;
    case 'NumpadDecimal':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_NUMPAD_DOT;
    case 'NumpadMultiply':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_NUMPAD_MULTIPLY;
    case 'NumpadAdd':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_NUMPAD_ADD;
    case 'NumpadDivide':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_NUMPAD_DIVIDE;
    case 'NumpadEnter':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_NUMPAD_ENTER;
    case 'NumpadSubtract':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_NUMPAD_SUBTRACT;
    case 'NumpadEqual':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_NUMPAD_EQUALS;
    case 'NumpadComma':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_NUMPAD_COMMA;

    // alphabet
    case 'KeyA':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_A;
    case 'KeyB':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_B;
    case 'KeyC':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_C;
    case 'KeyD':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_D;
    case 'KeyE':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_E;
    case 'KeyF':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_F;
    case 'KeyG':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_G;
    case 'KeyH':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_H;
    case 'KeyI':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_I;
    case 'KeyJ':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_J;
    case 'KeyK':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_K;
    case 'KeyL':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_L;
    case 'KeyM':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_M;
    case 'KeyN':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_N;
    case 'KeyO':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_O;
    case 'KeyP':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_P;
    case 'KeyQ':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_Q;
    case 'KeyR':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_R;
    case 'KeyS':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_S;
    case 'KeyT':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_T;
    case 'KeyU':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_U;
    case 'KeyV':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_V;
    case 'KeyW':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_W;
    case 'KeyX':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_X;
    case 'KeyY':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_Y;
    case 'KeyZ':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_Z;

    case 'Tab':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_TAB;
    case 'Backslash':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_BACKSLASH;
    case 'BackQuote':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_GRAVE;
    case 'Quote':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_APOSTROPHE;
    case 'BracketLeft':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_LEFT_BRACKET;
    case 'BracketRight':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_RIGHT_BRACKET;
    case 'Slash':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_SLASH;
    case 'SemiColon':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_SEMICOLON;
    case 'Comma':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_COMMA;
    case 'Period':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_PERIOD;
    case 'Minus':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_MINUS;
    case 'Equal':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_EQUALS;

    case 'Backspace':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_DEL;
    case 'Enter':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_ENTER;
    case 'CapsLock':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_SWITCH_CHARSET;
    case 'ScrollLock':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_SCROLL_LOCK;
    case 'Space':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_SPACE;
    case 'ControlLeft':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_CTRL_LEFT;
    case 'ControlRight':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_CTRL_RIGHT;
    case 'AltLeft':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_ALT_LEFT;
    case 'AltRight':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_ALT_RIGHT;
    case 'MetaLeft':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_META_LEFT;
    case 'MetaRight':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_META_RIGHT;
    case 'ShiftLeft':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_SHIFT_LEFT;
    case 'ShiftRight':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_SHIFT_RIGHT;

    case 'ArrowRight':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_DPAD_RIGHT;
    case 'ArrowUp':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_DPAD_UP;
    case 'ArrowLeft':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_DPAD_LEFT;
    case 'ArrowDown':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_DPAD_DOWN;

    case 'Escape':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_ESCAPE;
    case 'F1':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_F1;
    case 'F2':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_F2;
    case 'F3':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_F3;
    case 'F4':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_F4;
    case 'F5':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_F5;
    case 'F6':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_F6;
    case 'F7':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_F7;
    case 'F8':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_F8;
    case 'F9':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_F9;
    case 'F10':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_F10;
    case 'F11':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_F11;
    case 'F12':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_F12;

    case 'Insert':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_INSERT;
    case 'Delete':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_FORWARD_DEL;
    case 'PageUp':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_PAGE_UP;
    case 'PageDown':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_PAGE_DOWN;
    case 'Home':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_MOVE_HOME;
    case 'End':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_MOVE_END;
    case 'PrintScreen':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_SYSRQ;

    case 'AudioVolumeMute':
    case 'VolumeMute':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_VOLUME_MUTE;
    case 'AudioVolumeDown':
    case 'VolumeDown':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_VOLUME_DOWN;
    case 'AudioVolumeUp':
    case 'VolumeUp':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_VOLUME_UP;

    case 'Pause':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_MEDIA_PAUSE;
    case 'MediaTrackPrevious':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_MEDIA_PREVIOUS;
    case 'MediaTrackNext':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_MEDIA_NEXT;
    case 'MediaPlayPause':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_MEDIA_PLAY_PAUSE;
    case 'MediaStop':
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_MEDIA_STOP;

    default:
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_UNSPECIFIED;
  }
};

export enum DeviceToolBarMenu {
  VOLUME_UP = 'volumeUp',
  VOLUME_DOWN = 'volumeDown',
  VOLUME_MUTE = 'volumeMute',
  LOCK = 'lock',
  UNLOCK = 'unlock',
  POWER = 'power',
  BACK = 'back',
  HOME = 'home',
  SWITCH = 'switch',
  SCREENSHOT = 'screenshot',
}

export const mapToolbarMenuToDeviceKeyboard = (menu: DeviceToolBarMenu) => {
  switch (menu) {
    case DeviceToolBarMenu.VOLUME_DOWN:
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_VOLUME_DOWN;
    case DeviceToolBarMenu.VOLUME_UP:
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_VOLUME_UP;
    case DeviceToolBarMenu.VOLUME_MUTE:
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_VOLUME_MUTE;
    case DeviceToolBarMenu.LOCK:
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_SLEEP;
    case DeviceToolBarMenu.UNLOCK:
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_WAKEUP;
    case DeviceToolBarMenu.POWER:
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_POWER;
    case DeviceToolBarMenu.BACK:
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_BACK;
    case DeviceToolBarMenu.HOME:
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_HOME;
    case DeviceToolBarMenu.SWITCH:
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_APP_SWITCH;
    case DeviceToolBarMenu.SCREENSHOT:
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_SYSRQ;
    default:
      return DeviceControlKeycode.DEVICE_CONTROL_KEYCODE_UNSPECIFIED;
  }
};

export const mapMouseEventButtonToDeviceControlButtons = (button: number): DeviceControlButton => {
  switch (button) {
    case 0:
      return DeviceControlButton.DEVICE_CONTROL_BUTTON_PRIMARY;
    case 1:
      return DeviceControlButton.DEVICE_CONTROL_BUTTON_TERTIARY;
    case 2:
      return DeviceControlButton.DEVICE_CONTROL_BUTTON_SECONDARY;
    case 3:
      return DeviceControlButton.DEVICE_CONTROL_BUTTON_BACK;
    case 4:
      return DeviceControlButton.DEVICE_CONTROL_BUTTON_FORWARD;
    default:
      return DeviceControlButton.DEVICE_CONTROL_BUTTON_UNSPECIFIED;
  }
};

export const checkStreamingAvaliability = (connectionState: DeviceConnectionState): boolean => {
  return (
    connectionState !== DeviceConnectionState.DEVICE_CONNECTION_STATE_DISCONNECTED &&
    connectionState !== DeviceConnectionState.DEVICE_CONNECTION_STATE_UNSPECIFIED &&
    connectionState !== DeviceConnectionState.UNRECOGNIZED
  );
};

export const getAvailableApplicationExtension = (platform: Platform): string => {
  switch (platform) {
    case Platform.PLATFORM_ANDROID:
      return '.apk';
    case Platform.PLATFORM_IOS:
      return '.ipa';
    default:
      return '';
  }
};
