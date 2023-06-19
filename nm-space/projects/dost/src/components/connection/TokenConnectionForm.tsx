import { Button, Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input } from '@chakra-ui/react';
import { stringify } from '@dogu-tech/common';
import { useState } from 'react';
import styled from 'styled-components';

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    props.onBeforeSubmit?.();

    if (!value) {
      setError('Token cannot be empty');
      return;
    }

    setLoading(true);

    try {
      await connect(value);
    } catch (error) {
      ipc.rendererLogger.error(`Connect host failed: ${stringify(error)}`);
    }

    setLoading(false);
  };

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

export default TokenConnectionForm;

const StyledForm = styled.form`
  width: 100%;
  max-width: 400px;
`;
