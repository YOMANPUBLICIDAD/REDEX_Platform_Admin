import re
import os

filepath = '/Users/admin/Desktop/REDEX_Premium_Final/inmuebles.html'
opt_filepath = '/Users/admin/Desktop/REDEX_Premium_Optimizado/inmuebles.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. NEW CSS for the Modal Detail View
new_css = """
/* ============= MODAL DETALLE PREMIUM ============= */
.detail-modal-overlay {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.85); z-index: 99999;
  display: flex; align-items: flex-start; justify-content: center;
  opacity: 0; pointer-events: none; transition: opacity 0.4s ease;
  overflow-y: auto; padding: 40px 20px;
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
}
.detail-modal-overlay.open { opacity: 1; pointer-events: all; }

.detail-modal-content {
  background: var(--g-deep); width: 100%; max-width: 1200px;
  border-radius: 12px; overflow: hidden; position: relative;
  box-shadow: 0 25px 50px rgba(0,0,0,0.5); border: 1px solid rgba(255,215,0,0.2);
  transform: translateY(30px); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  margin: auto;
}
.detail-modal-overlay.open .detail-modal-content { transform: translateY(0); }

.dm-close {
  position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.6);
  color: #fff; border: 1px solid rgba(255,255,255,0.2); width: 40px; height: 40px;
  border-radius: 50%; font-size: 24px; cursor: pointer; z-index: 100;
  display: flex; align-items: center; justify-content: center; transition: all 0.3s;
}
.dm-close:hover { background: var(--red); border-color: var(--red); transform: rotate(90deg); }

.dm-header { padding: 30px; border-bottom: 1px solid rgba(255,255,255,0.05); }
.dm-title { font-size: 28px; color: var(--gold); margin-bottom: 8px; font-weight: 700; line-height: 1.2; }
.dm-location { color: var(--ww80); font-size: 15px; display: flex; align-items: center; gap: 8px; margin-bottom: 15px; }
.dm-tags { display: flex; gap: 10px; flex-wrap: wrap; }
.dm-tag { padding: 5px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.dm-tag.type { background: rgba(255,255,255,0.1); color: #fff; }
.dm-tag.status { background: var(--red); color: #fff; }

.dm-gallery-wrap { display: flex; height: 500px; background: #000; }
.dm-gallery-main { flex: 0 0 75%; position: relative; overflow: hidden; }
.dm-gallery-main img { width: 100%; height: 100%; object-fit: cover; transition: opacity 0.3s; }
.dm-gallery-side { flex: 0 0 25%; display: flex; flex-direction: column; gap: 2px; padding-left: 2px; overflow: hidden; }
.dm-thumb { flex: 1; position: relative; cursor: pointer; overflow: hidden; }
.dm-thumb img { width: 100%; height: 100%; object-fit: cover; opacity: 0.6; transition: all 0.3s; }
.dm-thumb:hover img, .dm-thumb.active img { opacity: 1; transform: scale(1.05); }
.dm-more-overlay { position: absolute; top:0; left:0; width:100%; height:100%; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 24px; font-weight: bold; pointer-events: none; }
.dm-nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); color: #fff; border: none; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center; font-size: 20px; cursor: pointer; z-index: 10; border-radius: 50%; transition: 0.3s; }
.dm-nav:hover { background: var(--gold); color: #000; }
.dm-nav.prev { left: 20px; }
.dm-nav.next { right: 20px; }

.dm-body-wrap { display: flex; padding: 30px; gap: 40px; }
.dm-content { flex: 1; }
.dm-sidebar { flex: 0 0 320px; }

.dm-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; background: rgba(255,255,255,0.02); padding: 25px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 30px; }
.dm-metric { display: flex; flex-direction: column; gap: 5px; }
.dm-metric-val { font-size: 18px; font-weight: 600; color: #fff; }
.dm-metric-lbl { font-size: 13px; color: var(--ww80); text-transform: uppercase; letter-spacing: 0.5px; }
.dm-metric.price .dm-metric-val { color: var(--gold); font-size: 24px; }

.dm-section { margin-bottom: 40px; }
.dm-section-title { font-size: 20px; color: var(--gold); margin-bottom: 20px; border-bottom: 1px solid rgba(255,215,0,0.2); padding-bottom: 10px; }
.dm-desc-text { color: var(--ww80); line-height: 1.8; font-size: 15px; white-space: pre-line; }

.dm-features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.dm-feature-group h4 { color: #fff; margin-bottom: 12px; font-size: 15px; }
.dm-feature-list { list-style: none; padding: 0; margin: 0; color: var(--ww80); font-size: 14px; line-height: 1.6; }
.dm-feature-list li { position: relative; padding-left: 18px; margin-bottom: 6px; }
.dm-feature-list li::before { content: '✓'; position: absolute; left: 0; color: var(--gold); }

.dm-contact-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,215,0,0.2); border-radius: 8px; padding: 25px; position: sticky; top: 20px; }
.dm-agent-header { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 20px; }
.dm-agent-img { width: 60px; height: 60px; border-radius: 50%; background: var(--red); display: flex; align-items: center; justify-content: center; font-size: 24px; color: #fff; font-weight: bold; border: 2px solid var(--gold); }
.dm-agent-info h4 { color: #fff; margin: 0 0 5px 0; font-size: 16px; }
.dm-agent-info p { color: var(--ww80); margin: 0; font-size: 13px; }
.dm-action-btn { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 14px; border-radius: 6px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.3s; margin-bottom: 12px; border: none; text-decoration: none; text-align: center; }
.dm-btn-wa { background: #25D366; color: #fff; }
.dm-btn-wa:hover { background: #1ebe5a; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(37,211,102,0.3); }
.dm-btn-call { background: var(--red); color: #fff; }
.dm-btn-call:hover { background: #90111f; transform: translateY(-2px); }

@media (max-width: 992px) {
  .dm-body-wrap { flex-direction: column; padding: 20px; }
  .dm-sidebar { flex: auto; }
  .dm-gallery-wrap { height: 350px; flex-direction: column; }
  .dm-gallery-main { flex: 1; }
  .dm-gallery-side { flex-direction: row; flex: 0 0 80px; padding-left: 0; padding-top: 2px; }
  .dm-metrics { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 768px) {
  .dm-metrics { grid-template-columns: 1fr; }
  .dm-features { grid-template-columns: 1fr; }
  .detail-modal-overlay { padding: 0; }
  .detail-modal-content { border-radius: 0; min-height: 100vh; }
  .dm-close { top: 10px; right: 10px; }
}
</style>
"""

