const vertexShaderSource = `
  attribute vec2 aPosition;
  varying vec2 vUv;

  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

const rippleShaderSource = `
  precision mediump float;

  varying vec2 vUv;
  uniform sampler2D uText;
  uniform float uAspect;
  uniform float uTextReveal;
  uniform vec4 uRippleA;
  uniform vec4 uRippleB;
  uniform vec4 uRippleC;
  uniform vec4 uRippleD;

  void applyRipple(
    vec2 uv,
    vec4 ripple,
    inout vec2 displacement,
    inout float crest,
    inout float trough
  ) {
    float age = ripple.z;
    if (age < 0.0 || age > 1.08) return;

    vec2 delta = vec2((uv.x - ripple.x) * uAspect, uv.y - ripple.y);
    float distanceFromOrigin = length(delta);
    float radius = 0.015 + age * 0.27;
    float width = 0.0038 + age * 0.0018;
    float leading = exp(-pow((distanceFromOrigin - radius) / width, 2.0));
    float innerEdge = exp(
      -pow((distanceFromOrigin - (radius - 0.01)) / (width * 1.08), 2.0)
    );
    float firstWake = exp(
      -pow((distanceFromOrigin - (radius - 0.028)) / (width * 1.4), 2.0)
    ) * smoothstep(0.035, 0.1, radius);
    float secondWake = exp(
      -pow((distanceFromOrigin - (radius - 0.052)) / (width * 1.75), 2.0)
    ) * smoothstep(0.065, 0.15, radius);
    float fade = smoothstep(0.0, 0.045, age) * (1.0 - smoothstep(0.68, 1.08, age));
    float wave = (
      leading - innerEdge * 0.68 + firstWake * 0.25 - secondWake * 0.12
    ) * fade * ripple.w;
    vec2 radial = delta / max(distanceFromOrigin, 0.0001);

    displacement += vec2(radial.x / uAspect, radial.y) * wave * 0.008;
    crest += (leading + firstWake * 0.28) * fade * ripple.w;
    trough += (innerEdge * 0.74 + secondWake * 0.22) * fade * ripple.w;
  }

  void main() {
    vec2 displacement = vec2(0.0);
    float crest = 0.0;
    float trough = 0.0;

    applyRipple(vUv, uRippleA, displacement, crest, trough);
    applyRipple(vUv, uRippleB, displacement, crest, trough);
    applyRipple(vUv, uRippleC, displacement, crest, trough);
    applyRipple(vUv, uRippleD, displacement, crest, trough);

    vec2 textUv = clamp(vUv + displacement, vec2(0.001), vec2(0.999));
    float textMask = texture2D(uText, textUv).a;
    float textAlpha = textMask * uTextReveal * 0.76;
    float waveAlpha = clamp(crest * 0.27 + trough * 0.09, 0.0, 0.32);
    vec3 deepWater = vec3(0.137, 0.278, 0.353);
    vec3 clearWater = vec3(0.31, 0.47, 0.54);
    vec3 waveColor = mix(deepWater, clearWater, clamp(crest * 0.68, 0.0, 1.0));
    vec3 textColor = vec3(0.137, 0.278, 0.353);
    float combinedAlpha = waveAlpha + textAlpha * (1.0 - waveAlpha);
    vec3 combinedColor = (
      waveColor * waveAlpha + textColor * textAlpha * (1.0 - waveAlpha)
    ) / max(combinedAlpha, 0.0001);

    gl_FragColor = vec4(combinedColor, combinedAlpha);
  }
