import { initializePaddle, Paddle } from '@paddle/paddle-js';
import { useRouter } from 'next/router';
import { MutableRefObject, useEffect, useRef, useState } from 'react';

const usePaddle = (): { paddleRef: MutableRefObject<Paddle | undefined>; loading: boolean } => {
  const paddleRef = useRef<Paddle>();
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    initializePaddle({
      environment: 'sandbox',
      // token: 'test_34410b5690f361ec275f1cb58bf',
      token: 'test_3184624ff37cdb070269ed045c9',
      debug: true,
    })
      .then((paddle) => {
        if (paddle) {
          paddleRef.current = paddle;
        }
        setLoading(false);
      })
      .catch((e) => {
        setLoading(false);
        console.error(e);
      });
  }, [router.locale]);

  return { paddleRef, loading };
};

export default usePaddle;
