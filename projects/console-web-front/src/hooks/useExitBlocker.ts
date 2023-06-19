import { useRouter } from 'next/router';
import { useEffect } from 'react';

const useExitBlocker = (isChanged: boolean) => {
  const router = useRouter();

  useEffect(() => {
    const confirmationMessage = '변경사항이 저장되지 않습니다.';
    const beforeUnloadHandler = (e: BeforeUnloadEvent) => {
      (e || window.event).returnValue = confirmationMessage;
      return confirmationMessage;
    };
    const beforeRouteHandler = (url: string) => {
      if (router.pathname !== url && !confirm(confirmationMessage)) {
        router.events.emit('routeChangeError');
        throw 'routeChange aborted.';
      }
    };

    if (isChanged) {
      window.addEventListener('beforeunload', beforeUnloadHandler);
      router.events.on('routeChangeStart', beforeRouteHandler);
    } else {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      router.events.off('routeChangeStart', beforeRouteHandler);
    }

    return () => {
      window.removeEventListener('beforeunload', beforeUnloadHandler);
      router.events.off('routeChangeStart', beforeRouteHandler);
    };
  }, [isChanged, router]);
};

export default useExitBlocker;
