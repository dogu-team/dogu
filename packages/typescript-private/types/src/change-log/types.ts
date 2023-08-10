export const CHANGE_LOG_TABLE_NAME = 'change_log';
export const CHANGE_LOG_USER_REACTION_TABLE_NAME = 'change_log_user_reaction';

export type ChangeLogId = string;
export type ChangeLogUserReactionId = string;

export enum ChangeLogReactionType {
  LIKE,
  NEUTRAL,
  DISLIKE,
}

export enum ChangeLogType {
  ANNOUNCEMENT = 'announcement',
  FEATURE = 'feature',
  EVENT = 'event',
  RELEASE = 'release',
  WEB = 'web',
  MOBILE = 'mobile',
  GAME = 'game',
  AUTOMATION = 'automation',
  INTEGRATION = 'integration',
}
