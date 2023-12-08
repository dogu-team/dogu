export const hostAgentKey = 'host-agent' as const;
export const deviceServerKey = 'device-server' as const;

export const ChildKey = [hostAgentKey, deviceServerKey] as const;
export type ChildKey = (typeof ChildKey)[number];
