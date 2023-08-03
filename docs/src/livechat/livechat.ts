function initLiveChat() {
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
      fcWidget.user.get().catch(() => {
        fcWidget.user.setProperties({
          firstName: 'Anonymous',
        });
      });
      clearInterval(setUserLoop);
      return;
    }

    retryCount++;
  }, 1000);
}

export default initLiveChat;
