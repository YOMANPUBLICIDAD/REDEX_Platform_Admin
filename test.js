gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ============= CURSOR =============
const dot = document.getElementById('c-dot');
const ring = document.getElementById('c-ring');
let mx = 0, my = 0, dx = 0, dy = 0, rx = 0, ry = 0;
const lerp = (a,b,t) => a*(1-t)+b*t;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function loop(){
  dx = lerp(dx, mx, 0.28); dy = lerp(dy, my, 0.28);
  rx = lerp(rx, mx, 0.1);  ry = lerp(ry, my, 0.1);
  dot.style.left = dx+'px'; dot.style.top = dy+'px';
  ring.style.left = rx+'px'; ring.style.top = ry+'px';
  requestAnimationFrame(loop);
})();
document.querySelectorAll('a,button,.p-card,.vt,.agt-card,.off-card,.t-card,.f-btn,.f-num-card,.a-feat,.edev-card,.inm-card,.pf-feat').forEach(el=>{
  el.addEventListener('mouseenter',()=>document.body.classList.add('ch'));
  el.addEventListener('mouseleave',()=>document.body.classList.remove('ch'));
});

// ============= SCROLL PROGRESS =============
const prog = document.getElementById('prog');
window.addEventListener('scroll',()=>{
  const s = window.scrollY/(document.body.scrollHeight-window.innerHeight);
  prog.style.width = (s*100)+'%';
  document.getElementById('main-nav').classList.toggle('scrolled', window.scrollY>60);
});

// ============= HERO ENTRANCE =============
gsap.set(['#hh-eye','#hh-title','#hh-search','#hh-acts','#hh-mstats'], {y:45, opacity:0});
gsap.timeline({defaults:{ease:'power4.out'}})
  .to('#hh-eye',    {opacity:1,y:0,duration:1.0,delay:.5})
  .to('#hh-title',  {opacity:1,y:0,duration:1.5},'-=.65')
  .to('#hh-search', {opacity:1,y:0,duration:1.0},'-=.85')
  .to('#hh-wa',     {opacity:1,y:0,duration:1.0},'-=.75')
  .to('#hh-acts',   {opacity:1,y:0,duration:.9},'-=.7')
  .to('#hh-mstats', {opacity:1,y:0,duration:.8},'-=.6')
  .to('#scroll-hint',{opacity:1,duration:.6},'-=.3');

// ============= SCROLL REVEAL =============
const revealAll = (sel, from) => {
  document.querySelectorAll(sel).forEach((el,i) => {
    const x = from==='l'?-45:from==='r'?45:0;
    const y = from?0:48;
    gsap.fromTo(el,{opacity:0,x,y},{
      opacity:1,x:0,y:0,duration:.9,ease:'power3.out',
      scrollTrigger:{trigger:el,start:'top 88%',once:true},
      delay:(i%4)*.07
    });
  });
};
revealAll('.reveal','');
revealAll('.reveal-l','l');
revealAll('.reveal-r','r');

// ============= COUNTERS =============
document.querySelectorAll('.counter').forEach(el=>{
  const target = parseInt(el.getAttribute('data-target'));
  gsap.fromTo(el,{textContent:0},{
    textContent:target,duration:2,ease:'power2.out',
    snap:{textContent:1},
    scrollTrigger:{trigger:el,start:'top 90%',once:true}
  });
});

// ============= MAGNETIC BUTTONS =============
document.querySelectorAll('.mag').forEach(el=>{
  el.addEventListener('mousemove',e=>{
    const r = el.getBoundingClientRect();
    const cx=r.left+r.width/2, cy=r.top+r.height/2;
    gsap.to(el,{x:(e.clientX-cx)*.28,y:(e.clientY-cy)*.28,duration:.4,ease:'power2.out'});
  });
  el.addEventListener('mouseleave',()=>gsap.to(el,{x:0,y:0,duration:.7,ease:'elastic.out(1,.4)'}));
});

