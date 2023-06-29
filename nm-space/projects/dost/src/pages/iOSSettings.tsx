import { Center, Divider, List, Text } from '@chakra-ui/react';
import { stringify } from '@dogu-tech/common';
import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

import ManualExternalToolValidCheckerItem from '../components/external/ManualExternalToolValidCheckerItem';
import PageTitle from '../components/layouts/PageTitle';
import useManualSetupExternalValidResult from '../hooks/manaul-setup-external-valid-result';
import { ExternalValidationResult } from '../shares/external';
import { ipc } from '../utils/window';

function IosSettings() {
  const { results } = useManualSetupExternalValidResult(['xcode', 'web-driver-agent-build', 'ios-device-agent-build']);
  const [wdaResult, setWdaResult] = useState<ExternalValidationResult | null>(null);

  const validateWda = useCallback(async () => {
    try {
      const result = await ipc.externalClient.validate('web-driver-agent-build');
      setWdaResult(result);
    } catch (e) {
      ipc.rendererLogger.error(`WdaValidate error: ${stringify(e)}`);
    }
  }, []);

  useEffect(() => {
    validateWda();
  }, []);

  return (
    <div>
      <div style={{ paddingBottom: '16px' }}>
        <PageTitle title="iOS Settings" />
      </div>

      <Divider mb={4} />

      <Center>
        <List spacing={2} width="100%">
          {results?.map((result) => (
            <ManualExternalToolValidCheckerItem key={result.key} isValid={result.isValid} externalKey={result.key} name={result.name} />
          ))}
        </List>
      </Center>
    </div>
  );
}

export default IosSettings;

const MenuTitle = styled(Text)`
  font-size: 1.1rem;
  font-weight: 500;
`;
