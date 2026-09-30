(function(){
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap=Boolean(window.gsap);

  const scenes=Array.from(document.querySelectorAll('.journey-scene,.plane-section'));
  if(!scenes.length)return;

  document.documentElement.classList.add('scene-deck-mode','scene-click-only');

  function railScroll(dir){
    const rail=document.getElementById('preview-rail');
    if(!rail)return;
    const card=rail.querySelector('.preview-card');
    const step=card?card.getBoundingClientRect().width+22:window.innerWidth*.75;
    rail.scrollBy({left:dir*step,behavior:reducedMotion?'auto':'smooth'});
  }

  document.querySelectorAll('[data-preview-dir]').forEach((button)=>{
    button.addEventListener('click',()=>railScroll(Number(button.dataset.previewDir)||1));
  });

  const rail=document.getElementById('preview-rail');
  if(rail){
    rail.addEventListener('wheel',(event)=>{
      const canMove=event.deltaY>0?rail.scrollLeft<rail.scrollWidth-rail.clientWidth-1:rail.scrollLeft>1;
      if(event.shiftKey&&canMove&&Math.abs(event.deltaY)>Math.abs(event.deltaX)){
        event.preventDefault();
        rail.scrollLeft+=event.deltaY;
      }
    },{passive:false});
  }

  const pocketSelector='.scene-pocket-scroll';
  const horizontalPocketSelector='.scene-pocket-scroll-x,.zeni-shell__inner';

  function verticalPocketFor(target){
    return target&&target.closest?target.closest(pocketSelector):null;
  }

  // The page itself is not scroll navigation. Only explicit inner pockets may move.
  window.addEventListener('wheel',(event)=>{
    const pocket=verticalPocketFor(event.target);
    if(pocket){
      const max=Math.max(0,pocket.scrollHeight-pocket.clientHeight);
      const movingDown=event.deltaY>0;
      const canMove=movingDown?pocket.scrollTop<max-1:pocket.scrollTop>1;
      if(canMove)return;
    }

    if(event.target&&event.target.closest&&event.target.closest(horizontalPocketSelector)){
      const horizontal=event.target.closest(horizontalPocketSelector);
      const delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
      const max=Math.max(0,horizontal.scrollWidth-horizontal.clientWidth);
      const movingRight=delta>0;
      const canMove=movingRight?horizontal.scrollLeft<max-1:horizontal.scrollLeft>1;
      if(canMove){
        event.preventDefault();
        horizontal.scrollLeft+=delta;
        return;
      }
    }

    event.preventDefault();
  },{passive:false});

  document.addEventListener('touchmove',(event)=>{
    if(event.target&&event.target.closest&&(
      event.target.closest(pocketSelector)||
      event.target.closest(horizontalPocketSelector)
    ))return;
    event.preventDefault();
  },{passive:false});

  window.addEventListener('keydown',(event)=>{
    const tag=event.target&&event.target.tagName;
    if(tag==='INPUT'||tag==='TEXTAREA'||tag==='SELECT'||event.target?.isContentEditable)return;
    if(event.target&&event.target.closest&&(
      event.target.closest(pocketSelector)||
      event.target.closest(horizontalPocketSelector)
    ))return;
    if(['ArrowDown','ArrowUp','PageDown','PageUp',' ','Home','End'].includes(event.key)){
      event.preventDefault();
    }
  },{passive:false});

  const pageShell=document.querySelector('.page-shell');
  scenes.forEach((scene,index)=>{
    scene.dataset.sceneIndex=String(index);
    if(!scene.id&&scene.classList.contains('weight-scene'))scene.id='weight';
  });

  function buildPortal(){
    const portal=document.createElement('div');
    portal.className='scene-portal';
    portal.setAttribute('aria-hidden','true');

    const veil=document.createElement('div');
    veil.className='scene-portal__veil';
    const halo=document.createElement('div');
    halo.className='scene-portal__halo';
    const line=document.createElement('div');
    line.className='scene-portal__line';
    const particles=document.createElement('div');
    particles.className='scene-portal__particles';

    for(let i=0;i<24;i++){
      const particle=document.createElement('i');
      particle.style.setProperty('--x',(((i*37)%94)+3)+'%');
      particle.style.setProperty('--y',(((i*53)%88)+6)+'%');
      particle.style.setProperty('--s',(1.1+(i%5)*.52).toFixed(2)+'px');
      particle.style.setProperty('--o',(0.16+(i%6)*.07).toFixed(2));
      particles.appendChild(particle);
    }

    portal.append(veil,halo,line,particles);
    document.body.appendChild(portal);
    return {portal,veil,halo,line,particles};
  }

  function buildStepper(){
    const stepper=document.createElement('div');
    stepper.className='scene-stepper';
    stepper.setAttribute('aria-label','Homepage scene controls');

    const prev=document.createElement('button');
    prev.type='button';
    prev.className='scene-stepper__prev';
    prev.setAttribute('aria-label','Previous scene');
    prev.innerHTML='↑';

    const count=document.createElement('span');
    count.className='scene-stepper__count';
    count.setAttribute('aria-live','polite');

    const next=document.createElement('button');
    next.type='button';
    next.className='scene-stepper__next';
    next.setAttribute('aria-label','Next scene');
    next.innerHTML='↓';

    stepper.append(prev,count,next);
    document.body.appendChild(stepper);
    return {stepper,prev,count,next};
  }

  const portal=buildPortal();
  const controls=buildStepper();

  function sceneIndexForHash(hash){
    if(!hash||hash==='#')return -1;
    const target=document.querySelector(hash);
    if(!target)return -1;
    return scenes.findIndex((scene)=>scene===target||scene.contains(target));
  }

  let current=sceneIndexForHash(window.location.hash);
  if(current<0)current=0;
  let animating=false;

  function setSceneVisibility(scene,active,z){
    if(hasGsap){
      gsap.set(scene,{autoAlpha:active?1:0,zIndex:z});
    }else{
      scene.style.opacity=active?'1':'0';
      scene.style.visibility=active?'visible':'hidden';
      scene.style.zIndex=String(z);
    }
  }

  function syncSceneState(){
    scenes.forEach((scene,index)=>{
      const active=index===current;
      scene.classList.toggle('is-deck-active',active);
      if(!scene.classList.contains('is-deck-transition')){
        setSceneVisibility(scene,active,active?3:0);
      }
      scene.setAttribute('aria-hidden',active?'false':'true');

      scene.querySelectorAll('video').forEach((video)=>{
        if(active){
          const play=video.play();
          if(play&&typeof play.catch==='function')play.catch(()=>{});
        }else{
          video.pause();
        }
      });
    });

    controls.prev.disabled=current===0;
    controls.next.disabled=false;
    controls.count.textContent=String(current+1).padStart(2,'0')+' / '+String(scenes.length).padStart(2,'0');
    if(pageShell)pageShell.classList.toggle('is-last-scene',current===scenes.length-1);
  }

  scenes.forEach((scene,index)=>{
    const panel=scene.querySelector(':scope > .journey-wrap');
    setSceneVisibility(scene,index===current,index===current?3:0);
    if(panel&&hasGsap)gsap.set(panel,{clearProps:'transform,opacity'});
  });
  if(hasGsap)gsap.set(portal.portal,{autoAlpha:0});
  syncSceneState();

  function edgeNudge(direction){
    if(!hasGsap||animating)return;
    const panel=scenes[current].querySelector(':scope > .journey-wrap');
    if(!panel)return;
    gsap.fromTo(panel,
      {y:0},
      {y:direction>0?-10:10,duration:.13,yoyo:true,repeat:1,ease:'power2.out',overwrite:true}
    );
  }

  function updateHash(index){
    const id=scenes[index].id;
    if(!id)return;
    try{history.replaceState(null,'','#'+id);}catch(_){}
  }

  function finishSceneSwap(previous,nextIndex,outgoingPanel,incomingPanel){
    current=nextIndex;

    scenes[previous].classList.remove('is-deck-active','is-deck-transition');
    scenes[current].classList.remove('is-deck-transition');
    scenes[current].classList.add('is-deck-active');

    setSceneVisibility(scenes[previous],false,0);
    setSceneVisibility(scenes[current],true,3);

    if(hasGsap){
      gsap.set(scenes[previous],{clearProps:'--scene-bg-blur,--scene-bg-brightness,--scene-bg-scale'});
      gsap.set(scenes[current],{clearProps:'--scene-bg-blur,--scene-bg-brightness,--scene-bg-scale'});
      if(outgoingPanel)gsap.set(outgoingPanel,{clearProps:'transform,opacity'});
      if(incomingPanel)gsap.set(incomingPanel,{clearProps:'transform,opacity'});
    }
    if(incomingPanel){
      incomingPanel.scrollTop=0;
      incomingPanel.querySelectorAll('.scene-pocket-scroll,.scene-pocket-scroll-x').forEach((pocket)=>{
        pocket.scrollTop=0;
        pocket.scrollLeft=0;
      });
    }

    animating=false;
    updateHash(current);
    syncSceneState();
  }

  function goToScene(nextIndex,direction){
    if(animating)return;
    if(nextIndex<0||nextIndex>=scenes.length){
      edgeNudge(direction||1);
      return;
    }
    if(nextIndex===current)return;

    const previous=current;
    const outgoing=scenes[previous];
    const incoming=scenes[nextIndex];
    const outgoingPanel=outgoing.querySelector(':scope > .journey-wrap');
    const incomingPanel=incoming.querySelector(':scope > .journey-wrap');
    const dir=direction||Math.sign(nextIndex-current)||1;

    animating=true;
    controls.prev.disabled=true;
    controls.next.disabled=true;

    outgoing.classList.add('is-deck-transition');
    incoming.classList.add('is-deck-transition');
    incoming.setAttribute('aria-hidden','false');

    if(!hasGsap){
      setSceneVisibility(outgoing,false,0);
      setSceneVisibility(incoming,true,3);
      finishSceneSwap(previous,nextIndex,outgoingPanel,incomingPanel);
      return;
    }

    gsap.set(incoming,{
      autoAlpha:1,
      zIndex:4,
      '--scene-bg-blur':reducedMotion?'0px':'10px',
      '--scene-bg-brightness':reducedMotion?'1':'.70',
      '--scene-bg-scale':reducedMotion?'1.045':'1.085'
    });
    gsap.set(outgoing,{zIndex:3});

    if(incomingPanel){
      gsap.set(incomingPanel,{
        autoAlpha:reducedMotion?0:.18,
        y:reducedMotion?0:dir*110,
        scale:reducedMotion?1:1.035,
        rotateX:reducedMotion?0:dir*-1.15,
        transformOrigin:'50% 50%'
      });
    }

    const durationScale=window.matchMedia('(max-width: 640px)').matches ? .84 : 1;
    const tl=gsap.timeline({
      defaults:{overwrite:true},
      onComplete:()=>finishSceneSwap(previous,nextIndex,outgoingPanel,incomingPanel)
    });

    if(reducedMotion){
      tl
        .to(outgoing,{autoAlpha:0,duration:.12},0)
        .to(incoming,{autoAlpha:1,duration:.18},.08);
      return;
    }

    tl
      .set(portal.portal,{autoAlpha:1,visibility:'visible'},0)
      .fromTo(portal.veil,{scaleY:.035},{scaleY:1,duration:.28*durationScale,ease:'power3.inOut'},0)
      .fromTo(portal.line,{scaleX:.04,autoAlpha:0},{scaleX:1,autoAlpha:.95,duration:.25*durationScale,ease:'power2.out'},.02*durationScale)
      .fromTo(portal.halo,{scaleX:.52,autoAlpha:0},{scaleX:1.08,autoAlpha:.82,duration:.28*durationScale,ease:'power2.out'},.02*durationScale)
      .fromTo(portal.particles,{autoAlpha:0,y:dir*24},{autoAlpha:.78,y:-dir*18,duration:.38*durationScale,ease:'power1.out'},.02*durationScale);

    if(outgoingPanel){
      tl.to(outgoingPanel,{
        y:-dir*96,
        scale:.955,
        rotateX:dir*1.05,
        autoAlpha:.08,
        duration:.34*durationScale,
        ease:'power3.in'
      },0);
    }

    tl.to(outgoing,{
      '--scene-bg-blur':'13px',
      '--scene-bg-brightness':'.58',
      '--scene-bg-scale':'1.09',
      duration:.30*durationScale,
      ease:'power2.in'
    },0)
      .set(outgoing,{autoAlpha:0,zIndex:0},.29*durationScale);

    if(incomingPanel){
      tl.to(incomingPanel,{
        y:0,
        scale:1,
        rotateX:0,
        autoAlpha:1,
        duration:.52*durationScale,
        ease:'expo.out'
      },.27*durationScale);
    }

    tl.to(incoming,{
      '--scene-bg-blur':'0px',
      '--scene-bg-brightness':'1',
      '--scene-bg-scale':'1.045',
      duration:.48*durationScale,
      ease:'power2.out'
    },.27*durationScale)
      .to(portal.veil,{scaleY:.035,duration:.40*durationScale,ease:'power3.inOut'},.34*durationScale)
      .to(portal.line,{scaleX:.16,autoAlpha:0,duration:.32*durationScale,ease:'power2.in'},.35*durationScale)
      .to(portal.halo,{scaleX:.60,autoAlpha:0,duration:.32*durationScale,ease:'power2.in'},.35*durationScale)
      .to(portal.particles,{autoAlpha:0,y:-dir*38,duration:.28*durationScale,ease:'power1.in'},.38*durationScale)
      .set(portal.portal,{autoAlpha:0,visibility:'hidden'},.78*durationScale);
  }

  controls.prev.addEventListener('click',()=>goToScene(current-1,-1));
  controls.next.addEventListener('click',()=>goToScene((current+1)%scenes.length,1));

  document.querySelectorAll('a[href^="#"]').forEach((link)=>{
    link.addEventListener('click',(event)=>{
      const index=sceneIndexForHash(link.getAttribute('href'));
      if(index<0)return;
      event.preventDefault();
      goToScene(index,Math.sign(index-current)||1);
    });
  });

  window.addEventListener('hashchange',()=>{
    const index=sceneIndexForHash(window.location.hash);
    if(index>=0&&index!==current)goToScene(index,Math.sign(index-current)||1);
  });
})();
