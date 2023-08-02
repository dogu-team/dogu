import Script from 'next/script';

interface Props {
  name: string;
  email: string;
  organizationId: string;
}

function LiveChat(props: Props) {
  if (process.env.NEXT_PUBLIC_ENV === 'self-hosted') {
    return null;
  }

  return (
    <Script
      src="//fw-cdn.com/10683920/3497107.js"
      onReady={() => {
        let retryCount = 0;
        const setUserLoop = setInterval(() => {
          if (retryCount > 10) {
            clearInterval(setUserLoop);
            return;
          }

          //@ts-ignore
          const fcWidget = window.fcWidget;
          if (fcWidget && fcWidget.user) {
            fcWidget.user.setProperties({ firstName: props.name, lastName: props.organizationId, email: props.email });
            clearInterval(setUserLoop);
            return;
          }

          retryCount++;
        }, 1000);
      }}
    />
  );
}

export default LiveChat;
