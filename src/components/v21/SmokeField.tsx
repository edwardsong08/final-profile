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
  uniform vec2 uPoint;
  uniform vec2 uPreviousPoint;
  uniform float uAspect;
  uniform float uTime;
  uniform float uStep;
  uniform float uEnergy;
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

    vec2 scaledPoint = vec2(uPoint.x * uAspect, uPoint.y);
    vec2 scaledPreviousPoint = vec2(uPreviousPoint.x * uAspect, uPreviousPoint.y);
    float distanceToGesture = segmentDistance(scaledUv, scaledPreviousPoint, scaledPoint);
    float pockets = smoothstep(0.22, 0.84, noise(vUv * 27.0 + uTime * 0.12));
    float turbulence = 0.34 + pockets * 1.24;
    float core = exp(-distanceToGesture * distanceToGesture * 2300.0);
    float haze = exp(-distanceToGesture * distanceToGesture * 390.0) * 0.11;
    float injection = (core * turbulence + haze) * uEnergy;
    density = min(1.0, density + injection * 0.42);

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
    if (reducedMotion.matches || coarsePointer.matches) {
      canvas.dataset.motion = 'off';
      layer.dataset.mode = 'static';
      return;
    }

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
      point: gl.getUniformLocation(updateProgram, 'uPoint'),
      previousPoint: gl.getUniformLocation(updateProgram, 'uPreviousPoint'),
      aspect: gl.getUniformLocation(updateProgram, 'uAspect'),
      time: gl.getUniformLocation(updateProgram, 'uTime'),
      step: gl.getUniformLocation(updateProgram, 'uStep'),
      energy: gl.getUniformLocation(updateProgram, 'uEnergy'),
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
    let hasPoint = false;
    let energy = 0;
    let idleFrames = 0;
    let hasInteracted = false;
    let point: [number, number] = [0.5, 0.5];
    let previousPoint: [number, number] = point;

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
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
      canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
      updateTextTexture(bounds, pixelRatio);

      const maxSimulationWidth = bounds.width >= 900 ? 1280 : 760;
      const scale = Math.min(0.86, maxSimulationWidth / Math.max(bounds.width * pixelRatio, 1));
      simulationWidth = Math.max(384, Math.round(bounds.width * pixelRatio * scale));
      simulationHeight = Math.max(240, Math.round(bounds.height * pixelRatio * scale));
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
      gl.uniform2f(updateUniforms.point, point[0], point[1]);
      gl.uniform2f(updateUniforms.previousPoint, previousPoint[0], previousPoint[1]);
      gl.uniform1f(updateUniforms.aspect, simulationWidth / simulationHeight);
      gl.uniform1f(updateUniforms.time, (now - startTime) / 1000);
      gl.uniform1f(updateUniforms.step, elapsedStep);
      gl.uniform1f(updateUniforms.energy, energy);
      gl.uniform1f(
        updateUniforms.idleFade,
        Math.min(1, Math.max(0, (idleFrames - 210) / 360)),
      );
      drawFullscreen(updatePosition);

      frontIndex = 1 - frontIndex;
      drawDisplay(now);

      previousPoint = point;
      energy *= Math.pow(0.76, elapsedStep);
      if (energy < 0.003) energy = 0;
      idleFrames = energy > 0 ? 0 : idleFrames + 1;

      const idleLimit = hasInteracted ? 720 : 150;
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

    const startRendering = () => {
      if (animationFrame || !isVisible || document.hidden) return;
      lastFrame = performance.now();
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

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = canvas.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      ) {
        hasPoint = false;
        return;
      }

      const nextPoint: [number, number] = [
        (event.clientX - bounds.left) / bounds.width,
        1 - (event.clientY - bounds.top) / bounds.height,
      ];

      if (!hasPoint) {
        point = nextPoint;
        previousPoint = nextPoint;
        hasPoint = true;
        hasInteracted = true;
        energy = Math.max(energy, 0.12);
        idleFrames = 0;
        startRendering();
        return;
      }

      const deltaX = (nextPoint[0] - point[0]) * (bounds.width / bounds.height);
      const deltaY = nextPoint[1] - point[1];
      const velocity = Math.hypot(deltaX, deltaY);
      previousPoint = point;
      point = nextPoint;
      hasInteracted = true;
      energy = Math.min(1, 0.26 + velocity * 16);
      idleFrames = 0;
      startRendering();
    };

    const handlePointerLeave = (event: PointerEvent) => {
      if (event.relatedTarget) return;
      hasPoint = false;
      energy = 0;
    };

    const handleVisibility = () => {
      if (document.hidden) stopRendering();
      else {
        hasPoint = false;
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
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerout', handlePointerLeave, { passive: true });
    document.addEventListener('visibilitychange', handleVisibility);
    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);
    startRendering();

    return () => {
      stopRendering();
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerout', handlePointerLeave);
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
