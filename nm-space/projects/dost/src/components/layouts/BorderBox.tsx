import { Box, useColorMode } from '@chakra-ui/react';

interface Props {
  children: React.ReactNode;
}

const BorderBox = ({ children }: Props) => {
  const { colorMode } = useColorMode();
  return (
    <Box border="1px" borderColor={colorMode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.3)'} p={4} rounded="md">
      {children}
    </Box>
  );
};

export default BorderBox;
