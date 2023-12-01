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
      environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT ?? 'sandbox',
      token: process.env.NEXT_PUBLIC_PADDLE_TOKEN,
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
