import { UUID_LENGTH } from '../constants';

export type UserId = string;

export const USER_TABLE_NAME = 'user';
export const USER_ID_MAX_LENGTH = UUID_LENGTH;
export const USER_EMAIL_MIN_LENGTH = 1;
export const USER_EMAIL_MAX_LENGTH = 100;
export const USER_PASSWORD_MIN_LENGTH = 8;
export const USER_PASSWORD_MAX_LENGTH = 28;
export const USER_HASHED_PASSWORD_MAX_LENGTH = 128;
export const USER_NAME_MIN_LENGTH = 1;
export const USER_NAME_MAX_LENGTH = 50;
export const USER_PROFILE_IMAGE_URL_MAX_LENGTH = 500;
