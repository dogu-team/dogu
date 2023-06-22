import { Button, Divider, Flex, Spinner } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import ManualExternalToolValidCheckerItem from '../components/external/ManualExternalToolValidCheckerItem';
import PageTitle from '../components/layouts/PageTitle';
import useManualSetupExternalValidResult from '../hooks/manaul-setup-external-valid-result';
import { ipc } from '../utils/window';

const SetupManual = () => {
  const [needConfiguration, setNeedConfiguration] = useState(false);
  const { results, loading, validate } = useManualSetupExternalValidResult();
  const navigate = useNavigate();

  useEffect(() => {
    const check = async () => {
      try {
        const needConfiguration = await ipc.featureConfigClient.get('apiUrlInsertable');
        setNeedConfiguration(needConfiguration);
      } catch (e) {
        ipc.rendererLogger.error('Error while checking need configuration', { error: e });
      }
    };

    check();
  }, []);

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
            {results.length ? (
              results.map((result) => {
                return <ManualExternalToolValidCheckerItem key={result.key} isValid={result.isValid} externalKey={result.key} name={result.name} onValidateEnd={validate} />;
              })
            ) : (
              <div>Nothing to do.</div>
            )}
          </div>
        ) : (
          <Spinner />
        )}

        <Flex justifyContent="flex-end">
          <Button onClick={() => navigate(needConfiguration ? '/setup/config' : '/home/connect')} isDisabled={!results?.every((item) => item.isValid)} colorScheme="blue">
            {needConfiguration ? 'Continue' : 'Finish'}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default SetupManual;
