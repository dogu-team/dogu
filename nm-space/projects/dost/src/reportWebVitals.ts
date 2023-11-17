// @ts-nocheck
const reportWebVitals = (onPerfEntry?: unknown) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals')
      .then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(onPerfEntry);
        getFID(onPerfEntry);
        getFCP(onPerfEntry);
        getLCP(onPerfEntry);
        getTTFB(onPerfEntry);
      })
      .catch((e) => {
        console.error('reportWebVitals error', e);
      });
  }
};

export default reportWebVitals;
