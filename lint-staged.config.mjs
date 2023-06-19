const IgnorePatterns = ['node_modules', 'dist', 'third-party', '.yarn', '.pnp'];

export default {
  '*.ts': (files) => {
    const joins = files
      .filter((file) => !file.endsWith('.d.ts'))
      .filter((file) => !IgnorePatterns.some((pattern) => file.includes(pattern)))
      .join(' ');
    return [`organize-imports-cli ${joins}`, `prettier --write ${joins}`];
  },
  'package.json': (files) => {
    const joins = files.filter((file) => !IgnorePatterns.some((pattern) => file.includes(pattern))).join(' ');
    return [`prettier-package-json --write ${joins}`];
  },
};
