import {
  Mesh,
  Program,
  Renderer,
  RenderTarget,
  Texture,
  Triangle,
  Vec2,
} from 'ogl';
import { advanceRippleClock, RIPPLE_STEP_MS } from './rippleTiming';

const fullscreenVertexShader = `
  attribute vec2 uv;
  attribute vec2 position;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const simulationFragmentShader = `
  precision highp float;

  varying vec2 vUv;
  uniform sampler2D tState;
  uniform vec2 uTexel;
  uniform float uAspect;
  uniform float uEncoded;
  uniform vec4 uTouchA;
  uniform vec4 uTouchB;

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

  vec2 decodeState(vec4 state) {
    vec2 encoded = (state.rg - vec2(128.0 / 255.0)) * vec2(0.5, 0.06);
    return mix(state.rg, encoded, uEncoded);
  }

  vec2 encodeState(vec2 state) {
    vec2 encoded = state / vec2(0.5, 0.06) + vec2(128.0 / 255.0);
    return mix(state, clamp(encoded, 0.0, 1.0), uEncoded);
  }

  float touchImpulse(vec4 touch) {
    if (touch.z <= 0.0) return 0.0;

    vec2 delta = vUv - touch.xy;
    delta.x *= uAspect;
    float angle = touch.w * 6.2831853;
    mat2 rotation = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    vec2 shaped = rotation * delta;
    vec2 primaryShape = shaped * vec2(1.0, 1.34);
    vec2 companionShape = (shaped - vec2(0.014, -0.006)) * vec2(1.18, 0.92);
    float primaryRadius = dot(primaryShape, primaryShape);
    float companionRadius = dot(companionShape, companionShape);
    float primary = (1.0 - primaryRadius * 880.0)
      * exp(-primaryRadius * 560.0);
    float companion = (1.0 - companionRadius * 1320.0)
      * exp(-companionRadius * 840.0) * 0.18;
    return (primary + companion) * touch.z;
  }

  void main() {
    vec2 centerState = decodeState(texture2D(tState, vUv));
    float left = decodeState(texture2D(tState, vUv - vec2(uTexel.x, 0.0))).x;
    float right = decodeState(texture2D(tState, vUv + vec2(uTexel.x, 0.0))).x;
    float below = decodeState(texture2D(tState, vUv - vec2(0.0, uTexel.y))).x;
    float above = decodeState(texture2D(tState, vUv + vec2(0.0, uTexel.y))).x;
    float lowerLeft = decodeState(texture2D(tState, vUv - uTexel)).x;
    float upperRight = decodeState(texture2D(tState, vUv + uTexel)).x;
    float upperLeft = decodeState(
      texture2D(tState, vUv + vec2(-uTexel.x, uTexel.y))
    ).x;
    float lowerRight = decodeState(
      texture2D(tState, vUv + vec2(uTexel.x, -uTexel.y))
    ).x;

    float cardinalAverage = (left + right + below + above) * 0.25;
    float diagonalAverage = (
      lowerLeft + upperRight + upperLeft + lowerRight
    ) * 0.25;
    float neighborhood = cardinalAverage * 0.82 + diagonalAverage * 0.18;
    float medium = 0.955 + noise(vUv * vec2(7.1, 9.3) + vec2(2.7, 5.1)) * 0.09;
    float height = centerState.x;
    float velocity = centerState.y;
    velocity += (neighborhood - height) * 0.62 * medium;
    velocity += (touchImpulse(uTouchA) + touchImpulse(uTouchB)) * 0.018;
    velocity *= 0.989;
    height = (height + velocity) * 0.9994;

    float edge = smoothstep(0.0, 0.045, vUv.x)
      * smoothstep(0.0, 0.045, vUv.y)
      * smoothstep(0.0, 0.045, 1.0 - vUv.x)
      * smoothstep(0.0, 0.045, 1.0 - vUv.y);
    height *= mix(0.91, 1.0, edge);
    velocity *= mix(0.88, 1.0, edge);

    vec2 outputState = encodeState(vec2(height, velocity));
    gl_FragColor = vec4(outputState, 0.0, 1.0);
  }
