import Script from 'next/script';

interface Props {
  user?: {
    name: string;
    email: string;
    organizationId: string;
  };
}

function LiveChat(props: Props) {
  if (process.env.NEXT_PUBLIC_ENV === 'self-hosted') {
    return null;
  }

  return (
    <Script
      src="//fw-cdn.com/10683920/3497107.js"
      onReady={() => {
        const MAX_RETRY_COUNT = 100;
        let retryCount = 0;

        const setUserLoop = setInterval(() => {
          if (retryCount > MAX_RETRY_COUNT) {
            clearInterval(setUserLoop);
            return;
          }

          //@ts-ignore
          const fcWidget = window.fcWidget;
          if (fcWidget && fcWidget.user) {
            if (props.user) {
              fcWidget.user.setProperties({ firstName: props.user.name, lastName: props.user.organizationId, email: props.user.email });
            }

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
