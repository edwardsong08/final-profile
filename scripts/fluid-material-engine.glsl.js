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
      float fraction=1.-exp(-dt*mix(1.65,6.05,guided)*gate);
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
