import useDeviceStreamingContext from '../../hooks/streaming/useDeviceStreamingContext';

interface Props {}

const DeviceLocationChanger: React.FC<Props> = () => {
  const { deviceService, device } = useDeviceStreamingContext();

  return <div />;
};

export default DeviceLocationChanger;
