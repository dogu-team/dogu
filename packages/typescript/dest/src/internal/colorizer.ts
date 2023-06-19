import chalk from 'chalk';
chalk.level = 3;

const orange = { r: 242, g: 147, b: 57 };

export type Colorizer = chalk.Chalk;

export { chalk as color };

export const colorTemplate = {
  bgOrange: chalk.bgRgb(orange.r, orange.g, orange.b),
  orange: chalk.rgb(orange.r, orange.g, orange.b),
};
