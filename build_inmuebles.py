import re

with open("index.html", "r") as f:
    lines = f.readlines()

header_end = 0
for i, line in enumerate(lines):
    if "<!-- =" in line and "HERO" in line:
        header_end = i
        break

footer_start = 0
for i, line in enumerate(lines):
    if "<!-- =" in line and "FOOTER" in line:
        footer_start = i
        break

header = "".join(lines[:header_end])
footer = "".join(lines[footer_start:])

# Fix the active menu item if any, though it's easier to just use the default header.

new_content = """
<!-- ============================================================
     HERO INMUEBLES
============================================================ -->
<section style="padding: 160px 5% 80px; background: linear-gradient(180deg, var(--black) 0%, var(--g-dark) 100%); position: relative; overflow: hidden;">
  <!-- Decoración -->
  <div style="position:absolute; top:-200px; right:-200px; width:600px; height:600px; background:radial-gradient(circle, rgba(139,30,47,0.15) 0%, transparent 70%); border-radius:50%; z-index:0;"></div>
  
  <div style="max-width:1200px; margin:0 auto; position:relative; z-index:2; text-align:center;">
    <div class="s-eye reveal" style="justify-content:center"><div class="s-eye-line"></div><span class="s-eye-txt">Catálogo REDEX</span><div class="s-eye-line"></div></div>
    <h1 style="font-family: var(--display); font-size: clamp(40px, 6vw, 64px); color: var(--ww); line-height: 1.1; margin-bottom: 20px; font-weight:800;" class="reveal">Inmuebles <em style="color:var(--gold); font-style:normal;">disponibles</em></h1>
    <p style="color: var(--ww60); font-size: 18px; max-width: 600px; margin: 0 auto 40px; line-height: 1.6;" class="reveal">Explora casas, apartamentos, villas y propiedades seleccionadas por REDEX en La Vega y otras zonas de República Dominicana.</p>
    
    <div style="display:flex; gap:15px; justify-content:center;" class="reveal">
      <a href="#catalogo" class="btn-gold-solid mag">Ver inmuebles</a>
      <a href="quiero-vender.html" class="btn-ph mag">Quiero vender mi propiedad</a>
    </div>
  </div>
</section>

<!-- ============================================================
     CATÁLOGO INMUEBLES
============================================================ -->
<section id="catalogo" style="padding: 40px 5% 100px; background: var(--g-dark);">
  <div style="max-width:1200px; margin:0 auto;">
    
    <!-- Filtros -->
    <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:40px; justify-content:center;" class="reveal">
      <button class="f-btn active" data-filter="todos">Todos</button>
      <button class="f-btn" data-filter="casa">Casas</button>
      <button class="f-btn" data-filter="apartamento">Apartamentos</button>
      <button class="f-btn" data-filter="villa">Villas</button>
      <button class="f-btn" data-filter="local">Locales</button>
      <button class="f-btn" data-filter="finca">Fincas</button>
      <button class="f-btn" data-filter="disponible">Disponibles</button>
    </div>
    
    <!-- Grid de Inmuebles -->
    <div id="inmuebles-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap:30px;">
      <!-- Generado dinámicamente -->
    </div>
    
  </div>
</section>

<!-- ============================================================
     MODAL DETALLE INMUEBLE
============================================================ -->
<div id="inm-modal" class="modal-overlay">
  <div class="modal-content" id="inm-modal-content">
    <button id="inm-m-close" aria-label="Cerrar" style="position:absolute; top:20px; right:20px; background:rgba(0,0,0,0.5); color:#fff; border:none; width:40px; height:40px; border-radius:50%; font-size:24px; cursor:pointer; z-index:10; backdrop-filter:blur(5px);">&times;</button>
    
    <div id="inm-modal-body" style="display:flex; flex-direction:column; background:var(--g-deep); min-height:600px;">
      <!-- Generado dinámicamente -->
    </div>
  </div>
</div>

<script>
// ================= DATA DE INMUEBLES =================
const inmueblesData = [
  {
    id: 1,
    nombre: "Casa en venta en La Vega",
    tipo: "Casa",
    estado: "Disponible",
    ciudad: "La Vega",
    sector: "Centro de la Ciudad",
    precio: "Consultar precio",
    habitaciones: 3,
    banos: 2,
    parqueos: 2,
    metros: "250 m²",
    descripcion: "Propiedad residencial ubicada en La Vega, ideal para familias que buscan comodidad, buena ubicación y acceso rápido a los principales servicios de la ciudad.",
    imagenPrincipal: "project_don_martin.png",
    galeria: [
      "project_don_martin.png",
      "project_valle_verde.png",
      "project_santa_fe.png"
    ],
    amenidades: [
      "Buena ubicación",
      "Zona residencial",
      "Acceso a servicios",
      "Ideal para familia"
    ],
    whatsapp: "https://wa.me/18495180024?text=Hola,%20me%20interesa%20obtener%20más%20información%20sobre%20la%20Casa%20en%20venta%20en%20La%20Vega."
  },
  {
    id: 2,
    nombre: "Apartamento Torre Lujo",
    tipo: "Apartamento",
    estado: "Disponible",
    ciudad: "Santiago",
    sector: "Los Jardines",
    precio: "US$ 180,000",
    habitaciones: 2,
    banos: 2,
    parqueos: 1,
    metros: "120 m²",
    descripcion: "Hermoso apartamento moderno en torre con seguridad 24/7, lobby climatizado y área social con piscina.",
    imagenPrincipal: "project_concepcion.png",
    galeria: [
      "project_concepcion.png",
      "inmueble_1.jpg"
    ],
    amenidades: [
      "Piscina",
      "Gimnasio",
      "Lobby Climatizado",
      "Planta Full"
    ],
    whatsapp: "https://wa.me/18495180024?text=Hola,%20me%20interesa%20obtener%20más%20información%20sobre%20el%20Apartamento%20Torre%20Lujo."
  },
  {
    id: 3,
    nombre: "Villa Paraíso",
    tipo: "Villa",
    estado: "Reservado",
    ciudad: "Jarabacoa",
    sector: "Pinar Dorado",
    precio: "US$ 350,000",
    habitaciones: 4,
    banos: 4,
    parqueos: 4,
    metros: "500 m²",
    descripcion: "Espectacular villa de montaña con vistas increíbles, chimenea, amplios jardines y terraza techada.",
    imagenPrincipal: "project_palmaretto.png",
    galeria: [
      "project_palmaretto.png",
      "inversion_aerial.jpg"
    ],
    amenidades: [
      "Vista a la montaña",
      "Chimenea",
      "Jardines",
      "Terraza"
    ],
    whatsapp: "https://wa.me/18495180024?text=Hola,%20me%20interesa%20obtener%20más%20información%20sobre%20la%20Villa%20Paraíso."
  }
];

// ================= RENDERIZADO =================
const grid = document.getElementById('inmuebles-grid');
const fBtns = document.querySelectorAll('.f-btn');

function renderInmuebles(filter = 'todos') {
  grid.innerHTML = '';
  
  const filtrados = inmueblesData.filter(item => {
    if(filter === 'todos') return true;
    if(filter === 'disponible') return item.estado.toLowerCase() === 'disponible';
    return item.tipo.toLowerCase() === filter.toLowerCase();
  });
  
  if(filtrados.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:50px; color:var(--ww60);">No hay inmuebles disponibles en esta categoría.</div>';
    return;
  }
  
  filtrados.forEach(item => {
    let estadoColor = 'var(--wa-green)';
    if(item.estado.toLowerCase() === 'reservado') estadoColor = 'var(--gold)';
    if(item.estado.toLowerCase() === 'vendido') estadoColor = 'var(--red)';
    
    const card = document.createElement('div');
    card.className = 'inm-card';
    card.style.cssText = 'background:var(--black); border-radius:12px; overflow:hidden; border:1px solid rgba(255,255,255,0.05); transition:transform 0.3s; display:flex; flex-direction:column;';
    card.innerHTML = `
      <div style="position:relative; height:240px; overflow:hidden;">
        <img src="${item.imagenPrincipal}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.5s;" class="inm-img-h">
        <div style="position:absolute; top:15px; right:15px; background:${estadoColor}; color:#fff; font-size:11px; font-weight:700; padding:4px 10px; border-radius:20px; text-transform:uppercase;">${item.estado}</div>
        <div style="position:absolute; bottom:15px; left:15px; background:rgba(0,0,0,0.7); backdrop-filter:blur(4px); padding:4px 10px; border-radius:4px; font-size:11px; color:var(--ww); text-transform:uppercase; letter-spacing:1px;">${item.tipo}</div>
      </div>
      <div style="padding:25px; display:flex; flex-direction:column; flex:1;">
        <div style="font-size:11px; color:var(--gold); text-transform:uppercase; letter-spacing:1px; margin-bottom:5px;">${item.ciudad} · ${item.sector}</div>
        <h3 style="font-family:var(--font-display); font-size:20px; font-weight:700; color:var(--ww); margin-bottom:15px; line-height:1.2;">${item.nombre}</h3>
        
        <div style="display:flex; gap:15px; margin-bottom:20px; color:var(--ww60); font-size:13px;">
          <div title="Habitaciones">🛏 ${item.habitaciones}</div>
          <div title="Baños">🛁 ${item.banos}</div>
          <div title="Parqueos">🚗 ${item.parqueos}</div>
          <div title="Metraje">📐 ${item.metros}</div>
        </div>
        
        <div style="margin-top:auto; padding-top:20px; border-top:1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center;">
          <div style="font-size:18px; font-weight:700; color:var(--gold);">${item.precio}</div>
          <button class="btn-ph mag" onclick="openModal(${item.id})" style="padding:8px 16px; font-size:10px;">Ver inmueble</button>
        </div>
      </div>
    `;
    
    // hover effect
    card.addEventListener('mouseenter', () => card.querySelector('.inm-img-h').style.transform = 'scale(1.08)');
    card.addEventListener('mouseleave', () => card.querySelector('.inm-img-h').style.transform = 'scale(1)');
    
    grid.appendChild(card);
  });
}

// ================= FILTROS =================
fBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    fBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderInmuebles(btn.getAttribute('data-filter'));
  });
});

// ================= MODAL LOGIC =================
const modalOverlay = document.getElementById('inm-modal');
const modalBody = document.getElementById('inm-modal-body');
const btnClose = document.getElementById('inm-m-close');

function openModal(id) {
  const item = inmueblesData.find(i => i.id === id);
  if(!item) return;
  
  let galeriaHTML = '';
  item.galeria.forEach(img => {
    galeriaHTML += `<img src="${img}" style="width:100px; height:70px; object-fit:cover; border-radius:6px; cursor:pointer; opacity:0.6; transition:0.3s;" onmouseover="document.getElementById('m-main-img').src=this.src; this.parentNode.querySelectorAll('img').forEach(i=>i.style.opacity='0.6'); this.style.opacity='1';">`;
  });
  
  let amenidadesHTML = '';
  item.amenidades.forEach(am => {
    amenidadesHTML += `<span style="background:rgba(255,255,255,0.05); padding:6px 12px; border-radius:4px; font-size:12px; color:var(--ww60); border:1px solid rgba(255,255,255,0.1);">${am}</span>`;
  });
  
  modalBody.innerHTML = `
    <div style="display:flex; flex-wrap:wrap; height:100%;">
      <!-- Lado Izquierdo (Fotos) -->
      <div style="flex:1; min-width:300px; background:#000; padding:20px; display:flex; flex-direction:column; gap:10px;">
        <img id="m-main-img" src="${item.imagenPrincipal}" style="width:100%; height:400px; object-fit:cover; border-radius:8px;">
        <div style="display:flex; gap:10px; overflow-x:auto; padding-bottom:10px;">
          ${galeriaHTML}
        </div>
      </div>
      <!-- Lado Derecho (Info) -->
      <div style="flex:1; min-width:300px; padding:40px; display:flex; flex-direction:column;">
        <div style="font-size:12px; color:var(--gold); text-transform:uppercase; letter-spacing:1px; margin-bottom:10px;">${item.ciudad} · ${item.sector}</div>
        <h2 style="font-family:var(--font-display); font-size:32px; color:var(--ww); margin-bottom:10px; line-height:1.1;">${item.nombre}</h2>
        <div style="display:inline-block; background:rgba(255,255,255,0.1); padding:4px 10px; border-radius:4px; font-size:11px; text-transform:uppercase; margin-bottom:20px;">${item.tipo} · <strong style="color:var(--wa-green)">${item.estado}</strong></div>
        
        <div style="font-size:24px; font-weight:700; color:var(--gold); margin-bottom:30px;">${item.precio}</div>
        
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:30px;">
          <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
            <div style="font-size:11px; color:var(--ww60); text-transform:uppercase; margin-bottom:5px;">Habitaciones</div>
            <div style="font-size:16px; font-weight:600;">🛏 ${item.habitaciones}</div>
          </div>
          <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
            <div style="font-size:11px; color:var(--ww60); text-transform:uppercase; margin-bottom:5px;">Baños</div>
            <div style="font-size:16px; font-weight:600;">🛁 ${item.banos}</div>
          </div>
          <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
            <div style="font-size:11px; color:var(--ww60); text-transform:uppercase; margin-bottom:5px;">Parqueos</div>
            <div style="font-size:16px; font-weight:600;">🚗 ${item.parqueos}</div>
          </div>
          <div style="background:rgba(0,0,0,0.3); padding:15px; border-radius:8px; border:1px solid rgba(255,255,255,0.05);">
            <div style="font-size:11px; color:var(--ww60); text-transform:uppercase; margin-bottom:5px;">Metraje</div>
            <div style="font-size:16px; font-weight:600;">📐 ${item.metros}</div>
          </div>
        </div>
        
        <h4 style="font-size:14px; margin-bottom:10px; color:var(--ww);">Descripción</h4>
        <p style="font-size:14px; color:var(--ww60); line-height:1.6; margin-bottom:30px;">${item.descripcion}</p>
        
        <h4 style="font-size:14px; margin-bottom:10px; color:var(--ww);">Amenidades</h4>
        <div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:40px;">
          ${amenidadesHTML}
        </div>
        
        <div style="margin-top:auto; display:flex; gap:15px;">
          <a href="${item.whatsapp}" target="_blank" class="btn-wa mag" style="flex:1; text-align:center; padding:15px; border-radius:8px; background:#25D366; color:#fff; text-decoration:none; font-weight:700; display:flex; align-items:center; justify-content:center; gap:10px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </div>
  `;
  
  // Set the first thumbnail as active visually
  setTimeout(()=>{
    const firstThumb = modalBody.querySelector('img[src="'+item.imagenPrincipal+'"]');
    if(firstThumb && firstThumb.id !== 'm-main-img') firstThumb.style.opacity = '1';
  },10);
  
  modalOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('open');
  document.body.style.overflow = '';
  modalBody.innerHTML = '';
}

btnClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => {
  if(e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', e => {
  if(e.key === 'Escape' && modalOverlay.classList.contains('open')) closeModal();
});

// INIT
renderInmuebles();

</script>
"""

with open("inmuebles.html", "w") as f:
    f.write(header + new_content + footer)
