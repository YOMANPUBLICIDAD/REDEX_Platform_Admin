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
  if(dot) { dot.style.left = dx+'px'; dot.style.top = dy+'px'; }
  if(ring) { ring.style.left = rx+'px'; ring.style.top = ry+'px'; }
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
  err.textContent='';
  err.classList.remove('err');
  
  setTimeout(()=>{
    window.location.href = 'portal-asesor.html';
  },800);
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
  if(typeof isModalOpen !== 'undefined') isModalOpen = true; // Pausar autoplay carrusel
}
function closeHipoModal() {
  if(hipoModal) {
    hipoModal.classList.remove('open');
    document.body.style.overflow = '';
    if(typeof isModalOpen !== 'undefined') isModalOpen = false;
  }
}
if(hipoModal) {
  hipoModal.addEventListener('click', e => { if(e.target === hipoModal) closeHipoModal();  });
}
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') closeHipoModal();
});

const hipoInput = document.getElementById('hipo-archivos-new');
const hipoList = document.getElementById('hipo-file-list-new');
const hipoText = document.getElementById('hipo-drop-text-new');
if(hipoInput) {
  hipoInput.addEventListener('change', function() {
    hipoList.innerHTML = '';
    if(this.files.length > 0) {
      hipoText.style.display = 'none';
      Array.from(this.files).forEach(f => {
        const div = document.createElement('div');
        div.textContent = '📄 ' + f.name;
        hipoList.appendChild(div);
      });
    } else {
      hipoText.style.display = 'block';
    }
  });
}

