export const AdapterType = {
  NONE: "none",
  REDIS: "redis",
  CLUSTER: "cluster",
} as const;

export type AdapterType = (typeof AdapterType)[keyof typeof AdapterType];
