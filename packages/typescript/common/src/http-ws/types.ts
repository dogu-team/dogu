export const Method = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
export type Method = (typeof Method)[number];

export type Path = `/${string}`;

// export type Headers = Record<string, string | string[]>;
export type HeaderRecord = Record<string, string>;
export const DoguRequestTimeoutHeader = 'dogu-request-timeout';
export const DoguRemoteDeviceJobIdHeader = 'dogu-remote-device-job-id';
export const DoguBrowserNameHeader = 'dogu-browser-name';
export const DoguBrowserVersionHeader = 'dogu-browser-version';
export const DoguRemoteSerialHeader = 'dogu-remote-serial';
export const DoguRemotePlatformHeader = 'dogu-remote-platform';

export type Query = Record<string, unknown>;