`;

const displayFragmentShader = `
  precision highp float;

  varying vec2 vUv;
  uniform sampler2D tState;
  uniform sampler2D tText;
  uniform vec2 uTexel;
  uniform float uAspect;
  uniform float uEncoded;
  uniform float uEffectStrength;
  uniform float uTextReveal;

  float decodeHeight(vec4 state) {
    return mix(state.r, (state.r - 128.0 / 255.0) * 0.5, uEncoded);
  }

  void main() {
    float height = decodeHeight(texture2D(tState, vUv));
    float left = decodeHeight(texture2D(tState, vUv - vec2(uTexel.x, 0.0)));
    float right = decodeHeight(texture2D(tState, vUv + vec2(uTexel.x, 0.0)));
    float below = decodeHeight(texture2D(tState, vUv - vec2(0.0, uTexel.y)));
    float above = decodeHeight(texture2D(tState, vUv + vec2(0.0, uTexel.y)));
    vec2 slope = vec2(right - left, above - below);
    vec3 normal = normalize(vec3(-slope.x * 30.0, -slope.y * 30.0, 1.0));
    vec3 lightDirection = normalize(vec3(-0.42, 0.56, 0.72));
    vec2 refraction = vec2(slope.x / uAspect, slope.y)
      * 1.18 * uEffectStrength;
    vec2 textUv = clamp(vUv + refraction, vec2(0.001), vec2(0.999));
    vec4 artwork = texture2D(tText, textUv);
    float paperLuma = dot(artwork.rgb, vec3(0.299, 0.587, 0.114));
    float chroma = max(max(artwork.r, artwork.g), artwork.b)
      - min(min(artwork.r, artwork.g), artwork.b);
    float pigmentMask = max(
      1.0 - smoothstep(0.68, 0.94, paperLuma),
      smoothstep(0.015, 0.09, chroma) * 0.62
    );
    float waveEnergy = smoothstep(0.00014, 0.0048, length(slope));
    float displacedBody = smoothstep(0.003, 0.052, abs(height));
    float waterDispersal = clamp(waveEnergy * 0.82 + displacedBody * 0.18, 0.0, 0.88);
    float textAlpha = artwork.a * pigmentMask * uTextReveal * 0.76 * (1.0 - waterDispersal);

    float gradient = length(slope);
    float disturbance = smoothstep(0.00018, 0.0065, gradient);
    float curvature = left + right + below + above - height * 4.0;
    float waveFront = smoothstep(0.00016, 0.0034, abs(curvature));
    float directionalShadow = max(0.0, dot(slope, vec2(0.68, -0.74))) * 58.0;
    float specular = pow(max(dot(normal, lightDirection), 0.0), 22.0);
    float surfaceAlpha = clamp(
      waveFront * 0.058 + specular * disturbance * 0.022,
      0.0,
      0.15
    ) * uEffectStrength;
    vec3 clearWater = vec3(0.34, 0.47, 0.52);
    vec3 mineralShadow = vec3(0.13, 0.25, 0.31);
    vec3 surfaceColor = mix(
      clearWater,
      mineralShadow,
      clamp(directionalShadow * 1.7, 0.0, 1.0)
    );
    vec3 textColor = artwork.rgb;
    float combinedAlpha = surfaceAlpha + textAlpha * (1.0 - surfaceAlpha);
    vec3 combinedColor = (
      surfaceColor * surfaceAlpha + textColor * textAlpha * (1.0 - surfaceAlpha)
    ) / max(combinedAlpha, 0.0001);

    gl_FragColor = vec4(combinedColor, combinedAlpha);
  }
