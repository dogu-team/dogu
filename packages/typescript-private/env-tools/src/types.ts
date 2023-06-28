export const DoguRunType = ['unknown', 'local', 'new-local', 'self-hosted', 'e2e', 'new-e2e', 'development', 'production', 'staging', 'test'] as const;
export type DoguRunType = (typeof DoguRunType)[number];

export function isValidDoguRunType(value: string): value is DoguRunType {
  return DoguRunType.includes(value as DoguRunType);
}

export const NodeEnvType = ['development', 'production', 'test'] as const;
export type NodeEnvType = (typeof NodeEnvType)[number];

export function isValidNodeEnvType(value: string): value is NodeEnvType {
  return NodeEnvType.includes(value as NodeEnvType);
}
