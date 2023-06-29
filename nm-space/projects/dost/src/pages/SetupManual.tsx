import { Button, Divider, Flex, List, Spinner } from '@chakra-ui/react';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ManualExternalToolValidCheckerItem from '../components/external/ManualExternalToolValidCheckerItem';
import PageTitle from '../components/layouts/PageTitle';
import useManualSetupExternalValidResult from '../hooks/manaul-setup-external-valid-result';
import useEnvironmentStore from '../stores/environment';
import { ipc } from '../utils/window';

const SetupManual = () => {
  const { apiUrlInsertable } = useEnvironmentStore((state) => state.features);
  const { results, loading, validate } = useManualSetupExternalValidResult();
  const navigate = useNavigate();

  if (!loading && !results) {
    return <div>Error occured while checking...</div>;
  }

  return (
    <Flex direction="column" style={{ padding: '24px', height: '100%' }}>
      <PageTitle title="Manual Setup" />

      <Divider mt={6} mb={6} />

      <Flex direction="column" justifyContent="space-between" flex={1}>
        {results ? (
          <div>
            <List spacing={2} width="100%">
              {results.length ? (
                results.map((result) => {
                  return <ManualExternalToolValidCheckerItem key={result.key} isValid={result.isValid} externalKey={result.key} name={result.name} onValidateEnd={validate} />;
                })
              ) : (
                <div>Nothing to do.</div>
              )}
            </List>
          </div>
        ) : (
          <Spinner />
        )}

        <Flex justifyContent="flex-end">
          <Button onClick={() => navigate(apiUrlInsertable ? '/setup/config' : '/home/connect')} isDisabled={!results?.every((item) => item.isValid)} colorScheme="blue">
            {apiUrlInsertable ? 'Continue' : 'Finish'}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default SetupManual;