# We need to inject the CSS before </style> or in head
if '</style>' in content:
    content = content.replace('</style>', new_css, 1)
elif '</head>' in content:
    content = content.replace('</head>', '<style>' + new_css.replace('</style>', '') + '</style></head>')

# 2. Add Modal HTML Structure (Replace old modals)
# We will search for `<div id="inm-modal"` and replace the whole block until `</div>`
# Wait, it's safer to just inject the new HTML right before </body>, and let it override the old one
new_modal_html = """
<!-- ============================================================
     NUEVA FICHA TÉCNICA DETALLE (REMAX STYLE / REDEX PREMIUM)
============================================================ -->
<div id="detail-modal" class="detail-modal-overlay">
  <div class="detail-modal-content">
    <button class="dm-close" onclick="cerrarDetailModal()">&times;</button>
    
    <div class="dm-header">
      <h2 class="dm-title" id="dm-title">Nombre del Inmueble</h2>
      <div class="dm-location"><span id="dm-loc">Ciudad, Sector</span></div>
      <div class="dm-tags">
        <span class="dm-tag type" id="dm-type">Tipo</span>
        <span class="dm-tag status" id="dm-status">Disponible</span>
      </div>
    </div>
    
    <div class="dm-gallery-wrap">
      <div class="dm-gallery-main">
        <button class="dm-nav prev" onclick="dmGalleryPrev()">&#10094;</button>
        <button class="dm-nav next" onclick="dmGalleryNext()">&#10095;</button>
        <img id="dm-main-img" src="" alt="Principal">
      </div>
      <div class="dm-gallery-side" id="dm-thumbs">
        <!-- Thumbnails injected here -->
      </div>
    </div>
    
    <div class="dm-body-wrap">
      <div class="dm-content">
        
        <div class="dm-metrics">
          <div class="dm-metric price">
            <span class="dm-metric-lbl">Precio Desde</span>
            <span class="dm-metric-val" id="dm-m-price">Consultar</span>
          </div>
          <div class="dm-metric">
            <span class="dm-metric-lbl">Metraje</span>
            <span class="dm-metric-val" id="dm-m-area">Consultar</span>
          </div>
          <div class="dm-metric">
            <span class="dm-metric-lbl">Habitaciones</span>
            <span class="dm-metric-val" id="dm-m-bed">Consultar</span>
          </div>
          <div class="dm-metric">
            <span class="dm-metric-lbl">Baños</span>
            <span class="dm-metric-val" id="dm-m-bath">Consultar</span>
          </div>
          <div class="dm-metric">
            <span class="dm-metric-lbl">Parqueos</span>
            <span class="dm-metric-val" id="dm-m-park">Consultar</span>
          </div>
          <div class="dm-metric">
            <span class="dm-metric-lbl">Forma de Pago</span>
            <span class="dm-metric-val" id="dm-m-pay" style="font-size:14px">Consultar</span>
          </div>
        </div>
        
        <div class="dm-section">
          <h3 class="dm-section-title">Descripción</h3>
          <div class="dm-desc-text" id="dm-desc"></div>
        </div>
        
        <div class="dm-section">
          <h3 class="dm-section-title">Características</h3>
          <div class="dm-features" id="dm-features">
            <!-- Features injected here -->
          </div>
        </div>
        
      </div>
      
      <div class="dm-sidebar">
        <div class="dm-contact-card">
          <div class="dm-agent-header">
            <div class="dm-agent-img">R</div>
            <div class="dm-agent-info">
              <h4 id="dm-agent-name">Asesor Inmobiliario</h4>
              <p>REDEX Inmobiliaria</p>
            </div>
          </div>
          <a href="#" class="dm-action-btn dm-btn-wa" id="dm-btn-wa" target="_blank">Contactar por WhatsApp</a>
          <button class="dm-action-btn dm-btn-call" onclick="document.getElementById('dm-btn-wa').click()">Solicitar Información</button>
        </div>
      </div>
    </div>
    
  </div>
</div>
"""

if '<!-- Generado dinámicamente -->' in content:
    content = content.replace('<!-- Generado dinámicamente -->', '')

content = content.replace('</body>', new_modal_html + '\n</body>')

# 3. Inject JS logic for the new modal
# We will replace the old `window.openProyectoModal = function(id) { ... }` block
# We will use regex to find the block from `let mGalleryArr = [];` up to `window.mSetGallery` included
old_js_pattern = re.compile(r'let mGalleryArr = \[\];.*?window\.mSetGallery.*?;\n', re.DOTALL)
if old_js_pattern.search(content):
    print("Found old modal JS logic to replace.")

new_js = """
// ============= NUEVA LOGICA DE MODAL (FICHA TECNICA) =============
let dmGalleryArr = [];
let dmGalleryIndex = 0;

window.openProyectoModal = function(id) {
  const p = typeof inmueblesData !== 'undefined' ? inmueblesData.find(x => x.id === id) : null;
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
"""

content = old_js_pattern.sub(new_js, content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
with open(opt_filepath, 'w', encoding='utf-8') as f:
    f.write(content)
    
print("Updated HTML UI successfully.")
