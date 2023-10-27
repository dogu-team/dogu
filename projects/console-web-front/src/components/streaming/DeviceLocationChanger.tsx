import { GeoLocation } from '@dogu-private/types';
import { useEffect, useState } from 'react';
import GoogleMapReact from 'google-map-react';
import styled from 'styled-components';
import Image from 'next/image';

import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';
import resources from '../../resources';

interface Props {}

const DeviceLocationChanger: React.FC<Props> = () => {
  const { deviceService, device } = useDeviceStreamingContext();
  const [currentLocation, setCurrentLocation] = useState<GeoLocation | undefined>();
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

  const handleChange = async (e: any) => {
    if (!deviceService?.deviceClient.current || !device?.serial) {
      return;
    }

    try {
      await deviceService.deviceClient.current.setGeoLocation(device.serial, {
        latitude: e.lat,
        longitude: e.lng,
      });
      setCurrentLocation({
        latitude: e.lat,
        longitude: e.lng,
      });
    } catch (e) {}
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
          onClick={handleChange}
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
      </MapWrapper>
    </div>
  );
};

export default DeviceLocationChanger;

const MapWrapper = styled.div`
  width: 300px;
  height: 20rem;
`;
