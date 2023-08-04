import Script from 'next/script';

interface Props {
  user?: {
    name: string;
    email: string;
    organizationId: string;
  };
}

function Beamer(props: Props) {
  if (process.env.NEXT_PUBLIC_ENV === 'self-hosted') {
    return null;
  }

  //@ts-ignore
  globalThis.beamer_config = {
    product_id: 'jFgisoum57434',
    button: false,
    selector: `<div id="beamerButton">What's new 123</div>`,
  };

  return <Script async type="text/javascript" src="https://app.getbeamer.com/js/beamer-embed.js" strategy="afterInteractive" />;
}

export default Beamer;
