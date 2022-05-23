import { performance } from "perf_hooks";

const timers: { [key: string]: number } = {};

export function startTime(id: string) {
  timers[id] = performance.now();
}

export function stopTime(id: string): number {
  const start = timers[id];
  if (!start) {
    return 0;
  }
  const duration = performance.now() - start;
  return duration;
}
