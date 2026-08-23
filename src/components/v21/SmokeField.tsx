import { useEffect, useRef, useState } from 'react';

import styles from './PortfolioZen.module.css';

const vertexShaderSource = `
  attribute vec2 aPosition;
  varying vec2 vUv;

  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const updateShaderSource = `
  precision mediump float;

  varying vec2 vUv;
  uniform sampler2D uPrevious;
  uniform vec2 uTexel;
  uniform vec2 uPointA;
  uniform vec2 uPreviousPointA;
  uniform vec2 uPointB;
  uniform vec2 uPreviousPointB;
  uniform float uAspect;
  uniform float uTime;
  uniform float uStep;
  uniform float uEnergyA;
  uniform float uEnergyB;
  uniform float uIdleFade;

  float hash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 point) {
    vec2 index = floor(point);
    vec2 fraction = fract(point);
    fraction = fraction * fraction * (3.0 - 2.0 * fraction);

    return mix(
      mix(hash(index), hash(index + vec2(1.0, 0.0)), fraction.x),
      mix(hash(index + vec2(0.0, 1.0)), hash(index + vec2(1.0, 1.0)), fraction.x),
      fraction.y
    );
  }

  float segmentDistance(vec2 point, vec2 start, vec2 end) {
    vec2 segment = end - start;
    float denominator = max(dot(segment, segment), 0.00001);
    float position = clamp(dot(point - start, segment) / denominator, 0.0, 1.0);
    return length(point - (start + segment * position));
  }

  float gestureInjection(
    vec2 scaledUv,
    vec2 point,
    vec2 previousPoint,
    float energy,
    float phase
  ) {
    vec2 scaledPoint = vec2(point.x * uAspect, point.y);
    vec2 scaledPreviousPoint = vec2(previousPoint.x * uAspect, previousPoint.y);
    float distanceToGesture = segmentDistance(scaledUv, scaledPreviousPoint, scaledPoint);
    float pockets = smoothstep(
      0.22,
      0.84,
      noise(vUv * 27.0 + vec2(uTime * 0.12 + phase, phase * -0.73))
    );
    float turbulence = 0.34 + pockets * 1.24;
    float core = exp(-distanceToGesture * distanceToGesture * 2300.0);
    float haze = exp(-distanceToGesture * distanceToGesture * 390.0) * 0.11;
    return (core * turbulence + haze) * energy;
  }

  void main() {
    vec2 scaledUv = vec2(vUv.x * uAspect, vUv.y);
    float lowNoise = noise(vUv * 3.4 + vec2(uTime * 0.027, -uTime * 0.021));
    float highNoise = noise(vUv * 8.2 + vec2(-uTime * 0.019, uTime * 0.024));
    float angle = (lowNoise * 2.0 + highNoise - 1.35) * 6.2831853;
    vec2 flow = vec2(cos(angle), sin(angle)) * 0.0019;
    flow.y += 0.0005;

    vec2 sampleUv = clamp(vUv - flow * uStep, vec2(0.002), vec2(0.998));
    float center = texture2D(uPrevious, sampleUv).r;
    float left = texture2D(uPrevious, sampleUv - vec2(uTexel.x, 0.0)).r;
    float right = texture2D(uPrevious, sampleUv + vec2(uTexel.x, 0.0)).r;
    float below = texture2D(uPrevious, sampleUv - vec2(0.0, uTexel.y)).r;
    float above = texture2D(uPrevious, sampleUv + vec2(0.0, uTexel.y)).r;
    float lowerLeft = texture2D(uPrevious, sampleUv - uTexel).r;
    float upperRight = texture2D(uPrevious, sampleUv + uTexel).r;
    float upperLeft = texture2D(uPrevious, sampleUv + vec2(-uTexel.x, uTexel.y)).r;
    float lowerRight = texture2D(uPrevious, sampleUv + vec2(uTexel.x, -uTexel.y)).r;
    float density = center * 0.68;
    density += (left + right + below + above) * 0.07;
    density += (lowerLeft + upperRight + upperLeft + lowerRight) * 0.01;
    float dissipation = mix(0.9965, 0.974, uIdleFade);
    density *= pow(dissipation, uStep);

    float injectionA = gestureInjection(
      scaledUv,
      uPointA,
      uPreviousPointA,
      uEnergyA,
      0.0
    );
    float injectionB = gestureInjection(
      scaledUv,
      uPointB,
      uPreviousPointB,
      uEnergyB,
      5.17
    );
    density = min(1.0, density + (injectionA + injectionB) * 0.42);

    gl_FragColor = vec4(vec3(density), 1.0);
  }
