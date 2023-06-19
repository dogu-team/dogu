import { Button, Flex, FormControl, FormErrorMessage, FormHelperText, FormLabel, Input } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { ipc } from '../../utils/window';

interface Props {
  onFinish?: () => void;
}

const ApiUrlInputForm = ({ onFinish }: Props) => {
  const [loading, setLoaidng] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string>();

  useEffect(() => {
    const setInitValue = async () => {
      setLoaidng(true);
      try {
        const apiUrl = await ipc.appConfigClient.get<string>('DOGU_API_BASE_URL');
        setValue(apiUrl);
      } catch (e) {
        ipc.rendererLogger.error('Error while getting api url', { error: e });
      }
      setLoaidng(false);
    };

    setInitValue();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoaidng(true);

    try {
      await ipc.appConfigClient.set('DOGU_API_BASE_URL', value);
      onFinish?.();
    } catch (e) {
      setError('Failed to set API URL');
      ipc.rendererLogger.error('Error while setting api url', { error: e });
    }

    setLoaidng(false);
  };

  return (
    <StyledForm id="api-url-form" onSubmit={handleSubmit}>
      <FormControl isInvalid={!!error}>
        <FormLabel>API URL</FormLabel>
        <Flex alignItems="center">
          <Input
            value={value}
            onChange={(e) => {
              const { value } = e.target;
              setValue(value);
            }}
            isDisabled={loading}
          />
          <Button type="submit" form="api-url-form" colorScheme="blue" isDisabled={loading}>
            Set
          </Button>
        </Flex>
        {error ? <FormErrorMessage>{error}</FormErrorMessage> : <FormHelperText>Set API URL for Dost connection on Self-Hosted version</FormHelperText>}
      </FormControl>
    </StyledForm>
  );
};

export default ApiUrlInputForm;

const StyledForm = styled.form`
  width: 100%;
  max-width: 400px;
`;
