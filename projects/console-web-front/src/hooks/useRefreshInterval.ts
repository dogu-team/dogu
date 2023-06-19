import { useEffect } from 'react';

import useEventStore from '../stores/events';

const useRefreshInterval = (condition: boolean, timing: number) => {
  const fireEvent = useEventStore((state) => state.fireEvent);

  useEffect(() => {
    let interval: NodeJS.Timer;

    if (condition) {
      interval = setInterval(() => fireEvent('onRefreshClicked'), timing);
    }

    return () => {
      setTimeout(() => {
        clearInterval(interval);
      }, timing);
    };
  }, [condition, timing]);
};

export default useRefreshInterval;
