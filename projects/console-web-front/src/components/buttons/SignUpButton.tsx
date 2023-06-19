import useTranslation from 'next-translate/useTranslation';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CSSProperties } from 'react';
import Button from '../main/Button';

interface Props {
  style?: CSSProperties;
}

const SignUpButton = ({ style }: Props) => {
  const { t } = useTranslation();

  return (
    <Link href="/signup" style={style} access-id={process.env.NEXT_PUBLIC_ENV !== 'production' ? 'sign-up-btn' : undefined}>
      <Button size="small" primary>
        {t('common:signup')}
      </Button>
    </Link>
  );
};

export default SignUpButton;
