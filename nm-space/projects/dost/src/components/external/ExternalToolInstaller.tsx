import { stringify } from '@dogu-tech/common';
import { useEffect, useRef, useState } from 'react';
import { Text, Textarea, useToast } from '@chakra-ui/react';

import { ExternalKey } from '../../shares/external';
import { ipc } from '../../utils/window';
import styled from 'styled-components';

export type ExternalKeyAndName = { key: ExternalKey; name: string };

interface Props {
  externalKeyAndNames: ExternalKeyAndName[];
  onStart: () => void | Promise<void>;
  onFinish: () => void | Promise<void>;
}

const ExternaltoolInstaller = ({ externalKeyAndNames, onStart, onFinish }: Props) => {
  const totalCount = externalKeyAndNames.length;
  const [currentCount, setCurrentCount] = useState(0);
  const toast = useToast();
  const [logs, setLogs] = useState<{ log: string; isError: boolean }[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToBottom = () => {
      if (logRef.current) {
        logRef.current.scrollTop = logRef.current.scrollHeight;
      }
    };

    ipc.stdLogCallback.onStdout((_, message) => {
      setLogs((prev) => {
        if (prev.length < 10) {
          return [...prev, { log: message, isError: false }];
        }

        return [...prev.slice(1), { log: message, isError: false }];
      });

      setTimeout(() => {
        scrollToBottom();
      }, 20);
    });

    ipc.stdLogCallback.onStderr((_, message) => {
      setLogs((prev) => {
        if (prev.length < 10) {
          return [...prev, { log: message, isError: true }];
        }

        return [...prev.slice(1), { log: message, isError: true }];
      });

      setTimeout(() => {
        scrollToBottom();
      }, 20);
    });
  }, []);

  useEffect(() => {
    if (externalKeyAndNames.length === 0) {
      return;
    }

    const install = async () => {
      await onStart();
      for (const { key, name } of externalKeyAndNames) {
        try {
          await ipc.externalClient.install(key);
        } catch (e) {
          ipc.rendererLogger.error(`Error occurred while installing: ${key} | ${stringify(e)}`);
          toast({
            title: `Error occurred while installing: ${name}`,
            description: stringify(e),
            status: 'error',
          });
        }
        setCurrentCount((prev) => prev + 1);
      }
      await onFinish();
    };

    install();
  }, [externalKeyAndNames]);

  return (
    <div>
      <div>{currentCount < totalCount ? <Text>{externalKeyAndNames[currentCount].name}</Text> : <Text>Complete.</Text>}</div>
      <div style={{ marginTop: '.5rem' }}>
        <LogBox ref={logRef}>
          {logs.map((item, i) => (
            <Text key={item.log + i} color={item.isError ? 'orange.500' : 'inherit'} fontSize="smaller" fontFamily="monospace">
              {item.log}
            </Text>
          ))}
        </LogBox>

        <Text fontSize="small">
          Done: {currentCount} / {totalCount}
        </Text>
      </div>
    </div>
  );
};

export default ExternaltoolInstaller;

const LogBox = styled.div`
  height: 100px;
  margin: 0.5rem 0;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  overflow-y: auto;
`;
