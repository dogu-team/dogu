import { GeoLocation } from '@dogu-private/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import styled from 'styled-components';
import { Popconfirm } from 'antd';

import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';

interface Props {}

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

      try {
        const location = await deviceService.deviceClientRef.current.getGeoLocation(device.serial);
        setCurrentLocation(location);
        backupLocation.current = location;
      } catch (e) {}
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
        latitude: currentLocation?.latitude ?? 0,
        longitude: currentLocation?.longitude ?? 0,
      });
      backupLocation.current = currentLocation;
    } catch (e) {}
    setLoading(false);
    setIsOpen(false);
  };

  return (
    <div>
      <MapWrapper>
        {(isOpen || !isLoaded) && <LoadingBox />}

        {isLoaded && (
          <GoogleMap
            center={{ lat: currentLocation?.latitude ?? 0, lng: currentLocation?.longitude ?? 0 }}
            onClick={handleClick}
            mapContainerStyle={{
              width: '100%',
              height: '100%',
            }}
            options={{
              zoomControl: false,
              fullscreenControl: false,
              streetViewControl: false,
              mapTypeControl: false,
              clickableIcons: false,
              zoom: 3,
            }}
          >
            {currentLocation && (
              <MarkerF
                position={{
                  lat: currentLocation.latitude,
                  lng: currentLocation.longitude,
                }}
              />
            )}
          </GoogleMap>
        )}
        {/* <GoogleMapReact
          bootstrapURLKeys={{
            key: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY,
          }}
          center={{ lat: currentLocation?.latitude ?? 0, lng: currentLocation?.longitude ?? 0 }}
          defaultZoom={3}
          onClick={handleClick}
          options={{
            zoomControl: false,
            fullscreenControl: false,
          }}
        >
          {currentLocation && (
            <Image
              src={resources.icons.mapMarker}
              // @ts-ignore
              lat={currentLocation.latitude}
              // @ts-ignore
              lng={currentLocation.longitude}
              width={24}
              height={24}
              alt={'map-marker'}
              style={{
                transform: 'translate(-50%, -100%)',
                position: 'absolute',
              }}
            />
          )}
        </GoogleMapReact> */}
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
