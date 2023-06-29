import { CheckCircleIcon, QuestionIcon, QuestionOutlineIcon } from '@chakra-ui/icons';
import { Button, Flex, Icon, Text, Tooltip, useToast } from '@chakra-ui/react';
import { stringify } from '@dogu-tech/common';
import { useState, createContext } from 'react';
import styled from 'styled-components';

import { ExternalKey } from '../../shares/external';
import { ipc } from '../../utils/window';
import BorderBox from '../layouts/BorderBox';
import { manualExternalToolDetail } from './ManualExternalToolDetail';

interface Props {
  externalKey: ExternalKey;
  name: string;
  isValid: boolean;
  onValidateEnd?: (isValid: boolean) => Promise<void> | void;
}

export const ValidContext = createContext<boolean>(false);

const ManualExternalToolValidCheckerItem = ({ externalKey, name, isValid, onValidateEnd }: Props) => {
  const [valid, setValid] = useState<boolean>(isValid);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleValidate = async () => {
    setLoading(true);
    try {
      console.log(`validate ${externalKey}`);
      const result = await ipc.externalClient.validate(externalKey);
      console.log(`validate result`, result);
      if (!result.valid) {
        toast({
          title: `Failed to validate ${externalKey}`,
          description: result.error?.message ?? 'Unknown error',
          status: 'error',
        });
      }
      setValid(result.valid);
      onValidateEnd?.(isValid);
    } catch (e) {
      ipc.rendererLogger.error(`Failed to validate ${externalKey}: ${stringify(e)}`);
    }
    setLoading(false);
  };

  const doscLink = manualExternalToolDetail[externalKey]?.docsLink;

  return (
    <ValidContext.Provider value={valid}>
      <div>
        <BorderBox>
          <Flex justifyContent="space-between" alignItems="center" mb={2}>
            <Flex alignItems="center" mb="8px">
              <Text fontWeight="medium" fontSize="m">
                {name}
              </Text>

              {!!doscLink && (
                <Tooltip label="Open docs">
                  <StyledButton>
                    <Icon
                      as={QuestionOutlineIcon}
                      onClick={() => {
                        ipc.settingsClient.openExternal(doscLink);
                      }}
                    />
                  </StyledButton>
                </Tooltip>
              )}
            </Flex>
            {valid ? <Icon as={CheckCircleIcon} color="green.500" /> : <Icon as={QuestionIcon} color="red.500" />}
          </Flex>
          <div>
            <div>{manualExternalToolDetail[externalKey]?.description}</div>
            {!valid && (
              <>
                <div>{manualExternalToolDetail[externalKey]?.solution}</div>
                <Button mt={2} size="sm" onClick={handleValidate} isLoading={loading}>
                  Check
                </Button>
              </>
            )}
          </div>
        </BorderBox>
      </div>
    </ValidContext.Provider>
  );
};

export default ManualExternalToolValidCheckerItem;

const StyledButton = styled.button`
  margin-left: 0.5rem;
  padding: 0.1rem;
`;
