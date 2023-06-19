import { useEffect } from 'react';
import useEventStore, { EventName } from 'src/stores/events';

const useRefresh = (events: EventName[], refresher: Function) => {
  useEffect(() => {
    const unsub = useEventStore.subscribe(({ eventName }) => {
      if (!!eventName && events.includes(eventName)) {
        refresher();
      }
    });

    return () => {
      unsub();
    };
  }, []);
};

export default useRefresh;
