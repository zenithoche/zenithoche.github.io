(function(){
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  document.querySelectorAll('.journey-button[href^="#"]').forEach((link)=>{
    link.addEventListener('click',(event)=>{
      const target=document.querySelector(link.getAttribute('href'));
      if(!target)return;
      event.preventDefault();
      target.scrollIntoView({behavior:reducedMotion?'auto':'smooth',block:'start'});
    });
  });

  // Layered city movement: scenery and district glass move at different depths while controls remain readable.
  if(!reducedMotion&&window.matchMedia('(min-width: 981px)').matches){
    const scenes=Array.from(document.querySelectorAll('.journey-scene,.plane-section'));
    const visible=new Set();
    const observer=new IntersectionObserver((entries)=>{
      entries.forEach((entry)=>entry.isIntersecting?visible.add(entry.target):visible.delete(entry.target));
      requestUpdate();
    });
    let scheduled=false;
    function requestUpdate(){
      if(scheduled)return;
      scheduled=true;
      requestAnimationFrame(()=>{
        visible.forEach((scene)=>{
          const rect=scene.getBoundingClientRect();
          const viewportCenter=window.innerHeight*.5;
          const sceneCenter=rect.top+rect.height*.5;
          const travel=Math.max(window.innerHeight*.9,rect.height*.72);
          const progress=Math.max(-1,Math.min(1,(viewportCenter-sceneCenter)/travel));
          const distance=Math.abs(progress);
          const sceneShift=progress*48;
          const panelShift=progress*-24;
          const panelScale=1-distance*.024;
          const panelTilt=progress*.72;
          const panelZ=-distance*20;
          scene.style.setProperty('--scene-shift',sceneShift.toFixed(1)+'px');
          scene.style.setProperty('--panel-shift',panelShift.toFixed(1)+'px');
          scene.style.setProperty('--panel-scale',panelScale.toFixed(4));
          scene.style.setProperty('--panel-tilt',panelTilt.toFixed(3)+'deg');
          scene.style.setProperty('--panel-z',panelZ.toFixed(1)+'px');
        });
        scheduled=false;
      });
    }
    scenes.forEach((scene)=>{
      observer.observe(scene);
      const petals=document.createElement('div');
      petals.className='scene-petals';petals.setAttribute('aria-hidden','true');
      for(let i=0;i<6;i++){
        const petal=document.createElement('i');
        petal.style.setProperty('--petal-x',(9+i*16)+'%');
        petal.style.setProperty('--petal-duration',(18+i*2)+'s');
        petal.style.setProperty('--petal-delay',(-i*4)+'s');
        petals.appendChild(petal);
      }
      scene.appendChild(petals);
    });
    window.addEventListener('scroll',requestUpdate,{passive:true});
    window.addEventListener('resize',requestUpdate,{passive:true});
  }
})();
