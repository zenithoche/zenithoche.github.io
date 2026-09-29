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

  const scenes=Array.from(document.querySelectorAll('.journey-scene,.plane-section'));

  function buildSceneBridges(){
    const bridges=[];
    scenes.slice(0,-1).forEach((scene,index)=>{
      const bridge=document.createElement('div');
      bridge.className='scene-bridge';
      bridge.setAttribute('aria-hidden','true');
      bridge.dataset.bridgeIndex=String(index);
      const haze=document.createElement('div');
      haze.className='scene-bridge__haze';
      const particles=document.createElement('div');
      particles.className='scene-bridge__particles';
      for(let i=0;i<12;i++){
        const particle=document.createElement('i');
        particle.style.setProperty('--x',(((i*29)+(index*11))%94+3)+'%');
        particle.style.setProperty('--y',(((i*37)+(index*17))%66+17)+'%');
        particle.style.setProperty('--s',(1.2+(i%4)*.55).toFixed(2)+'px');
        particle.style.setProperty('--o',(0.18+(i%5)*.08).toFixed(2));
        particle.style.setProperty('--d',(4.8+(i%4)*1.1).toFixed(1)+'s');
        particle.style.setProperty('--delay',(-((i+index)%6)*.8).toFixed(1)+'s');
        particles.appendChild(particle);
      }
      bridge.append(haze,particles);
      scene.insertAdjacentElement('afterend',bridge);
      bridges.push(bridge);
    });
    return bridges;
  }

  function addPetals(){
    if(window.matchMedia('(max-width: 980px)').matches)return;
    scenes.forEach((scene)=>{
      if(scene.querySelector(':scope > .scene-petals'))return;
      const petals=document.createElement('div');
      petals.className='scene-petals';
      petals.setAttribute('aria-hidden','true');
      for(let i=0;i<6;i++){
        const petal=document.createElement('i');
        petal.style.setProperty('--petal-x',(9+i*16)+'%');
        petal.style.setProperty('--petal-duration',(18+i*2)+'s');
        petal.style.setProperty('--petal-delay',(-i*4)+'s');
        petals.appendChild(petal);
      }
      scene.appendChild(petals);
    });
  }

  const bridges=buildSceneBridges();
  addPetals();
  document.documentElement.classList.add('scene-flow-ready');

  const activeObserver=new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      entry.target.classList.toggle('is-scene-active',entry.isIntersecting&&entry.intersectionRatio>.28);
    });
  },{threshold:[0,.28,.55]});
  scenes.forEach((scene)=>activeObserver.observe(scene));

  if(reducedMotion)return;

  if(window.gsap&&window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    gsap.config({nullTargetWarn:false});

    const mm=gsap.matchMedia();

    mm.add('(min-width: 641px)',()=>{
      scenes.forEach((scene,index)=>{
        const panel=scene.querySelector(':scope > .journey-wrap');
        if(!panel)return;

        gsap.fromTo(scene,
          {'--scene-shift':'-58px'},
          {
            '--scene-shift':'58px',
            ease:'none',
            scrollTrigger:{trigger:scene,start:'top bottom',end:'bottom top',scrub:1}
          }
        );

        const entry=gsap.fromTo(panel,
          {
            y:index===0?18:72,
            scale:index===0?.985:.948,
            rotateX:index===0?.35:1.65,
            opacity:index===0?.86:.56,
            transformOrigin:'50% 50%'
          },
          {
            y:0,
            scale:1,
            rotateX:0,
            opacity:1,
            ease:'none',
            scrollTrigger:{
              trigger:scene,
              start:index===0?'top 82%':'top 94%',
              end:'center 56%',
              scrub:.72
            }
          }
        );

        const exit=gsap.to(panel,{
          y:-34,
          scale:.978,
          rotateX:-.75,
          opacity:.76,
          ease:'none',
          scrollTrigger:{
            trigger:scene,
            start:'center 36%',
            end:'bottom 7%',
            scrub:.9
          }
        });

        return()=>{entry.kill();exit.kill();};
      });

      bridges.forEach((bridge,index)=>{
        const haze=bridge.querySelector('.scene-bridge__haze');
        const particles=bridge.querySelector('.scene-bridge__particles');
        gsap.fromTo(bridge,
          {'--bridge-line-scale':.08,'--bridge-line-opacity':.12},
          {
            '--bridge-line-scale':1,
            '--bridge-line-opacity':.82,
            ease:'none',
            scrollTrigger:{trigger:bridge,start:'top 92%',end:'center 54%',scrub:.55}
          }
        );
        gsap.fromTo(haze,
          {xPercent:index%2?-10:10,scaleX:.82,opacity:.18},
          {
            xPercent:index%2?8:-8,
            scaleX:1.18,
            opacity:.72,
            ease:'none',
            scrollTrigger:{trigger:bridge,start:'top bottom',end:'bottom top',scrub:1}
          }
        );
        gsap.fromTo(particles,
          {yPercent:18},
          {
            yPercent:-18,
            ease:'none',
            scrollTrigger:{trigger:bridge,start:'top bottom',end:'bottom top',scrub:1.2}
          }
        );
      });
    });

    mm.add('(max-width: 640px)',()=>{
      scenes.forEach((scene,index)=>{
        const panel=scene.querySelector(':scope > .journey-wrap');
        if(!panel)return;
        gsap.fromTo(panel,
          {y:index===0?8:34,scale:index===0?.994:.978,opacity:index===0?.94:.70},
          {
            y:0,
            scale:1,
            opacity:1,
            ease:'none',
            scrollTrigger:{trigger:scene,start:'top 96%',end:'center 62%',scrub:.45}
          }
        );
        gsap.to(panel,{
          y:-16,
          scale:.99,
          opacity:.86,
          ease:'none',
          scrollTrigger:{trigger:scene,start:'center 30%',end:'bottom 6%',scrub:.6}
        });
        gsap.fromTo(scene,
          {'--scene-shift':'-24px'},
          {
            '--scene-shift':'24px',
            ease:'none',
            scrollTrigger:{trigger:scene,start:'top bottom',end:'bottom top',scrub:.8}
          }
        );
      });

      bridges.forEach((bridge)=>{
        gsap.fromTo(bridge,
          {'--bridge-line-scale':.12,'--bridge-line-opacity':.16},
          {
            '--bridge-line-scale':.9,
            '--bridge-line-opacity':.64,
            ease:'none',
            scrollTrigger:{trigger:bridge,start:'top 96%',end:'bottom 42%',scrub:.45}
          }
        );
      });
    });

    ScrollTrigger.refresh();
  }
})();
