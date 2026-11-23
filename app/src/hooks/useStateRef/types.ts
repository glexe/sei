export type Next<T> = T | ((current: T) => T);
