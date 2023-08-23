export default {
  presets: ['@babel/preset-typescript'],
  plugins: [['@babel/plugin-proposal-decorators', { version: 'legacy' }], '@babel/plugin-transform-class-properties'],
  ignore: ['node_modules', 'build', 'build-temp', /^.*\.(test|spec)\.ts$/],
};
