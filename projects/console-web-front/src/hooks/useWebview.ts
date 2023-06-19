import { useEffect, useState } from 'react';

const useWebview = () => {
  const [isWebview, setIsWebview] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsWebview(navigator.userAgent === 'electron-webview');
    }
  }, []);

  return isWebview;
};

export default useWebview;
