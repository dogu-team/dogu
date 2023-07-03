import { Button } from '@chakra-ui/react';
import { useContext, useState } from 'react';

import { ValidContext } from './ManualExternalToolValidCheckerItem';

const XCodeCheckButton = () => {
  const { isValid, validate } = useContext(ValidContext);
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    setLoading(true);
    await validate();
    setLoading(false);
  };

  return (
    <Button width="max-content" colorScheme="blue" onClick={handleValidate} isLoading={loading} isDisabled={isValid}>
      Check
    </Button>
  );
};

export default XCodeCheckButton;
