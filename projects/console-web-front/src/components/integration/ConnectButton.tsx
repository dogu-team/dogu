import Link from 'next/link';
import { props } from 'ramda';
import styled from 'styled-components';

interface Props {
  isConnected?: boolean;
  href: string;
}

function ConnectButton(props: Props) {
  return (
    <Link href={props.href} target="_blank">
      <p
        style={{
          fontSize: '14px',
          marginRight: '8px',
        }}
      >
        Connect
      </p>
    </Link>
  );
}

export default ConnectButton;