`;

type Ripple = {
  point: [number, number];
  startedAt: number;
  strength: number;
};

type SetupMobileRippleOptions = {
  canvas: HTMLCanvasElement;
  layer: HTMLDivElement;
  onContextRestored: () => void;
};

const isInteractiveTarget = (target: EventTarget | null) =>
  target instanceof Element
  && Boolean(
    target.closest(
      'a, button, input, select, textarea, summary, [contenteditable="true"], [role="button"]',
    ),
  );

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Unable to create ripple shader.');

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? 'Unknown ripple shader error.';
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
  if (!program) throw new Error('Unable to create ripple program.');

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.deleteShader(vertexShader);
  gl.deleteShader(fragmentShader);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? 'Unknown ripple program error.';
    gl.deleteProgram(program);
    throw new Error(message);
  }

  return program;
}

export function setupMobileRipple({
  canvas,
  layer,
  onContextRestored,
}: SetupMobileRippleOptions) {
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
    canvas.dataset.effect = 'ripple';
    layer.dataset.mode = 'static';
    return () => undefined;
  }

  let program: WebGLProgram;
  try {
    program = createProgram(gl, vertexShaderSource, rippleShaderSource);
  } catch {
    canvas.dataset.motion = 'unavailable';
    canvas.dataset.effect = 'ripple';
    layer.dataset.mode = 'static';
    return () => undefined;
  }

  const buffer = gl.createBuffer();
  const textTexture = gl.createTexture();
  if (!buffer || !textTexture) {
    if (buffer) gl.deleteBuffer(buffer);
    if (textTexture) gl.deleteTexture(textTexture);
    gl.deleteProgram(program);
    canvas.dataset.motion = 'unavailable';
    canvas.dataset.effect = 'ripple';
    layer.dataset.mode = 'static';
    return () => undefined;
  }

  const position = gl.getAttribLocation(program, 'aPosition');
  const uniforms = {
    aspect: gl.getUniformLocation(program, 'uAspect'),
    rippleA: gl.getUniformLocation(program, 'uRippleA'),
    rippleB: gl.getUniformLocation(program, 'uRippleB'),
    rippleC: gl.getUniformLocation(program, 'uRippleC'),
    rippleD: gl.getUniformLocation(program, 'uRippleD'),
    text: gl.getUniformLocation(program, 'uText'),
    textReveal: gl.getUniformLocation(program, 'uTextReveal'),
  };
  const rippleUniforms = [
    uniforms.rippleA,
    uniforms.rippleB,
    uniforms.rippleC,
    uniforms.rippleD,
  ];
  const textCanvas = document.createElement('canvas');
  const textContext = textCanvas.getContext('2d');

  if (!textContext) {
    gl.deleteBuffer(buffer);
    gl.deleteTexture(textTexture);
    gl.deleteProgram(program);
    canvas.dataset.motion = 'unavailable';
    canvas.dataset.effect = 'ripple';
    layer.dataset.mode = 'static';
    return () => undefined;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
    gl.STATIC_DRAW,
  );
  gl.bindTexture(gl.TEXTURE_2D, textTexture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const ripples: Ripple[] = [];
  const minimumFrameInterval = 1000 / 45;
  let animationFrame = 0;
  let isVisible = true;
  let lastFrame = performance.now();
  let startTime = lastFrame;

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
    if ('letterSpacing' in textContext) textContext.letterSpacing = '0.015em';
    textContext.fillText(
      'Listen. Learn. Build.',
      textCanvas.width / 2,
      textCanvas.height * mantraPosition,
    );

    gl.activeTexture(gl.TEXTURE0);
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

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    const requestedRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    const pixelRatio = Math.min(
      requestedRatio,
      620 / Math.max(bounds.width, 1),
      900 / Math.max(bounds.height, 1),
    );
    canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
    canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
    updateTextTexture(bounds, pixelRatio);
  };

  const draw = (now: number) => {
    const activeRipples = ripples
      .map((ripple) => ({ ...ripple, age: (now - ripple.startedAt) / 1000 }))
      .filter((ripple) => ripple.age <= 1.08);
    ripples.splice(
      0,
      ripples.length,
      ...activeRipples.map((ripple) => ({
        point: ripple.point,
        startedAt: ripple.startedAt,
        strength: ripple.strength,
      })),
    );

    gl.disable(gl.BLEND);
    gl.useProgram(program);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textTexture);
    gl.uniform1i(uniforms.text, 0);
    gl.uniform1f(uniforms.aspect, canvas.width / canvas.height);
    gl.uniform1f(
      uniforms.textReveal,
      Math.min(1, Math.max(0, ((now - startTime) / 1000 - 0.28) / 1.35)),
    );

    rippleUniforms.forEach((uniform, index) => {
      const ripple = activeRipples[index];
      if (ripple) {
        gl.uniform4f(
          uniform,
          ripple.point[0],
          ripple.point[1],
          ripple.age,
          ripple.strength,
        );
      } else {
        gl.uniform4f(uniform, -2, -2, -1, 0);
      }
    });

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  };

  const render = (now: number) => {
    animationFrame = 0;
    if (now - lastFrame < minimumFrameInterval) {
      if (isVisible && !document.hidden) {
        animationFrame = window.requestAnimationFrame(render);
      }
      return;
    }

    lastFrame = now;
    draw(now);
    const textIsRevealing = now - startTime < 1900;
    if (isVisible && !document.hidden && (ripples.length > 0 || textIsRevealing)) {
      animationFrame = window.requestAnimationFrame(render);
    }
  };

  const startRendering = (immediate = false) => {
    if (animationFrame || !isVisible || document.hidden) return;
    const now = performance.now();
    lastFrame = immediate ? now - minimumFrameInterval : now;
    animationFrame = window.requestAnimationFrame(render);
  };

  const stopRendering = () => {
    if (!animationFrame) return;
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  };

  const addRipple = (clientX: number, clientY: number) => {
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

    if (ripples.length >= 4) ripples.shift();
    ripples.push({
      point: [
        (clientX - bounds.left) / bounds.width,
        1 - (clientY - bounds.top) / bounds.height,
      ],
      startedAt: performance.now(),
      strength: 1,
    });
    startRendering(true);
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (event.button !== 0 || isInteractiveTarget(event.target)) return;
    addRipple(event.clientX, event.clientY);
  };

  const handleTouchStart = (event: TouchEvent) => {
    if (isInteractiveTarget(event.target)) return;
    Array.from(event.changedTouches).forEach((touch) => {
      addRipple(touch.clientX, touch.clientY);
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
  const supportsPointerEvents = 'PointerEvent' in window;

  resize();
  startTime = performance.now();
  canvas.dataset.effect = 'ripple';
  canvas.dataset.motion = 'ready';
  layer.dataset.mode = 'enhanced';
  resizeObserver.observe(canvas);
  visibilityObserver.observe(canvas);
  if (supportsPointerEvents) {
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
  } else {
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
  }
  document.addEventListener('visibilitychange', handleVisibility);
  canvas.addEventListener('webglcontextlost', handleContextLost);
  canvas.addEventListener('webglcontextrestored', handleContextRestored);
  startRendering();

  return () => {
    stopRendering();
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    if (supportsPointerEvents) {
      window.removeEventListener('pointerdown', handlePointerDown);
    } else {
      window.removeEventListener('touchstart', handleTouchStart);
    }
    document.removeEventListener('visibilitychange', handleVisibility);
    canvas.removeEventListener('webglcontextlost', handleContextLost);
    canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    gl.deleteBuffer(buffer);
    gl.deleteTexture(textTexture);
    gl.deleteProgram(program);
    delete canvas.dataset.effect;
  };
}
