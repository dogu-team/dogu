import { DeviceBase } from '@dogu-private/console';
import { Platform } from '@dogu-private/types';
import { Closable, Log } from '@dogu-tech/common';
import { DeviceClient } from '@dogu-tech/device-client-common';
import { RefObject, useCallback, useEffect, useState } from 'react';

const useDeviceLog = (
  deviceClientRef: RefObject<DeviceClient | undefined> | undefined,
  device: DeviceBase | undefined | null,
) => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [filterValue, setFilterValue] = useState<string>('');
  const [isStopped, setIsStopped] = useState(true);
  const MAX_LOG_LENGTH = 2000;

  useEffect(() => {
    if (device?.serial) {
      setLogs([]);
      setFilterValue('');
      setIsStopped(true);
    }
  }, [device?.serial]);

  useEffect(() => {
    let closer: Closable | undefined;
    (async () => {
      if (deviceClientRef?.current && device && !isStopped) {
        const getArgs = () => {
          const trimmedFilter = filterValue.trim();

          switch (device.platform) {
            case Platform.PLATFORM_ANDROID:
              return trimmedFilter
                ? [
                    `-e`,
                    `${filterValue
                      .split('')
                      .map((i) => (i.trim() ? `(${i.toUpperCase()}|${i.toLowerCase()})` : i))
                      .join('')}`,
                  ]
                : ['*:F'];
            case Platform.PLATFORM_IOS:
              return trimmedFilter ? ['-m', trimmedFilter] : [];
            default:
              return [];
          }
        };

        const unsubscriber = await deviceClientRef.current.subscribeLog(device.serial, getArgs(), (log) => {
          const logs: Log[] = log.message
            .split('\n')
            .map((sl) => ({
              level: log.level,
              localTimeStampNano: log.localTimeStampNano,
              message: sl,
              details: log.details,
            }))
            .filter((item) => item.message.trim() !== '');
          setLogs((prev) => {
            if (prev.length < MAX_LOG_LENGTH) {
              if (prev.length + logs.length > MAX_LOG_LENGTH) {
                return [...prev.slice(prev.length + logs.length - MAX_LOG_LENGTH), ...logs];
              }

              return [...prev, ...logs];
            } else {
              return [...prev.slice(logs.length), ...logs];
            }
          });
        });
        closer = unsubscriber;
      }
    })();

    return () => {
      closer?.close();
    };
  }, [device, filterValue, isStopped]);

  const handleChangeFilterValue = useCallback((value: string) => {
    setFilterValue(value);
  }, []);

  const togglePlay = useCallback(() => {
    setIsStopped((prev) => !prev);
  }, []);

  const clearLog = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    deviceLogs: logs,
    isLogStopped: isStopped,
    logFilterValue: filterValue,
    handleChangeFilterValue,
    togglePlay,
    clearLog,
  };
};

export default useDeviceLog;
