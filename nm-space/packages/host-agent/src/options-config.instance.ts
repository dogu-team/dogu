import { NullOptionsConfig, OptionsConfig } from '@dogu-tech/node';

export let optionsConfig = NullOptionsConfig;
OptionsConfig.load().then((config) => {
  optionsConfig = config;
});
