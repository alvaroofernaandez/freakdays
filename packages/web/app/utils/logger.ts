export const devLog = (...args: unknown[]) => {
  if (import.meta.dev) console.log(...args);
};

export const devWarn = (...args: unknown[]) => {
  if (import.meta.dev) console.warn(...args);
};

export const devError = (...args: unknown[]) => {
  if (import.meta.dev) console.error(...args);
};
