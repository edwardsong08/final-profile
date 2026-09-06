import { describe, expect, it } from 'vitest';
import { advanceRippleClock } from './rippleTiming';

describe('mobile ripple timing', () => {
  it.each([30, 60, 90, 120])('advances the same wave time at %i fps', (fps) => {
    let remainder = 0;
    let total = 0;
    for (let frame = 0; frame < fps; frame += 1) {
      const next = advanceRippleClock(remainder, 1000 / fps);
      total += next.steps;
      remainder = next.remainder;
    }
    expect(total).toBe(120);
    expect(remainder).toBeCloseTo(0);
  });

  it('caps catch-up work after a stalled or hidden frame', () => {
    expect(advanceRippleClock(0, 6000)).toEqual({ steps: 6, remainder: 0 });
  });

  it('retains partial steps and ignores negative elapsed time', () => {
    expect(advanceRippleClock(3, 2)).toEqual({ steps: 0, remainder: 5 });
    expect(advanceRippleClock(3, -2)).toEqual({ steps: 0, remainder: 3 });
  });
});