// ============= PROJECT FILTER =============
document.querySelectorAll('.f-btn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.f-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.getAttribute('data-filter');
    document.querySelectorAll('.p-card').forEach(c=>{
      const cat = c.getAttribute('data-cat');
      const show = f==='all'||cat===f;
      if(show) {
        c.style.display = 'block';
        gsap.to(c,{opacity:1,scale:1,duration:.45,ease:'power2.out'});
      } else {
        c.style.display = 'none';
        gsap.set(c,{opacity:0,scale:0.96});
      }
    });
  });
});

// ============= PROJECT CARD HOVER =============
document.querySelectorAll('.p-card').forEach(c=>{
  c.addEventListener('mouseenter',()=>gsap.to(c,{boxShadow:'0 40px 80px rgba(0,0,0,.6)',duration:.4}));
  c.addEventListener('mouseleave',()=>gsap.to(c,{boxShadow:'0 4px 24px rgba(0,0,0,.3)',duration:.4}));
});



// ============= SECTION PARALLAX =============
gsap.utils.toArray('.s-title').forEach(t=>{
  gsap.fromTo(t,{y:18},{y:-10,ease:'none',scrollTrigger:{trigger:t,start:'top bottom',end:'bottom top',scrub:1.5}});
});

// ============= METRICS STAGGER =============
gsap.from('.met-cell',{opacity:0,y:32,duration:.8,stagger:.15,ease:'power3.out',scrollTrigger:{trigger:'#metrics',start:'top 87%',once:true}});

// ============= TESTIMONIALS DRAG =============
const track = document.getElementById('test-track');
let isDown=false,startX,scrollLeft;
track.addEventListener('mousedown',e=>{isDown=true;startX=e.pageX-track.offsetLeft;scrollLeft=track.scrollLeft;});
track.addEventListener('mouseleave',()=>{isDown=false;});
track.addEventListener('mouseup',()=>{isDown=false;});
track.addEventListener('mousemove',e=>{if(!isDown)return;e.preventDefault();track.scrollLeft=scrollLeft-(e.pageX-track.offsetLeft-startX)*1.5;});

// ============= FAQ ACCORDION =============
document.querySelectorAll('.faq-q').forEach(q=>{
  q.addEventListener('click',()=>{
    const item = q.parentElement;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(o=>o.classList.remove('open'));
    if(!isOpen) item.classList.add('open');
  });
});

// ============= SEARCH BAR =============
function handleSearch(){
  const loc   = document.getElementById('hs-loc').value;
  const type  = document.getElementById('hs-type').value;
  const price = document.getElementById('hs-price').value;
  // Map filters to project cards if possible
  const filterMap = { 'Proyecto':'proyecto','Casa':'casa','Apartamento':'apto','Terreno':'terreno' };
  const f = filterMap[type] || 'all';
  // Animate filter buttons to match
  document.querySelectorAll('.f-btn').forEach(b=>{
    const match = b.getAttribute('data-filter')===f;
    b.classList.toggle('active', match);
    const cat = b.getAttribute('data-filter');
    document.querySelectorAll('.p-card').forEach(c=>{
      const show = f==='all'||c.getAttribute('data-cat')===f;
      gsap.to(c,{opacity:show?1:.15,scale:show?1:.96,duration:.4,ease:'power2.out'});
    });
  });
  // Scroll to projects
  const projSection = document.getElementById('projects');
  if(projSection) gsap.to(window,{scrollTo:{y:projSection,offsetY:74},duration:1.4,ease:'power3.inOut'});
}