`;

const displayShaderSource = `
  precision mediump float;

  varying vec2 vUv;
  uniform sampler2D uDensity;
  uniform sampler2D uText;
  uniform vec2 uTexel;
  uniform float uTime;
  uniform float uTextReveal;

  float hash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 point) {
    vec2 index = floor(point);
    vec2 fraction = fract(point);
    fraction = fraction * fraction * (3.0 - 2.0 * fraction);
    return mix(
      mix(hash(index), hash(index + vec2(1.0, 0.0)), fraction.x),
      mix(hash(index + vec2(0.0, 1.0)), hash(index + vec2(1.0, 1.0)), fraction.x),
      fraction.y
    );
  }

  void main() {
    float density = texture2D(uDensity, vUv).r;
    float horizontal = texture2D(uDensity, vUv + vec2(uTexel.x, 0.0)).r
      - texture2D(uDensity, vUv - vec2(uTexel.x, 0.0)).r;
    float vertical = texture2D(uDensity, vUv + vec2(0.0, uTexel.y)).r
      - texture2D(uDensity, vUv - vec2(0.0, uTexel.y)).r;
    float contour = clamp(length(vec2(horizontal, vertical)) * 3.4, 0.0, 1.0);
    float billow = noise(vUv * 34.0 + vec2(uTime * 0.018, -uTime * 0.025));
    float filament = noise(vUv * 91.0 + vec2(-uTime * 0.04, uTime * 0.03));
    float shapedDensity = max(0.0, density * (0.64 + billow * 0.58) - (1.0 - filament) * 0.055);
    float haze = smoothstep(0.005, 0.16, density) * (0.58 + billow * 0.34);
    float body = smoothstep(0.035, 0.5, shapedDensity);
    float core = smoothstep(0.22, 0.86, shapedDensity);
    float grain = (hash(gl_FragCoord.xy) - 0.5) * 0.014;
    vec3 mineralBlue = vec3(0.192, 0.361, 0.447);
    vec3 graphite = vec3(0.09, 0.12, 0.12);
    vec3 color = mix(mineralBlue, graphite, clamp(density * 0.76 + contour * 0.18, 0.0, 1.0));
    float alpha = clamp(haze * 0.11 + body * 0.34 + core * 0.13 + contour * 0.08 + grain, 0.0, 0.59);

    float disturbance = smoothstep(0.018, 0.46, density);
    vec2 distortion = vec2(horizontal, vertical) * 0.076;
    float driftAngle = billow * 6.2831853 + uTime * 0.11;
    distortion += vec2(cos(driftAngle), sin(driftAngle)) * disturbance * 0.0045;
    vec2 textUv = clamp(vUv + distortion, vec2(0.001), vec2(0.999));
    float textMask = texture2D(uText, textUv).a;
    float erosionTexture = noise(vUv * 146.0 + vec2(uTime * 0.055, -uTime * 0.043));
    float erosion = smoothstep(0.075, 0.58, density * (0.82 + erosionTexture * 0.42));
    float textAlpha = textMask * uTextReveal * mix(0.76, 0.12, erosion);
    vec3 textColor = vec3(0.137, 0.278, 0.353);
    float combinedAlpha = alpha + textAlpha * (1.0 - alpha);
    vec3 combinedColor = (
      color * alpha + textColor * textAlpha * (1.0 - alpha)
    ) / max(combinedAlpha, 0.0001);

    gl_FragColor = vec4(combinedColor, combinedAlpha);
  }
