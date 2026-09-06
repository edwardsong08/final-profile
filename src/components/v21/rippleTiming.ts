// Fixed physics steps keep water speed independent of display refresh rate.
export const RIPPLE_STEP_MS = 1000 / 120;
const MAX_STEPS = 6;

export function advanceRippleClock(remainder: number, elapsed: number) {
  const accumulated = Math.min(
    Math.max(0, remainder) + Math.max(0, elapsed),
    RIPPLE_STEP_MS * MAX_STEPS,
  );
  const steps = Math.min(MAX_STEPS, Math.floor((accumulated + 1e-6) / RIPPLE_STEP_MS));
  return { steps, remainder: Math.max(0, accumulated - steps * RIPPLE_STEP_MS) };
}
