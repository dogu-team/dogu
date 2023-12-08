export const PERMISSION_OPTIONS_KEY = 'PERMISSION_OPTIONS_KEY';

export interface PermissionOptions {
  allowAdmin: boolean;
  allowTemporary: 'serial' | 'exist' | 'no';
}
