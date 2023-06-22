import { VStack, Text, Button, Flex, Spinner } from '@chakra-ui/react';
import { stringify } from '@dogu-tech/common';
import { useEffect, useState } from 'react';

import { ExternalKey } from '../../shares/external';
import { ipc } from '../../utils/window';

type TermInfo = { name: string; url: string | null; keys: ExternalKey[] };

interface Props {
  externalKeys: ExternalKey[];
}

const ExternalToolAgreementContent = ({ externalKeys }: Props) => {
  const [loading, setLoading] = useState(false);
  const [termInfos, setTermInfos] = useState<TermInfo[]>();

  useEffect(() => {
    const getInfo = async () => {
      try {
        setLoading(true);
        const infos: TermInfo[] = [];

        for (const key of externalKeys) {
          const [name, url] = await Promise.all([ipc.externalClient.getName(key), ipc.externalClient.getTermUrl(key)]);

          if (url === null || infos.some((item) => item.url === url)) {
            continue;
          }

          infos.push({ name, url, keys: [key] });
        }

        setTermInfos(infos);
      } catch (e) {
        ipc.rendererLogger.error(`Error occurred while getting term info: ${stringify(e)}`);
      }

      setLoading(false);
    };

    getInfo();
  }, [externalKeys]);

  const openTermLink = async (url: string) => {
    try {
      await ipc.settingsClient.openExternal(url);
    } catch (e) {
      ipc.rendererLogger.error(`Error occurred while opening term link: ${stringify(e)}`);
    }
  };

  return (
    <VStack spacing="8px" alignItems="flex-start">
      {loading && (
        <Flex alignItems="center">
          <Text>Loading...</Text>
          <Spinner />
        </Flex>
      )}
      {!!termInfos &&
        termInfos.map((item) => {
          return (
            <div key={item.name}>
              <Text>{item.name}</Text>
              <Button
                variant="link"
                onClick={() => {
                  if (item.url) {
                    openTermLink(item.url);
                  }
                }}
              >
                {item.url}
              </Button>
            </div>
          );
        })}
    </VStack>
  );
};

export default ExternalToolAgreementContent;
