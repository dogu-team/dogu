const webpack = require('webpack');

module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    crypto: false,
    stream: false,
    assert: false,
    http: false,
    https: false,
    os: false,
    url: false,
    fs: false,
    path: false,
    process: false,
  });
  config.resolve.fallback = fallback;
  return config;
};
