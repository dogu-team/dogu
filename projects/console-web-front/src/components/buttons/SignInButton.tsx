import { CSSProperties } from 'react';
import { useRouter } from 'next/router';
import useTranslation from 'next-translate/useTranslation';
import Button from '../main/Button';
import Link from 'next/link';

interface Props {
  style?: CSSProperties;
}

const SignInButton = ({ style }: Props) => {
  const { t } = useTranslation();

  return (
    <Link href="/signin" style={style}>
      <Button size="small">{t('common:signin')}</Button>
    </Link>
  );
};

export default SignInButton;
