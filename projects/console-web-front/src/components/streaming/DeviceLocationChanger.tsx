import { GeoLocation } from '@dogu-private/types';
import { useEffect, useRef, useState } from 'react';
import GoogleMapReact from 'google-map-react';
import styled from 'styled-components';
import Image from 'next/image';

import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import resources from '../../resources';
import { Popconfirm } from 'antd';

interface Props {}

const DeviceLocationChanger: React.FC<Props> = () => {
  const { deviceService, device } = useDeviceStreamingContext();
  const [currentLocation, setCurrentLocation] = useState<GeoLocation | undefined>();
  const clickedLocation = useRef<GeoLocation | undefined>(undefined);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      if (!deviceService?.deviceClient.current || !device?.serial) {
        return;
      }

      try {
        const location = await deviceService.deviceClient.current.getGeoLocation(device.serial);
        setCurrentLocation(location);
      } catch (e) {}
    })();
  }, [deviceService?.deviceClient, device?.serial]);

  const handleClick = async (e: GoogleMapReact.ClickEventValue) => {
    clickedLocation.current = {
      latitude: e.lat,
      longitude: e.lng,
    };
    setIsOpen(true);
  };

  const handleConfirm = async () => {
    if (!deviceService?.deviceClient.current || !device?.serial) {
      return;
    }

    setLoading(true);
    try {
      await deviceService.deviceClient.current.setGeoLocation(device.serial, {
        latitude: clickedLocation.current?.latitude ?? 0,
        longitude: clickedLocation.current?.longitude ?? 0,
      });
      setCurrentLocation(clickedLocation.current);
    } catch (e) {}
    setLoading(false);
    setIsOpen(false);
  };

  return (
    <div>
      <MapWrapper>
        <GoogleMapReact
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
        </GoogleMapReact>

        {isOpen && <LoadingBox />}
      </MapWrapper>
      <Popconfirm
        open={isOpen}
        onCancel={() => setIsOpen(false)}
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
