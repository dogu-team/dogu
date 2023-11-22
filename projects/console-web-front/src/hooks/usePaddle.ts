import { initializePaddle, Paddle } from '@paddle/paddle-js';
import { useRouter } from 'next/router';
import { MutableRefObject, useEffect, useRef, useState } from 'react';

const usePaddle = (): MutableRefObject<Paddle | undefined> => {
  const paddleRef = useRef<Paddle>();
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    if (router.locale !== 'ko') {
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
            console.log(paddle);
            paddle.Environment.set('sandbox');
            paddleRef.current = paddle;
          }
        })
        .catch((e) => {
          console.error(e);
        });
    }
  }, [router.locale]);

  return paddleRef;
};

export default usePaddle;
