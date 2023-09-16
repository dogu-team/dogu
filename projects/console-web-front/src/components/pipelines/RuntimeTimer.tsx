import { useEffect, useState } from 'react';

import { getDateDiffAsMilliseconds, localizeDate, stringifyDuration } from '../../utils/date';

interface Props {
  startDate: Date;
  endDate: Date | null;
}

const RuntimeTimer = ({ startDate, endDate }: Props) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    let timer: NodeJS.Timer;
    if (!endDate) {
      timer = setInterval(() => {
        setNow(new Date());
      }, 1000);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [endDate]);

  return (
    <>{stringifyDuration(getDateDiffAsMilliseconds(localizeDate(startDate), endDate ? localizeDate(endDate) : now))}</>
  );
};

export default RuntimeTimer;
