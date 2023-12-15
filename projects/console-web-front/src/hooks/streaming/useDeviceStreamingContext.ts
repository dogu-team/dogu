import { DeviceBase } from '@dogu-private/console';
import { DeviceRTCCaller } from '@dogu-private/webrtc';
import React, { useContext } from 'react';

import { StreamingMode } from '../../types/device';
import { InspectorType, StreamingError, StreamingTabMenuKey } from '../../types/streaming';
import useDeviceClient from './useDeviceClient';
import useGamiumClient from './useGamiumClient';
import useGamiumInspector from './useGamiumInspector';
import useInspector from './useInspector';

export interface StreamingContextValue {
  device: DeviceBase | null;
  mode: StreamingMode;
  inspectorType: InspectorType;
  loading: boolean;
  deviceRTCCaller: DeviceRTCCaller | null;
  peerConnection: RTCPeerConnection | null;
  error: StreamingError | null;
  tab: StreamingTabMenuKey;
  gamiumService: ReturnType<typeof useGamiumClient> | null;
  deviceService: ReturnType<typeof useDeviceClient> | null;
  isSelf: boolean;
  videoRef: React.RefObject<HTMLVideoElement> | null;
  inspector: ReturnType<typeof useInspector> | null;
  gamiumInspector: ReturnType<typeof useGamiumInspector> | null;
  updateMode: (mode: StreamingMode) => void;
  updateInspectorType: (type: InspectorType) => void;
  updateTab: (tab: StreamingTabMenuKey) => void;
  isCloudDevice?: boolean;
  deviceScreenshotBase64: string | null;
  isAdmin: boolean;
}

const defaultContextValue: StreamingContextValue = {
  mode: 'input',
  inspectorType: InspectorType.APP,
  loading: true,
  deviceRTCCaller: null,
  peerConnection: null,
  error: null,
  tab: StreamingTabMenuKey.INFO,
  gamiumService: null,
  deviceService: null,
  device: null,
  isSelf: false,
  videoRef: null,
  inspector: null,
  gamiumInspector: null,
  updateMode: () => {},
  updateInspectorType: () => {},
  updateTab: () => {},
  isCloudDevice: undefined,
  deviceScreenshotBase64: null,
  isAdmin: false,
};

export const DeviceStreamingContext = React.createContext<StreamingContextValue>(defaultContextValue);

const useDeviceStreamingContext = () => {
  const context = useContext(DeviceStreamingContext);

  if (context === undefined) {
    throw new Error('useDeviceStreamingContext must be used within a DeviceStreamingContextProvider');
  }

  return context;
};

export default useDeviceStreamingContext;
