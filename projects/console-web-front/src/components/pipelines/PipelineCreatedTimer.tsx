import { useEffect, useState } from 'react';

import useEventStore from '../../stores/events';
import { stringifyPipelineCreatedAt } from '../../utils/date';

interface Props {
  createdAt: Date;
}

const PipelineCreatedTimer = ({ createdAt }: Props) => {
  const [_, setNow] = useState(new Date());

  useEffect(() => {
    const unsub = useEventStore.subscribe(({ eventName }) => {
      if (eventName === 'onRefreshClicked') {
        setNow(new Date());
      }
    });

    return () => {
      unsub();
    };
  });

  return <>{stringifyPipelineCreatedAt(createdAt)}</>;
};

export default PipelineCreatedTimer;
