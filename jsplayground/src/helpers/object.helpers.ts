export const isObject = (value: unknown): boolean => {
  return value !== null && typeof value === "object" && !Array.isArray(value);
};
