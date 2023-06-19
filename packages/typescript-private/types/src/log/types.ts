import { UUID_LENGTH } from '../constants';

export type LogId = string;
export const LOG_ID_MAX_LENGTH = UUID_LENGTH;

export const LOG_NAME_MIN_LENGTH = 1;
export const LOG_NAME_MAX_LENGTH = 45;

export const LOG_CONTENTS_MIN_LENGTH = 1;
export const LOG_CONTENTS_MAX_LENGTH = 200;