// ============= CONTACT FORM =============
function handleForm(e){
  e.preventDefault();
  const btn = document.getElementById('cf-submit');
  const status = document.getElementById('cf-status');
  btn.textContent = 'Enviando...';
  btn.style.opacity='.6';
  
  const formData = new FormData(e.target);
  
  fetch("https://formsubmit.co/ajax/redexinmobiliariasrd@gmail.com", {
    method: "POST",
    headers: {
        'Accept': 'application/json'
    },
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    btn.textContent='Solicitud Enviada';
    btn.style.background='var(--wine-lt)';
    status.textContent='Un asesor te contactará en las próximas 24 horas.';
    status.className='f-status ok';
    setTimeout(()=>{
      btn.textContent='Enviar Solicitud';
      btn.style.opacity='1';
      btn.style.background='';
      status.textContent='';
      e.target.reset();
    },4000);
  })
  .catch(error => {
    btn.textContent='Error al enviar';
    status.textContent='Ocurrió un error. Intenta escribiéndonos directo al correo.';
    status.className='f-status err';
    setTimeout(()=>{
      btn.textContent='Enviar Solicitud';
      btn.style.opacity='1';
      status.textContent='';
    },4000);
  });
}

// ============= PORTAL LOGIN =============
function handlePortalLogin(e){
  e.preventDefault();
  const btn = document.getElementById('login-btn');
  const err = document.getElementById('portal-status');
  btn.textContent='Verificando...';
  setTimeout(()=>{
    err.textContent='Credenciales incorrectas. Contacta a redexinmobiliariasrd@gmail.com';
    err.classList.add('err');
    btn.textContent='Ingresar al Portal';
  },1000);
}

// ============= FLOAT WA =============
gsap.set('#float-wa',{scale:0,opacity:0});
ScrollTrigger.create({
  start:'top -200',
  onEnter:()=>gsap.to('#float-wa',{scale:1,opacity:1,duration:.6,ease:'back.out(1.7)'}),
  onLeaveBack:()=>gsap.to('#float-wa',{scale:0,opacity:0,duration:.3})
});// ============= VIDEO SWITCHER =============
const videos = [
  { id: '7aRn2ghCrM8', label: 'REDEX — Proyecto Estrella 2024' },
  { id: 'c-DHLDTOOpQ', label: 'Palmaretto Golden Village — Comunidad Premium' },
  { id: 'HGl7Ul4Go1Y', label: 'REDEX — Video 3' }
];
let currentVideo = 0;

function switchVideo(idx){
  currentVideo = idx;
  const v = videos[idx];
  const iframe = document.getElementById('vid-main-iframe');
  iframe.src = `https://www.youtube.com/embed/${v.id}?autoplay=1&mute=1&rel=0&modestbranding=1&enablejsapi=1`;
  document.querySelectorAll('.vid-dot').forEach((d,i)=>{
    d.classList.toggle('active', i===idx);
  });
}
let vidCycleTimer = setInterval(()=>{ switchVideo((currentVideo+1)%3); }, 30000);

// ============= PROJECTS CAROUSEL =============
function scrollProj(dir) {
  const container = document.getElementById('proj-grid');
  const cardWidth = container.querySelector('.p-card').offsetWidth + 14;
  container.scrollBy({ left: dir * cardWidth, behavior: 'smooth' });
}

// ============= SMOOTH ANCHOR SCROLL =============
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const target = document.querySelector(a.getAttribute('href'));
    if(!target)return;
    e.preventDefault();
    gsap.to(window,{scrollTo:{y:target,offsetY:74},duration:1.25,ease:'power3.inOut'});
  });
});

// ============= ABOUT PARALLAX =============
gsap.to('.about-frame img, .about-frame video',{yPercent:-8,ease:'none',scrollTrigger:{trigger:'#about',start:'top bottom',end:'bottom top',scrub:true}});



