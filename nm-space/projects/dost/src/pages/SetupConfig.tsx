import { Button, Divider, Flex, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ApiUrlInputForm from '../components/connection/ApiUrlInputForm';
import PageTitle from '../components/layouts/PageTitle';
import { ipc } from '../utils/window';

const SetupConfig = () => {
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();

  return (
    <Flex direction="column" style={{ padding: '24px', height: '100%' }}>
      <PageTitle title="Configurations" />

      <Divider mt={6} mb={6} />

      <Flex direction="column" flex={1} justifyContent="space-between">
        <div>
          <ApiUrlInputForm onFinish={() => setIsValid(true)} />

          <div style={{ marginTop: '12px' }}>
            <Text mb={1}>Need help?</Text>
            <Button onClick={() => ipc.settingsClient.openExternal('https://docs.dogutech.io/device-farm/host/get-started')}>Open dogu document</Button>
          </div>
        </div>

        <Flex justifyContent="flex-end">
          <Button isDisabled={!isValid} colorScheme="blue" onClick={() => navigate('/home/connect')}>
            Finish
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default SetupConfig;
