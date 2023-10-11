/*
 * Ceil the device memory. If 5.67GB, then ceil to 6GB.
 */
export const ceilDeviceMemory = (memoryBytes: `${number}` | number): string => {
  const memory = Number(memoryBytes);
  const memoryGB = memory / 1024 / 1024 / 1024;
  const ceilMemory = Math.ceil(memoryGB);
  return `${ceilMemory}GB`;
};
