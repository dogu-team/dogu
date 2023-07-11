export let stripAnsi: any | null = null;
import('strip-ansi').then((module) => {
  stripAnsi = module.default;
});