const hipoFormNew = document.getElementById('hipo-form-new');
const hipoMsgNew = document.getElementById('hipo-form-msg-new');
if(hipoFormNew) {
  hipoFormNew.addEventListener('submit', function(e) {
    e.preventDefault();
    const btn = hipoFormNew.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Enviando...';
    btn.disabled = true;
    
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
      hipoFormNew.reset();
      hipoList.innerHTML = '';
      hipoText.style.display = 'block';
      
      hipoMsgNew.style.display = 'block';
      setTimeout(() => hipoMsgNew.style.display = 'none', 8000);
    }, 1500);
  });
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
function googleTranslateElementInit() {
  new google.translate.TranslateElement({pageLanguage: 'es', includedLanguages: 'es,en', autoDisplay: false}, 'google_translate_element');
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

// ============= ADVISOR CAROUSEL =============
const advisors = [
  { name: 'Ana Martínez', role: 'Directora Regional', phone: '+1 (809) 555-1201', image: 'images/asesores/c_1.jpg', objectPosition: 'center 20%' },
  { name: 'Roberto Santos', role: 'Asesor Comercial', phone: '+1 (809) 555-1202', image: 'images/asesores/c_2.jpg', objectPosition: 'center 20%' },
  { name: 'Laura Pérez', role: 'Gerente de Ventas', phone: '+1 (809) 555-1203', image: 'images/asesores/c_3.jpg', objectPosition: 'center 20%' },
  { name: 'Carlos Mejía', role: 'Asesor Senior', phone: '+1 (809) 555-1204', image: 'images/asesores/c_4.jpg', objectPosition: 'center 20%' },
  { name: 'Miguel Vargas', role: 'Asesor de Lujo', phone: '+1 (809) 555-1205', image: 'images/asesores/c_5.jpg', objectPosition: 'center 20%' }
];

const carWrap = document.getElementById('asesor-carousel');
if (carWrap) {
  let currentAdvisorIndex = 0;
  let autoplayInterval;
  
  advisors.forEach((adv, index) => {
    const slide = document.createElement('div');
    slide.className = 'asesor-slide' + (index === 0 ? ' active' : '');
    slide.innerHTML = `
      <img src="${adv.image}" class="asesor-bg" alt="${adv.name}" style="object-position: ${adv.objectPosition};">
      <div class="asesor-info">
        <div class="asesor-name">${adv.name}</div>
        <div class="asesor-role">${adv.role}</div>
        <div class="asesor-phone">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
          </svg>
          ${adv.phone}
        </div>
      </div>
    `;
    carWrap.insertBefore(slide, carWrap.querySelector('.asesor-nav'));
  });

  const slides = carWrap.querySelectorAll('.asesor-slide');
  
  function nextAsesor(dir) {
    if(slides.length === 0) return;
    slides[currentAdvisorIndex].classList.remove('active');
    slides[currentAdvisorIndex].classList.add('prev');
    setTimeout((idx) => { if(slides[idx]) slides[idx].classList.remove('prev'); }, 800, currentAdvisorIndex);
    currentAdvisorIndex = (currentAdvisorIndex + dir + slides.length) % slides.length;
    slides[currentAdvisorIndex].classList.add('active');
  }
  
  function startAutoplay() {
    autoplayInterval = setInterval(() => { nextAsesor(1); }, 5000);
  }
  
  window.nextAsesor = function(dir) {
    clearInterval(autoplayInterval);
    nextAsesor(dir);
    startAutoplay();
  };
  
  startAutoplay();
}





// ============= MODAL PROYECTO =============

// ============= NUEVA LOGICA DE MODAL (FICHA TECNICA) =============
let dmGalleryArr = [];
let dmGalleryIndex = 0;

window.openProyectoModal = function(id) {
  const p = typeof inmueblesData !== 'undefined' ? inmueblesData.find(x => String(x.id) === String(id)) : null;
  if(!p) return;
  
  // Header
  document.getElementById('dm-title').textContent = p.nombre || 'Propiedad REDEX';
  document.getElementById('dm-loc').textContent = (p.ciudad && p.sector && p.sector !== 'Varias Zonas') ? `${p.ciudad}, ${p.sector}` : (p.ciudad || 'República Dominicana');
  document.getElementById('dm-type').textContent = p.tipo || 'Inmueble';
  document.getElementById('dm-status').textContent = p.estado || 'Disponible';
  
  // Gallery
  dmGalleryArr = [p.imagenPrincipal];
  if(p.galeria && Array.isArray(p.galeria)) {
    p.galeria.forEach(img => {
      if(!dmGalleryArr.includes(img)) dmGalleryArr.push(img);
    });
  }
  dmGalleryIndex = 0;
  updateDmGallery();
  
  // Metrics
  document.getElementById('dm-m-price').textContent = p.precio || 'Consultar';
  document.getElementById('dm-m-area').textContent = p.metros || 'Consultar';
  document.getElementById('dm-m-bed').textContent = p.habitaciones || 'Consultar';
  document.getElementById('dm-m-bath').textContent = p.banos || 'Consultar';
  document.getElementById('dm-m-park').textContent = p.parqueos || 'Consultar';
  document.getElementById('dm-m-pay').textContent = p.forma_pago || 'Consultar';
  
  // Desc
  const defaultDesc = "Propiedad disponible en República Dominicana, ideal para quienes buscan una oportunidad inmobiliaria con buena ubicación, potencial de inversión y acompañamiento profesional de REDEX.";
  document.getElementById('dm-desc').textContent = (p.descripcion && p.descripcion.trim().length > 10) ? p.descripcion : defaultDesc;
  
  // Features (Amenidades)
  const featuresContainer = document.getElementById('dm-features');
  if(p.amenidades && p.amenidades.length > 0 && p.amenidades[0] !== 'Información disponible con un asesor') {
    // Categorize them basically or just show one block
    const items = p.amenidades.map(a => `<li>${a}</li>`).join('');
    featuresContainer.innerHTML = `
      <div class="dm-feature-group">
        <h4>Comodidades y Detalles</h4>
        <ul class="dm-feature-list">${items}</ul>
      </div>
    `;
  } else {
    featuresContainer.innerHTML = `
      <div class="dm-feature-group">
        <h4>Comodidades y Detalles</h4>
        <ul class="dm-feature-list"><li>Información disponible con un asesor</li></ul>
      </div>
    `;
  }
  
  // Contact
  const waBtn = document.getElementById('dm-btn-wa');
  waBtn.href = p.whatsapp || `https://wa.me/18495180024?text=Hola,%20me%20interesa%20obtener%20más%20información%20sobre%20${encodeURIComponent(p.nombre)}`;
  
  // Open
  const modal = document.getElementById('detail-modal');
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.cerrarDetailModal = function() {
  const modal = document.getElementById('detail-modal');
  if(modal) {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }
};

document.getElementById('detail-modal')?.addEventListener('click', e => {
  if(e.target.classList.contains('detail-modal-overlay')) cerrarDetailModal();
});
document.addEventListener('keydown', e => {
  if(e.key === 'Escape') cerrarDetailModal();
});

window.updateDmGallery = function() {
  const mainImg = document.getElementById('dm-main-img');
  mainImg.style.opacity = 0;
  setTimeout(() => {
    mainImg.src = dmGalleryArr[dmGalleryIndex];
    mainImg.style.opacity = 1;
  }, 200);
  
  const thumbsContainer = document.getElementById('dm-thumbs');
  // Show up to 4 thumbnails
  const maxThumbs = 4;
  const displayThumbs = dmGalleryArr.slice(0, maxThumbs);
  const extraCount = dmGalleryArr.length - maxThumbs;
  
  let html = '';
  displayThumbs.forEach((src, i) => {
    const isLast = (i === maxThumbs - 1);
    const hasMore = (isLast && extraCount > 0);
    html += `
      <div class="dm-thumb ${i === dmGalleryIndex ? 'active' : ''}" onclick="dmSetGallery(${i})">
        <img src="${src}" alt="Thumb">
        ${hasMore ? `<div class="dm-more-overlay">+${extraCount}</div>` : ''}
      </div>
    `;
  });
  thumbsContainer.innerHTML = html;
};

window.dmGalleryPrev = function() { dmGalleryIndex = (dmGalleryIndex - 1 + dmGalleryArr.length) % dmGalleryArr.length; updateDmGallery(); };
window.dmGalleryNext = function() { dmGalleryIndex = (dmGalleryIndex + 1) % dmGalleryArr.length; updateDmGallery(); };
window.dmSetGallery = function(i) { dmGalleryIndex = i; updateDmGallery(); };
// ============= INMUEBLES PREMIUM DYNAMIC LOGIC =============
(function(){
  if(typeof inmueblesData === 'undefined') return;

  const grid = document.getElementById('inmuebles-grid');
  const filtersContainer = document.getElementById('inmuebles-filters-container');
  const navMenu = document.getElementById('nav-inmuebles-menu');
  let currentCategory = 'todos';
  let currentCity = 'todas';
  let searchQuery = '';

  // 1. Extraer ciudades únicas para el Navbar
  const allCities = [...new Set(inmueblesData.map(i => i.ciudad))].filter(c => c && c.trim() !== '').sort();
  if(navMenu) {
      navMenu.innerHTML = allCities.map(c => `<a href="inmuebles.html?ciudad=${encodeURIComponent(c)}">${c.toLowerCase()}</a>`).join('');
  }

  // 2. Extraer submenús por categoría
  const categoriesMap = {
    'todos': 'Todos',
    'casa': 'Casas',
    'apartamento': 'Apartamentos',
    'villa': 'Villas',
    'local': 'Locales',
    'solar residencial': 'Solares Residenciales',
    'lote': 'Lotes',
    'disponible': 'Disponibles'
  };

  const cats = ['todos', 'casa', 'apartamento', 'villa', 'local', 'solar residencial', 'lote', 'disponible'];
  
  function renderFilters() {
    if(!filtersContainer) return;
    filtersContainer.innerHTML = '';
    cats.forEach(cat => {
      const wrap = document.createElement('div');
      wrap.className = 'f-btn-wrap';
      
      const btn = document.createElement('button');
      btn.className = `f-btn ${cat === currentCategory ? 'active' : ''}`;
      btn.textContent = categoriesMap[cat];
      btn.onclick = () => { currentCategory = cat; currentCity = 'todas'; renderInmuebles(); };
      wrap.appendChild(btn);

      // Si no es "todos" o "disponible", generar submenú de ciudades para esa categoría
      if(cat !== 'todos' && cat !== 'disponible') {
        const catItems = inmueblesData.filter(i => matchCat(i, cat));
        const catCities = [...new Set(catItems.map(i => i.ciudad))].filter(c => c && c.trim() !== '').sort();
        
        if(catCities.length > 0) {
          const submenu = document.createElement('div');
          submenu.className = 'f-submenu';
          submenu.innerHTML = catCities.map(c => `
            <button class="f-submenu-item ${c===currentCity ? 'active' : ''}" onclick="event.stopPropagation(); setCatAndCity('${cat}', '${c}')">${c}</button>
          `).join('');
          wrap.appendChild(submenu);
        }
      }
      filtersContainer.appendChild(wrap);
    });
  }

  window.setCatAndCity = function(cat, city) {
    currentCategory = cat;
    currentCity = city;
    renderInmuebles();
  };

  function matchCat(item, cat) {
    if(cat === 'todos') return true;
    if(cat === 'disponible') return (item.estado || '').toLowerCase() === 'disponible';
    
    let itemType = (item.tipo || '').toLowerCase();
    
    if(cat === 'local') return itemType.includes('local');
    if(cat === 'solar residencial') return itemType.includes('solar');
    if(cat === 'lote') return itemType.includes('lote');
    if(cat === 'proyecto residencial') return itemType.includes('proyecto');
    
    return itemType === cat.toLowerCase();
  }

  window.buscarInmuebles = function() {
    const sInput = document.getElementById('hs-inm-search');
    if(sInput) {
      searchQuery = sInput.value.toLowerCase().trim();
      renderInmuebles();
      scrollToGrid();
    }
  };

  window.scrollToGrid = function() {
    const el = document.getElementById('catalogo');
    if(el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({top: y, behavior: 'smooth'});
    }
  };

  function renderInmuebles() {
    renderFilters();
    if(!grid) return;
    grid.innerHTML = '';
    
    let filtered = inmueblesData.filter(item => {
      // 1. Cat Filter
      if(!matchCat(item, currentCategory)) return false;
      // 2. City Filter
      if(currentCity !== 'todas' && item.ciudad !== currentCity) return false;
      // 3. Search Query
      if(searchQuery) {
        const txt = `${item.nombre} ${item.ciudad} ${item.sector} ${item.tipo}`.toLowerCase();
        if(!txt.includes(searchQuery)) return false;
      }
      return true;
    });

    if(filtered.length === 0) {
      grid.innerHTML = '<div class="no-results">No encontramos inmuebles con esos criterios.</div>';
      return;
    }

    filtered.forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'inm-card reveal';
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      card.innerHTML = `
        <div class="inm-c-img">
          <img src="${p.imagenPrincipal}" alt="${p.nombre}" loading="lazy">
          <div class="inm-c-tag ${(p.estado||'').toLowerCase() === 'disponible' ? 'green' : ((p.estado||'').toLowerCase() === 'reservado' || (p.estado||'').toLowerCase() === 'vendido' ? 'red' : 'gold')}">${p.estado}</div>
        </div>
        <div class="inm-c-body">
          <div class="inm-c-loc">${p.ciudad} ${p.sector !== 'Varias Zonas' ? ' - ' + p.sector : ''}</div>
          <h3 class="inm-c-name" style="font-size:15px; margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${p.nombre}</h3>
          <div class="inm-c-price">Desde <strong>${p.precio}</strong></div>
          <div style="font-size:12px; color:var(--ww80); margin-bottom:8px;">${p.metros && p.metros !== 'Consultar' ? 'Construcción: ' + p.metros : (p.habitaciones && p.habitaciones !== 'Consultar' ? p.habitaciones + ' habs.' : '')}</div>
          <div class="inm-c-type">${(p.tipo||'').toUpperCase()}</div>
          <button class="btn-gold mag" style="width:100%; margin-top:15px; border-radius:4px;" onclick="openProyectoModal('${p.id}')">Ver Inmueble</button>
        </div>
      `;
      grid.appendChild(card);
      setTimeout(() => {
        gsap.to(card, {opacity: 1, y: 0, duration: 0.5, ease: 'power2.out'});
      }, Math.min(idx * 50, 800)); // Cap initial delay
    });
  }

  // Init
  const params = new URLSearchParams(window.location.search);
  const urlCity = params.get('ciudad');
  if(urlCity) {
    const matchedCity = allCities.find(c => c.toLowerCase() === urlCity.toLowerCase());
    if(matchedCity) {
      currentCity = matchedCity;
      setTimeout(() => scrollToGrid(), 500);
    }
  }
  
  renderInmuebles();

})();
