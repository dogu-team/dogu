import { Code, CodeUtil, input, PrivateProtocol } from '@dogu-private/types';
import { DeviceRTCCaller } from '@dogu-private/webrtc';
import { useCallback, useState } from 'react';

import useStreamingOptionStore from 'src/stores/streaming-option';
import {
  DeviceToolBarMenu,
  mapMouseEventButtonToDeviceControlButtons,
  mapToolbarMenuToDeviceKeyboard,
  mapWebKeyboardToDeviceKeyboard,
  mapWebMetaKeyToDeviceMetaState,
} from 'src/utils/streaming/streaming';
import { sendErrorNotification } from '../../utils/antd';

type DeviceControlType = PrivateProtocol.DeviceControlType;
const DeviceControlType = PrivateProtocol.DeviceControlType;
type DeviceControlAction = PrivateProtocol.DeviceControlAction;
const DeviceControlAction = PrivateProtocol.DeviceControlAction;
type DeviceControl = PrivateProtocol.DeviceControl;
type CfGdcDaControlResult = PrivateProtocol.CfGdcDaControlResult;
type DeviceControlKeycode = PrivateProtocol.DeviceControlKeycode;
const DeviceControlKeycode = PrivateProtocol.DeviceControlKeycode;

export interface DeviceInputOption {
  type: DeviceControlType;
  action: DeviceControlAction;
  originSize: { width: number; height: number };
  isDoubleClicked?: boolean;
}

