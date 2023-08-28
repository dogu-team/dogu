import { Button, Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input, Spacer, useToast } from '@chakra-ui/react';
import { Code } from '@dogu-private/types';
import { stringify } from '@dogu-tech/common';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { HostAgentConnectionStatus } from '../../shares/child';
import useHostAgentConnectionStatusStore from '../../stores/host-agent-connection-status';
import useTryStore from '../../stores/try-connect';

import { connect } from '../../utils/connection';
import { ipc } from '../../utils/window';

interface Props {
  notInputable?: boolean;
  onBeforeSubmit?: () => void;
}

const TokenConnectionForm = (props: Props) => {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const { isFirstTried, setIsFirstTried } = useTryStore();
  const toast = useToast();
  const setHAConnectionStatus = useHostAgentConnectionStatusStore((state) => state.setStatus);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleConnect();
  };

  const handleConnect = async () => {
    props.onBeforeSubmit?.();
    if (!value) {
      setError('Token cannot be empty');
      return;
    }
    setLoading(true);

    try {
      const result = await connect(value);
      setHAConnectionStatus(result);
    } catch (error) {
      ipc.rendererLogger.error(`Connect host failed: ${stringify(error)}`);
    }

    setLoading(false);
  };

  useEffect(() => {
    (async () => {
      const token = await ipc.appConfigClient.get<string>('DOGU_HOST_TOKEN');
      if (token) {
        setValue(token);
      }
    })().catch((error) => {
      ipc.rendererLogger.error(`Get host token failed: ${stringify(error)}`);
    });
  }, []);
  useEffect(() => {
    if (!value || value.length === 0) {
      return;
    }
    if (isFirstTried === false) {
      setIsFirstTried(false);
      handleConnect();
    }
  }, [value]);

  return (
    <StyledForm id="host-token-form" onSubmit={handleSubmit}>
      <FormControl isInvalid={!!error}>
        <FormLabel>Token</FormLabel>
        <Flex>
          <Input
            readOnly={!!props.notInputable}
            value={value}
            onChange={(e) => {
              setError(undefined);
              setValue(e.target.value);
            }}
          />
          <Button type="submit" colorScheme="blue" form="host-token-form" disabled={loading || !value} isLoading={loading}>
            Connect
          </Button>
        </Flex>
        {error ? <FormErrorMessage>{error}</FormErrorMessage> : <FormHelperText>Host token from Dogu</FormHelperText>}
      </FormControl>
    </StyledForm>
  );
};

export function connectionStatusToMessage(status: HostAgentConnectionStatus): string {
  if (status.code === Code.CODE_HOST_AGENT_INVALID_TOKEN) {
    return 'Invalid token';
  }
  return status.reason ?? 'Unknown error';
}

export default TokenConnectionForm;

const StyledForm = styled.form`
  width: 100%;
  max-width: 400px;
`;