// ============= IMAGE MODAL =============
const imgModal = document.getElementById('img-modal');
const imgModalSrc = document.getElementById('img-m-src');
function openImgModal(src) {
  if(!imgModal) return;
  imgModalSrc.src = src;
  imgModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeImgModal() {
  if(imgModal) {
    imgModal.classList.remove('open');
    document.body.style.overflow = '';
  }
}
if(document.getElementById('img-m-close')) document.getElementById('img-m-close').addEventListener('click', closeImgModal);
if(imgModal) {
  imgModal.addEventListener('click', e => { if(e.target === imgModal) closeImgModal();  });
}



// ============= HIPO MODAL =============
const hipoModal = document.getElementById('hipo-modal');
function openHipoModal() {
  if(!hipoModal) return;
  hipoModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeHipoModal() {
  if(hipoModal) {
    hipoModal.classList.remove('open');
    document.body.style.overflow = '';
  }
}
if(document.getElementById('hipo-m-close')) document.getElementById('hipo-m-close').addEventListener('click', closeHipoModal);
if(hipoModal) {
  hipoModal.addEventListener('click', e => { if(e.target === hipoModal) closeHipoModal();  });
}
function handleHipoForm(e) {
  e.preventDefault();
  const btn = document.getElementById('hipo-btn');
  const status = document.getElementById('hipo-status');
  btn.textContent = 'Enviando...';
  btn.style.opacity = '.6';
  setTimeout(()=>{
    btn.textContent = 'Solicitud Enviada';
    btn.style.background = 'var(--wine-lt)';
    status.textContent = 'Un analista de crédito se comunicará en breve con sus opciones.';
    status.className = 'f-status ok';
    setTimeout(()=>{
      closeHipoModal();
      btn.textContent = 'Enviar Solicitud';
      btn.style.opacity = '1';
      btn.style.background = '';
      status.textContent = '';
      e.target.reset();
    }, 4000);
  }, 1200);
}
// ============= LANGUAGE TRANSLATOR =============
function toggleLangMenu() {
  document.getElementById('lang-menu').classList.toggle('open');
}
function setLang(lang, label) {
  document.querySelector('.lang-current').innerHTML = label + ' <svg width="10" height="10" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" fill="currentColor"/></svg>';
  document.getElementById('lang-menu').classList.remove('open');
  const select = document.querySelector('.goog-te-combo');
  if(select) {
    select.value = lang;
    select.dispatchEvent(new Event('change'));
  }
}
document.addEventListener('click', e => {
  if(!e.target.closest('#lang-wrap')) {
    const lm = document.getElementById('lang-menu');
    if(lm) lm.classList.remove('open');
  }
});

// ============= LOGIN MODAL =============
const loginModal = document.getElementById('login-modal');
function openLoginModal() { if(loginModal) { loginModal.classList.add('open'); document.body.style.overflow = 'hidden'; } }
function closeLoginModal() { if(loginModal) { loginModal.classList.remove('open'); document.body.style.overflow = ''; } }
if(document.getElementById('login-m-close')) document.getElementById('login-m-close').addEventListener('click', closeLoginModal);
if(loginModal) { loginModal.addEventListener('click', e => { if(e.target === loginModal) closeLoginModal(); }); }
// ============= INMUEBLES GALLERY =============
function updateInmMain(thumbElem, imgSrc, title, priceHtml) {
  const mainImg = document.getElementById('inm-main-img');
  const mainWrap = document.querySelector('.inm-g-main');
  const mainTitle = document.getElementById('inm-main-title');
  const mainPrice = document.getElementById('inm-main-price');
  
  document.querySelectorAll('.inm-thumb').forEach(t => t.classList.remove('active'));
  thumbElem.classList.add('active');
  
  mainWrap.classList.add('fade');
  setTimeout(() => {
    mainImg.src = imgSrc;
    mainTitle.innerHTML = title;
    mainPrice.innerHTML = priceHtml;
    mainWrap.classList.remove('fade');
  }, 400);
}
// ============================================================
// PERFORMANCE OPTIMIZATIONS
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  const images = document.querySelectorAll('img:not(.nav-logo img):not(.asesor-bg)');
  images.forEach(img => {
    if (!img.hasAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
    img.setAttribute('decoding', 'async');
  });
});