const useDeviceInput = (deviceRTCCaller: DeviceRTCCaller | undefined) => {
  const [isPressing, setIsPressing] = useState(false);

  const handleControlResult = useCallback((result: CfGdcDaControlResult | null) => {
    if (result === null) {
      return;
    }

    switch (result.error?.code) {
      case Code.CODE_INPUT_NOTREADY:
        sendErrorNotification(result.error.message);
        return;
    }
  }, []);

  const handleTouchInput = useCallback(
    async (event: React.MouseEvent<HTMLTextAreaElement, MouseEvent>, inputOption: DeviceInputOption) => {
      if (!deviceRTCCaller) {
        return;
      }

      if (deviceRTCCaller.channel.readyState !== 'open' || event.currentTarget === null) {
        return undefined;
      }

      const { type, action, originSize, isDoubleClicked } = inputOption;

      // const screenWidth = event.currentTarget.clientWidth;
      // const screenHeight = event.currentTarget.clientHeight;

      // const widthRatio = originSize.width / screenWidth;
      // const heightRatio = originSize.height / screenHeight;

      const c: DeviceControl = {
        ...input.DefaultDeviceControl(),
        type,
        action,
        position: {
          x: Math.trunc(event.nativeEvent.offsetX),
          y: Math.trunc(event.nativeEvent.offsetY),
          screenWidth: Math.trunc(event.currentTarget.clientWidth),
          screenHeight: Math.trunc(event.currentTarget.clientHeight),
        },
        buttons: mapMouseEventButtonToDeviceControlButtons(event.button),
        repeat: isDoubleClicked ? 2 : 0,
        timeStamp: event.timeStamp,
      };

      try {
        const result = await deviceRTCCaller.call('cfGdcDaControlParam', 'cfGdcDaControlResult', {
          control: c,
        });
        handleControlResult(result);
      } catch (e) {}
    },
    [deviceRTCCaller, handleControlResult],
  );

  const handleScrollInput = useCallback(
    async (event: React.WheelEvent<HTMLTextAreaElement>, originSize: { width: number; height: number }) => {
      if (!deviceRTCCaller) {
        return;
      }

      // const screenWidth = event.currentTarget.clientWidth;
      // const screenHeight = event.currentTarget.clientHeight;

      // const widthRatio = originSize.width / screenWidth;
      // const heightRatio = originSize.height / screenHeight;

      const sensitivityOption = useStreamingOptionStore.getState().option.scrollSensitivity;
      const ceilAbsAndSign = (value: number) => {
        const abs = Math.abs(value);
        const sign = Math.sign(value);
        return Math.ceil(abs) * sign;
      };

      const c: DeviceControl = {
        ...input.DefaultDeviceControl(),
        type: DeviceControlType.DEVICE_CONTROL_TYPE_AOS_INJECT_SCROLL_EVENT,
        action: DeviceControlAction.DEVICE_CONTROL_ACTION_AOS_MOTIONEVENT_ACTION_SCROLL,
        vScroll: ceilAbsAndSign((event.deltaY * sensitivityOption) / 100),
        hScroll: ceilAbsAndSign((event.deltaX * sensitivityOption) / 100),
        // vScroll: event.deltaY,
        // hScroll: event.deltaX,
        position: {
          x: Math.trunc(event.nativeEvent.offsetX),
          y: Math.trunc(event.nativeEvent.offsetY),
          screenWidth: Math.trunc(event.currentTarget.clientWidth),
          screenHeight: Math.trunc(event.currentTarget.clientHeight),
        },
        timeStamp: event.timeStamp,
      };

      try {
        deviceRTCCaller?.setSendThrottleMs(33);
        const result = await deviceRTCCaller?.call('cfGdcDaControlParam', 'cfGdcDaControlResult', {
          control: c,
        });
        handleControlResult(result);
      } catch (e) {}
    },
    [deviceRTCCaller, handleControlResult],
  );

  const handleKeyboardInput = useCallback(
    async (event: React.KeyboardEvent<HTMLTextAreaElement>, isKeyUp: boolean) => {
      if (!deviceRTCCaller) {
        return;
      }

      if (deviceRTCCaller.channel.readyState !== 'open' || event.currentTarget === null) {
        return undefined;
      }

      if (!isKeyUp && event.code === 'KeyV' && event.ctrlKey && event.shiftKey) {
        const c: DeviceControl = {
          ...input.DefaultDeviceControl(),
          metaState: mapWebMetaKeyToDeviceMetaState(event),
          type: DeviceControlType.DEVICE_CONTROL_TYPE_AOS_SET_CLIPBOARD,
          paste: true,
          text: await navigator.clipboard.readText(),
          keycode: mapWebKeyboardToDeviceKeyboard(event),
          key: event.key,
          timeStamp: event.timeStamp,
        };

        try {
          const result = await deviceRTCCaller.call('cfGdcDaControlParam', 'cfGdcDaControlResult', {
            control: c,
          });
          handleControlResult(result);
        } catch (e) {}
      }

      const c: DeviceControl = {
        ...input.DefaultDeviceControl(),
        metaState: mapWebMetaKeyToDeviceMetaState(event),
        action: isKeyUp
          ? DeviceControlAction.DEVICE_CONTROL_ACTION_AOS_KEYEVENT_ACTION_UP
          : DeviceControlAction.DEVICE_CONTROL_ACTION_AOS_KEYEVENT_ACTION_DOWN_UNSPECIFIED,
        type: DeviceControlType.DEVICE_CONTROL_TYPE_AOS_INJECT_KEYCODE,
        keycode: mapWebKeyboardToDeviceKeyboard(event),
        key: event.key,
        timeStamp: event.timeStamp,
      };

      const result = await deviceRTCCaller.call('cfGdcDaControlParam', 'cfGdcDaControlResult', {
        control: c,
      });
    },
    [deviceRTCCaller, handleControlResult],
  );

  const handleToolMenuInput = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, menu: DeviceToolBarMenu) => {
      if (!deviceRTCCaller) {
        return;
      }

      if (deviceRTCCaller.channel.readyState !== 'open') {
        return undefined;
      }

      const downMenus = [DeviceToolBarMenu.BACK, DeviceToolBarMenu.HOME];
      const upMenus = [
        DeviceToolBarMenu.BACK,
        DeviceToolBarMenu.HOME,
        DeviceToolBarMenu.SWITCH,
        DeviceToolBarMenu.LOCK,
      ];

      let controls: DeviceControl[] = [];
      if (downMenus.includes(menu)) {
        controls.push({
          ...input.DefaultDeviceControl(),
          action: DeviceControlAction.DEVICE_CONTROL_ACTION_AOS_KEYEVENT_ACTION_DOWN_UNSPECIFIED,
          type: DeviceControlType.DEVICE_CONTROL_TYPE_AOS_INJECT_KEYCODE,
          keycode: mapToolbarMenuToDeviceKeyboard(menu),
          timeStamp: event.timeStamp,
        });
      }
      if (upMenus.includes(menu)) {
        controls.push({
          ...input.DefaultDeviceControl(),
          action: DeviceControlAction.DEVICE_CONTROL_ACTION_AOS_KEYEVENT_ACTION_UP,
          type: DeviceControlType.DEVICE_CONTROL_TYPE_AOS_INJECT_KEYCODE,
          keycode: mapToolbarMenuToDeviceKeyboard(menu),
          timeStamp: event.timeStamp,
        });
      } else {
        controls.push({
          ...input.DefaultDeviceControl(),
          action: DeviceControlAction.DEVICE_CONTROL_ACTION_AOS_KEYEVENT_ACTION_DOWN_UNSPECIFIED,
          type: DeviceControlType.DEVICE_CONTROL_TYPE_AOS_INJECT_KEYCODE,
          keycode: mapToolbarMenuToDeviceKeyboard(menu),
          timeStamp: event.timeStamp,
        });
      }

      for (const c of controls) {
        /**
         * @note e2e test comment
         */
        console.debug(`e2e handleToolMenuInput code: ${DeviceControlKeycode[c.keycode]} request`);

        const result = await deviceRTCCaller.call('cfGdcDaControlParam', 'cfGdcDaControlResult', {
          control: c,
        });

        /**
         * @note e2e test comment
         */
        if (null === result || null == result.error) {
          console.debug(`e2e handleToolMenuInput code: ${DeviceControlKeycode[c.keycode]} failed result: ${result}`);
        } else if (CodeUtil.isNotSuccess(result.error.code)) {
          console.debug(
            `e2e handleToolMenuInput code: ${DeviceControlKeycode[c.keycode]} failed error: ${result.error.code}`,
          );
        } else {
          console.debug(`e2e handleToolMenuInput code: ${DeviceControlKeycode[c.keycode]} success`);
        }
        handleControlResult(result);
      }
      return;
    },
    [deviceRTCCaller, handleControlResult],
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.currentTarget === null) {
        return;
      }

      try {
        handleKeyboardInput(event, false);
      } catch (e) {}
    },
    [handleKeyboardInput],
  );

  const handleKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.currentTarget === null) {
        return;
      }

      try {
        handleKeyboardInput(event, true);
      } catch (e) {}
    },
    [handleKeyboardInput],
  );

  const handleWheel = useCallback(
    (event: React.WheelEvent<HTMLTextAreaElement>, videoSize: { width: number; height: number }) => {
      if (event.currentTarget === null) {
        return;
      }

      try {
        handleScrollInput(event, videoSize);
      } catch (e) {}
    },
    [handleScrollInput],
  );

  const handleMouseDown = useCallback(
    (event: React.MouseEvent<HTMLTextAreaElement, MouseEvent>, videoSize: { width: number; height: number }) => {
      if (event.currentTarget === null) {
        return;
      }

      try {
        deviceRTCCaller?.setSendThrottleMs(33);
        setIsPressing(true);
        handleTouchInput(event, {
          type: DeviceControlType.DEVICE_CONTROL_TYPE_AOS_INJECT_TOUCH_EVENT,
          action: DeviceControlAction.DEVICE_CONTROL_ACTION_DESKTOP_ACTION_DOWN_UNSPECIFIED,
          originSize: videoSize,
        });
      } catch (e) {}
    },
    [deviceRTCCaller, handleTouchInput],
  );

  const handleMouseUp = useCallback(
    (event: React.MouseEvent<HTMLTextAreaElement, MouseEvent>, videoSize: { width: number; height: number }) => {
      if (event.currentTarget === null) {
        return;
      }

      try {
        deviceRTCCaller?.setSendThrottleMs(33);
        setIsPressing(false);
        handleTouchInput(event, {
          type: DeviceControlType.DEVICE_CONTROL_TYPE_AOS_INJECT_TOUCH_EVENT,
          action: DeviceControlAction.DEVICE_CONTROL_ACTION_DESKTOP_ACTION_UP,
          originSize: videoSize,
        });
      } catch (e) {}
    },
    [deviceRTCCaller, handleTouchInput],
  );

  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLTextAreaElement, MouseEvent>, videoSize: { width: number; height: number }) => {
      if (event.currentTarget === null) {
        return;
      }

      if (isPressing) {
        try {
          deviceRTCCaller?.setSendThrottleMs(33);
          handleTouchInput(event, {
            type: DeviceControlType.DEVICE_CONTROL_TYPE_AOS_INJECT_TOUCH_EVENT,
            action: DeviceControlAction.DEVICE_CONTROL_ACTION_AOS_MOTIONEVENT_ACTION_MOVE,
            originSize: videoSize,
          });
        } catch (e) {}
      }
    },
    [deviceRTCCaller, handleTouchInput, isPressing],
  );

  const handleMouseLeave = useCallback(
    (event: React.MouseEvent<HTMLTextAreaElement, MouseEvent>, videoSize: { width: number; height: number }) => {
      if (event.currentTarget === null) {
        return;
      }

      try {
        setIsPressing(false);
        handleTouchInput(event, {
          type: DeviceControlType.DEVICE_CONTROL_TYPE_AOS_INJECT_TOUCH_EVENT,
          action: DeviceControlAction.DEVICE_CONTROL_ACTION_AOS_KEYEVENT_ACTION_UP,
          originSize: videoSize,
        });
      } catch (e) {}
    },
    [handleTouchInput],
  );

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent<HTMLTextAreaElement, MouseEvent>, videoSize: { width: number; height: number }) => {
      if (event.currentTarget === null) {
        return;
      }

      try {
        handleTouchInput(event, {
          type: DeviceControlType.DEVICE_CONTROL_TYPE_AOS_INJECT_TOUCH_EVENT,
          action: DeviceControlAction.DEVICE_CONTROL_ACTION_DESKTOP_ACTION_DOWNUP,
          originSize: videoSize,
          isDoubleClicked: true,
        });
      } catch (e) {}
    },
    [handleTouchInput],
  );

  const handleFocus = useCallback(
    async (event: React.FocusEvent<HTMLTextAreaElement>) => {
      if (!deviceRTCCaller) {
        return;
      }

      if (deviceRTCCaller.channel.readyState !== 'open' || event.currentTarget === null) {
        return undefined;
      }

      if (event.currentTarget === null) {
        return;
      }

      try {
        const c: DeviceControl = {
          ...input.DefaultDeviceControl(),
          type: DeviceControlType.DEVICE_CONTROL_TYPE_DESKTOP_ONSCREEN_FOCUSED,
          timeStamp: event.timeStamp,
        };

        const result = await deviceRTCCaller.call('cfGdcDaControlParam', 'cfGdcDaControlResult', {
          control: c,
        });
      } catch (e) {
        console.error(e);
      }
    },
    [deviceRTCCaller],
  );

  const handleBlur = useCallback(
    async (event: React.FocusEvent<HTMLTextAreaElement>) => {
      if (!deviceRTCCaller) {
        return;
      }

      if (deviceRTCCaller.channel.readyState !== 'open' || event.currentTarget === null) {
        return undefined;
      }

      if (event.currentTarget === null) {
        return;
      }

      try {
        const c: DeviceControl = {
          ...input.DefaultDeviceControl(),
          type: DeviceControlType.DEVICE_CONTROL_TYPE_DESKTOP_ONSCREEN_UNFOCUSED,
          timeStamp: event.timeStamp,
        };

        const result = await deviceRTCCaller.call('cfGdcDaControlParam', 'cfGdcDaControlResult', {
          control: c,
        });
      } catch (e) {
        console.error(e);
      }
    },
    [deviceRTCCaller],
  );

  return {
    handleKeyDown,
    handleKeyUp,
    handleWheel,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleMouseLeave,
    handleDoubleClick,
    handleToolMenuInput,
    handleFocus,
    handleBlur,
  };
};

export default useDeviceInput;
