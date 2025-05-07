export const FromServiceNames = {
  HEROND_POINTS: "herond-points-service",
} as const;

export type FromServiceName =
  (typeof FromServiceNames)[keyof typeof FromServiceNames];
