import { Alert, AlertDescription, AlertIcon, AlertTitle, Button, useDisclosure } from '@chakra-ui/react';
import useEnvironmentStore from '../stores/environment';

const DeviceSharedAlert = () => {
  const isDeviceShare = useEnvironmentStore((state) => state.appConfig.DOGU_IS_DEVICE_SHAREABLE);

  if (!isDeviceShare) {
    return null;
  }

  return (
    <Alert status="error">
      <AlertIcon />
      <AlertTitle fontSize="xs">Your devices will be reset automatically! You are currently in device sharing mode </AlertTitle>
    </Alert>
  );
};

export default DeviceSharedAlert;
