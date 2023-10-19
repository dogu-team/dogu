import { DeviceBase } from '@dogu-private/console';
import { DeviceRTCCaller } from '@dogu-private/webrtc';
import React, { useContext } from 'react';

import { StreamingMode } from '../../types/device';
import { StreamingError } from '../../types/streaming';
import useDeviceClient from './useDeviceClient';
import useGamiumClient from './useGamiumClient';
import useInspector from './useInspector';

export interface StreamingContextValue {
  device: DeviceBase | null;
  mode: StreamingMode;
  loading: boolean;
  deviceRTCCaller: DeviceRTCCaller | null;
  peerConnection: RTCPeerConnection | null;
  error: StreamingError | null;
  gamiumService: ReturnType<typeof useGamiumClient> | null;
  deviceService: ReturnType<typeof useDeviceClient> | null;
  isSelf: boolean;
  videoRef: React.RefObject<HTMLVideoElement> | null;
  inspector: ReturnType<typeof useInspector> | null;
  updateMode: (mode: StreamingMode) => void;
  isCloudDevice?: boolean;
}

const defaultContextValue: StreamingContextValue = {
  mode: 'input',
  loading: true,
  deviceRTCCaller: null,
  peerConnection: null,
  error: null,
  gamiumService: null,
  deviceService: null,
  device: null,
  isSelf: false,
  videoRef: null,
  inspector: null,
  updateMode: () => {},
  isCloudDevice: undefined,
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
