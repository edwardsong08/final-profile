// Reproducible, narrowly scoped adaptation of the MIT upstream study.
// This standalone Node build helper intentionally uses CommonJS.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('node:fs');
let s = fs.readFileSync('public/fluid-upstream-study.js', 'utf8').replace(/\r\n/g, '\n');
s = s.replace(/\/\/ Mobile promo section[\s\S]*?\/\/ Simulation section/, '// Local watercolor study; upstream MIT license retained.');
s = s.replace('startGUI();', '');
s = s.replace(/^.*ga\('send'.*$/gm, '');
s = s.replace("let ditheringTexture = createTextureAsync('LDR_LLL1_0.png');", 'let ditheringTexture;');
s = s.replace('multipleSplats(parseInt(Math.random() * 20) + 5);', '');
s = s.replace('\nupdate();', '\n// Start after the watercolor texture has loaded.');
s = s.replace('    DENSITY_DISSIPATION: 1,', '    DENSITY_DISSIPATION: 0,');
s = s.replace('    SIM_RESOLUTION: 128,', '    SIM_RESOLUTION: 192,');
s = s.replace('    VELOCITY_DISSIPATION: 0.2,', '    VELOCITY_DISSIPATION: 4.2,');
s = s.replace('    CURL: 30,', "    CURL: new URLSearchParams(location.search).has('water') ? 5 : 14,");
s = s.replace('    SPLAT_RADIUS: 0.25,', '    SPLAT_RADIUS: 0.16,');
s = s.replace('    SPLAT_FORCE: 6000,', "    SPLAT_FORCE: new URLSearchParams(location.search).has('water') ? 320 : 400,");
for (const k of ['SHADING','COLORFUL','BLOOM','SUNRAYS']) s = s.replace(`${k}: true`, `${k}: false`);
s = s.replace('    updateColors(dt);', '    if (document.hidden || !embedVisible) { requestAnimationFrame(update); return; }');
s = s.replace('    render(null);', '    evolveWisps(dt);\n    restorePainting(dt);\n    renderPainting();');
// Keep the solver's velocity dynamics, but shorten pigment travel. Local
// diffusion and thinning below now do more of the visible work than dragging.
s = s.replace('    gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));',
  '    gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));\n    gl.uniform1f(advectionProgram.uniforms.dt, dt * .52);');
// Apply pointer forces exclusively to velocity. Never inject random colors.
s = s.replace(/    gl.uniform1i\(splatProgram.uniforms.uTarget, dye.read.attach\(0\)\);[\s\S]*?    dye.swap\(\);/, '');
s = s.replace("canvas.addEventListener('mousemove', e => {", "canvas.addEventListener('mousemove', e => {\n    noteGesture(performance.now());");
s = s.replace('    if (!pointer.down) return;', '    // Hover moves pigment too.');
// Bound a sparse/fast pointer event so it cannot fling the whole painting.
s = s.replace('    splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);',
  '    const speed = Math.hypot(dx, dy);\n    const scale = Math.min(1, 18 / Math.max(speed, .001));\n    splat(pointer.texcoordX, pointer.texcoordY, dx * scale, dy * scale, pointer.color);');
s = s.replace("canvas.addEventListener('mousedown', e => {", "canvas.addEventListener('mouseenter', e => { updatePointerDownData(pointers[0], -1, scaleByPixelRatio(e.offsetX), scaleByPixelRatio(e.offsetY)); });\ncanvas.addEventListener('mousedown', e => {");
s = s.replace("canvas.addEventListener('touchmove', e => {", "canvas.addEventListener('touchmove', e => {\n    noteGesture(performance.now());");
s += `
// The dye stores pigment absorption, so white paper contributes no dye.
let lastGesture = -10000;
let gestureStart = -10000;
let lastGestureEvent = -10000;
function noteGesture(now){
 if(now-lastGestureEvent>220)gestureStart=now;
 lastGestureEvent=now;
 lastGesture=gestureStart;
}
let embedVisible=true;
let lastEmbeddedPointer=0;
let paintCoverage=null;
function hitsPaint(x,y){
 if(!paintCoverage)return false;
 const aspect=canvas.width/canvas.height;
 const h=Math.min(.9*aspect/1.5,.78),w=h*1.5/aspect;
 const u=(x-.5)/w+.5,v=(y-(canvas.clientWidth<650?.33:.5))/h+.5;
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
 lastEmbeddedPointer=now;noteGesture(now);
});
const sourceTexture = gl.createTexture();
const smokeTexture = gl.createTexture();
// Detached wisps carry a fraction of the pigment removed from the painting.
// This is a second transported dye field, not separately colored smoke.
let wisps;
const pigmentNoise = \`
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
\`;
const restoreProgram = new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, \`
 precision highp float; varying vec2 vUv;
 uniform sampler2D current; uniform sampler2D original; uniform sampler2D flow;
 uniform vec2 pixel; uniform float stepTime; uniform float clock; uniform float water;
 uniform float amount; uniform float aspect; uniform float mobile; uniform float recoveryAge;
 \${pigmentNoise}
 vec3 originalPigment(vec2 position) {
   float w = .9; float h = w * aspect / 1.5;
   h = min(h, .78); w = h * 1.5 / aspect;
   vec2 uv = (position - vec2(.5, mix(.5,.67,mobile))) / vec2(w,h) + .5;
   if(any(lessThan(uv,vec2(0.))) || any(greaterThan(uv,vec2(1.)))) return vec3(0.);
   vec4 paint = texture2D(original,uv);
   return (1.-paint.rgb)*paint.a*.85;
 }
 void main(){
   vec3 target=originalPigment(vUv);
   float structure=smoothstep(.035,.24,max(target.r,max(target.g,target.b)));
   vec2 q=vec2(vUv.x*aspect,vUv.y);
   float recoveryPattern=noise(q*24.+vec2(3.,7.));
   float localAge=max(0.,recoveryAge-recoveryPattern*.22);
   float gathering=smoothstep(0.,.7,localAge);
   float detail=smoothstep(.25,1.25,localAge);
   vec2 motion=texture2D(flow,vUv).xy;
   // Recovery is local: areas the pointer has already passed may settle while
   // the active stroke continues, but moving pigment stays out of the way.
   float quiet=1.-smoothstep(.12,1.8,length(motion));
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
   pigment=mix(pigment,nearby,1.-exp(-stepTime*stirred*9.));
   // Keep moving pigment legible long enough to form currents instead of
   // washing the whole territory out in one pass.
   float thinning=stirred*mix(1.2,9.,smoothstep(.25,.7,billow))*(1.-gathering);
   pigment*=exp(-stepTime*thinning*mix(1.,.65,water));
   gl_FragColor=vec4(mix(pigment,target,resilience),1.);
 }
\`));
const wispProgram = new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, \`
 precision highp float; varying vec2 vUv;
 uniform sampler2D previous; uniform sampler2D pigment; uniform sampler2D flow; uniform sampler2D smoke;
 uniform sampler2D home; uniform float recoveryAge;
 uniform vec2 flowPixel; uniform float stepTime; uniform float clock;
 uniform float aspect; uniform float water; uniform float mobile;
 \${pigmentNoise}
 void main(){
   vec2 motion=texture2D(flow,vUv).xy;
   float stirred=smoothstep(.15,4.,length(motion));
   vec2 q=vec2(vUv.x*aspect,vUv.y);
   float n=billows(q,clock);
   // Small curling eddies carry released pigment, never an independent cursor trail.
   vec2 drift=vec2(sin(q.y*85.+clock*.65)*.009/aspect,
     .012+cos(q.x*85.-clock*.55)*.006)*mix(1.,.25,water);
   float gather=smoothstep(0.,.8,recoveryAge);
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
   vec2 transport=mix(outward,inward+drift*.35,gather);
   vec2 uv=clamp(vUv-stepTime*transport,vec2(.001),vec2(.999));
   vec3 carried=texture2D(previous,uv).rgb*exp(-stepTime*mix(1.1,2.0,gather));
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
\`));
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
 gl.uniform1f(wispProgram.uniforms.recoveryAge,Math.max(0,(performance.now()-lastGesture-550)/1000));
 gl.uniform1f(wispProgram.uniforms.mobile,canvas.clientWidth<650?1:0);
 gl.uniform2f(wispProgram.uniforms.flowPixel,velocity.texelSizeX,velocity.texelSizeY);
 gl.uniform1f(wispProgram.uniforms.stepTime,dt);
 gl.uniform1f(wispProgram.uniforms.clock,performance.now()/1000);
 gl.uniform1f(wispProgram.uniforms.aspect,canvas.width/canvas.height);
 gl.uniform1f(wispProgram.uniforms.water,new URLSearchParams(location.search).has('water')?1:0);
 blit(wisps.write);wisps.swap();
}
const paintingProgram = new Program(baseVertexShader, compileShader(gl.FRAGMENT_SHADER, \`
 precision highp float; varying vec2 vUv; uniform sampler2D pigment; uniform sampler2D wisps;
 void main(){vec3 dye=texture2D(pigment,vUv).rgb+texture2D(wisps,vUv).rgb;
 gl_FragColor=vec4(max(vec3(0.),vec3(.9647,.9686,.9569)-dye),1.);}
\`));
function restorePainting(dt, initial=false) {
 gl.disable(gl.BLEND); restoreProgram.bind();
 gl.uniform1i(restoreProgram.uniforms.current,dye.read.attach(0));
 gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,sourceTexture);
 gl.uniform1i(restoreProgram.uniforms.original,1);
 gl.uniform1i(restoreProgram.uniforms.flow,velocity.read.attach(2));
 gl.uniform2f(restoreProgram.uniforms.pixel,dye.texelSizeX,dye.texelSizeY);
 gl.uniform1f(restoreProgram.uniforms.stepTime,dt);
 gl.uniform1f(restoreProgram.uniforms.clock,performance.now()/1000);
 gl.uniform1f(restoreProgram.uniforms.water,new URLSearchParams(location.search).has('water')?1:0);
 gl.uniform1f(restoreProgram.uniforms.aspect,canvas.width/canvas.height);
 gl.uniform1f(restoreProgram.uniforms.mobile,canvas.clientWidth<650?1:0);
 const idle=Math.max(0,(performance.now()-lastGesture-550)/1000);
 const recovery=Math.min(3.2,idle*4.);
 gl.uniform1f(restoreProgram.uniforms.recoveryAge,initial?10:idle);
 gl.uniform1f(restoreProgram.uniforms.amount,initial?1:1-Math.exp(-dt*recovery));
 blit(dye.write);dye.swap();
}
function renderPainting(){
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
 restorePainting(0,true);update();
 if(parent!==window)parent.postMessage({type:'fluid-ready'},location.origin);
};
painting.onload=startPainting;smokePainting.onload=startPainting;
painting.src='/hero-watercolor-territory.webp';
smokePainting.src='/hero-territory-smoke-v2.webp';
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
`;
fs.writeFileSync('public/fluid-watercolor-study.js', s);
