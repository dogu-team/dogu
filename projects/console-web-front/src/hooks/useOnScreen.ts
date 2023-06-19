import { RefObject, useEffect, useMemo, useState } from 'react';

const useOnScreen = (ref: RefObject<HTMLElement>) => {
  const [isIntersecting, setIntersecting] = useState(false);
  const observer = useMemo(() => new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting)), [ref]);

  useEffect(() => {
    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [observer, ref]);

  return isIntersecting;
};

export default useOnScreen;
