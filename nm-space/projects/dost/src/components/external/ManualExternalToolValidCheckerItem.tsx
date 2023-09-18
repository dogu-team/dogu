import { CheckCircleIcon, QuestionIcon, QuestionOutlineIcon } from '@chakra-ui/icons';
import { Button, Flex, Icon, Popover, PopoverArrow, PopoverBody, PopoverContent, Text, Tooltip, useToast } from '@chakra-ui/react';
import { ExternalKey, ExternalValidationResult } from '@dogu-private/dogu-agent-core/shares';
import { stringify } from '@dogu-tech/common';
import { useState, createContext } from 'react';
import styled from 'styled-components';

import { ipc } from '../../utils/window';
import BorderBox from '../layouts/BorderBox';
import { manualExternalToolDetail } from './ManualExternalToolDetail';

interface Props {
  externalKey: ExternalKey;
  name: string;
  isValid: boolean;
  error: Error | null;
  onValidateEnd?: (result: ExternalValidationResult) => Promise<void> | void;
}

export const ValidContext = createContext<{
  isValid: boolean;
  validate: (hideToast?: boolean) => Promise<void>;
}>({ isValid: false, validate: async () => {} });

const ManualExternalToolValidCheckerItem = ({ externalKey, name, isValid, error, onValidateEnd }: Props) => {
  const [validResult, setValidResult] = useState<ExternalValidationResult>({ valid: isValid, error: error });
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleValidate = async (hideToast?: boolean) => {
    setLoading(true);
    try {
      console.log(`validate ${externalKey}`);
      const result = await ipc.externalClient.validate(externalKey);
      console.log(`validate result`, result);
      if (!result.valid && !hideToast) {
        toast({
          title: `Failed to validate ${externalKey}`,
          description: result.error?.message ?? 'Unknown error',
          status: 'error',
        });
      }
      setValidResult(result);
      onValidateEnd?.(result);
    } catch (e) {
      ipc.rendererLogger.error(`Failed to validate ${externalKey}: ${stringify(e)}`);
    }
    setLoading(false);
  };

  const doscLink = manualExternalToolDetail[externalKey]?.docsLink;

  return (
    <ValidContext.Provider
      value={{
        isValid: validResult.valid,
        validate: handleValidate,
      }}
    >
      <div>
        <BorderBox>
          <Flex justifyContent="space-between" alignItems="center">
            <Flex alignItems="center">
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
            {validResult.valid ? (
              <Icon as={CheckCircleIcon} color="green.500" />
            ) : (
              <ConditionalToolTip message={validResult.error?.message ?? ''} children={<Icon as={QuestionIcon} color="red.500" />} />
            )}
          </Flex>
          <div>
            <div>{manualExternalToolDetail[externalKey]?.description}</div>
            {!validResult.valid && <div>{manualExternalToolDetail[externalKey]?.solution}</div>}
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

const ConditionalToolTip = ({ children, message, ...props }: { children: React.ReactNode; message: string }) => {
  if (0 == message.length) {
    return <>{children}</>;
  }
  return (
    <Tooltip label={message} fontSize="xs" width="500px" placement="left" closeOnClick={true}>
      {children}
    </Tooltip>
  );
};
