document.addEventListener('DOMContentLoaded', () => {
  // 1. Get the project slug from the URL
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('proyecto');

  if (!slug) {
    // Si no hay slug, redirigir al index o mostrar error
    window.location.href = 'index.html';
    return;
  }

  // 2. Find the project in the data array
  const mainProject = proyectosData.find(p => p.slug === slug);

  if (!mainProject) {
    // Si no se encuentra el proyecto, redirigir al index
    window.location.href = 'index.html';
    return;
  }

  // 3. Render the Main Hero Project
  const heroContainer = document.getElementById('hero-proyecto');
  
  // Format pills
  const pillsHTML = mainProject.pills.map(p => `<span class="p-pill">${p}</span>`).join('');
  
  // Format amenities
  const amenidadesHTML = mainProject.amenidades.map(a => `
    <div style="display:flex; align-items:center; gap:10px; margin-bottom:12px;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
      <span style="font-size:14px; color:var(--ww); font-weight:300;">${a}</span>
    </div>
  `).join('');

  const allHeroImages = [mainProject.imagenPrincipal, ...mainProject.galeria];

  heroContainer.innerHTML = `
    <!-- TOP SLIDER -->
    <div class="project-slider" style="position:relative; width:100%; height:clamp(520px, 60vh, 650px); margin:0 0 80px 0; overflow:hidden;">
      <style>
        .ps-track::-webkit-scrollbar { display: none; }
      </style>
      <div class="ps-track" style="display:flex; height:100%; overflow-x:auto; scroll-snap-type:x mandatory; scrollbar-width:none; -webkit-overflow-scrolling:touch; scroll-behavior:smooth;">
        ${allHeroImages.map((img, i) => `
          <div class="ps-slide" style="flex:0 0 100%; height:100%; scroll-snap-align:start;">
            <img src="${img}" style="width:100%; height:100%; object-fit:cover;">
            <div style="position:absolute; inset:0; background:linear-gradient(to top, rgba(10,15,28,0.8) 0%, transparent 40%); pointer-events:none;"></div>
          </div>
        `).join('')}
      </div>
      
      <!-- Arrows -->
      <button class="ps-prev" style="position:absolute; top:50%; left:20px; transform:translateY(-50%); background:rgba(10,15,28,0.5); color:white; border:none; width:50px; height:50px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); transition:all 0.3s;" onmouseover="this.style.background='var(--gold)'" onmouseout="this.style.background='rgba(10,15,28,0.5)'">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button class="ps-next" style="position:absolute; top:50%; right:20px; transform:translateY(-50%); background:rgba(10,15,28,0.5); color:white; border:none; width:50px; height:50px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(10px); transition:all 0.3s;" onmouseover="this.style.background='var(--gold)'" onmouseout="this.style.background='rgba(10,15,28,0.5)'">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
      </button>

      <!-- Dots -->
      <div class="ps-dots" style="position:absolute; bottom:30px; left:0; right:0; display:flex; justify-content:center; gap:8px; z-index:10;">
        ${allHeroImages.map((_, i) => `
          <div class="ps-dot" data-idx="${i}" style="width:10px; height:10px; border-radius:50%; background:rgba(255,255,255,0.4); cursor:pointer; transition:all 0.3s; ${i===0 ? 'background:var(--gold); transform:scale(1.2);' : ''}"></div>
        `).join('')}
      </div>
    </div>

    <!-- PROJECT DETAILS GRID -->
    <div class="project-details" style="max-width:1200px; margin:0 auto 80px; display:grid; grid-template-columns:minmax(0, 1.3fr) minmax(0, 1fr); gap:60px; padding:0 5%;">
      <!-- Left: Info -->
      <div class="pd-left">
        <span class="p-tag ${mainProject.colorEtiqueta}" style="font-size:12px; padding:6px 14px; margin-bottom:20px;">${mainProject.etiqueta}</span>
        <div style="font-size:14px; letter-spacing:3px; text-transform:uppercase; color:var(--gold); margin-bottom:15px; font-weight:600; margin-top:20px;">${mainProject.ubicacion}</div>
        <h1 class="s-title" style="font-size:clamp(36px, 4vw, 55px) !important; margin-bottom:30px; line-height:1.1;">
          ${mainProject.nombre}
        </h1>
        <p style="font-size:18px; line-height:1.8; color:var(--cream60); font-weight:300; margin-bottom:40px;">
          ${mainProject.descripcion}
        </p>

        <h3 style="font-family:var(--serif); font-size:20px; color:var(--ww); margin-bottom:20px;">Amenidades</h3>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; border-top:1px solid rgba(245,242,238,0.1); padding-top:20px;">
          ${amenidadesHTML}
        </div>
      </div>

      <!-- Right: Acts & Details -->
      <div class="pd-right">
        <div style="background:rgba(13,18,33,0.6); border:1px solid rgba(200,164,74,0.2); border-radius:var(--r); padding:40px; box-shadow:0 10px 30px rgba(0,0,0,0.3);">
          
          <div style="margin-bottom:30px;">
            <div style="font-size:12px; color:var(--ww60); text-transform:uppercase; letter-spacing:1px; margin-bottom:6px;">Precio</div>
            <div style="font-family:var(--display); font-size:36px; color:var(--ww); line-height:1;">${mainProject.precio}</div>
            <div style="font-size:16px; color:var(--gold); margin-top:12px; font-weight:500;">${mainProject.reserva}</div>
          </div>

          <h3 style="font-family:var(--serif); font-size:18px; color:var(--ww); margin-bottom:15px;">Datos Principales</h3>
          <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:35px;">
            ${mainProject.pills.map(pill => `
              <div style="display:flex; align-items:center; gap:10px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                <span style="font-size:15px; color:var(--cream60);">${pill}</span>
              </div>
            `).join('')}
          </div>

          <div class="h-acts" style="display:flex; flex-direction:column; gap:15px; opacity:1;">
            <a href="#contacto" class="btn-gh" style="justify-content:center; padding:16px; text-align:center;">
              Solicitar información
            </a>
            <a href="${mainProject.enlaceWhatsApp}" target="_blank" class="btn-gh" style="justify-content:center; padding:16px; background:rgba(37, 211, 102, 0.1); border-color:rgba(37, 211, 102, 0.5); color:#25D366;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
              Hablar por WhatsApp
            </a>
            <a href="#" class="btn-no" style="padding:16px; text-align:center;" onclick="alert('Ubicación: ${mainProject.ubicacion}'); return false;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:middle; margin-right:8px; display:inline-block;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              Ver ubicación
            </a>
          </div>
    </div>
  `;

  // --- SLIDER LOGIC ---
  const track = heroContainer.querySelector('.ps-track');
  const slides = heroContainer.querySelectorAll('.ps-slide');
  const prevBtn = heroContainer.querySelector('.ps-prev');
  const nextBtn = heroContainer.querySelector('.ps-next');
  const dots = heroContainer.querySelectorAll('.ps-dot');
  
  let sliderInterval;

  const updateDots = () => {
    const scrollLeft = track.scrollLeft;
    const slideWidth = track.clientWidth;
    // Evitar division por cero y calcular índice actual
    if (slideWidth > 0) {
      const currentSlide = Math.round(scrollLeft / slideWidth);
      dots.forEach((dot, i) => {
        if (i === currentSlide) {
          dot.style.background = 'var(--gold)';
          dot.style.transform = 'scale(1.2)';
        } else {
          dot.style.background = 'rgba(255,255,255,0.4)';
          dot.style.transform = 'scale(1)';
        }
      });
    }
  };

  track.addEventListener('scroll', updateDots, {passive: true});

  const goToSlide = (i) => {
    track.scrollTo({ left: track.clientWidth * i, behavior: 'smooth' });
  };

  const nextSlide = () => {
    const slideWidth = track.clientWidth;
    const currentSlide = Math.round(track.scrollLeft / slideWidth);
    let nextIdx = currentSlide + 1;
    if (nextIdx >= slides.length) nextIdx = 0;
    goToSlide(nextIdx);
  };

  const prevSlide = () => {
    const slideWidth = track.clientWidth;
    const currentSlide = Math.round(track.scrollLeft / slideWidth);
    let prevIdx = currentSlide - 1;
    if (prevIdx < 0) prevIdx = slides.length - 1;
    goToSlide(prevIdx);
  };

  const startAutoplay = () => {
    sliderInterval = setInterval(nextSlide, 5000);
  };

  const stopAutoplay = () => {
    clearInterval(sliderInterval);
  };

  if (slides.length > 1) {
    nextBtn.addEventListener('click', () => { stopAutoplay(); nextSlide(); startAutoplay(); });
    prevBtn.addEventListener('click', () => { stopAutoplay(); prevSlide(); startAutoplay(); });
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        stopAutoplay();
        goToSlide(i);
        startAutoplay();
      });
    });

    track.addEventListener('touchstart', stopAutoplay, {passive: true});
    track.addEventListener('touchend', startAutoplay, {passive: true});
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);
    
    startAutoplay();
  } else {
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';
    if (heroContainer.querySelector('.ps-dots')) heroContainer.querySelector('.ps-dots').style.display = 'none';
  }

  // 4. Render the "Other Projects" section
  const otrosGrid = document.getElementById('otros-grid');
  
  // Filter out the current main project
  const otrosProyectos = proyectosData.filter(p => p.slug !== slug);
  
  otrosGrid.innerHTML = otrosProyectos.map(p => {
    return `
      <div class="p-card is-visible" style="opacity:1; transform:translateY(0);">
        <div class="p-img-wrap"><img src="${p.imagenPrincipal}" alt="${p.nombre}"><div class="p-img-ov"></div><div class="p-ov2"></div></div>
        <div class="p-body">
          <span class="p-tag ${p.colorEtiqueta}">${p.etiqueta}</span>
          <div class="p-loc">${p.ubicacion}</div>
          <div class="p-name">${p.nombre}</div>
          <div class="p-desc">${p.descripcion}</div>
          <div class="p-price">Desde <strong>${p.precio}</strong></div>
          <div class="p-pills">${p.pills.map(pill => `<span class="p-pill">${pill}</span>`).join('')}</div>
          <a href="proyectos-activos.html?proyecto=${p.slug}" class="p-cta">Ver Proyecto <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
        </div>
      </div>
    `;
  }).join('');

  // Populate Inmuebles section dynamically with current project photos
  const allImages = [mainProject.imagenPrincipal, ...mainProject.galeria];
  const inmueblesMainImg = document.getElementById('inm-main-img');
  const inmueblesMainTitle = document.getElementById('inm-main-title');
  const inmueblesMainPrice = document.getElementById('inm-main-price');
  const inmueblesThumbs = document.querySelector('.inm-g-thumbs');
  
  const sectionTitle = document.querySelector('#inmuebles .s-title');
  const sectionEye = document.querySelector('#inmuebles .s-eye-txt');

  if (sectionTitle) {
    sectionEye.textContent = 'Galería';
    sectionTitle.innerHTML = `<span style="font-size:0.85em; vertical-align:middle;">Descubre</span><em style="font-size:1.4em; vertical-align:middle; margin-left:10px;">${mainProject.nombre}</em>`;
  }
  
  if (inmueblesMainImg && inmueblesThumbs) {
    inmueblesMainImg.src = allImages[0];
    inmueblesMainTitle.innerHTML = mainProject.nombre;
    inmueblesMainPrice.innerHTML = `Desde <strong>${mainProject.precio}</strong>`;
    
    inmueblesThumbs.innerHTML = allImages.map((img, idx) => {
      return `
        <div class="inm-thumb ${idx === 0 ? 'active' : ''}" onclick="updateInmMain(this, '${img}', '${mainProject.nombre}', 'Desde <strong>${mainProject.precio}</strong>')">
          <img src="${img}" alt="Foto ${idx+1}">
        </div>
      `;
    }).join('');
  }

  // Re-initialize GSAP basic animations if needed for the new elements
  gsap.from(".reveal-l", {x: -50, opacity: 0, duration: 1, ease: "power3.out", delay: 0.2});
  gsap.from(".reveal-r", {x: 50, opacity: 0, duration: 1, ease: "power3.out", delay: 0.4});
  gsap.from("#otros-grid .p-card", {y: 40, opacity: 0, duration: 0.8, stagger: 0.1, ease: "power2.out", delay: 0.6, scrollTrigger: {trigger: "#otros-proyectos", start: "top 80%"}});
  
  // Set window title dynamically
  document.title = `${mainProject.nombre} — REDEX Inmobiliaria`;

  // Sync cursor hover state with newly added DOM elements
  setTimeout(() => {
    document.querySelectorAll('a,button,.p-card,.vt,.agt-card,.off-card,.t-card,.f-btn,.f-num-card,.a-feat,.edev-card,.inm-card,.pf-feat').forEach(el=>{
      el.addEventListener('mouseenter',()=>document.body.classList.add('ch'));
      el.addEventListener('mouseleave',()=>document.body.classList.remove('ch'));
    });
  }, 100);
});

window.updateInmMain = function(thumbElem, imgSrc, title, priceHtml) {
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
};
