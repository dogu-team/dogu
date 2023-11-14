import { useEffect } from 'react';

import useEventStore, { EventName } from 'src/stores/events';

const useRefresh = (events: EventName[], refresher: (payload?: unknown) => any) => {
  useEffect(() => {
    const unsub = useEventStore.subscribe(({ eventName, payload }) => {
      if (!!eventName && events.includes(eventName)) {
        refresher(payload);
      }
    });

    return () => {
      unsub();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useRefresh;
