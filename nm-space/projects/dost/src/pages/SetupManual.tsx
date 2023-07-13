import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useEnvironmentStore from '../stores/environment';
// import { Button, Divider, Flex, List, Spinner } from '@chakra-ui/react';
// import { useEffect, useLayoutEffect, useState } from 'react';

// import ManualExternalToolValidCheckerItem from '../components/external/ManualExternalToolValidCheckerItem';
// import PageTitle from '../components/layouts/PageTitle';
// import useManualSetupExternalValidResult from '../hooks/manaul-setup-external-valid-result';
// import { ipc } from '../utils/window';

const SetupManual = () => {
  const { useApiUrlInput } = useEnvironmentStore((state) => state.features);
  // const { results, loading, validate } = useManualSetupExternalValidResult();
  const navigate = useNavigate();

  useEffect(() => {
    navigate(useApiUrlInput ? '/setup/config' : '/home/connect');
  }, []);
  return <div></div>;

  // if (!loading && !results) {
  //   return <div>Error occured while checking...</div>;
  // }

  // return (
  //   <Flex direction="column" style={{ padding: '24px', height: '100%' }}>
  //     <PageTitle title="Manual Setup" />

  //     <Divider mt={6} mb={6} />

  //     <Flex direction="column" justifyContent="space-between" flex={1}>
  //       {results ? (
  //         <div>
  //           <List spacing={2} width="100%">
  //             {results.length ? (
  //               results.map((result) => {
  //                 return <ManualExternalToolValidCheckerItem key={result.key} isValid={result.isValid} externalKey={result.key} name={result.name} onValidateEnd={validate} />;
  //               })
  //             ) : (
  //               <div>Nothing to do.</div>
  //             )}
  //           </List>
  //         </div>
  //       ) : (
  //         <Spinner />
  //       )}

  //       <Flex justifyContent="flex-end">
  //         <Button onClick={() => navigate(useApiUrlInput ? '/setup/config' : '/home/connect')} isDisabled={!results?.every((item) => item.isValid)} colorScheme="blue">
  //           {useApiUrlInput ? 'Continue' : 'Finish'}
  //         </Button>
  //       </Flex>
  //     </Flex>
  //   </Flex>
  // );
};

export default SetupManual;
