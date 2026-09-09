const arrivalSmoke = new URLSearchParams(location.search).get("refinement") === "arrival";
/*
MIT License

Copyright (c) 2017 Pavel Dobryakov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict';

// Local watercolor study; upstream MIT license retained.

const canvas = document.getElementsByTagName('canvas')[0];
resizeCanvas();

let config = {
    SIM_RESOLUTION: 192,
    DYE_RESOLUTION: 1024,
    CAPTURE_RESOLUTION: 512,
    DENSITY_DISSIPATION: 0,
    VELOCITY_DISSIPATION: new URLSearchParams(location.search).get('refinement') === 'light' || arrivalSmoke ? 5.25 : 4.2,
    PRESSURE: 0.8,
    PRESSURE_ITERATIONS: 20,
    CURL: new URLSearchParams(location.search).has('water') ? 5 : 14,
    SPLAT_RADIUS: 0.16,
    SPLAT_FORCE: new URLSearchParams(location.search).has('water') ? 320 : 400,
    SHADING: false,
    COLORFUL: false,
    COLOR_UPDATE_SPEED: 10,
    PAUSED: false,
    BACK_COLOR: { r: 0, g: 0, b: 0 },
    TRANSPARENT: false,
    BLOOM: false,
    BLOOM_ITERATIONS: 8,
    BLOOM_RESOLUTION: 256,
    BLOOM_INTENSITY: 0.8,
    BLOOM_THRESHOLD: 0.6,
    BLOOM_SOFT_KNEE: 0.7,
    SUNRAYS: false,
    SUNRAYS_RESOLUTION: 196,
    SUNRAYS_WEIGHT: 1.0,
}

function pointerPrototype () {
    this.id = -1;
    this.texcoordX = 0;
    this.texcoordY = 0;
    this.prevTexcoordX = 0;
    this.prevTexcoordY = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.down = false;
    this.moved = false;
    this.color = [30, 0, 300];
}

let pointers = [];
let splatStack = [];
pointers.push(new pointerPrototype());

const { gl, ext } = getWebGLContext(canvas);

if (isMobile()) {
    config.DYE_RESOLUTION = 512;
}
if (!ext.supportLinearFiltering) {
    config.DYE_RESOLUTION = 512;
    config.SHADING = false;
    config.BLOOM = false;
    config.SUNRAYS = false;
}



function getWebGLContext (canvas) {
    const params = { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };

    let gl = canvas.getContext('webgl2', params);
    const isWebGL2 = !!gl;
    if (!isWebGL2)
        gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);

    let halfFloat;
    let supportLinearFiltering;
    if (isWebGL2) {
        gl.getExtension('EXT_color_buffer_float');
        supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
    } else {
        halfFloat = gl.getExtension('OES_texture_half_float');
        supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat.HALF_FLOAT_OES;
    let formatRGBA;
    let formatRG;
    let formatR;

    if (isWebGL2)
    {
        formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
        formatR = getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
    }
    else
    {
        formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
        formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
    }



    return {
        gl,
        ext: {
            formatRGBA,
            formatRG,
            formatR,
            halfFloatTexType,
            supportLinearFiltering
        }
    };
}

function getSupportedFormat (gl, internalFormat, format, type)
{
    if (!supportRenderTextureFormat(gl, internalFormat, format, type))
    {
        switch (internalFormat)
        {
            case gl.R16F:
                return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
            case gl.RG16F:
                return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
            default:
                return null;
        }
    }

    return {
        internalFormat,
        format
    }
}

function supportRenderTextureFormat (gl, internalFormat, format, type) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

    let fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    return status == gl.FRAMEBUFFER_COMPLETE;
}

function startGUI () {
    var gui = new dat.GUI({ width: 300 });
    gui.add(config, 'DYE_RESOLUTION', { 'high': 1024, 'medium': 512, 'low': 256, 'very low': 128 }).name('quality').onFinishChange(initFramebuffers);
    gui.add(config, 'SIM_RESOLUTION', { '32': 32, '64': 64, '128': 128, '256': 256 }).name('sim resolution').onFinishChange(initFramebuffers);
    gui.add(config, 'DENSITY_DISSIPATION', 0, 4.0).name('density diffusion');
    gui.add(config, 'VELOCITY_DISSIPATION', 0, 4.0).name('velocity diffusion');
    gui.add(config, 'PRESSURE', 0.0, 1.0).name('pressure');
    gui.add(config, 'CURL', 0, 50).name('vorticity').step(1);
    gui.add(config, 'SPLAT_RADIUS', 0.01, 1.0).name('splat radius');
    gui.add(config, 'SHADING').name('shading').onFinishChange(updateKeywords);
    gui.add(config, 'COLORFUL').name('colorful');
    gui.add(config, 'PAUSED').name('paused').listen();

    gui.add({ fun: () => {
        splatStack.push(parseInt(Math.random() * 20) + 5);
    } }, 'fun').name('Random splats');

    let bloomFolder = gui.addFolder('Bloom');
    bloomFolder.add(config, 'BLOOM').name('enabled').onFinishChange(updateKeywords);
    bloomFolder.add(config, 'BLOOM_INTENSITY', 0.1, 2.0).name('intensity');
    bloomFolder.add(config, 'BLOOM_THRESHOLD', 0.0, 1.0).name('threshold');

    let sunraysFolder = gui.addFolder('Sunrays');
    sunraysFolder.add(config, 'SUNRAYS').name('enabled').onFinishChange(updateKeywords);
    sunraysFolder.add(config, 'SUNRAYS_WEIGHT', 0.3, 1.0).name('weight');

    let captureFolder = gui.addFolder('Capture');
    captureFolder.addColor(config, 'BACK_COLOR').name('background color');
    captureFolder.add(config, 'TRANSPARENT').name('transparent');
    captureFolder.add({ fun: captureScreenshot }, 'fun').name('take screenshot');

    let github = gui.add({ fun : () => {
        window.open('https://github.com/PavelDoGreat/WebGL-Fluid-Simulation');

    } }, 'fun').name('Github');
    github.__li.className = 'cr function bigFont';
    github.__li.style.borderLeft = '3px solid #8C8C8C';
    let githubIcon = document.createElement('span');
    github.domElement.parentElement.appendChild(githubIcon);
    githubIcon.className = 'icon github';

    let twitter = gui.add({ fun : () => {

        window.open('https://twitter.com/PavelDoGreat');
    } }, 'fun').name('Twitter');
    twitter.__li.className = 'cr function bigFont';
    twitter.__li.style.borderLeft = '3px solid #8C8C8C';
    let twitterIcon = document.createElement('span');
    twitter.domElement.parentElement.appendChild(twitterIcon);
    twitterIcon.className = 'icon twitter';

    let discord = gui.add({ fun : () => {

        window.open('https://discordapp.com/invite/CeqZDDE');
    } }, 'fun').name('Discord');
    discord.__li.className = 'cr function bigFont';
    discord.__li.style.borderLeft = '3px solid #8C8C8C';
    let discordIcon = document.createElement('span');
    discord.domElement.parentElement.appendChild(discordIcon);
    discordIcon.className = 'icon discord';

    let app = gui.add({ fun : () => {

        window.open('http://onelink.to/5b58bn');
    } }, 'fun').name('Check out mobile app');
    app.__li.className = 'cr function appBigFont';
    app.__li.style.borderLeft = '3px solid #00FF7F';
    let appIcon = document.createElement('span');
    app.domElement.parentElement.appendChild(appIcon);
    appIcon.className = 'icon app';

    if (isMobile())
        gui.close();
}

function isMobile () {
    return /Mobi|Android/i.test(navigator.userAgent);
}

function captureScreenshot () {
    let res = getResolution(config.CAPTURE_RESOLUTION);
    let target = createFBO(res.width, res.height, ext.formatRGBA.internalFormat, ext.formatRGBA.format, ext.halfFloatTexType, gl.NEAREST);
    render(target);

    let texture = framebufferToTexture(target);
    texture = normalizeTexture(texture, target.width, target.height);

    let captureCanvas = textureToCanvas(texture, target.width, target.height);
    let datauri = captureCanvas.toDataURL();
    downloadURI('fluid.png', datauri);
    URL.revokeObjectURL(datauri);
}

function framebufferToTexture (target) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
    let length = target.width * target.height * 4;
    let texture = new Float32Array(length);
    gl.readPixels(0, 0, target.width, target.height, gl.RGBA, gl.FLOAT, texture);
    return texture;
}

function normalizeTexture (texture, width, height) {
    let result = new Uint8Array(texture.length);
    let id = 0;
    for (let i = height - 1; i >= 0; i--) {
        for (let j = 0; j < width; j++) {
            let nid = i * width * 4 + j * 4;
            result[nid + 0] = clamp01(texture[id + 0]) * 255;
            result[nid + 1] = clamp01(texture[id + 1]) * 255;
            result[nid + 2] = clamp01(texture[id + 2]) * 255;
            result[nid + 3] = clamp01(texture[id + 3]) * 255;
            id += 4;
        }
    }
    return result;
}

function clamp01 (input) {
    return Math.min(Math.max(input, 0), 1);
}

function textureToCanvas (texture, width, height) {
    let captureCanvas = document.createElement('canvas');
    let ctx = captureCanvas.getContext('2d');
    captureCanvas.width = width;
    captureCanvas.height = height;

    let imageData = ctx.createImageData(width, height);
    imageData.data.set(texture);
    ctx.putImageData(imageData, 0, 0);

    return captureCanvas;
}

function downloadURI (filename, uri) {
    let link = document.createElement('a');
    link.download = filename;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

class Material {
    constructor (vertexShader, fragmentShaderSource) {
        this.vertexShader = vertexShader;
        this.fragmentShaderSource = fragmentShaderSource;
        this.programs = [];
        this.activeProgram = null;
        this.uniforms = [];
    }

    setKeywords (keywords) {
        let hash = 0;
        for (let i = 0; i < keywords.length; i++)
            hash += hashCode(keywords[i]);

        let program = this.programs[hash];
        if (program == null)
        {
            let fragmentShader = compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
            program = createProgram(this.vertexShader, fragmentShader);
            this.programs[hash] = program;
        }

        if (program == this.activeProgram) return;

        this.uniforms = getUniforms(program);
        this.activeProgram = program;
    }

    bind () {
        gl.useProgram(this.activeProgram);
    }
}

class Program {
    constructor (vertexShader, fragmentShader) {
        this.uniforms = {};
        this.program = createProgram(vertexShader, fragmentShader);
        this.uniforms = getUniforms(this.program);
    }

    bind () {
        gl.useProgram(this.program);
    }
}

function createProgram (vertexShader, fragmentShader) {
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
        console.trace(gl.getProgramInfoLog(program));

    return program;
}

function getUniforms (program) {
    let uniforms = [];
    let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < uniformCount; i++) {
        let uniformName = gl.getActiveUniform(program, i).name;
        uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
    }
    return uniforms;
}

function compileShader (type, source, keywords) {
    source = addKeywords(source, keywords);

    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        console.trace(gl.getShaderInfoLog(shader));

    return shader;
};

function addKeywords (source, keywords) {
    if (keywords == null) return source;
    let keywordsString = '';
    keywords.forEach(keyword => {
        keywordsString += '#define ' + keyword + '\n';
    });
    return keywordsString + source;
}

const baseVertexShader = compileShader(gl.VERTEX_SHADER, `
    precision highp float;

    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform vec2 texelSize;

    void main () {
        vUv = aPosition * 0.5 + 0.5;
        vL = vUv - vec2(texelSize.x, 0.0);
        vR = vUv + vec2(texelSize.x, 0.0);
        vT = vUv + vec2(0.0, texelSize.y);
        vB = vUv - vec2(0.0, texelSize.y);
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`);

const blurVertexShader = compileShader(gl.VERTEX_SHADER, `
    precision highp float;

    attribute vec2 aPosition;
    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    uniform vec2 texelSize;

    void main () {
        vUv = aPosition * 0.5 + 0.5;
        float offset = 1.33333333;
        vL = vUv - texelSize * offset;
        vR = vUv + texelSize * offset;
        gl_Position = vec4(aPosition, 0.0, 1.0);
    }
`);

const blurShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    uniform sampler2D uTexture;

    void main () {
        vec4 sum = texture2D(uTexture, vUv) * 0.29411764;
        sum += texture2D(uTexture, vL) * 0.35294117;
        sum += texture2D(uTexture, vR) * 0.35294117;
        gl_FragColor = sum;
    }
`);

const copyShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    uniform sampler2D uTexture;

    void main () {
        gl_FragColor = texture2D(uTexture, vUv);
    }
`);

const clearShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    uniform sampler2D uTexture;
    uniform float value;

    void main () {
        gl_FragColor = value * texture2D(uTexture, vUv);
    }
`);

const colorShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;

    uniform vec4 color;

    void main () {
        gl_FragColor = color;
    }
`);

const checkerboardShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float aspectRatio;

    #define SCALE 25.0

    void main () {
        vec2 uv = floor(vUv * SCALE * vec2(aspectRatio, 1.0));
        float v = mod(uv.x + uv.y, 2.0);
        v = v * 0.1 + 0.8;
        gl_FragColor = vec4(vec3(v), 1.0);
    }
`);

const displayShaderSource = `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform sampler2D uBloom;
    uniform sampler2D uSunrays;
    uniform sampler2D uDithering;
    uniform vec2 ditherScale;
    uniform vec2 texelSize;

    vec3 linearToGamma (vec3 color) {
        color = max(color, vec3(0));
        return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
    }

    void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;

    #ifdef SHADING
        vec3 lc = texture2D(uTexture, vL).rgb;
        vec3 rc = texture2D(uTexture, vR).rgb;
        vec3 tc = texture2D(uTexture, vT).rgb;
        vec3 bc = texture2D(uTexture, vB).rgb;

        float dx = length(rc) - length(lc);
        float dy = length(tc) - length(bc);

        vec3 n = normalize(vec3(dx, dy, length(texelSize)));
        vec3 l = vec3(0.0, 0.0, 1.0);

        float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
        c *= diffuse;
    #endif

    #ifdef BLOOM
        vec3 bloom = texture2D(uBloom, vUv).rgb;
    #endif

    #ifdef SUNRAYS
        float sunrays = texture2D(uSunrays, vUv).r;
        c *= sunrays;
    #ifdef BLOOM
        bloom *= sunrays;
    #endif
    #endif

    #ifdef BLOOM
        float noise = texture2D(uDithering, vUv * ditherScale).r;
        noise = noise * 2.0 - 1.0;
        bloom += noise / 255.0;
        bloom = linearToGamma(bloom);
        c += bloom;
    #endif

        float a = max(c.r, max(c.g, c.b));
        gl_FragColor = vec4(c, a);
    }
`;

const bloomPrefilterShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform vec3 curve;
    uniform float threshold;

    void main () {
        vec3 c = texture2D(uTexture, vUv).rgb;
        float br = max(c.r, max(c.g, c.b));
        float rq = clamp(br - curve.x, 0.0, curve.y);
        rq = curve.z * rq * rq;
        c *= max(rq, br - threshold) / max(br, 0.0001);
        gl_FragColor = vec4(c, 0.0);
    }
`);

const bloomBlurShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;

    void main () {
        vec4 sum = vec4(0.0);
        sum += texture2D(uTexture, vL);
        sum += texture2D(uTexture, vR);
        sum += texture2D(uTexture, vT);
        sum += texture2D(uTexture, vB);
        sum *= 0.25;
        gl_FragColor = sum;
    }
`);

const bloomFinalShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uTexture;
    uniform float intensity;

    void main () {
        vec4 sum = vec4(0.0);
        sum += texture2D(uTexture, vL);
        sum += texture2D(uTexture, vR);
        sum += texture2D(uTexture, vT);
        sum += texture2D(uTexture, vB);
        sum *= 0.25;
        gl_FragColor = sum * intensity;
    }
`);

const sunraysMaskShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;

    void main () {
        vec4 c = texture2D(uTexture, vUv);
        float br = max(c.r, max(c.g, c.b));
        c.a = 1.0 - min(max(br * 20.0, 0.0), 0.8);
        gl_FragColor = c;
    }
`);

const sunraysShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTexture;
    uniform float weight;

    #define ITERATIONS 16

    void main () {
        float Density = 0.3;
        float Decay = 0.95;
        float Exposure = 0.7;

        vec2 coord = vUv;
        vec2 dir = vUv - 0.5;

        dir *= 1.0 / float(ITERATIONS) * Density;
        float illuminationDecay = 1.0;

        float color = texture2D(uTexture, vUv).a;

        for (int i = 0; i < ITERATIONS; i++)
        {
            coord -= dir;
            float col = texture2D(uTexture, coord).a;
            color += col * illuminationDecay * weight;
            illuminationDecay *= Decay;
        }

        gl_FragColor = vec4(color * Exposure, 0.0, 0.0, 1.0);
    }
`);

const splatShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uTarget;
    uniform float aspectRatio;
    uniform vec3 color;
    uniform vec2 point;
    uniform float radius;

    void main () {
        vec2 p = vUv - point.xy;
        p.x *= aspectRatio;
        vec3 splat = exp(-dot(p, p) / radius) * color;
        vec3 base = texture2D(uTarget, vUv).xyz;
        gl_FragColor = vec4(base + splat, 1.0);
    }
`);

const advectionShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    uniform sampler2D uVelocity;
    uniform sampler2D uSource;
    uniform vec2 texelSize;
    uniform vec2 dyeTexelSize;
    uniform float dt;
    uniform float dissipation;

    vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
        vec2 st = uv / tsize - 0.5;

        vec2 iuv = floor(st);
        vec2 fuv = fract(st);

        vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
        vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
        vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
        vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

        return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
    }

    void main () {
    #ifdef MANUAL_FILTERING
        vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
        vec4 result = bilerp(uSource, coord, dyeTexelSize);
    #else
        vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
        vec4 result = texture2D(uSource, coord);
    #endif
        float decay = 1.0 + dissipation * dt;
        gl_FragColor = result / decay;
    }`,
    ext.supportLinearFiltering ? null : ['MANUAL_FILTERING']
);

const divergenceShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uVelocity, vL).x;
        float R = texture2D(uVelocity, vR).x;
        float T = texture2D(uVelocity, vT).y;
        float B = texture2D(uVelocity, vB).y;

        vec2 C = texture2D(uVelocity, vUv).xy;
        if (vL.x < 0.0) { L = -C.x; }
        if (vR.x > 1.0) { R = -C.x; }
        if (vT.y > 1.0) { T = -C.y; }
        if (vB.y < 0.0) { B = -C.y; }

        float div = 0.5 * (R - L + T - B);
        gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
    }
`);

const curlShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uVelocity, vL).y;
        float R = texture2D(uVelocity, vR).y;
        float T = texture2D(uVelocity, vT).x;
        float B = texture2D(uVelocity, vB).x;
        float vorticity = R - L - T + B;
        gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
    }
`);

const vorticityShader = compileShader(gl.FRAGMENT_SHADER, `
    precision highp float;
    precision highp sampler2D;

    varying vec2 vUv;
    varying vec2 vL;
    varying vec2 vR;
    varying vec2 vT;
    varying vec2 vB;
    uniform sampler2D uVelocity;
    uniform sampler2D uCurl;
    uniform float curl;
    uniform float dt;

    void main () {
        float L = texture2D(uCurl, vL).x;
        float R = texture2D(uCurl, vR).x;
        float T = texture2D(uCurl, vT).x;
        float B = texture2D(uCurl, vB).x;
        float C = texture2D(uCurl, vUv).x;

        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 0.0001;
        force *= curl * C;
        force.y *= -1.0;

        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity += force * dt;
        velocity = min(max(velocity, -1000.0), 1000.0);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`);

const pressureShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uDivergence;

    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        float C = texture2D(uPressure, vUv).x;
        float divergence = texture2D(uDivergence, vUv).x;
        float pressure = (L + R + B + T - divergence) * 0.25;
        gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
    }
`);

const gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER, `
    precision mediump float;
    precision mediump sampler2D;

    varying highp vec2 vUv;
    varying highp vec2 vL;
    varying highp vec2 vR;
    varying highp vec2 vT;
    varying highp vec2 vB;
    uniform sampler2D uPressure;
    uniform sampler2D uVelocity;

    void main () {
        float L = texture2D(uPressure, vL).x;
        float R = texture2D(uPressure, vR).x;
        float T = texture2D(uPressure, vT).x;
        float B = texture2D(uPressure, vB).x;
        vec2 velocity = texture2D(uVelocity, vUv).xy;
        velocity.xy -= vec2(R - L, T - B);
        gl_FragColor = vec4(velocity, 0.0, 1.0);
    }
`);

const blit = (() => {
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    return (target, clear = false) => {
        if (target == null)
        {
            gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
        else
        {
            gl.viewport(0, 0, target.width, target.height);
            gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
        }
        if (clear)
        {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
        }
        // CHECK_FRAMEBUFFER_STATUS();
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    }
})();

function CHECK_FRAMEBUFFER_STATUS () {
    let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status != gl.FRAMEBUFFER_COMPLETE)
        console.trace("Framebuffer error: " + status);
}

let dye;
let velocity;
let divergence;
let curl;
let pressure;
let bloom;
let bloomFramebuffers = [];
let sunrays;
let sunraysTemp;

let ditheringTexture;

const blurProgram            = new Program(blurVertexShader, blurShader);
const copyProgram            = new Program(baseVertexShader, copyShader);
const clearProgram           = new Program(baseVertexShader, clearShader);
const colorProgram           = new Program(baseVertexShader, colorShader);
const checkerboardProgram    = new Program(baseVertexShader, checkerboardShader);
const bloomPrefilterProgram  = new Program(baseVertexShader, bloomPrefilterShader);
const bloomBlurProgram       = new Program(baseVertexShader, bloomBlurShader);
const bloomFinalProgram      = new Program(baseVertexShader, bloomFinalShader);
const sunraysMaskProgram     = new Program(baseVertexShader, sunraysMaskShader);
const sunraysProgram         = new Program(baseVertexShader, sunraysShader);
const splatProgram           = new Program(baseVertexShader, splatShader);
const advectionProgram       = new Program(baseVertexShader, advectionShader);
const divergenceProgram      = new Program(baseVertexShader, divergenceShader);
const curlProgram            = new Program(baseVertexShader, curlShader);
const vorticityProgram       = new Program(baseVertexShader, vorticityShader);
const pressureProgram        = new Program(baseVertexShader, pressureShader);
const gradienSubtractProgram = new Program(baseVertexShader, gradientSubtractShader);

const displayMaterial = new Material(baseVertexShader, displayShaderSource);

function initFramebuffers () {
    let simRes = getResolution(config.SIM_RESOLUTION);
    let dyeRes = getResolution(config.DYE_RESOLUTION);

    const texType = ext.halfFloatTexType;
    const rgba    = ext.formatRGBA;
    const rg      = ext.formatRG;
    const r       = ext.formatR;
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    gl.disable(gl.BLEND);

    if (dye == null)
        dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
    else
        dye = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);

    if (velocity == null)
        velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
    else
        velocity = resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);

    divergence = createFBO      (simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    curl       = createFBO      (simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
    pressure   = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);

    initBloomFramebuffers();
    initSunraysFramebuffers();
}

function initBloomFramebuffers () {
    let res = getResolution(config.BLOOM_RESOLUTION);

    const texType = ext.halfFloatTexType;
    const rgba = ext.formatRGBA;
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    bloom = createFBO(res.width, res.height, rgba.internalFormat, rgba.format, texType, filtering);

    bloomFramebuffers.length = 0;
    for (let i = 0; i < config.BLOOM_ITERATIONS; i++)
    {
        let width = res.width >> (i + 1);
        let height = res.height >> (i + 1);

        if (width < 2 || height < 2) break;

        let fbo = createFBO(width, height, rgba.internalFormat, rgba.format, texType, filtering);
        bloomFramebuffers.push(fbo);
    }
}

function initSunraysFramebuffers () {
    let res = getResolution(config.SUNRAYS_RESOLUTION);

    const texType = ext.halfFloatTexType;
    const r = ext.formatR;
    const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

    sunrays     = createFBO(res.width, res.height, r.internalFormat, r.format, texType, filtering);
    sunraysTemp = createFBO(res.width, res.height, r.internalFormat, r.format, texType, filtering);
}

function createFBO (w, h, internalFormat, format, type, param) {
    gl.activeTexture(gl.TEXTURE0);
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

    let fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.viewport(0, 0, w, h);
    gl.clear(gl.COLOR_BUFFER_BIT);

    let texelSizeX = 1.0 / w;
    let texelSizeY = 1.0 / h;

    return {
        texture,
        fbo,
        width: w,
        height: h,
        texelSizeX,
        texelSizeY,
        attach (id) {
            gl.activeTexture(gl.TEXTURE0 + id);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            return id;
        }
    };
}

function createDoubleFBO (w, h, internalFormat, format, type, param) {
    let fbo1 = createFBO(w, h, internalFormat, format, type, param);
    let fbo2 = createFBO(w, h, internalFormat, format, type, param);

    return {
        width: w,
        height: h,
        texelSizeX: fbo1.texelSizeX,
        texelSizeY: fbo1.texelSizeY,
        get read () {
            return fbo1;
        },
        set read (value) {
            fbo1 = value;
        },
        get write () {
            return fbo2;
        },
        set write (value) {
            fbo2 = value;
        },
        swap () {
            let temp = fbo1;
            fbo1 = fbo2;
            fbo2 = temp;
        }
    }
}

function resizeFBO (target, w, h, internalFormat, format, type, param) {
    let newFBO = createFBO(w, h, internalFormat, format, type, param);
    copyProgram.bind();
    gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
    blit(newFBO);
    return newFBO;
}

function resizeDoubleFBO (target, w, h, internalFormat, format, type, param) {
    if (target.width == w && target.height == h)
        return target;
    target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param);
    target.write = createFBO(w, h, internalFormat, format, type, param);
    target.width = w;
    target.height = h;
    target.texelSizeX = 1.0 / w;
    target.texelSizeY = 1.0 / h;
    return target;
}

function createTextureAsync (url) {
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, 1, 1, 0, gl.RGB, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255]));

    let obj = {
        texture,
        width: 1,
        height: 1,
        attach (id) {
            gl.activeTexture(gl.TEXTURE0 + id);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            return id;
        }
    };

    let image = new Image();
    image.onload = () => {
        obj.width = image.width;
        obj.height = image.height;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
    };
    image.src = url;

    return obj;
}

function updateKeywords () {
    let displayKeywords = [];
    if (config.SHADING) displayKeywords.push("SHADING");
    if (config.BLOOM) displayKeywords.push("BLOOM");
    if (config.SUNRAYS) displayKeywords.push("SUNRAYS");
    displayMaterial.setKeywords(displayKeywords);
}

updateKeywords();
initFramebuffers();


let lastUpdateTime = Date.now();
let colorUpdateTimer = 0.0;
// Start after the watercolor texture has loaded.

function update () {
    const dt = calcDeltaTime();
    if (resizeCanvas())
        initFramebuffers();
    if (document.hidden || !embedVisible) { requestAnimationFrame(update); return; }
    applyInputs();
    if (!config.PAUSED)
        step(dt);
    updateActivity(dt);
    if(materialEngine) materialEngine.step();
    if(guidedRecovery && materialEngine) recoveryDensity=materialEngine.render(true);
    if(!materialEngine || guidedRecovery) {
      evolveWisps(dt);
      if(materialRecovery && materialEngine) returningDeposit=materialEngine.prepareDeposit(dye.read,wisps.read,recoveryDensity,dt);
      restorePainting(dt);
      if(materialRecovery && materialEngine) materialEngine.withdrawDeposit(wisps);
    }
    renderPainting();
    requestAnimationFrame(update);
}

function calcDeltaTime () {
    let now = Date.now();
    let dt = (now - lastUpdateTime) / 1000;
    dt = Math.min(dt, 0.016666);
    lastUpdateTime = now;
    return dt;
}

function resizeCanvas () {
    let width = scaleByPixelRatio(canvas.clientWidth);
    let height = scaleByPixelRatio(canvas.clientHeight);
    if (canvas.width != width || canvas.height != height) {
        canvas.width = width;
        canvas.height = height;
        return true;
    }
    return false;
}

function updateColors (dt) {
    if (!config.COLORFUL) return;

    colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
    if (colorUpdateTimer >= 1) {
        colorUpdateTimer = wrap(colorUpdateTimer, 0, 1);
        pointers.forEach(p => {
            p.color = generateColor();
        });
    }
}

function applyInputs () {
    if (splatStack.length > 0)
        multipleSplats(splatStack.pop());

    pointers.forEach(p => {
        if (p.moved) {
            p.moved = false;
            splatPointer(p);
        }
    });
}

function step (dt) {
    gl.disable(gl.BLEND);

    curlProgram.bind();
    gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(curl);

    vorticityProgram.bind();
    gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
    gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
    gl.uniform1f(vorticityProgram.uniforms.dt, dt);
    blit(velocity.write);
    velocity.swap();

    divergenceProgram.bind();
    gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
    blit(divergence);

    clearProgram.bind();
    gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
    gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
    blit(pressure.write);
    pressure.swap();

    pressureProgram.bind();
    gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
    for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
        gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
        blit(pressure.write);
        pressure.swap();
    }

    gradienSubtractProgram.bind();
    gl.uniform2f(gradienSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    gl.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();

    advectionProgram.bind();
    gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
    if (!ext.supportLinearFiltering)
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
    let velocityId = velocity.read.attach(0);
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
    gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
    gl.uniform1f(advectionProgram.uniforms.dt, dt);
    gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
    blit(velocity.write);
    velocity.swap();

    if (!ext.supportLinearFiltering)
        gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
    gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
    gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
    gl.uniform1f(advectionProgram.uniforms.dt, dt * .52);
    gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
    blit(dye.write);
    dye.swap();
}

function render (target) {
    if (config.BLOOM)
        applyBloom(dye.read, bloom);
    if (config.SUNRAYS) {
        applySunrays(dye.read, dye.write, sunrays);
        blur(sunrays, sunraysTemp, 1);
    }

    if (target == null || !config.TRANSPARENT) {
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
    }
    else {
        gl.disable(gl.BLEND);
    }

    if (!config.TRANSPARENT)
        drawColor(target, normalizeColor(config.BACK_COLOR));
    if (target == null && config.TRANSPARENT)
        drawCheckerboard(target);
    drawDisplay(target);
}

function drawColor (target, color) {
    colorProgram.bind();
    gl.uniform4f(colorProgram.uniforms.color, color.r, color.g, color.b, 1);
    blit(target);
}

function drawCheckerboard (target) {
    checkerboardProgram.bind();
    gl.uniform1f(checkerboardProgram.uniforms.aspectRatio, canvas.width / canvas.height);
    blit(target);
}

function drawDisplay (target) {
    let width = target == null ? gl.drawingBufferWidth : target.width;
    let height = target == null ? gl.drawingBufferHeight : target.height;

    displayMaterial.bind();
    if (config.SHADING)
        gl.uniform2f(displayMaterial.uniforms.texelSize, 1.0 / width, 1.0 / height);
    gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
    if (config.BLOOM) {
        gl.uniform1i(displayMaterial.uniforms.uBloom, bloom.attach(1));
        gl.uniform1i(displayMaterial.uniforms.uDithering, ditheringTexture.attach(2));
        let scale = getTextureScale(ditheringTexture, width, height);
        gl.uniform2f(displayMaterial.uniforms.ditherScale, scale.x, scale.y);
    }
    if (config.SUNRAYS)
        gl.uniform1i(displayMaterial.uniforms.uSunrays, sunrays.attach(3));
    blit(target);
}

function applyBloom (source, destination) {
    if (bloomFramebuffers.length < 2)
        return;

    let last = destination;

    gl.disable(gl.BLEND);
    bloomPrefilterProgram.bind();
    let knee = config.BLOOM_THRESHOLD * config.BLOOM_SOFT_KNEE + 0.0001;
    let curve0 = config.BLOOM_THRESHOLD - knee;
    let curve1 = knee * 2;
    let curve2 = 0.25 / knee;
    gl.uniform3f(bloomPrefilterProgram.uniforms.curve, curve0, curve1, curve2);
    gl.uniform1f(bloomPrefilterProgram.uniforms.threshold, config.BLOOM_THRESHOLD);
    gl.uniform1i(bloomPrefilterProgram.uniforms.uTexture, source.attach(0));
    blit(last);

    bloomBlurProgram.bind();
    for (let i = 0; i < bloomFramebuffers.length; i++) {
        let dest = bloomFramebuffers[i];
        gl.uniform2f(bloomBlurProgram.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
        gl.uniform1i(bloomBlurProgram.uniforms.uTexture, last.attach(0));
        blit(dest);
        last = dest;
    }

    gl.blendFunc(gl.ONE, gl.ONE);
    gl.enable(gl.BLEND);

    for (let i = bloomFramebuffers.length - 2; i >= 0; i--) {
        let baseTex = bloomFramebuffers[i];
        gl.uniform2f(bloomBlurProgram.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
        gl.uniform1i(bloomBlurProgram.uniforms.uTexture, last.attach(0));
        gl.viewport(0, 0, baseTex.width, baseTex.height);
        blit(baseTex);
        last = baseTex;
    }

    gl.disable(gl.BLEND);
    bloomFinalProgram.bind();
    gl.uniform2f(bloomFinalProgram.uniforms.texelSize, last.texelSizeX, last.texelSizeY);
    gl.uniform1i(bloomFinalProgram.uniforms.uTexture, last.attach(0));
    gl.uniform1f(bloomFinalProgram.uniforms.intensity, config.BLOOM_INTENSITY);
    blit(destination);
}

function applySunrays (source, mask, destination) {
    gl.disable(gl.BLEND);
    sunraysMaskProgram.bind();
    gl.uniform1i(sunraysMaskProgram.uniforms.uTexture, source.attach(0));
    blit(mask);

    sunraysProgram.bind();
    gl.uniform1f(sunraysProgram.uniforms.weight, config.SUNRAYS_WEIGHT);
    gl.uniform1i(sunraysProgram.uniforms.uTexture, mask.attach(0));
    blit(destination);
}

function blur (target, temp, iterations) {
    blurProgram.bind();
    for (let i = 0; i < iterations; i++) {
        gl.uniform2f(blurProgram.uniforms.texelSize, target.texelSizeX, 0.0);
        gl.uniform1i(blurProgram.uniforms.uTexture, target.attach(0));
        blit(temp);

        gl.uniform2f(blurProgram.uniforms.texelSize, 0.0, target.texelSizeY);
        gl.uniform1i(blurProgram.uniforms.uTexture, temp.attach(0));
        blit(target);
    }
}

function splatPointer (pointer) {
    let dx = pointer.deltaX * config.SPLAT_FORCE;
    let dy = pointer.deltaY * config.SPLAT_FORCE;
    const speed = Math.hypot(dx, dy);
    const scale = Math.min(1, 18 / Math.max(speed, .001));
    splat(pointer.texcoordX, pointer.texcoordY, dx * scale, dy * scale, pointer.color);
}

function multipleSplats (amount) {
    for (let i = 0; i < amount; i++) {
        const color = generateColor();
        color.r *= 10.0;
        color.g *= 10.0;
        color.b *= 10.0;
        const x = Math.random();
        const y = Math.random();
        const dx = 1000 * (Math.random() - 0.5);
        const dy = 1000 * (Math.random() - 0.5);
        splat(x, y, dx, dy, color);
    }
}

function splat (x, y, dx, dy, color) {
    splatProgram.bind();
    gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
    gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
    gl.uniform2f(splatProgram.uniforms.point, x, y);
    gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
    gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100.0));
    blit(velocity.write);
    velocity.swap();


}

function correctRadius (radius) {
    let aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1)
        radius *= aspectRatio;
    return radius;
}

canvas.addEventListener('mouseenter', e => { updatePointerDownData(pointers[0], -1, scaleByPixelRatio(e.offsetX), scaleByPixelRatio(e.offsetY)); });
canvas.addEventListener('mousedown', e => {
    let posX = scaleByPixelRatio(e.offsetX);
    let posY = scaleByPixelRatio(e.offsetY);
    let pointer = pointers.find(p => p.id == -1);
    if (pointer == null)
        pointer = new pointerPrototype();
    updatePointerDownData(pointer, -1, posX, posY);
});

canvas.addEventListener('mousemove', e => {
    noteGesture(performance.now());
    let pointer = pointers[0];
    // Hover moves pigment too.
    let posX = scaleByPixelRatio(e.offsetX);
    let posY = scaleByPixelRatio(e.offsetY);
    updatePointerMoveData(pointer, posX, posY);
});

window.addEventListener('mouseup', () => {
    updatePointerUpData(pointers[0]);
});

canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    const touches = e.targetTouches;
    while (touches.length >= pointers.length)
        pointers.push(new pointerPrototype());
    for (let i = 0; i < touches.length; i++) {
        let posX = scaleByPixelRatio(touches[i].pageX);
        let posY = scaleByPixelRatio(touches[i].pageY);
        updatePointerDownData(pointers[i + 1], touches[i].identifier, posX, posY);
    }
});

canvas.addEventListener('touchmove', e => {
    noteGesture(performance.now());
    e.preventDefault();
    const touches = e.targetTouches;
    for (let i = 0; i < touches.length; i++) {
        let pointer = pointers[i + 1];
        if (!pointer.down) continue;
        let posX = scaleByPixelRatio(touches[i].pageX);
        let posY = scaleByPixelRatio(touches[i].pageY);
        updatePointerMoveData(pointer, posX, posY);
    }
}, false);

window.addEventListener('touchend', e => {
    const touches = e.changedTouches;
    for (let i = 0; i < touches.length; i++)
    {
        let pointer = pointers.find(p => p.id == touches[i].identifier);
        if (pointer == null) continue;
        updatePointerUpData(pointer);
    }
});

window.addEventListener('keydown', e => {
    if (e.code === 'KeyP')
        config.PAUSED = !config.PAUSED;
    if (e.key === ' ')
        splatStack.push(parseInt(Math.random() * 20) + 5);
});

function updatePointerDownData (pointer, id, posX, posY) {
    pointer.id = id;
    pointer.down = true;
    pointer.moved = false;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1.0 - posY / canvas.height;
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.deltaX = 0;
    pointer.deltaY = 0;
    pointer.color = generateColor();
}

function updatePointerMoveData (pointer, posX, posY) {
    pointer.prevTexcoordX = pointer.texcoordX;
    pointer.prevTexcoordY = pointer.texcoordY;
    pointer.texcoordX = posX / canvas.width;
    pointer.texcoordY = 1.0 - posY / canvas.height;
    pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
    pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
    pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
}

function updatePointerUpData (pointer) {
    pointer.down = false;
}

function correctDeltaX (delta) {
    let aspectRatio = canvas.width / canvas.height;
    if (aspectRatio < 1) delta *= aspectRatio;
    return delta;
}

function correctDeltaY (delta) {
    let aspectRatio = canvas.width / canvas.height;
    if (aspectRatio > 1) delta /= aspectRatio;
    return delta;
}

function generateColor () {
    let c = HSVtoRGB(Math.random(), 1.0, 1.0);
    c.r *= 0.15;
    c.g *= 0.15;
    c.b *= 0.15;
    return c;
}

function HSVtoRGB (h, s, v) {
    let r, g, b, i, f, p, q, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    return {
        r,
        g,
        b
    };
}

function normalizeColor (input) {
    let output = {
        r: input.r / 255,
        g: input.g / 255,
        b: input.b / 255
    };
    return output;
}

function wrap (value, min, max) {
    let range = max - min;
    if (range == 0) return min;
    return (value - min) % range + min;
}

function getResolution (resolution) {
    let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
    if (aspectRatio < 1)
        aspectRatio = 1.0 / aspectRatio;

    let min = Math.round(resolution);
    let max = Math.round(resolution * aspectRatio);

    if (gl.drawingBufferWidth > gl.drawingBufferHeight)
        return { width: max, height: min };
    else
        return { width: min, height: max };
}

function getTextureScale (texture, width, height) {
    return {
        x: width / texture.width,
        y: height / texture.height
    };
}

function scaleByPixelRatio (input) {
    let pixelRatio = window.devicePixelRatio || 1;
    return Math.floor(input * pixelRatio);
}

function hashCode (s) {
    if (s.length == 0) return 0;
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        hash = (hash << 5) - hash + s.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};
// The dye stores pigment absorption, so white paper contributes no dye.
let lastGesture = -10000;
let gestureStart = -10000;
let lastGestureEvent = -10000;
function noteGesture(now,x,y){
 if(now-lastGestureEvent>220)gestureStart=now;
 if(hybridMode&&Number.isFinite(x)&&Number.isFinite(y))markActivity(x,y,now);
 lastGestureEvent=now;
 lastGesture=gestureStart;
}
let embedVisible=true;
let lastEmbeddedPointer=0;
let paintCoverage=null;
let paintCoverageSums=null;
function buildPaintCoverageSums(){
 const {width,height,data}=paintCoverage,stride=width+1;
 paintCoverageSums=new Uint32Array(stride*(height+1));
 for(let y=0;y<height;y++){
   let row=0;
   for(let x=0;x<width;x++){
     const i=(y*width+x)*4;
     if(data[i+3]/255*(1-Math.min(data[i],data[i+1],data[i+2])/255)>.012)row++;
     paintCoverageSums[(y+1)*stride+x+1]=paintCoverageSums[y*stride+x+1]+row;
   }
 }
}
function hitsPaint(x,y){
 if(!paintCoverage)return false;
 const aspect=canvas.width/canvas.height;
 const h=Math.min(.9*aspect/1.5,.78),w=h*1.5/aspect;
 const u=(x-.5)/w+.5,v=(y-(canvas.clientWidth<650?.33:.5))/h+.5;
 // A brush touches a neighborhood, not a single source pixel. Thin ink and
 // feathered edges need consecutive accepted samples to receive velocity.
 if((refinedTiming||systemArtwork)&&paintCoverageSums){
   const radius=Math.min(24,canvas.clientHeight*.025);
   const rx=radius/(canvas.clientWidth*w),ry=radius/(canvas.clientHeight*h);
   const x0=Math.max(0,Math.floor((u-rx)*paintCoverage.width));
   const y0=Math.max(0,Math.floor((v-ry)*paintCoverage.height));
   const x1=Math.min(paintCoverage.width,Math.ceil((u+rx)*paintCoverage.width));
   const y1=Math.min(paintCoverage.height,Math.ceil((v+ry)*paintCoverage.height));
   if(x0>=x1||y0>=y1)return false;
   const stride=paintCoverage.width+1,sums=paintCoverageSums;
   return sums[y1*stride+x1]-sums[y0*stride+x1]-sums[y1*stride+x0]+sums[y0*stride+x0]>0;
 }
 if(u<0||u>=1||v<0||v>=1)return false;
 const i=(Math.floor(v*paintCoverage.height)*paintCoverage.width+Math.floor(u*paintCoverage.width))*4;
 const p=paintCoverage.data;
 return p[i+3]/255*(1-Math.min(p[i],p[i+1],p[i+2])/255)>.012;
}
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.source!==parent||parent===window)return;
 const data=event.data;
 if(data?.type==='fluid-visible'){embedVisible=data.visible===true;return;}
 if(data?.type!=='fluid-pointer'||!Number.isFinite(data.x)||!Number.isFinite(data.y)||data.x<0||data.x>1||data.y<0||data.y>1)return;
 if(!hitsPaint(data.x,data.y)){lastEmbeddedPointer=0;return;}
 const pointer=pointers[0],now=performance.now();
 const x=data.x*canvas.width,y=data.y*canvas.height;
 if(now-lastEmbeddedPointer>150)updatePointerDownData(pointer,-1,x,y);
 else updatePointerMoveData(pointer,x,y);
 lastEmbeddedPointer=now;noteGesture(now,data.x,1.-data.y);
});
const sourceTexture = gl.createTexture();
const smokeTexture = gl.createTexture();
const hybridMode=new URLSearchParams(location.search).has('hybrid');
const refinement=new URLSearchParams(location.search).get('refinement');
const refinedTiming=hybridMode&&['timing','gather','balanced','light','arrival'].includes(refinement);
const refinedGather=refinedTiming?(refinement==='gather'?1:['balanced','light','arrival'].includes(refinement)?.5:0):0;
const lighterMotion=refinedTiming&&(refinement==='light'||arrivalSmoke);
const activityWidth=64,activityHeight=40;
const activityData=new Uint8Array(activityWidth*activityHeight*4);
// Absolute expiry avoids accumulating rounded decrements. Sixty byte levels
// per second preserves the approved release's 60 Hz pacing (255 / 60 = 4.25s).
const activityExpires=new Float64Array(activityWidth*activityHeight);
const activityTexture=gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D,activityTexture);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,activityWidth,activityHeight,0,gl.RGBA,gl.UNSIGNED_BYTE,activityData);
let previousActivityPoint=null,activityDirty=false;
function stampActivity(x,y,now){
 const aspect=canvas.width/Math.max(canvas.height,1);
 const radius=.072;
 const minX=Math.max(0,Math.floor((x-radius/aspect)*activityWidth));
 const maxX=Math.min(activityWidth-1,Math.ceil((x+radius/aspect)*activityWidth));
 const minY=Math.max(0,Math.floor((y-radius)*activityHeight));
 const maxY=Math.min(activityHeight-1,Math.ceil((y+radius)*activityHeight));
 for(let py=minY;py<=maxY;py++)for(let px=minX;px<=maxX;px++){
   const dx=(px+.5)/activityWidth-x,dy=(py+.5)/activityHeight-y;
   const distance=Math.hypot(dx*aspect,dy);
   if(distance>radius)continue;
   const strength=Math.max(0,1-distance/radius);
   const value=Math.round(255*(.9+.1*strength));
   const i=(py*activityWidth+px)*4;
   if(refinedTiming)activityExpires[i/4]=Math.max(activityExpires[i/4],now+value/60*1000);
   activityData[i]=Math.max(activityData[i],value);
   activityData[i+1]=activityData[i];activityData[i+2]=activityData[i];activityData[i+3]=255;
 }
 activityDirty=true;
}
function markActivity(x,y,now){
 if(!previousActivityPoint||now-previousActivityPoint.time>220)previousActivityPoint={x,y,time:now};
 const distance=Math.hypot((x-previousActivityPoint.x)*(canvas.width/Math.max(canvas.height,1)),y-previousActivityPoint.y);
 const steps=Math.max(1,Math.ceil(distance/.025));
 for(let step=0;step<=steps;step++){
   const t=step/steps;
   stampActivity(previousActivityPoint.x+(x-previousActivityPoint.x)*t,previousActivityPoint.y+(y-previousActivityPoint.y)*t,now);
 }
 previousActivityPoint={x,y,time:now};
}
function updateActivity(dt){
 if(!hybridMode)return;
 const now=performance.now();
 const decay=Math.max(1,Math.round(255*dt/3.2));
 let active=false;
 for(let i=0;i<activityData.length;i+=4){
   if(activityData[i]>0){
     const value=refinedTiming
       ? Math.min(255,Math.max(0,Math.round((activityExpires[i/4]-now)*.06)))
       : Math.max(0,activityData[i]-decay);
     activityData[i]=value;activityData[i+1]=value;activityData[i+2]=value;active=true;
   }
 }
 if(!active&&!activityDirty)return;
 gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_2D,activityTexture);
 gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,activityWidth,activityHeight,gl.RGBA,gl.UNSIGNED_BYTE,activityData);
 activityDirty=false;
}
// Detached wisps carry a fraction of the pigment removed from the painting.
// This is a second transported dye field, not separately colored smoke.
let wisps;
const pigmentNoise = `
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){
   vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
   return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),
              mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);
 }
 float billows(vec2 q,float t){
   vec2 warp=vec2(noise(q*19.+t*.08),noise(q*23.-t*.06));
   return .65*noise(q*95.+warp*3.)+.35*noise(q*183.+warp*4.);
 }
`;
const restoreProgram = new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, `
 precision highp float; varying vec2 vUv;
 uniform sampler2D current; uniform sampler2D original; uniform sampler2D flow; uniform sampler2D activity; uniform sampler2D returningPigment;
 uniform float guided; uniform float materialReturn; uniform sampler2D depositedPigment;
 uniform vec2 pixel; uniform float stepTime; uniform float clock; uniform float water;
 uniform float amount; uniform float aspect; uniform float mobile; uniform float recoveryAge; uniform float hybrid; uniform float lighterMotion; uniform float cleanPaper;
 ${pigmentNoise}
 vec3 originalPigment(vec2 position) {
   float w = .9; float h = w * aspect / 1.5;
   h = min(h, .78); w = h * 1.5 / aspect;
   vec2 uv = (position - vec2(.5, mix(.5,.67,mobile))) / vec2(w,h) + .5;
   if(any(lessThan(uv,vec2(0.))) || any(greaterThan(uv,vec2(1.)))) return vec3(0.);
   vec4 paint = texture2D(original,uv);
   vec3 ink=1.-paint.rgb;
   vec2 edge=smoothstep(vec2(0.),vec2(.09),min(uv,1.-uv));
   ink=mix(ink,max(vec3(0.),ink-.018)/.982*edge.x*edge.y,cleanPaper);
   return ink*paint.a*.85;
 }
 void main(){
   vec3 target=originalPigment(vUv);
   float structure=smoothstep(.035,.24,max(target.r,max(target.g,target.b)));
   vec2 q=vec2(vUv.x*aspect,vUv.y);
   float recoveryPattern=noise(q*24.+vec2(3.,7.));
   float spatialElapsed=(1.-texture2D(activity,vUv).r)*3.2;
   float localAge=mix(max(0.,recoveryAge-recoveryPattern*.22),
     max(0.,spatialElapsed-.9-recoveryPattern*.22),hybrid);
   float gathering=smoothstep(0.,.7,localAge);
   float detail=smoothstep(.25,1.25,localAge);
   vec2 motion=texture2D(flow,vUv).xy;
   // Recovery is local: areas the pointer has already passed may settle while
   // the active stroke continues, but moving pigment stays out of the way.
   float quiet=1.-smoothstep(.12,1.8,length(motion));
   quiet=mix(quiet,max(quiet,.24),hybrid*smoothstep(0.,.7,localAge));
   gathering*=quiet;
   float resilience=1.-pow(1.-amount,gathering*mix(.9,1.3,structure));
   // Rebuild only disturbed pigment; intact areas retain their crispness.
   float disturbed=smoothstep(.008,.09,length(texture2D(current,vUv).rgb-target));
   vec2 softRadius=vec2(.004/aspect,.004)*(1.-detail)*disturbed;
   vec3 broad=(target*4.
     +originalPigment(vUv+vec2(softRadius.x,0.))
     +originalPigment(vUv-vec2(softRadius.x,0.))
     +originalPigment(vUv+vec2(0.,softRadius.y))
     +originalPigment(vUv-vec2(0.,softRadius.y)))/8.;
   target=mix(broad,target,detail);
   float stirred=smoothstep(.15,4.,length(motion));
   // Smooth multiscale eddies open uneven gaps in the pigment itself.
   // The result is persisted in the dye buffer, not drawn as a fading overlay.
   float billow=billows(q,clock);
   vec2 spread=pixel*mix(1.,1.8,stirred);
   vec3 pigment=texture2D(current,vUv).rgb;
   vec3 nearby=(texture2D(current,vUv+vec2(spread.x,0.)).rgb
               +texture2D(current,vUv-vec2(spread.x,0.)).rgb
               +texture2D(current,vUv+vec2(0.,spread.y)).rgb
               +texture2D(current,vUv-vec2(0.,spread.y)).rgb)*.25;
   pigment=mix(pigment,nearby,1.-exp(-stepTime*stirred*mix(9.,6.75,lighterMotion)));
   // Keep moving pigment legible long enough to form currents instead of
   // washing the whole territory out in one pass.
   float thinning=stirred*mix(1.2,9.,smoothstep(.25,.7,billow))*(1.-gathering);
   pigment*=exp(-stepTime*thinning*mix(1.,.65,water));
   float materialHandoff=smoothstep(.85,1.45,localAge);
   if(guided>.5 && gathering>0. && disturbed>.001){
   // Keep baseline breakup. Returning material only contributes to missing
   // painted structure during recovery; never overlay intact artwork/paper.
   // Reconstruct a continuous arrival field; never feed individual splat
   // contours back into the watercolor. Only this guide is softened.
   vec2 arrivalRadius=vec2(.004/aspect,.004);
   vec3 arriving=texture2D(returningPigment,vUv).rgb*.25
     +(texture2D(returningPigment,vUv+vec2(arrivalRadius.x,0.)).rgb
      +texture2D(returningPigment,vUv-vec2(arrivalRadius.x,0.)).rgb
      +texture2D(returningPigment,vUv+vec2(0.,arrivalRadius.y)).rgb
      +texture2D(returningPigment,vUv-vec2(0.,arrivalRadius.y)).rgb)*.125
     +(texture2D(returningPigment,vUv+arrivalRadius).rgb
      +texture2D(returningPigment,vUv-arrivalRadius).rgb
      +texture2D(returningPigment,vUv+vec2(arrivalRadius.x,-arrivalRadius.y)).rgb
      +texture2D(returningPigment,vUv+vec2(-arrivalRadius.x,arrivalRadius.y)).rgb)*.0625;
   float support=smoothstep(.008,.11,max(arriving.r,max(arriving.g,arriving.b)));
   float guidance=guided*gathering*disturbed;
   resilience*=mix(1.,.82+support*.58,guidance);
   if(materialReturn>.5){
     vec3 delivered=texture2D(depositedPigment,vUv).rgb;
     pigment+=delivered;
     if(${arrivalSmoke ? '1.' : '0.'}>.5){
       // Coverage includes surviving, transported and source-restored pigment.
       float coverage=1.-clamp(length(max(target-pigment,vec3(0.)))/max(.001,length(target)),0.,1.);
       materialHandoff=max(smoothstep(.55,.93,coverage),smoothstep(1.45,2.15,localAge));
     }
     // Reduce source reconstruction only where real wisp color contributes.
     // Late detail resolution stays on the original schedule.
     float share=clamp(max(delivered.r,max(delivered.g,delivered.b))
       /max(.0001,max(target.r,max(target.g,target.b))*resilience),0.,1.);
     resilience*=1.-${arrivalSmoke ? ".75" : ".60"}*share*(1.-materialHandoff);
   }else{
     pigment+=min(max(target-pigment,vec3(0.)),arriving*.3)
       *(1.-exp(-stepTime*3.))*guidance;
   }
   }
   gl_FragColor=vec4(mix(pigment,target,resilience*mix(${arrivalSmoke ? ".65" : "1."},1.,materialHandoff)),1.);
 }
`));
const wispProgram = new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, `
 precision highp float; varying vec2 vUv;
 uniform sampler2D previous; uniform sampler2D pigment; uniform sampler2D flow; uniform sampler2D smoke;
 uniform sampler2D activity;
 uniform sampler2D home; uniform float recoveryAge;
 uniform sampler2D returningPigment; uniform float guided; uniform float materialReturn;
 uniform vec2 flowPixel; uniform float stepTime; uniform float clock;
 uniform float aspect; uniform float water; uniform float mobile; uniform float hybrid; uniform float refinedGather;
 ${pigmentNoise}
 void main(){
   vec2 motion=texture2D(flow,vUv).xy;
   float stirred=smoothstep(.15,4.,length(motion));
   vec2 q=vec2(vUv.x*aspect,vUv.y);
   float n=billows(q,clock);
   // Small curling eddies carry released pigment, never an independent cursor trail.
   vec2 drift=vec2(sin(q.y*85.+clock*.65)*.009/aspect,
     .012+cos(q.x*85.-clock*.55)*.006)*mix(1.,.25,water);
   float spatialAge=max(0.,(1.-texture2D(activity,vUv).r)*3.2-.9);
   float gather=mix(smoothstep(0.,.8,recoveryAge),smoothstep(0.,1.15,spatialAge),hybrid);
   float homeH=min(.9*aspect/1.5,.78),homeW=homeH*1.5/aspect;
   vec2 homeUv=(vUv-vec2(.5,mix(.5,.67,mobile)))/vec2(homeW,homeH)+.5;
   vec2 homeStep=vec2(.018/aspect,.018)/vec2(homeW,homeH);
   vec4 east=texture2D(home,clamp(homeUv+vec2(homeStep.x,0.),0.,1.));
   vec4 west=texture2D(home,clamp(homeUv-vec2(homeStep.x,0.),0.,1.));
   vec4 north=texture2D(home,clamp(homeUv+vec2(0.,homeStep.y),0.,1.));
   vec4 south=texture2D(home,clamp(homeUv-vec2(0.,homeStep.y),0.,1.));
   vec3 luminance=vec3(.299,.587,.114);
   vec2 gradient=vec2(dot(1.-east.rgb,luminance)*east.a-dot(1.-west.rgb,luminance)*west.a,
     dot(1.-north.rgb,luminance)*north.a-dot(1.-south.rgb,luminance)*south.a);
   // A bounded attraction toward nearby painted shapes, not exact particle-origin tracking.
   vec2 inward=gradient/(.08+length(gradient))*vec2(.045/aspect,.045);
   vec2 outward=motion*flowPixel*3.2+drift*2.2;
   inward*=mix(1.,1.18,hybrid*gather);
   inward*=1.+.12*refinedGather*gather;
   vec2 transport=mix(outward,inward+drift*.35,gather);
   if(guided>.5 && gather>0.){
   // Use arriving material as a soft directional guide for the EXISTING
   // continuous wisp field. No particle splats are composited on the page.
   vec2 reach=vec2(.006/aspect,.006);
   vec3 arrivalDx=texture2D(returningPigment,vUv+vec2(reach.x,0.)).rgb
     -texture2D(returningPigment,vUv-vec2(reach.x,0.)).rgb;
   vec3 arrivalDy=texture2D(returningPigment,vUv+vec2(0.,reach.y)).rgb
     -texture2D(returningPigment,vUv-vec2(0.,reach.y)).rgb;
   vec2 arrivalSlope=vec2(dot(arrivalDx,luminance),dot(arrivalDy,luminance));
   transport+=arrivalSlope/(.04+length(arrivalSlope))*vec2(.018/aspect,.018)*guided*gather;
   }
   vec2 uv=clamp(vUv-stepTime*transport,vec2(.001),vec2(.999));
   float wispDecay=mix(mix(1.1,2.,gather),mix(.65,1.3,gather),hybrid);
   wispDecay-=.15*refinedGather*gather;
   // Keep a little more of the released color available for early transfer,
   // then return to baseline decay before the final detail stage.
   wispDecay-=.2*materialReturn*gather*(1.-smoothstep(1.1,1.9,spatialAge));
   vec3 carried=texture2D(previous,uv).rgb*exp(-stepTime*wispDecay);
   float loss=1.-exp(-stepTime*stirred*mix(1.2,9.,smoothstep(.25,.7,n))*mix(1.,.65,water));
   float h=min(.9*aspect/1.5,.78),w=h*1.5/aspect;
   vec2 materialUv=(vUv-vec2(.5,mix(.5,.67,mobile)))/vec2(w,h)+.5;
   vec3 vapor=vec3(0.);
   if(all(greaterThanEqual(materialUv,vec2(0.)))&&all(lessThanEqual(materialUv,vec2(1.)))) {
     vec3 ink=1.-texture2D(smoke,materialUv).rgb;
     // Match the original pigment preparation; white paper carries no ink.
     float a=pow(max(ink.r,max(ink.g,ink.b)),.72);
     vapor=ink*a*.85;
   }
   vec3 localPigment=texture2D(pigment,vUv).rgb;
   // Only disturbed pigment changes material. The companion never appears
   // as a full-frame layer or replaces the undisturbed resting painting.
   // Local pigment supplies both color and coverage: blank paper cannot emit.
   // The companion only modulates fine structure, never adds its own ink.
   float material=smoothstep(.005,.09,max(vapor.r,max(vapor.g,vapor.b)));
   vec3 released=localPigment*loss*.85*mix(.65,1.,material)*mix(.75,1.,n)*(1.-gather);
   gl_FragColor=vec4(carried+released,1.);
 }
`));
function evolveWisps(dt){
 if(!wisps)return;
 gl.disable(gl.BLEND);wispProgram.bind();
 gl.uniform1i(wispProgram.uniforms.previous,wisps.read.attach(0));
 gl.uniform1i(wispProgram.uniforms.pigment,dye.read.attach(1));
 gl.uniform1i(wispProgram.uniforms.flow,velocity.read.attach(2));
 gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,smokeTexture);
 gl.uniform1i(wispProgram.uniforms.smoke,3);
 gl.activeTexture(gl.TEXTURE4);gl.bindTexture(gl.TEXTURE_2D,sourceTexture);
 gl.uniform1i(wispProgram.uniforms.home,4);
 gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_2D,activityTexture);
 gl.uniform1i(wispProgram.uniforms.activity,5);
 gl.uniform1f(wispProgram.uniforms.hybrid,hybridMode?1:0);
 gl.uniform1f(wispProgram.uniforms.refinedGather,refinedGather);
 gl.activeTexture(gl.TEXTURE6);gl.bindTexture(gl.TEXTURE_2D,recoveryDensity||sourceTexture);
 gl.uniform1i(wispProgram.uniforms.returningPigment,6);
 gl.uniform1f(wispProgram.uniforms.guided,guidedRecovery&&recoveryDensity?1:0);
 gl.uniform1f(wispProgram.uniforms.materialReturn,materialRecovery&&materialEngine?1:0);
 gl.uniform1f(wispProgram.uniforms.recoveryAge,Math.max(0,(performance.now()-lastGesture-550)/1000));
 gl.uniform1f(wispProgram.uniforms.mobile,canvas.clientWidth<650?1:0);
 gl.uniform2f(wispProgram.uniforms.flowPixel,velocity.texelSizeX,velocity.texelSizeY);
 gl.uniform1f(wispProgram.uniforms.stepTime,dt);
 gl.uniform1f(wispProgram.uniforms.clock,performance.now()/1000);
 gl.uniform1f(wispProgram.uniforms.aspect,canvas.width/canvas.height);
 gl.uniform1f(wispProgram.uniforms.water,new URLSearchParams(location.search).has('water')?1:0);
 blit(wisps.write);wisps.swap();
}
const paintingProgram = new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, `
 precision highp float; varying vec2 vUv; uniform sampler2D pigment; uniform sampler2D wisps;
 void main(){vec3 dye=texture2D(pigment,vUv).rgb+texture2D(wisps,vUv).rgb;
 gl_FragColor=vec4(max(vec3(0.),vec3(.9647,.9686,.9569)-dye),1.);}
`));
function restorePainting(dt, initial=false) {
 gl.disable(gl.BLEND); restoreProgram.bind();
 gl.uniform1i(restoreProgram.uniforms.current,dye.read.attach(0));
 gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,sourceTexture);
 gl.uniform1i(restoreProgram.uniforms.original,1);
 gl.uniform1i(restoreProgram.uniforms.flow,velocity.read.attach(2));
 gl.activeTexture(gl.TEXTURE5);gl.bindTexture(gl.TEXTURE_2D,activityTexture);
 gl.uniform1i(restoreProgram.uniforms.activity,5);
 gl.uniform1f(restoreProgram.uniforms.hybrid,hybridMode?1:0);
 gl.uniform1f(restoreProgram.uniforms.lighterMotion,lighterMotion?1:0);
 gl.uniform1f(restoreProgram.uniforms.cleanPaper,connectedArtwork?1:0);
 gl.activeTexture(gl.TEXTURE6);gl.bindTexture(gl.TEXTURE_2D,recoveryDensity||sourceTexture);
 gl.uniform1i(restoreProgram.uniforms.returningPigment,6);
 gl.uniform1f(restoreProgram.uniforms.guided,guidedRecovery&&recoveryDensity?1:0);
 gl.activeTexture(gl.TEXTURE7);gl.bindTexture(gl.TEXTURE_2D,returningDeposit||sourceTexture);
 gl.uniform1i(restoreProgram.uniforms.depositedPigment,7);
 gl.uniform1f(restoreProgram.uniforms.materialReturn,materialRecovery&&returningDeposit?1:0);
 gl.uniform2f(restoreProgram.uniforms.pixel,dye.texelSizeX,dye.texelSizeY);
 gl.uniform1f(restoreProgram.uniforms.stepTime,dt);
 gl.uniform1f(restoreProgram.uniforms.clock,performance.now()/1000);
 gl.uniform1f(restoreProgram.uniforms.water,new URLSearchParams(location.search).has('water')?1:0);
 gl.uniform1f(restoreProgram.uniforms.aspect,canvas.width/canvas.height);
 gl.uniform1f(restoreProgram.uniforms.mobile,canvas.clientWidth<650?1:0);
 const idle=Math.max(0,(performance.now()-lastGesture-550)/1000);
 const recovery=hybridMode?1.35:Math.min(3.2,idle*4.);
 gl.uniform1f(restoreProgram.uniforms.recoveryAge,initial?10:idle);
 gl.uniform1f(restoreProgram.uniforms.amount,initial?1:1-Math.exp(-dt*recovery));
 blit(dye.write);
 if(materialRecovery&&materialEngine&&!initial)materialEngine.captureLoss(dye.read.texture,dye.write.texture);
 dye.swap();
}
function renderPainting(){
 if(materialEngine&&!guidedRecovery){materialEngine.render();return;}
 gl.disable(gl.BLEND);paintingProgram.bind();
 gl.uniform1i(paintingProgram.uniforms.pigment,dye.read.attach(0));
 gl.uniform1i(paintingProgram.uniforms.wisps,wisps.read.attach(1));blit(null);
}
const painting = new Image();
const smokePainting = new Image();
let loadedPaintings=0;
const startPainting=()=>{
 if(++loadedPaintings!==2)return;
 const coverageCanvas=document.createElement('canvas');
 coverageCanvas.width=painting.naturalWidth;coverageCanvas.height=painting.naturalHeight;
 const coverageContext=coverageCanvas.getContext('2d',{willReadFrequently:true});
 coverageContext.drawImage(painting,0,0);
 paintCoverage=coverageContext.getImageData(0,0,coverageCanvas.width,coverageCanvas.height);
 buildPaintCoverageSums();
 const fmt=ext.formatRGBA;
 wisps=createDoubleFBO(dye.width,dye.height,fmt.internalFormat,fmt.format,ext.halfFloatTexType,ext.supportLinearFiltering?gl.LINEAR:gl.NEAREST);
 gl.bindTexture(gl.TEXTURE_2D,sourceTexture);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,painting);
 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
 gl.bindTexture(gl.TEXTURE_2D,smokeTexture);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,smokePainting);
 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
 restorePainting(0,true);
 if(new URLSearchParams(location.search).has('particles')||guidedRecovery) {
   try { materialEngine=createMaterialEngine(materialRecovery); }
   catch(error) { console.warn('Particle preview unavailable; using light smoke.',error); }
 }
 update();
 if(parent!==window)parent.postMessage({type:'fluid-ready'},location.origin);
};
painting.onload=startPainting;smokePainting.onload=startPainting;
const systemArtwork=false;
const connectedArtwork=false;
painting.src='/hero-workroom-dog-v3.webp';
smokePainting.src='/hero-workroom-dog-v3.webp';
// Repeatable review gesture for comparing smoke and water at the same strength.
document.getElementById('gesture')?.addEventListener('click',()=>{
 const start=performance.now();
 const sweep=(now)=>{
   const t=Math.min(1,(now-start)/650);
   lastGesture=now;
   splat(.35+t*.3,.5+Math.sin(t*Math.PI*2)*.035,3.4,Math.cos(t*Math.PI*2)*1.5,{r:0,g:0,b:0});
   if(t<1)requestAnimationFrame(sweep);
 };
 requestAnimationFrame(sweep);
});

let materialEngine=null,recoveryDensity=null,returningDeposit=null;
const materialRecovery=new URLSearchParams(location.search).has("material-recovery");
const guidedRecovery=materialRecovery||new URLSearchParams(location.search).has("guided");
/* global gl, canvas, Program, compileShader, baseVertexShader, ext, createDoubleFBO, createFBO, sourceTexture, activityTexture, blit, velocity, pigmentNoise, connectedArtwork */
// Generator include, not an independently loaded browser script.
// GPU material samples retain their source color. State = displacement.xy,
// local age.z, released fraction.w. No per-frame CPU particle simulation.
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Called from the assembled generator output.
function createMaterialEngine(coupled=false) {
  if (!gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS)) throw new Error('Vertex texture sampling unavailable');
  // Hidden guidance needs coherent density, not full-image particle detail.
  // The measured-material variant uses 75% fewer samples than the prototype.
  const width=coupled?256:512, height=coupled?171:342, count=width*height;
  const fmt=ext.formatRGBA;
  gl.clearColor(0,0,0,0);
  const state=createDoubleFBO(width,height,fmt.internalFormat,fmt.format,ext.halfFloatTexType,gl.NEAREST);
  let density=null;
  const loss=coupled?createFBO(width,height,fmt.internalFormat,fmt.format,ext.halfFloatTexType,gl.LINEAR):null;
  let deposit=null;
  const mapping=`
    uniform float cleanPaper;
    vec2 sizeOfArt(float aspect){float h=min(.9*aspect/1.5,.78);return vec2(h*1.5/aspect,h);}
    vec2 homeOf(vec2 uv,float aspect){return vec2(.5)+ (uv-.5)*sizeOfArt(aspect);}
    vec3 inkOf(vec4 paint,vec2 uv){
      vec3 raw=1.-paint.rgb;
      vec2 edge=smoothstep(vec2(0.),vec2(.09),min(uv,1.-uv));
      return mix(raw,max(vec3(0.),raw-.018)/.982*edge.x*edge.y,cleanPaper)*paint.a*.85;
    }
  `;
  const evolve=new Program(baseVertexShader,compileShader(gl.FRAGMENT_SHADER,`
    precision highp float; varying vec2 vUv;
    uniform sampler2D previous, flow, activity, original, crowding, measuredLoss;
    uniform float dt, clock, aspect, densityReady, coupled, lossScale;
    uniform vec2 flowPixel, densityPixel;
    ${mapping}
    ${pigmentNoise}
    void main(){
      vec4 old=texture2D(previous,vUv);
      vec3 ink=inkOf(texture2D(original,vUv),vUv);
      if(max(ink.r,max(ink.g,ink.b))<.012){gl_FragColor=vec4(0.);return;}
      vec2 home=homeOf(vUv,aspect),pos=home+old.xy;
      // Age belongs to each material sample, not to the global gesture.
      float fresh=max(texture2D(activity,home).r,texture2D(activity,pos).r);
      float age=min(old.z+dt,12.);
      if(fresh>.93)age=0.;
      float released=old.w;
      float brush=smoothstep(.91,.985,fresh);
      if(coupled>.5){
        // Each measured frame loss is consumed once, split across substeps.
        // Source color remains a proxy; loss magnitude is no longer guessed
        // from cursor activity. Cap repeated releases to a source budget.
        vec3 missing=texture2D(measuredLoss,vUv).rgb;
        float fraction=max(missing.r,max(missing.g,missing.b))/max(.012,max(ink.r,max(ink.g,ink.b)));
        if(fresh>.5)released=min(1.,released+fraction*lossScale);
      }else if(brush>0.)released=mix(released,max(released,brush),1.-exp(-dt*22.));
      float seed=noise(vUv*vec2(18.,12.));
      float gather=smoothstep(.75+seed*.18,1.75+seed*.3,age);
      float detail=smoothstep(1.9,3.8,age);
      vec2 offset=old.xy;
      vec2 motion=texture2D(flow,clamp(pos,vec2(.001),vec2(.999))).xy*flowPixel;
      // Bounded curl advection keeps samples close enough to gather legibly.
      vec2 q=vec2(pos.x*aspect,pos.y);
      // Shared stream-function curls: neighbors travel as wisps, not dust.
      vec2 curl=vec2(.8,-.6)*cos(dot(q,vec2(.6,.8))*55.+clock*.6)
        +vec2(-.45,-.9)*cos(dot(q,vec2(.9,-.45))*103.-clock*.8)*.38;
      vec2 air=motion*.86+curl*vec2(.023/aspect,.023);
      // Gentle material pressure prevents circular strokes packing samples
      // into a dark ring. It transports ink outward rather than deleting it.
      vec2 gx=vec2(densityPixel.x*3.,0.),gy=vec2(0.,densityPixel.y*3.);
      vec3 dx=texture2D(crowding,pos+gx).rgb-texture2D(crowding,pos-gx).rgb;
      vec3 dy=texture2D(crowding,pos+gy).rgb-texture2D(crowding,pos-gy).rgb;
      vec2 gradient=vec2(dot(dx,vec3(.333)),dot(dy,vec3(.333)));
      air-=gradient/(.04+length(gradient))*vec2(.025/aspect,.025)*densityReady;
      float speed=length(air*vec2(aspect,1.));
      air*=min(1.,.22/max(speed,.0001));
      offset+=dt*air*released*(1.-gather);
      // First collect into coarse home territories, then resolve within them.
      // A first-order, bounded arrival avoids spring oscillation/rubber bands.
      vec2 territory=(vec2(noise(vUv*22.),noise(vUv*22.+7.))-.5)*vec2(.017/aspect,.017);
      vec2 target=territory*(1.-detail);
      vec2 toward=target-offset;
      float distance=length(toward*vec2(aspect,1.));
      float arrival=min(1.-exp(-dt*mix(2.8,5.,detail)),dt*.105/max(distance,.0001));
      offset+=toward*arrival*gather;
      // A small shared tangential flow bends arrival without spring inertia.
      offset+=vec2(-toward.y/aspect,toward.x*aspect)*dt*.55*gather*(1.-detail);
      // Material hands off to high-resolution detail only after arriving.
      float landed=(1.-smoothstep(.001,.009,length(offset*vec2(aspect,1.))))*detail;
      if(fresh<.9)released*=exp(-dt*landed*4.5);
      if(released<.0005){released=0.;offset=vec2(0.);}
      offset=clamp(offset,vec2(-.28/aspect,-.22),vec2(.28/aspect,.22));
      gl_FragColor=vec4(offset,age,released);
    }
  `));
  const draw=new Program(compileShader(gl.VERTEX_SHADER,`
    precision highp float;
    attribute vec2 aPosition;
    uniform sampler2D state, original, flow;
    uniform float aspect, resolutionY, recoveryOnly;
    uniform vec2 grid;
    varying vec3 ink;
    varying float energy;
    varying vec2 direction;
    varying float slenderness;
    ${mapping}
    void main(){
      vec4 sampleState=texture2D(state,aPosition);
      vec4 paint=texture2D(original,aPosition);
      ink=inkOf(paint,aPosition)*sampleState.w;
      ink*=mix(1.,smoothstep(.8,1.8,sampleState.z),recoveryOnly);
      vec2 size=sizeOfArt(aspect);
      vec2 pos=homeOf(aPosition,aspect)+sampleState.xy;
      gl_Position=vec4(pos*2.-1.,0.,1.);
      float cell=resolutionY*size.y/grid.y;
      float spread=smoothstep(.0005,.025,length(sampleState.xy*vec2(aspect,1.)));
      vec2 flowDirection=texture2D(flow,clamp(pos,vec2(.001),vec2(.999))).xy;
      vec2 heading=flowDirection+sampleState.xy*vec2(aspect,1.)*30.;
      direction=length(heading)>.0001?normalize(heading):vec2(1.,0.);
      slenderness=mix(1.,.42,spread);
      float diameter=max(2.,cell*mix(2.4,11.,spread));
      gl_PointSize=diameter;
      // Gaussian integral ~0.193 of square area; preserve pigment quantity
      // while changing splat width, instead of darkening expanding clouds.
      energy=cell*cell/(diameter*diameter*.193*slenderness);
    }
  `),compileShader(gl.FRAGMENT_SHADER,`
    precision highp float; varying vec3 ink; varying float energy;
    varying vec2 direction; varying float slenderness;
    void main(){
      vec2 p=gl_PointCoord*2.-1.;
      p.y=-p.y;
      p=vec2(dot(p,direction),dot(p,vec2(-direction.y,direction.x))/slenderness);
      float r=dot(p,p);
      if(r>1.)discard;
      gl_FragColor=vec4(ink*exp(-4.*r)*energy,1.);
    }
  `));
  const composite=new Program(baseVertexShader,compileShader(gl.FRAGMENT_SHADER,`
    precision highp float; varying vec2 vUv;
    uniform sampler2D original, state, density;
    uniform float aspect;
    uniform vec2 grid, densityPixel;
    ${mapping}
    void main(){
      vec2 uv=(vUv-.5)/sizeOfArt(aspect)+.5;
      vec3 anchored=vec3(0.);
      if(all(greaterThanEqual(uv,vec2(0.)))&&all(lessThanEqual(uv,vec2(1.)))){
        vec4 paint=texture2D(original,uv);
        // Interpolate only the release mask, not particle identities/state.
        vec2 cell=uv*grid-.5,base=(floor(cell)+.5)/grid,f=fract(cell);
        float release=mix(mix(texture2D(state,base).w,texture2D(state,base+vec2(1./grid.x,0.)).w,f.x),
          mix(texture2D(state,base+vec2(0.,1./grid.y)).w,texture2D(state,base+1./grid).w,f.x),f.y);
        anchored=inkOf(paint,uv)*(1.-release);
      }
      // A one-pixel density reconstruction removes sample grain, without
      // blurring the intact painting or creating a persistent smoke overlay.
      vec3 carried=texture2D(density,vUv).rgb*.5
        +(texture2D(density,vUv+vec2(densityPixel.x,0.)).rgb
         +texture2D(density,vUv-vec2(densityPixel.x,0.)).rgb
         +texture2D(density,vUv+vec2(0.,densityPixel.y)).rgb
         +texture2D(density,vUv-vec2(0.,densityPixel.y)).rgb)*.125;
      // Gentle density shoulder prevents piled-up samples turning black.
      carried=carried/(1.+max(vec3(0.),carried-.22)*2.);
      gl_FragColor=vec4(max(vec3(0.),vec3(.9647,.9686,.9569)-anchored-carried),1.);
    }
  `));
  const lossProgram=coupled?new Program(baseVertexShader,compileShader(gl.FRAGMENT_SHADER,`
    precision highp float; varying vec2 vUv;
    uniform sampler2D beforeDye, afterDye;
    uniform float aspect;
    ${mapping}
    void main(){
      vec2 home=homeOf(vUv,aspect);
      vec3 removed=max(texture2D(beforeDye,home).rgb-texture2D(afterDye,home).rgb,vec3(0.));
      gl_FragColor=vec4(removed,1.);
    }
  `)):null;
  const depositProgram=coupled?new Program(baseVertexShader,compileShader(gl.FRAGMENT_SHADER,`
    precision highp float; varying vec2 vUv;
    uniform sampler2D original, current, plume, arriving, activity, flow;
    uniform float aspect, dt;
    ${mapping}
    void main(){
      vec2 uv=(vUv-.5)/sizeOfArt(aspect)+.5;
      if(any(lessThan(uv,vec2(0.)))||any(greaterThan(uv,vec2(1.)))){gl_FragColor=vec4(0.);return;}
      vec3 target=inkOf(texture2D(original,uv),uv);
      vec3 existing=texture2D(current,vUv).rgb;
      vec3 missing=max(target-existing,vec3(0.));
      float localAge=max(0.,(1.-texture2D(activity,vUv).r)*3.2-1.12);
      float quiet=1.-smoothstep(.12,1.8,length(texture2D(flow,vUv).xy));
      quiet=max(quiet,.24*smoothstep(0.,.7,localAge));
      float gate=smoothstep(0.,.7,localAge)*quiet;
      // Soft neighborhood support, never the individual particle silhouette.
      vec2 reach=vec2(.006/aspect,.006);
      vec3 support=(texture2D(arriving,vUv).rgb*4.
        +texture2D(arriving,vUv+vec2(reach.x,0.)).rgb
        +texture2D(arriving,vUv-vec2(reach.x,0.)).rgb
        +texture2D(arriving,vUv+vec2(0.,reach.y)).rgb
        +texture2D(arriving,vUv-vec2(0.,reach.y)).rgb)/8.;
      float guided=smoothstep(.004,.075,max(support.r,max(support.g,support.b)));
      float fraction=1.-exp(-dt*mix(1.65,${arrivalSmoke ? "7.0" : "6.05"},guided)*gate);
      float disturbed=smoothstep(.008,.09,length(existing-target));
      vec3 delivered=min(missing,texture2D(plume,vUv).rgb*fraction)*step(.001,disturbed);
      gl_FragColor=vec4(delivered,1.);
    }
  `)):null;
  const withdrawProgram=coupled?new Program(baseVertexShader,compileShader(gl.FRAGMENT_SHADER,`
    precision highp float; varying vec2 vUv; uniform sampler2D plume, deposit;
    void main(){gl_FragColor=vec4(max(vec3(0.),texture2D(plume,vUv).rgb-texture2D(deposit,vUv).rgb),1.);}
  `)):null;
  for(const program of [evolve,draw,composite,lossProgram,depositProgram,withdrawProgram].filter(Boolean)) {
    if(!gl.getProgramParameter(program.program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program.program));
  }
  const quadBuffer=gl.getVertexAttrib(0,gl.VERTEX_ATTRIB_ARRAY_BUFFER_BINDING);
  const vertices=new Float32Array(count*2);
  for(let y=0;y<height;y++)for(let x=0;x<width;x++){
    const i=(y*width+x)*2;
    vertices[i]=(x+.5)/width;vertices[i+1]=(y+.5)/height;
  }
  const pointBuffer=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,pointBuffer);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER,quadBuffer);
  function texture(program,name,unit,value){
    gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,value);
    gl.uniform1i(program.uniforms[name],unit);
  }
  let last=performance.now();
  function step(){
    const now=performance.now(),elapsed=Math.min(.1,Math.max(0,(now-last)/1000));last=now;
    // Integrate real elapsed time in bounded steps, including 30 Hz displays.
    const steps=Math.max(1,Math.ceil(elapsed/(1/60)));
    for(let i=0;i<steps;i++){
      gl.disable(gl.BLEND);evolve.bind();
      gl.uniform1f(evolve.uniforms.cleanPaper,connectedArtwork?1:0);
      texture(evolve,'previous',0,state.read.texture);
      texture(evolve,'flow',1,velocity.read.texture);
      texture(evolve,'activity',2,activityTexture);
      texture(evolve,'original',3,sourceTexture);
      texture(evolve,'measuredLoss',5,loss?loss.texture:sourceTexture);
      gl.uniform1f(evolve.uniforms.coupled,coupled?1:0);
      gl.uniform1f(evolve.uniforms.lossScale,1/steps);
      texture(evolve,'crowding',4,density?density.texture:state.read.texture);
      gl.uniform1f(evolve.uniforms.densityReady,density?1:0);
      gl.uniform2f(evolve.uniforms.densityPixel,density?1/density.width:1/width,density?1/density.height:1/height);
      gl.uniform1f(evolve.uniforms.dt,elapsed/steps);
      gl.uniform1f(evolve.uniforms.clock,now/1000);
      gl.uniform1f(evolve.uniforms.aspect,canvas.width/canvas.height);
      gl.uniform2f(evolve.uniforms.flowPixel,velocity.texelSizeX,velocity.texelSizeY);
      blit(state.write);state.swap();
    }
  }
  function render(recoveryOnly=false){
    const renderHeight=Math.min(canvas.height,coupled?640:1200);
    const renderWidth=Math.round(renderHeight*canvas.width/canvas.height);
    if(!density||density.width!==renderWidth||density.height!==renderHeight){
      if(density){gl.deleteTexture(density.texture);gl.deleteFramebuffer(density.fbo);}
      density=createFBO(renderWidth,renderHeight,fmt.internalFormat,fmt.format,ext.halfFloatTexType,gl.LINEAR);
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER,density.fbo);gl.viewport(0,0,density.width,density.height);
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);draw.bind();
    gl.uniform1f(draw.uniforms.cleanPaper,connectedArtwork?1:0);
    gl.uniform1f(draw.uniforms.recoveryOnly,recoveryOnly?1:0);
    texture(draw,'state',0,state.read.texture);texture(draw,'original',1,sourceTexture);
    texture(draw,'flow',2,velocity.read.texture);
    gl.uniform1f(draw.uniforms.aspect,canvas.width/canvas.height);
    gl.uniform1f(draw.uniforms.resolutionY,density.height);
    gl.uniform2f(draw.uniforms.grid,width,height);
    gl.bindBuffer(gl.ARRAY_BUFFER,pointBuffer);
    gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);gl.enableVertexAttribArray(0);
    gl.drawArrays(gl.POINTS,0,count);
    // Restore upstream fullscreen-quad state before any solver/composite pass.
    gl.bindBuffer(gl.ARRAY_BUFFER,quadBuffer);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
    if(recoveryOnly){gl.disable(gl.BLEND);return density.texture;}
    gl.disable(gl.BLEND);composite.bind();
    gl.uniform1f(composite.uniforms.cleanPaper,connectedArtwork?1:0);
    texture(composite,'original',0,sourceTexture);texture(composite,'state',1,state.read.texture);
    texture(composite,'density',2,density.texture);
    gl.uniform1f(composite.uniforms.aspect,canvas.width/canvas.height);
    gl.uniform2f(composite.uniforms.grid,width,height);
    gl.uniform2f(composite.uniforms.densityPixel,1/density.width,1/density.height);blit(null);
  }
  function captureLoss(before,after){
    if(!coupled)return;
    gl.disable(gl.BLEND);lossProgram.bind();
    texture(lossProgram,'beforeDye',0,before);texture(lossProgram,'afterDye',1,after);
    gl.uniform1f(lossProgram.uniforms.aspect,canvas.width/canvas.height);blit(loss);
  }
  function prepareDeposit(current,plume,arriving,dt){
    if(!coupled)return null;
    if(!deposit||deposit.width!==current.width||deposit.height!==current.height){
      if(deposit){gl.deleteTexture(deposit.texture);gl.deleteFramebuffer(deposit.fbo);}
      deposit=createFBO(current.width,current.height,fmt.internalFormat,fmt.format,ext.halfFloatTexType,gl.LINEAR);
    }
    gl.disable(gl.BLEND);depositProgram.bind();
    texture(depositProgram,'original',0,sourceTexture);texture(depositProgram,'current',1,current.texture);
    texture(depositProgram,'plume',2,plume.texture);texture(depositProgram,'arriving',3,arriving);
    texture(depositProgram,'activity',4,activityTexture);texture(depositProgram,'flow',5,velocity.read.texture);
    gl.uniform1f(depositProgram.uniforms.aspect,canvas.width/canvas.height);
    gl.uniform1f(depositProgram.uniforms.cleanPaper,connectedArtwork?1:0);
    gl.uniform1f(depositProgram.uniforms.dt,dt);blit(deposit);
    return deposit.texture;
  }
  function withdrawDeposit(wisps){
    if(!coupled||!deposit)return;
    gl.disable(gl.BLEND);withdrawProgram.bind();
    texture(withdrawProgram,'plume',0,wisps.read.texture);texture(withdrawProgram,'deposit',1,deposit.texture);
    blit(wisps.write);wisps.swap();
  }
  return {step,render,captureLoss,prepareDeposit,withdrawDeposit,state,count,coupled,loss,
    get deposit(){return deposit;},backend:'WebGL GPU particle/grid',width,height};
}
