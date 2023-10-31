import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Tfoot,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { useEffect, useRef, useState } from 'react';
import { DefaultProcessInfo, ProcessInfo } from '@dogu-tech/common';
import { ChildTree } from '../../shares/child';
import { ipc } from '../../utils/window';
import styled from 'styled-components';

interface DevChildProcessTreeProps {
  isOpen: boolean;
  onClose: () => void;
}

function ChildTreeToComponent(tree: ChildTree, depth: number) {
  const info = tree.info;
  return (
    <div key={`${info.pid}-div`}>
      <Text key={info.pid} fontSize={'xs'}>
        {depth > 0 ? '-'.repeat(depth) : ''}
        <span style={{ backgroundColor: '#d14545', color: '#fff', padding: '.1rem' }}>{info.pid}</span>{' '}
        <span style={{ backgroundColor: '#d14545', color: '#fff', padding: '.1rem' }}>{info.ppid}</span>{' '}
        <span style={{ backgroundColor: '#d14545', color: '#fff', padding: '.1rem' }}>{info.cpuUsedTime}</span>
        <span style={{ backgroundColor: '#d14545', color: '#fff', padding: '.1rem' }}>{(info.mem / 1024 / 1024).toFixed(2)}M</span>
        {info.commandLine.substring(0, 200)}
      </Text>
      {tree.children.map((child) => ChildTreeToComponent(child, depth + 1))}
    </div>
  );
}

function sumChlidTreeMem(tree: ChildTree): number {
  const myMem = tree.info.mem;
  const childrenMem = tree.children.map((c) => sumChlidTreeMem(c)).reduce((a, b) => a + b, 0);
  return myMem + childrenMem;
}

function sumChlidTreeCount(tree: ChildTree): number {
  const childrenCount = tree.children.map((c) => sumChlidTreeCount(c)).reduce((a, b) => a + b, 0);
  return 1 + childrenCount;
}

function DevChildProcessTree(props: DevChildProcessTreeProps) {
  const { isOpen, onClose } = props;
  const [childTree, setChildTree] = useState<ChildTree>();
  const [updateDate, setUpdateDate] = useState<Date>();
  const logRef = useRef<HTMLDivElement>(null);

  const timer = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    const checkState = async () => {
      const childTree = await ipc.childClient.getChildTree();
      setChildTree(childTree);
      setUpdateDate(new Date());
    };
    const t = setInterval(async () => await checkState(), 1000);
    timer.current = t;

    return () => {
      clearInterval(timer.current ?? undefined);
    };
  }, []);

  return (
    <Modal onClose={onClose} isOpen={isOpen} isCentered scrollBehavior="inside" size="full">
      <ModalOverlay />
      <ModalContent mt="80px">
        <ModalHeader>Child Processes time: {updateDate?.toLocaleTimeString()}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div>
            <Text fontSize={'xs'}>
              Children: {sumChlidTreeCount(childTree ?? { info: DefaultProcessInfo(), children: [] })}, Mem:{' '}
              {sumChlidTreeMem(childTree ?? { info: DefaultProcessInfo(), children: [] }) / 1024 / 1024}M
            </Text>
          </div>
          <StyledBox>{childTree && ChildTreeToComponent(childTree, 0)}</StyledBox>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default DevChildProcessTree;

const StyledBox = styled.div`
  max-height: 100vh;
  height: 1000px;
  margin: 0.5rem 0;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0.25rem;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 0.75rem;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
  }
`;
