import { GeoLocation } from '@dogu-private/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import styled from 'styled-components';
import { Popconfirm } from 'antd';

import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import { LoadingOutlined } from '@ant-design/icons';

interface Props {}

const DOGU_OFFICE_LAT = 37.392145462427834;
const DOGU_OFFICE_LNG = 126.93941445526565;

const DeviceLocationChanger: React.FC<Props> = () => {
  const { deviceService, device } = useDeviceStreamingContext();
  const [currentLocation, setCurrentLocation] = useState<GeoLocation | undefined>();
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
  });
  const backupLocation = useRef<GeoLocation | undefined>(undefined);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (!deviceService?.deviceClientRef.current || !device?.serial) {
        return;
      }

      setLoading(true);
      try {
        const location = await deviceService.deviceClientRef.current.getGeoLocation(device.serial);
        setCurrentLocation(location);
        backupLocation.current = location;
      } catch (e) {}
      setLoading(false);
    })();
  }, [deviceService?.deviceClientRef, device?.serial]);

  const handleClick = useCallback((e: any) => {
    setCurrentLocation({
      latitude: e.latLng.lat(),
      longitude: e.latLng.lng(),
    });
    setIsOpen(true);
  }, []);

  const handleConfirm = async () => {
    if (!deviceService?.deviceClientRef.current || !device?.serial) {
      return;
    }

    setLoading(true);
    try {
      await deviceService.deviceClientRef.current.setGeoLocation(device.serial, {
        latitude: currentLocation?.latitude ?? DOGU_OFFICE_LAT,
        longitude: currentLocation?.longitude ?? DOGU_OFFICE_LNG,
      });
      backupLocation.current = currentLocation;
    } catch (e) {}
    setLoading(false);
    setIsOpen(false);
  };

  return (
    <div>
      <MapWrapper>
        {isLoaded && (
          <GoogleMap
            center={{
              lat: currentLocation?.latitude ?? DOGU_OFFICE_LAT,
              lng: currentLocation?.longitude ?? DOGU_OFFICE_LNG,
            }}
            onClick={handleClick}
            mapContainerStyle={{
              width: '100%',
              height: '100%',
            }}
            zoom={3}
            options={{
              zoomControl: false,
              fullscreenControl: false,
              streetViewControl: false,
              mapTypeControl: false,
              clickableIcons: false,
              zoom: 3,
            }}
          >
            <MarkerF
              position={{
                lat: currentLocation?.latitude ?? DOGU_OFFICE_LAT,
                lng: currentLocation?.longitude ?? DOGU_OFFICE_LNG,
              }}
            />
          </GoogleMap>
        )}
        {(loading || isOpen || !isLoaded) && (
          <LoadingBox>
            <LoadingOutlined />
          </LoadingBox>
        )}
      </MapWrapper>
      <Popconfirm
        open={isOpen}
        onCancel={() => {
          setIsOpen(false);
          setCurrentLocation(backupLocation.current);
        }}
        onConfirm={handleConfirm}
        title="Location"
        description="Confirm to change location"
        zIndex={2000}
        placement="topRight"
        destroyTooltipOnHide
        okButtonProps={{
          loading,
        }}
      >
        <div style={{ width: 1, height: 1 }} />
      </Popconfirm>
    </div>
  );
};

export default DeviceLocationChanger;

const MapWrapper = styled.div`
  position: relative;
  width: 300px;
  height: 20rem;
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
