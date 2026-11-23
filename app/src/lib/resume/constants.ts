// Positions and watched marks kept per drive, most recently played first.
export const MAX_FILES = 1000;
// Before this nothing is saved; this close to the end counts as finished.
export const EDGE_S = 30;
export const FINISHED_RATIO = 0.95;
// The player records a position this often; it reaches the drive at most every FLUSH_MS.
export const SAVE_EVERY_S = 5;
export const FLUSH_MS = 30_000;
