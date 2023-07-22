import { Button } from 'antd';
import React, { useState } from 'react';

import TokenCopyInput from '../common/TokenCopyInput';

interface Props {
  getToken: () => Promise<string | undefined | null>;
}

const AccessTokenButton = ({ getToken }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string>();

  const handleClick = async () => {
    setIsLoading(true);
    const rv = await getToken();
    if (rv) {
      setToken(rv);
    }
    setIsLoading(false);
  };

  return token ? (
    <TokenCopyInput value={token} />
  ) : (
    <Button type="primary" loading={isLoading} onClick={handleClick}>
      Show token
    </Button>
  );
};

export default React.memo(AccessTokenButton);