`;

type RenderTarget = {
  framebuffer: WebGLFramebuffer;
  texture: WebGLTexture;
};

type SmokePoint = [number, number];

type SmokeEmitter = {
  active: boolean;
  clientX: number | null;
  clientY: number | null;
  energy: number;
  hasPoint: boolean;
  input: 'mouse' | 'touch';
  inside: boolean;
  point: SmokePoint;
  pointerId: number | null;
  previousPoint: SmokePoint;
  scrollLinkedUntil: number;
};

const createEmitter = (): SmokeEmitter => ({
  active: false,
  clientX: null,
  clientY: null,
  energy: 0,
  hasPoint: false,
  input: 'mouse',
  inside: false,
  point: [0.5, 0.5],
  pointerId: null,
  previousPoint: [0.5, 0.5],
  scrollLinkedUntil: 0,
});

const isInteractiveTarget = (target: EventTarget | null) =>
  target instanceof Element
  && Boolean(
    target.closest(
      'a, button, input, select, textarea, summary, [contenteditable="true"], [role="button"]',
    ),
  );

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Unable to create smoke shader.');

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? 'Unknown shader error.';
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexSource: string,
  fragmentSource: string,
) {
  const program = gl.createProgram();
  if (!program) throw new Error('Unable to create smoke program.');

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? 'Unknown program error.';
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return program;
}

function createRenderTarget(
  gl: WebGLRenderingContext,
  width: number,
  height: number,
): RenderTarget {
  const texture = gl.createTexture();
  const framebuffer = gl.createFramebuffer();
  if (!texture || !framebuffer) throw new Error('Unable to create smoke render target.');

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    width,
    height,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    null,
  );

  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0,
  );
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  return { framebuffer, texture };
}

export default function SmokeField() {
  const layerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contextVersion, setContextVersion] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const layer = layerRef.current;
    if (!canvas || !layer) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)');
    if (reducedMotion.matches) {
      canvas.dataset.motion = 'off';
      layer.dataset.mode = 'static';
      return;
    }

    const touchOptimized = coarsePointer.matches;

    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: false,
      depth: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      stencil: false,
    });

    if (!gl) {
      canvas.dataset.motion = 'unavailable';
      layer.dataset.mode = 'static';
      return;
    }

    let updateProgram: WebGLProgram;
    let displayProgram: WebGLProgram;

    try {
      updateProgram = createProgram(gl, vertexShaderSource, updateShaderSource);
      displayProgram = createProgram(gl, vertexShaderSource, displayShaderSource);
    } catch {
      canvas.dataset.motion = 'unavailable';
      layer.dataset.mode = 'static';
      return;
    }

    const buffer = gl.createBuffer();
    const textTexture = gl.createTexture();
    if (!buffer || !textTexture) {
      gl.deleteProgram(updateProgram);
      gl.deleteProgram(displayProgram);
      if (buffer) gl.deleteBuffer(buffer);
      if (textTexture) gl.deleteTexture(textTexture);
      layer.dataset.mode = 'static';
      return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const updatePosition = gl.getAttribLocation(updateProgram, 'aPosition');
    const displayPosition = gl.getAttribLocation(displayProgram, 'aPosition');
    const updateUniforms = {
      previous: gl.getUniformLocation(updateProgram, 'uPrevious'),
      texel: gl.getUniformLocation(updateProgram, 'uTexel'),
      pointA: gl.getUniformLocation(updateProgram, 'uPointA'),
      previousPointA: gl.getUniformLocation(updateProgram, 'uPreviousPointA'),
      pointB: gl.getUniformLocation(updateProgram, 'uPointB'),
      previousPointB: gl.getUniformLocation(updateProgram, 'uPreviousPointB'),
      aspect: gl.getUniformLocation(updateProgram, 'uAspect'),
      time: gl.getUniformLocation(updateProgram, 'uTime'),
      step: gl.getUniformLocation(updateProgram, 'uStep'),
      energyA: gl.getUniformLocation(updateProgram, 'uEnergyA'),
      energyB: gl.getUniformLocation(updateProgram, 'uEnergyB'),
      idleFade: gl.getUniformLocation(updateProgram, 'uIdleFade'),
    };
    const displayUniforms = {
      density: gl.getUniformLocation(displayProgram, 'uDensity'),
      text: gl.getUniformLocation(displayProgram, 'uText'),
      texel: gl.getUniformLocation(displayProgram, 'uTexel'),
      time: gl.getUniformLocation(displayProgram, 'uTime'),
      textReveal: gl.getUniformLocation(displayProgram, 'uTextReveal'),
    };

    let targets: [RenderTarget, RenderTarget] | null = null;
    let simulationWidth = 0;
    let simulationHeight = 0;
    let frontIndex = 0;
    let animationFrame = 0;
    let lastFrame = performance.now();
    let startTime = lastFrame;
    let isVisible = true;
    let idleFrames = 0;
    let hasInteracted = false;
    const emitters: [SmokeEmitter, SmokeEmitter] = [createEmitter(), createEmitter()];
    const minimumFrameInterval = touchOptimized ? 1000 / 30 : 0;
    const touchVisualOffset = 22;
    const touchReleaseGrace = 700;
    let scrollFrame = 0;
    let pendingScrollDelta = 0;
    let lastScrollPosition = window.scrollY + (window.visualViewport?.offsetTop ?? 0);
    let lastScrollSample = performance.now();

    gl.bindTexture(gl.TEXTURE_2D, textTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const textCanvas = document.createElement('canvas');
    const textContext = textCanvas.getContext('2d');
    if (!textContext) {
      canvas.dataset.motion = 'unavailable';
      layer.dataset.mode = 'static';
      gl.deleteBuffer(buffer);
      gl.deleteTexture(textTexture);
      gl.deleteProgram(updateProgram);
      gl.deleteProgram(displayProgram);
      return;
    }

    const updateTextTexture = (bounds: DOMRect, pixelRatio: number) => {
      textCanvas.width = canvas.width;
      textCanvas.height = canvas.height;

      const configuredPosition = window
        .getComputedStyle(layer)
        .getPropertyValue('--mantra-y')
        .trim();
      const parsedPosition = Number.parseFloat(configuredPosition);
      const mantraPosition = Number.isFinite(parsedPosition)
        ? Math.min(0.82, Math.max(0.18, parsedPosition / 100))
        : 0.5;

      const fontSize = Math.min(32, Math.max(20, bounds.width * 0.021)) * pixelRatio;
      textContext.clearRect(0, 0, textCanvas.width, textCanvas.height);
      textContext.fillStyle = '#ffffff';
      textContext.font = `470 ${fontSize}px Aptos, "Segoe UI Variable", "Segoe UI", Helvetica, Arial, sans-serif`;
      textContext.textAlign = 'center';
      textContext.textBaseline = 'middle';
      if ('letterSpacing' in textContext) {
        textContext.letterSpacing = '0.015em';
      }
      textContext.fillText(
        'Listen. Learn. Build.',
        textCanvas.width / 2,
        textCanvas.height * mantraPosition,
      );

      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, textTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        textCanvas,
      );
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    };

    const destroyTargets = () => {
      targets?.forEach((target) => {
        gl.deleteFramebuffer(target.framebuffer);
        gl.deleteTexture(target.texture);
      });
      targets = null;
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, touchOptimized ? 1.25 : 1.5);
      canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
      canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
      updateTextTexture(bounds, pixelRatio);

      const maxSimulationWidth = touchOptimized ? 520 : bounds.width >= 900 ? 1280 : 760;
      const maxSimulationHeight = touchOptimized ? 720 : Number.POSITIVE_INFINITY;
      const scaledWidth = Math.max(bounds.width * pixelRatio, 1);
      const scaledHeight = Math.max(bounds.height * pixelRatio, 1);
      const scale = Math.min(
        touchOptimized ? 0.72 : 0.86,
        maxSimulationWidth / scaledWidth,
        maxSimulationHeight / scaledHeight,
      );
      simulationWidth = Math.max(touchOptimized ? 288 : 384, Math.round(scaledWidth * scale));
      simulationHeight = Math.max(touchOptimized ? 360 : 240, Math.round(scaledHeight * scale));
      destroyTargets();
      targets = [
        createRenderTarget(gl, simulationWidth, simulationHeight),
        createRenderTarget(gl, simulationWidth, simulationHeight),
      ];
      frontIndex = 0;
    };

    const drawFullscreen = (position: number) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };

    const drawDisplay = (now: number) => {
      if (!targets) return;

      gl.disable(gl.BLEND);
      gl.useProgram(displayProgram);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, targets[frontIndex].texture);
      gl.uniform1i(displayUniforms.density, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, textTexture);
      gl.uniform1i(displayUniforms.text, 1);
      gl.uniform2f(displayUniforms.texel, 1 / simulationWidth, 1 / simulationHeight);
      gl.uniform1f(displayUniforms.time, (now - startTime) / 1000);
      gl.uniform1f(
        displayUniforms.textReveal,
        Math.min(1, Math.max(0, ((now - startTime) / 1000 - 0.28) / 1.35)),
      );
      drawFullscreen(displayPosition);
    };

    const render = (now: number) => {
      animationFrame = 0;
      if (!targets) return;

      if (minimumFrameInterval && now - lastFrame < minimumFrameInterval) {
        if (isVisible && !document.hidden) {
          animationFrame = window.requestAnimationFrame(render);
        }
        return;
      }

      const elapsedStep = Math.min(2.2, Math.max(0.35, (now - lastFrame) / 16.667));
      lastFrame = now;
      const source = targets[frontIndex];
      const destination = targets[1 - frontIndex];

      gl.disable(gl.BLEND);
      gl.useProgram(updateProgram);
      gl.viewport(0, 0, simulationWidth, simulationHeight);
      gl.bindFramebuffer(gl.FRAMEBUFFER, destination.framebuffer);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, source.texture);
      gl.uniform1i(updateUniforms.previous, 0);
      gl.uniform2f(updateUniforms.texel, 1 / simulationWidth, 1 / simulationHeight);
      gl.uniform2f(updateUniforms.pointA, emitters[0].point[0], emitters[0].point[1]);
      gl.uniform2f(
        updateUniforms.previousPointA,
        emitters[0].previousPoint[0],
        emitters[0].previousPoint[1],
      );
      gl.uniform2f(updateUniforms.pointB, emitters[1].point[0], emitters[1].point[1]);
      gl.uniform2f(
        updateUniforms.previousPointB,
        emitters[1].previousPoint[0],
        emitters[1].previousPoint[1],
      );
      gl.uniform1f(updateUniforms.aspect, simulationWidth / simulationHeight);
      gl.uniform1f(updateUniforms.time, (now - startTime) / 1000);
      gl.uniform1f(updateUniforms.step, elapsedStep);
      const activeTouchCount = emitters.filter(
        (emitter) => emitter.active && emitter.input === 'touch' && emitter.inside,
      ).length;
      const dualTouchBalance = activeTouchCount > 1 ? 0.72 : 1;
      gl.uniform1f(
        updateUniforms.energyA,
        emitters[0].inside ? emitters[0].energy * dualTouchBalance : 0,
      );
      gl.uniform1f(
        updateUniforms.energyB,
        emitters[1].inside ? emitters[1].energy * dualTouchBalance : 0,
      );
      gl.uniform1f(
        updateUniforms.idleFade,
        Math.min(
          1,
          Math.max(
            0,
            (idleFrames - (touchOptimized ? 60 : 210)) / (touchOptimized ? 90 : 360),
          ),
        ),
      );
      drawFullscreen(updatePosition);

      frontIndex = 1 - frontIndex;
      drawDisplay(now);

      emitters.forEach((emitter) => {
        emitter.previousPoint = emitter.point;
        emitter.energy *= Math.pow(0.76, elapsedStep);
        if (emitter.active && emitter.input === 'touch' && emitter.inside) {
          emitter.energy = Math.max(emitter.energy, activeTouchCount > 1 ? 0.009 : 0.012);
        }
        if (!emitter.active && emitter.energy < 0.003) emitter.energy = 0;
      });
      const hasActiveEnergy = emitters.some(
        (emitter) => emitter.energy > 0 || (emitter.active && emitter.inside),
      );
      idleFrames = hasActiveEnergy ? 0 : idleFrames + 1;

      const idleLimit = hasInteracted
        ? touchOptimized ? 180 : 720
        : touchOptimized ? 75 : 150;
      if (isVisible && !document.hidden && idleFrames < idleLimit) {
        animationFrame = window.requestAnimationFrame(render);
      } else if (idleFrames >= idleLimit) {
        targets.forEach((target) => {
          gl.bindFramebuffer(gl.FRAMEBUFFER, target.framebuffer);
          gl.clearColor(0, 0, 0, 0);
          gl.clear(gl.COLOR_BUFFER_BIT);
        });
        frontIndex = 0;
        drawDisplay(now);
      }
    };

    const startRendering = (immediate = false) => {
      if (animationFrame || !isVisible || document.hidden) return;
      const now = performance.now();
      lastFrame = immediate
        ? now - Math.max(minimumFrameInterval, 16.667)
        : now;
      animationFrame = window.requestAnimationFrame((now) => {
        animationFrame = 0;
        render(now);
      });
    };

    const stopRendering = () => {
      if (!animationFrame) return;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    };

    const pointWithinCanvas = (
      clientX: number,
      clientY: number,
      visualOffsetY = 0,
    ) => {
      const bounds = canvas.getBoundingClientRect();
      if (
        clientX < bounds.left ||
        clientX > bounds.right ||
        clientY < bounds.top ||
        clientY > bounds.bottom ||
        bounds.width <= 0 ||
        bounds.height <= 0
      ) {
        return null;
      }

      const visualClientY = Math.min(
        bounds.bottom,
        Math.max(bounds.top, clientY - visualOffsetY),
      );

      return {
        bounds,
        point: [
          (clientX - bounds.left) / bounds.width,
          1 - (visualClientY - bounds.top) / bounds.height,
        ] as SmokePoint,
      };
    };

    const moveEmitter = (
      emitter: SmokeEmitter,
      nextPoint: SmokePoint,
      bounds: DOMRect,
      initialEnergy: number,
      baseEnergy: number,
      velocityScale: number,
      immediate = false,
    ) => {
      emitter.inside = true;

      if (!emitter.hasPoint) {
        emitter.point = nextPoint;
        emitter.previousPoint = nextPoint;
        emitter.hasPoint = true;
        hasInteracted = true;
        emitter.energy = Math.max(emitter.energy, initialEnergy);
        idleFrames = 0;
        startRendering(immediate);
        return;
      }

      const deltaX = (nextPoint[0] - emitter.point[0]) * (bounds.width / bounds.height);
      const deltaY = nextPoint[1] - emitter.point[1];
      const velocity = Math.hypot(deltaX, deltaY);
      emitter.previousPoint = emitter.point;
      emitter.point = nextPoint;
      hasInteracted = true;
      emitter.energy = Math.min(1, baseEnergy + velocity * velocityScale);
      idleFrames = 0;
      startRendering(immediate);
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType === 'touch') {
        const emitter = emitters.find(
          (candidate) => candidate.active && candidate.pointerId === event.pointerId,
        );
        if (!emitter) return;

        emitter.clientX = event.clientX;
        emitter.clientY = event.clientY;
        const location = pointWithinCanvas(event.clientX, event.clientY, touchVisualOffset);
        if (!location) {
          emitter.inside = false;
          return;
        }

        moveEmitter(emitter, location.point, location.bounds, 0.28, 0.28, 12, true);
        return;
      }

      if (emitters.some((emitter) => emitter.active)) return;
      const location = pointWithinCanvas(event.clientX, event.clientY);
      const emitter = emitters[0];
      emitter.input = 'mouse';
      if (!location) {
        emitter.hasPoint = false;
        emitter.inside = false;
        return;
      }

      moveEmitter(emitter, location.point, location.bounds, 0.12, 0.26, 16);
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || isInteractiveTarget(event.target)) return;
      if (emitters.some((emitter) => emitter.pointerId === event.pointerId)) return;

      const location = pointWithinCanvas(event.clientX, event.clientY, touchVisualOffset);
      if (!location) return;

      const availableEmitter = emitters
        .filter((emitter) => !emitter.active)
        .sort((first, second) => first.energy - second.energy)[0];
      if (!availableEmitter) return;

      availableEmitter.active = true;
      availableEmitter.clientX = event.clientX;
      availableEmitter.clientY = event.clientY;
      availableEmitter.energy = Math.max(availableEmitter.energy, 0.28);
      availableEmitter.hasPoint = true;
      availableEmitter.input = 'touch';
      availableEmitter.inside = true;
      availableEmitter.point = location.point;
      availableEmitter.pointerId = event.pointerId;
      availableEmitter.previousPoint = location.point;
      availableEmitter.scrollLinkedUntil = performance.now() + touchReleaseGrace;
      hasInteracted = true;
      idleFrames = 0;
      startRendering(true);
    };

    const handlePointerLeave = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      emitters.forEach((emitter) => {
        if (emitter.input !== 'mouse') return;
        emitter.hasPoint = false;
        emitter.inside = false;
        emitter.energy = 0;
      });
    };

    const releasePointer = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') return;
      const emitter = emitters.find(
        (candidate) => candidate.active && candidate.pointerId === event.pointerId,
      );
      if (!emitter) return;

      emitter.active = false;
      emitter.pointerId = null;
      emitter.scrollLinkedUntil = performance.now() + touchReleaseGrace;
    };

    const handleScroll = () => {
      const nextScrollPosition = window.scrollY + (window.visualViewport?.offsetTop ?? 0);
      pendingScrollDelta += nextScrollPosition - lastScrollPosition;
      lastScrollPosition = nextScrollPosition;
      if (scrollFrame) return;

      scrollFrame = window.requestAnimationFrame((now) => {
        scrollFrame = 0;
        const scrollDelta = pendingScrollDelta;
        pendingScrollDelta = 0;
        const elapsed = Math.max(16, now - lastScrollSample);
        lastScrollSample = now;
        if (Math.abs(scrollDelta) < 0.25 || !isVisible || document.hidden) return;

        const normalizedVelocity = Math.min(1, Math.abs(scrollDelta) / elapsed);
        emitters.forEach((emitter) => {
          if (
            emitter.input !== 'touch'
            || emitter.clientX === null
            || emitter.clientY === null
            || (!emitter.active && now > emitter.scrollLinkedUntil)
          ) {
            return;
          }

          const location = pointWithinCanvas(
            emitter.clientX,
            emitter.clientY,
            touchVisualOffset,
          );
          if (!location) {
            emitter.inside = false;
            return;
          }

          emitter.scrollLinkedUntil = now + 260;
          const scrollEnergy = Math.min(
            0.72,
            0.22
              + (Math.abs(scrollDelta) / Math.max(location.bounds.height, 1)) * 7
              + normalizedVelocity * 0.24,
          );
          moveEmitter(
            emitter,
            location.point,
            location.bounds,
            scrollEnergy,
            scrollEnergy,
            9,
            true,
          );
        });
      });
    };

    const handleVisibility = () => {
      if (document.hidden) stopRendering();
      else {
        emitters.forEach((emitter) => {
          emitter.active = false;
          emitter.clientX = null;
          emitter.clientY = null;
          emitter.hasPoint = false;
          emitter.inside = false;
          emitter.pointerId = null;
          emitter.scrollLinkedUntil = 0;
        });
        idleFrames = Math.min(idleFrames, 719);
        startRendering();
      }
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      canvas.dataset.motion = 'recovering';
      layer.dataset.mode = 'static';
      stopRendering();
    };

    const handleContextRestored = () => {
      delete canvas.dataset.motion;
      setContextVersion((version) => version + 1);
    };

    const resizeObserver = new ResizeObserver(resize);
    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) startRendering();
        else stopRendering();
      },
      { rootMargin: '80px' },
    );

    resize();
    startTime = performance.now();
    canvas.dataset.motion = 'ready';
    layer.dataset.mode = 'enhanced';
    resizeObserver.observe(canvas);
    visibilityObserver.observe(canvas);
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', releasePointer, { passive: true });
    window.addEventListener('pointercancel', releasePointer, { passive: true });
    window.addEventListener('pointerout', handlePointerLeave, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.visualViewport?.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
    startRendering();

    return () => {
      stopRendering();
      if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', releasePointer);
      window.removeEventListener('pointercancel', releasePointer);
      window.removeEventListener('pointerout', handlePointerLeave);
      window.removeEventListener('scroll', handleScroll);
      window.visualViewport?.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibility);
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
      destroyTargets();
      gl.deleteBuffer(buffer);
      gl.deleteTexture(textTexture);
      gl.deleteProgram(updateProgram);
      gl.deleteProgram(displayProgram);
    };
  }, [contextVersion]);

  return (
    <div ref={layerRef} className={styles.smokeLayer} data-mode="pending">
      <canvas
        ref={canvasRef}
        className={styles.smokeField}
        aria-hidden="true"
        data-smoke-canvas
      />
      <p className={styles.heroMantra}>Listen. Learn. Build.</p>
    </div>
  );
}
