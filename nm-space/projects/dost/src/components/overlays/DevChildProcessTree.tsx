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
import { ChildTree } from '../../shares/child';
import { ipc } from '../../utils/window';
import styled from 'styled-components';

interface DevChildProcessTreeProps {
  isOpen: boolean;
  onClose: () => void;
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
      <ModalContent>
        <ModalHeader>Child Processes time: {updateDate?.toLocaleTimeString()}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div>
            <Text fontSize={'xs'}>Children: {childTree?.childs.length ?? 0}</Text>
          </div>
          <StyledBox>
            {childTree &&
              childTree.childs.map((child) => {
                return (
                  <Text key={child.pid} fontSize={'xs'}>
                    <span style={{ backgroundColor: '#d14545', color: '#fff', padding: '.1rem' }}>{child.pid}</span> {child.name.substring(0, 150)}
                  </Text>
                );
              })}
          </StyledBox>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export default DevChildProcessTree;

const StyledBox = styled.div`
  max-height: 100vh;
  height: 600px;
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
