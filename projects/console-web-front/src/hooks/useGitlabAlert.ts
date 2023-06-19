import { useRouter } from 'next/router';
import { useCallback } from 'react';

const useGitlabAlert = () => {
  const router = useRouter();

  const alertGitlab = useCallback(() => {
    const hasAlerted = localStorage.getItem('gitlab-alerted');

    if (hasAlerted === 'true') {
      return;
    }

    if (router.locale === 'en') {
      alert('Gitlab email and password is same with Dogu account');
    } else {
      alert('Gitlab 계정은 Dogu 계정과 동일합니다.');
    }

    localStorage.setItem('gitlab-alerted', 'true');
  }, [router.locale]);

  return { alertGitlab };
};

export default useGitlabAlert;
