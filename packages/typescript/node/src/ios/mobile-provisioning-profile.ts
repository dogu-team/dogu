import { readPlist } from '..';

export interface MobileProvisioningProfile {
  appIDName: string;
  platform: string[];
  creationDate: Date;
  expirationDate: Date;
  name: string;
  provisionedDevices: string[];
  teamIdentifier: string[];
  teamName: string;
  timeToLive: number;
  uuid: string;
  version: number;
}

export function readMobileProvisioingProfile(contents: string): Promise<MobileProvisioningProfile> {
  const plistObj = readPlist(contents);

  const appIDName = (plistObj.AppIDName as string) || 'unknown';
  const platform = (plistObj.Platform as string[]) || [];
  const creationDate = new Date(plistObj.CreationDate as string);
  const expirationDate = new Date(plistObj.ExpirationDate as string);
  const name = (plistObj.Name as string) || 'unknown';
  const provisionedDevices = (plistObj.ProvisionedDevices as string[]) || [];
  const teamIdentifier = (plistObj.TeamIdentifier as string[]) || [];
  const teamName = (plistObj.TeamName as string) || 'unknown';
  const timeToLive = (plistObj.TimeToLive as number) || 0;
  const uuid = (plistObj.UUID as string) || 'unknown';
  const version = (plistObj.Version as number) || 0;
  return Promise.resolve({
    appIDName,
    platform,
    creationDate,
    expirationDate,
    name,
    provisionedDevices,
    teamIdentifier,
    teamName,
    timeToLive,
    uuid,
    version,
  });
}
