export const Method = ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
export type Method = (typeof Method)[number];

export type Path = `/${string}`;

// export type Headers = Record<string, string | string[]>;
export type HeaderRecord = Record<string, string>;

export const DoguRequestTimeoutHeader = 'dogu-request-timeout';
export const DoguRemoteDeviceJobIdHeader = 'dogu-remote-device-job-id';
export const DoguBrowserNameHeader = 'dogu-browser-name';
export const DoguBrowserVersionHeader = 'dogu-browser-version';
export const DoguDevicePlatformHeader = 'dogu-device-platform';
export const DoguDeviceSerialHeader = 'dogu-device-serial';
export const DoguApplicationUrlHeader = 'dogu-application-url';
export const DoguApplicationVersionHeader = 'dogu-application-version';
export const DoguApplicationFileSizeHeader = 'dogu-application-file-size';

export type Query = Record<string, unknown>;