`;

type RippleImpulse = {
  point: [number, number];
  seed: number;
  strength: number;
};

type TrackedTouch = {
  x: number;
  y: number;
  sampledAt: number;
};

type SetupMobileRippleOptions = {
  canvas: HTMLCanvasElement;
  layer: HTMLDivElement;
  onContextRestored: () => void;
  onReady?: () => void;
};

const isInteractiveTarget = (target: EventTarget | null) =>
  target instanceof Element
  && Boolean(
    target.closest(
      'a, button, input, select, textarea, summary, [contenteditable="true"], [role="button"]',
    ),
  );

const destroyRenderTarget = (
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  target: RenderTarget,
) => {
  target.textures.forEach((texture) => gl.deleteTexture(texture.texture));
  gl.deleteFramebuffer(target.buffer);
};

export function setupMobileRipple({
  canvas,
  layer,
  onContextRestored,
  onReady,
}: SetupMobileRippleOptions) {
  let renderer: Renderer;
  try {
    renderer = new Renderer({
      canvas,
      width: 1,
      height: 1,
      dpr: 1,
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: 'high-performance',
    });
  } catch {
    canvas.dataset.motion = 'unavailable';
    canvas.dataset.effect = 'ripple';
    layer.dataset.mode = 'static';
    return () => undefined;
  }

  // OGL initializes canvases with an explicit pixel size. Restore the layer's
  // responsive sizing before measuring it, while retaining a capped backing
  // buffer in resize() below.
  canvas.style.width = '100%';
  canvas.style.height = '100%';

  const gl = renderer.gl;
  const geometry = new Triangle(gl);
  const supportsHalfFloat = renderer.isWebgl2
    && Boolean(renderer.getExtension('EXT_color_buffer_float'));
  let encodedState = !supportsHalfFloat;

  const createStateTarget = (encoded: boolean) => new RenderTarget(gl, {
    width: 160,
    height: 320,
    type: encoded ? gl.UNSIGNED_BYTE : (gl as WebGL2RenderingContext).HALF_FLOAT,
    format: gl.RGBA,
    internalFormat: encoded
      ? gl.RGBA
      : (gl as WebGL2RenderingContext).RGBA16F,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
    depth: false,
    stencil: false,
    unpackAlignment: 1,
  });

  let readTarget = createStateTarget(encodedState);
  let writeTarget = createStateTarget(encodedState);
  renderer.bindFramebuffer(readTarget);
  const framebufferIsComplete = gl.checkFramebufferStatus(gl.FRAMEBUFFER)
    === gl.FRAMEBUFFER_COMPLETE;

  if (!framebufferIsComplete && !encodedState) {
    destroyRenderTarget(gl, readTarget);
    destroyRenderTarget(gl, writeTarget);
    encodedState = true;
    readTarget = createStateTarget(true);
    writeTarget = createStateTarget(true);
  }
  renderer.bindFramebuffer();

  const touchA = new Float32Array([-2, -2, 0, 0]);
  const touchB = new Float32Array([-2, -2, 0, 0]);
  const simulationTexel = new Vec2(1 / readTarget.width, 1 / readTarget.height);
  const simulationProgram = new Program(gl, {
    vertex: fullscreenVertexShader,
    fragment: simulationFragmentShader,
    uniforms: {
      tState: { value: readTarget.texture },
      uTexel: { value: simulationTexel },
      uAspect: { value: readTarget.width / readTarget.height },
      uEncoded: { value: encodedState ? 1 : 0 },
      uTouchA: { value: touchA },
      uTouchB: { value: touchB },
    },
    cullFace: false,
    depthTest: false,
    depthWrite: false,
  });
  const simulationMesh = new Mesh(gl, {
    geometry,
    program: simulationProgram,
    frustumCulled: false,
  });

  const textCanvas = document.createElement('canvas');
  const textContext = textCanvas.getContext('2d');
  if (!textContext) {
    geometry.remove();
    simulationProgram.remove();
    destroyRenderTarget(gl, readTarget);
    destroyRenderTarget(gl, writeTarget);
    canvas.dataset.motion = 'unavailable';
    canvas.dataset.effect = 'ripple';
    layer.dataset.mode = 'static';
    return () => undefined;
  }

  const textTexture = new Texture(gl, {
    image: textCanvas,
    generateMipmaps: false,
    minFilter: gl.LINEAR,
    magFilter: gl.LINEAR,
    wrapS: gl.CLAMP_TO_EDGE,
    wrapT: gl.CLAMP_TO_EDGE,
    flipY: true,
    premultiplyAlpha: false,
  });
  const displayProgram = new Program(gl, {
    vertex: fullscreenVertexShader,
    fragment: displayFragmentShader,
    uniforms: {
      tState: { value: readTarget.texture },
      tText: { value: textTexture },
      uTexel: { value: simulationTexel },
      uAspect: { value: readTarget.width / readTarget.height },
      uEncoded: { value: encodedState ? 1 : 0 },
      uEffectStrength: { value: 0 },
      uTextReveal: { value: 0 },
    },
    cullFace: false,
    depthTest: false,
    depthWrite: false,
  });
  const displayMesh = new Mesh(gl, {
    geometry,
    program: displayProgram,
    frustumCulled: false,
  });

  if (
    !gl.getProgramParameter(simulationProgram.program, gl.LINK_STATUS)
    || !gl.getProgramParameter(displayProgram.program, gl.LINK_STATUS)
  ) {
    geometry.remove();
    simulationProgram.remove();
    displayProgram.remove();
    gl.deleteTexture(textTexture.texture);
    destroyRenderTarget(gl, readTarget);
    destroyRenderTarget(gl, writeTarget);
    canvas.dataset.motion = 'unavailable';
    canvas.dataset.effect = 'ripple';
    layer.dataset.mode = 'static';
    return () => undefined;
  }

  const pendingImpulses: RippleImpulse[] = [];
  const rippleLifetime = 4200;
  const rippleFadeDuration = 1200;
  let simulationRemainder = 0;
  let activeUntil = 0;
  let animationFrame = 0;
  let isVisible = true;
  let lastFrame = performance.now();
  let needsReset = false;
  let startTime = lastFrame;

  const clearStateTargets = () => {
    const flatValue = encodedState ? 128 / 255 : 0;
    gl.clearColor(flatValue, flatValue, 0, 1);
    renderer.bindFramebuffer(readTarget);
    gl.clear(gl.COLOR_BUFFER_BIT);
    renderer.bindFramebuffer(writeTarget);
    gl.clear(gl.COLOR_BUFFER_BIT);
    renderer.bindFramebuffer();
    gl.clearColor(0, 0, 0, 0);
  };

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
    textContext.clearRect(0, 0, textCanvas.width, textCanvas.height);
    const artworkWidth = Math.min(textCanvas.width * 0.9, bounds.width * pixelRatio * 0.92);
    const artworkHeight = artworkWidth * (1024 / 1536);
    if (layer.dataset.ambient !== 'true' && artworkImage.complete && artworkImage.naturalWidth > 0) {
      textContext.drawImage(
        artworkImage,
        (textCanvas.width - artworkWidth) / 2,
        textCanvas.height * mantraPosition - artworkHeight / 2,
        artworkWidth,
        artworkHeight,
      );
    }
    textTexture.image = textCanvas;
    textTexture.needsUpdate = true;
  };

  const artworkImage = new Image();
  artworkImage.decoding = 'async';
  artworkImage.onload = () => {
    updateTextTexture(
      canvas.getBoundingClientRect(),
      Math.min(window.devicePixelRatio || 1, 2),
    );
    startRendering(true);
    onReady?.();
  };
  artworkImage.src = '/hero-watercolor-territory-mobile-v2.png';

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    const requestedRatio = Math.min(window.devicePixelRatio || 1, 2);
    const pixelRatio = Math.min(
      requestedRatio,
      900 / Math.max(bounds.width, 1),
      1400 / Math.max(bounds.height, 1),
      Math.sqrt(1_200_000 / Math.max(1, bounds.width * bounds.height)),
    );
    renderer.dpr = pixelRatio;
    renderer.setSize(bounds.width, bounds.height);
    canvas.style.width = '100%';
    canvas.style.height = '100%';

    const aspect = Math.max(0.25, bounds.width / Math.max(bounds.height, 1));
    const longEdge = 320;
    const simulationWidth = aspect >= 1
      ? longEdge
      : Math.max(144, Math.round(longEdge * aspect));
    const simulationHeight = aspect >= 1
      ? Math.max(144, Math.round(longEdge / aspect))
      : longEdge;
    readTarget.setSize(simulationWidth, simulationHeight);
    writeTarget.setSize(simulationWidth, simulationHeight);
    simulationTexel.set(1 / simulationWidth, 1 / simulationHeight);
    simulationProgram.uniforms.uAspect.value = simulationWidth / simulationHeight;
    displayProgram.uniforms.uAspect.value = simulationWidth / simulationHeight;
    clearStateTargets();
    updateTextTexture(bounds, pixelRatio);
    needsReset = false;
  };

  const setTouchUniform = (
    target: Float32Array,
    impulse: RippleImpulse | undefined,
  ) => {
    if (!impulse) {
      target.set([-2, -2, 0, 0]);
      return;
    }
    target.set([
      impulse.point[0],
      impulse.point[1],
      impulse.strength,
      impulse.seed,
    ]);
  };

  const simulate = (steps: number) => {
    for (let step = 0; step < steps; step += 1) {
      const impulses = pendingImpulses.splice(0, 2);
      setTouchUniform(touchA, impulses[0]);
      setTouchUniform(touchB, impulses[1]);
      simulationProgram.uniforms.tState.value = readTarget.texture;
      renderer.render({
        scene: simulationMesh,
        target: writeTarget,
        clear: false,
        update: false,
        sort: false,
        frustumCull: false,
      });
      [readTarget, writeTarget] = [writeTarget, readTarget];
    }
    displayProgram.uniforms.tState.value = readTarget.texture;
  };

  const drawDisplay = (now: number) => {
    const remainingLifetime = Math.max(0, activeUntil - now);
    const fadeStrength = Math.min(1, remainingLifetime / rippleFadeDuration);
    displayProgram.uniforms.uEffectStrength.value = fadeStrength
      * fadeStrength * (3 - 2 * fadeStrength);
    displayProgram.uniforms.uTextReveal.value = Math.min(
      1,
      Math.max(0, ((now - startTime) / 1000 - 0.28) / 1.35),
    );
    gl.clearColor(0, 0, 0, 0);
    renderer.render({
      scene: displayMesh,
      clear: true,
      update: false,
      sort: false,
      frustumCull: false,
    });
  };

  const render = (now: number) => {
    animationFrame = 0;
    const elapsed = now - lastFrame;
    lastFrame = now;
    const simulationIsActive = now < activeUntil || pendingImpulses.length > 0;
    if (simulationIsActive) {
      const timing = advanceRippleClock(simulationRemainder, elapsed);
      simulationRemainder = timing.remainder;
      simulate(timing.steps);
    }
    else if (needsReset) {
      clearStateTargets();
      displayProgram.uniforms.tState.value = readTarget.texture;
      needsReset = false;
    }
    drawDisplay(now);

    const textIsRevealing = now - startTime < 1900;
    if (isVisible && !document.hidden && (simulationIsActive || textIsRevealing)) {
      animationFrame = window.requestAnimationFrame(render);
    }
  };

  const startRendering = (immediate = false) => {
    if (animationFrame || !isVisible || document.hidden) return;
    const now = performance.now();
    simulationRemainder = 0;
    lastFrame = immediate ? now - RIPPLE_STEP_MS : now;
    animationFrame = window.requestAnimationFrame(render);
  };

  const stopRendering = () => {
    if (!animationFrame) return;
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  };

  const addImpulse = (
    clientX: number,
    clientY: number,
    strength = 1,
  ) => {
    const bounds = canvas.getBoundingClientRect();
    if (
      bounds.width <= 0
      || bounds.height <= 0
      || clientX < bounds.left
      || clientX > bounds.right
      || clientY < bounds.top
      || clientY > bounds.bottom
    ) {
      return;
    }

    const now = performance.now();
    if (needsReset && now >= activeUntil) clearStateTargets();
    activeUntil = now + rippleLifetime;
    needsReset = true;
    if (pendingImpulses.length >= 6) pendingImpulses.shift();
    pendingImpulses.push({
      point: [
        (clientX - bounds.left) / bounds.width,
        1 - (clientY - bounds.top) / bounds.height,
      ],
      seed: (clientX * 0.017 + clientY * 0.011 + now * 0.0007) % 1,
      strength,
    });
    startRendering(true);
  };

  const activePointers = new Map<number, TrackedTouch>();
  const activeTouches = new Map<number, TrackedTouch>();

  const handlePointerDown = (event: PointerEvent) => {
    if (
      event.pointerType === 'touch'
      || event.button !== 0
      || isInteractiveTarget(event.target)
    ) return;
    activePointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
      sampledAt: event.timeStamp,
    });
    addImpulse(event.clientX, event.clientY);
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    const previous = activePointers.get(event.pointerId);
    if (!previous) return;

    const distance = Math.hypot(
      event.clientX - previous.x,
      event.clientY - previous.y,
    );
    if (distance < 8 && event.timeStamp - previous.sampledAt < 32) return;

    activePointers.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
      sampledAt: event.timeStamp,
    });
    addImpulse(
      event.clientX,
      event.clientY,
      Math.min(0.82, 0.38 + distance / 72),
    );
  };

  const releasePointer = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return;
    activePointers.delete(event.pointerId);
  };

  const handleTouchStart = (event: TouchEvent) => {
    if (isInteractiveTarget(event.target)) return;
    Array.from(event.changedTouches).forEach((touch) => {
      activeTouches.set(touch.identifier, {
        x: touch.clientX,
        y: touch.clientY,
        sampledAt: event.timeStamp,
      });
      addImpulse(touch.clientX, touch.clientY);
    });
  };

  const handleTouchMove = (event: TouchEvent) => {
    Array.from(event.changedTouches).forEach((touch) => {
      const previous = activeTouches.get(touch.identifier);
      if (!previous) return;

      const distance = Math.hypot(
        touch.clientX - previous.x,
        touch.clientY - previous.y,
      );
      if (distance < 8 && event.timeStamp - previous.sampledAt < 32) return;

      activeTouches.set(touch.identifier, {
        x: touch.clientX,
        y: touch.clientY,
        sampledAt: event.timeStamp,
      });
      addImpulse(
        touch.clientX,
        touch.clientY,
        Math.min(0.82, 0.38 + distance / 72),
      );
    });
  };

  const releaseTouches = (event: TouchEvent) => {
    Array.from(event.changedTouches).forEach((touch) => {
      activeTouches.delete(touch.identifier);
    });
  };

  const handleVisibility = () => {
    if (document.hidden) stopRendering();
    else startRendering(true);
  };

  const handleContextLost = (event: Event) => {
    event.preventDefault();
    canvas.dataset.motion = 'recovering';
    layer.dataset.mode = 'static';
    stopRendering();
  };

  const handleContextRestored = () => {
    delete canvas.dataset.motion;
    onContextRestored();
  };

  const resizeObserver = new ResizeObserver(() => {
    resize();
    startRendering(true);
  });
  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) startRendering(true);
      else stopRendering();
    },
    { rootMargin: '80px' },
  );
  resize();
  clearStateTargets();
  startTime = performance.now();
  canvas.dataset.effect = 'ripple';
  canvas.dataset.motion = 'ready';
  layer.dataset.mode = 'enhanced';
  resizeObserver.observe(canvas);
  visibilityObserver.observe(canvas);
  if ('PointerEvent' in window) {
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', releasePointer, { passive: true });
    window.addEventListener('pointercancel', releasePointer, { passive: true });
  }
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchmove', handleTouchMove, { passive: true });
  window.addEventListener('touchend', releaseTouches, { passive: true });
  window.addEventListener('touchcancel', releaseTouches, { passive: true });
  document.addEventListener('visibilitychange', handleVisibility);
  canvas.addEventListener('webglcontextlost', handleContextLost);
  canvas.addEventListener('webglcontextrestored', handleContextRestored);
  startRendering();

  return () => {
    stopRendering();
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    if ('PointerEvent' in window) {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', releasePointer);
      window.removeEventListener('pointercancel', releasePointer);
    }
    window.removeEventListener('touchstart', handleTouchStart);
    window.removeEventListener('touchmove', handleTouchMove);
    window.removeEventListener('touchend', releaseTouches);
    window.removeEventListener('touchcancel', releaseTouches);
    document.removeEventListener('visibilitychange', handleVisibility);
    canvas.removeEventListener('webglcontextlost', handleContextLost);
    canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    geometry.remove();
    simulationProgram.remove();
    displayProgram.remove();
    gl.deleteTexture(textTexture.texture);
    destroyRenderTarget(gl, readTarget);
    destroyRenderTarget(gl, writeTarget);
    delete canvas.dataset.effect;
  };
}
