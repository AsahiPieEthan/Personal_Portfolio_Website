// Typing
  const phrases = ['Frontend Developer.', 'UI/UX Enthusiast.', 'Full-Stack Builder.', 'Creative Coder.'];
  let pi=0,ci=0,del=false;
  const tel = document.getElementById('typed-text');
  function type(){
    const p=phrases[pi];
    if(!del){ tel.textContent=p.slice(0,++ci); if(ci===p.length){ setTimeout(()=>{del=true;},1700); setTimeout(type,100); return; } }
    else { tel.textContent=p.slice(0,--ci); if(ci===0){ del=false; pi=(pi+1)%phrases.length; } }
    setTimeout(type, del?50:105);
  } type();

// Photo tilt
  const ph = document.getElementById('photoInner');
  document.addEventListener('mousemove', e=>{
    const cx=innerWidth/2, cy=innerHeight/2;
    const dx=(e.clientX-cx)/cx, dy=(e.clientY-cy)/cy;
    ph.style.transform=`translate(${dx*10}px,${dy*8}px) rotateX(${-dy*5}deg) rotateY(${dx*5}deg)`;
  });