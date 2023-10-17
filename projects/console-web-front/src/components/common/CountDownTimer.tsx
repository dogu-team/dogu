import { useCallback, useEffect, useRef, useState } from 'react';
import { stringifyDurationAsTimer } from '../../utils/date';

interface Props {
  startedAt: Date;
  endMs: number;
  onEnd?: () => void;
  intervalMs?: number;
}

const CountDownTimer: React.FC<Props> = ({ startedAt, endMs, intervalMs = 1000, onEnd }) => {
  const countDown = useCallback(
    (sd: Date) => {
      const now = new Date();
      return endMs - (now.getTime() - sd.getTime());
    },
    [endMs],
  );
  const [duration, setDuration] = useState<number>(() => countDown(startedAt));
  const timerRef = useRef<NodeJS.Timer>();

  useEffect(() => {
    setDuration(countDown(startedAt));
    const interval = setInterval(() => {
      setDuration(countDown(startedAt));
    }, intervalMs);
    timerRef.current = interval;

    return () => {
      clearInterval(timerRef.current);
    };
  }, [countDown, startedAt, intervalMs]);

  useEffect(() => {
    if (duration <= 0) {
      setDuration(0);
      onEnd?.();
      clearInterval(timerRef.current);
    }
  }, [duration]);

  console.log(duration);

  return <>{stringifyDurationAsTimer(duration)}</>;
};

export default CountDownTimer;
