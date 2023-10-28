const IgnorePatterns = ['node_modules', 'dist', 'third-party', '.yarn', '.pnp'];

export default {
  '*.ts': (files) => {
    const joins = files
      .filter((file) => !file.endsWith('.d.ts'))
      .filter((file) => !IgnorePatterns.some((pattern) => file.includes(pattern)))
      .join(' ');
    if (joins.trim() === '') return [];
    return [`organize-imports-cli ${joins}`, `prettier --write ${joins}`, `eslint ${joins}`];
  },
  'package.json': (files) => {
    const joins = files.filter((file) => !IgnorePatterns.some((pattern) => file.includes(pattern))).join(' ');
    return [`prettier-package-json --write ${joins}`];
  },
};
