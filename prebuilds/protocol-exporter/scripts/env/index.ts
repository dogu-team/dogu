import { Exporter } from './common';
import { GoContentCreator, GoCreationOptions } from './go';
import { TsCreationOptions, TsContentCreator } from './ts';

export const tsExporter = new Exporter<TsCreationOptions, TsContentCreator>('ts', TsContentCreator);
export const goExporter = new Exporter<GoCreationOptions, GoContentCreator>('go', GoContentCreator);
