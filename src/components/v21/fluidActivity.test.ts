import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { describe, expect, it } from 'vitest';

// Exercise the generated browser implementation, with only GPU uploads stubbed.
const generated = readFileSync('public/fluid-watercolor-study.js', 'utf8');
const activitySource = generated.slice(
  generated.indexOf('const hybridMode='),
  generated.indexOf('// Detached wisps carry'),
);

function activityClock(refinement = 'timing') {
  let now = 0;
  const noop = () => undefined;
  const context = createContext({
    URLSearchParams,
    location: { search: `?hybrid&refinement=${refinement}` },
    canvas: { width: 1000, height: 800 },
    performance: { now: () => now },
    gl: new Proxy({}, { get: () => noop }),
  });
  runInContext(activitySource, context);
  runInContext('stampActivity(20.5/64,20.5/40,0)', context);
  return {
    advance(time: number, dt: number) {
      now = time;
      runInContext(`updateActivity(${dt})`, context);
    },
    disturbRight() { runInContext('markActivity(48.5/64,20.5/40,performance.now())', context); },
    left: () => runInContext('activityData[(20*64+20)*4]', context) as number,
    right: () => runInContext('activityData[(20*64+48)*4]', context) as number,
  };
}

describe('spatial smoke recovery clock', () => {
  it.each([30, 60, 90, 120, 144])('keeps the approved pacing at %i fps', (fps) => {
    const clock = activityClock();
    for (let frame = 1; frame <= fps * 2; frame++) clock.advance(frame / fps * 1000, 1 / fps);
    expect(clock.left()).toBe(135);
    clock.advance(4250, 1 / fps);
    expect(clock.left()).toBe(0);
  });

  it('ages a passed region while another region is continuously disturbed', () => {
    const clock = activityClock();
    clock.disturbRight();
    for (let frame = 1; frame <= 300; frame++) {
      clock.advance(frame / 60 * 1000, 1 / 60);
      clock.disturbRight();
    }
    expect(clock.left()).toBe(0);
    expect(clock.right()).toBe(255);
  });

  it('uses elapsed time after a paused frame rather than the capped solver step', () => {
    const clock = activityClock();
    clock.advance(5000, 1 / 60);
    expect(clock.left()).toBe(0);
  });

  it('leaves the release clock available without a refinement flag', () => {
    const clock = activityClock('');
    for (let frame = 1; frame <= 240; frame++) clock.advance(frame / 120 * 1000, 1 / 120);
    expect(clock.left()).toBe(15);
  });
});
