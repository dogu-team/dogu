import { useCallback, useEffect, useRef, useState } from 'react';
import { stringifyDurationAsTimer } from '../../utils/date';

interface Props {
  startedAt: Date;
  intervalMs?: number;
}

const CountUpTimer: React.FC<Props> = ({ startedAt, intervalMs = 1000 }) => {
  const countUp = useCallback((sd: Date) => {
    const now = new Date();
    return now.getTime() - sd.getTime();
  }, []);
  const [duration, setDuration] = useState<number>(() => countUp(startedAt));
  const timerRef = useRef<NodeJS.Timer>();

  useEffect(() => {
    setDuration(countUp(startedAt));
    const interval = setInterval(() => {
      setDuration(countUp(startedAt));
    }, intervalMs);
    timerRef.current = interval;

    return () => {
      clearInterval(timerRef.current);
    };
  }, [countUp, startedAt, intervalMs]);

  return <>{stringifyDurationAsTimer(duration)}</>;
};

export default CountUpTimer;
