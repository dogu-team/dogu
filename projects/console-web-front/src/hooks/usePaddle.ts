import { initializePaddle, Paddle } from '@paddle/paddle-js';
import { useRouter } from 'next/router';
import { MutableRefObject, useEffect, useRef, useState } from 'react';

const usePaddle = (): { paddleRef: MutableRefObject<Paddle | undefined>; loading: boolean } => {
  const paddleRef = useRef<Paddle>();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (router.locale !== 'ko') {
      setLoading(true);
      initializePaddle({
        environment: 'sandbox',
        token: 'test_aa81223aa0421da888a01e4f13c',
        debug: true,
        eventCallback: (data) => {
          console.log('eventCallback', data);
        },
      })
        .then((paddle) => {
          if (paddle) {
            paddle.Environment.set('sandbox');
            paddleRef.current = paddle;
          }
          setLoading(false);
        })
        .catch((e) => {
          setLoading(false);
          console.error(e);
        });
    }
  }, [router.locale]);

  return { paddleRef, loading };
};

export default usePaddle;
