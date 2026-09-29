(function(){
  function railScroll(dir){
    const rail=document.getElementById('preview-rail');
    if(!rail)return;
    const card=rail.querySelector('.preview-card');
    const step=card?card.getBoundingClientRect().width+22:window.innerWidth*.75;
    rail.scrollBy({left:dir*step,behavior:'smooth'});
  }
  document.querySelectorAll('[data-preview-dir]').forEach((button)=>{
    button.addEventListener('click',()=>railScroll(Number(button.dataset.previewDir)||1));
  });

  const rail=document.getElementById('preview-rail');
  if(rail){
    rail.addEventListener('wheel',(event)=>{
      if(Math.abs(event.deltaY)>Math.abs(event.deltaX)){
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
      target.scrollIntoView({behavior:'smooth',block:'start'});
    });
  });
})();