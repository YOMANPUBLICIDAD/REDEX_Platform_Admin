import re
import os

filepath = '/Users/admin/Desktop/REDEX_Premium_Final/inmuebles.html'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add CSS for search and dropdowns
css_injection = """
/* ============================================================
   NAV DROPDOWN & ADVANCED SEARCH & FILTER SUBMENUS
============================================================ */
.nav-dropdown {
  position: absolute; top: 100%; left: 0; min-width: 200px; 
  background: var(--black); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 8px; padding: 10px 0; opacity: 0; visibility: hidden;
  transform: translateY(10px); transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 100;
}
.dropdown-nav { position: relative; }
.dropdown-nav:hover .nav-dropdown, .dropdown-nav.active .nav-dropdown {
  opacity: 1; visibility: visible; transform: translateY(0);
}
.nav-dropdown a {
  display: block; padding: 8px 20px; color: var(--ww80); font-size: 13px; font-weight: 500; text-transform: capitalize;
}
.nav-dropdown a:hover { color: var(--gold); background: rgba(255,255,255,0.03); }

.premium-search {
  display: flex; width: 100%; max-width: 650px; margin: 0 auto;
  background: rgba(10, 15, 28, 0.4); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 30px; padding: 6px; backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3); transition: border-color 0.3s;
}
.premium-search:focus-within { border-color: var(--gold); }
.premium-search input {
  flex: 1; background: transparent; border: none; padding: 12px 20px;
  color: #fff; font-size: 15px; outline: none; font-family: var(--sans);
}
.premium-search input::placeholder { color: rgba(255,255,255,0.4); }
.premium-search button {
  background: var(--gold); color: var(--navy); border: none;
  border-radius: 25px; padding: 0 25px; font-weight: 700; cursor: pointer;
  transition: all 0.3s; font-size: 13px; text-transform: uppercase; letter-spacing: 1px;
}
.premium-search button:hover {
  background: var(--g-deep); color: var(--gold); box-shadow: 0 4px 15px rgba(200, 164, 74, 0.3);
}

.f-btn-wrap { position: relative; display: inline-block; }
.f-submenu {
  position: absolute; top: 100%; left: 50%; transform: translateX(-50%) translateY(10px);
  background: var(--black); border: 1px solid rgba(255,255,255,0.05);
  border-radius: 6px; padding: 8px 0; min-width: 140px; z-index: 50;
  opacity: 0; visibility: hidden; transition: all 0.3s; box-shadow: 0 5px 20px rgba(0,0,0,0.5);
  display: flex; flex-direction: column;
}
.f-btn-wrap:hover .f-submenu { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(5px); }
.f-submenu-item {
  display: block; width: 100%; text-align: left; padding: 6px 15px;
  background: transparent; border: none; color: var(--ww80);
  font-size: 11px; font-weight: 600; text-transform: uppercase; cursor: pointer;
  transition: all 0.2s; font-family: var(--sans);
}
.f-submenu-item:hover, .f-submenu-item.active {
  color: var(--gold); background: rgba(255,255,255,0.03);
}

@media(max-width: 768px) {
  .nav-dropdown { position: static; box-shadow: none; padding-left: 15px; border: none; display: none; }
  .dropdown-nav.open .nav-dropdown { display: block; }
  .premium-search { flex-direction: column; border-radius: 15px; padding: 15px; }
  .premium-search input { padding: 10px; margin-bottom: 10px; }
  .premium-search button { padding: 12px; border-radius: 8px; }
}
</style>"""
content = content.replace("</style>", css_injection, 1)

# 2. Navbar modification
old_nav = '<li><a href="#inmuebles" id="nl-3">Inmuebles</a></li>'
new_nav = """      <li class="dropdown-nav" id="nav-inmuebles-wrap">
        <a href="#inmuebles" id="nl-3" onclick="this.parentNode.classList.toggle('open'); return false;">Inmuebles <svg width="10" height="10" viewBox="0 0 24 24" style="margin-left:5px"><path d="M7 10l5 5 5-5z" fill="currentColor"/></svg></a>
        <div class="nav-dropdown" id="nav-inmuebles-menu">
          <!-- Dinámico -->
        </div>
      </li>"""
content = content.replace(old_nav, new_nav)

# 3. Hero modification
hero_search = """
    <div class="premium-search reveal" style="margin-bottom: 30px;">
      <input type="text" id="hs-inm-search" placeholder="Buscar por nombre, ciudad, sector o tipo..." onkeyup="if(event.key === 'Enter') buscarInmuebles()">
      <button onclick="buscarInmuebles()">Buscar</button>
    </div>
"""
old_hero_buttons = """<div style="display:flex; gap:15px; justify-content:center;" class="reveal">
      <a href="#catalogo" class="btn-gold-solid mag">Ver inmuebles</a>
      <a href="quiero-vender.html" class="btn-ph mag">Quiero vender mi propiedad</a>
    </div>"""

new_hero = hero_search + """    <div style="display:flex; gap:15px; justify-content:center;" class="reveal">
      <button onclick="scrollToGrid()" class="btn-gold-solid mag">Ver inmuebles</button>
      <a href="quiero-vender.html" class="btn-ph mag">Quiero vender mi propiedad</a>
    </div>"""

content = content.replace(old_hero_buttons, new_hero)

# 4. Filters HTML modification
old_filters = """<div style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:40px; justify-content:center;" class="reveal">
      <button class="f-btn active" data-filter="todos">Todos</button>
      <button class="f-btn" data-filter="casa">Casas</button>
      <button class="f-btn" data-filter="apartamento">Apartamentos</button>
      <button class="f-btn" data-filter="villa">Villas</button>
      <button class="f-btn" data-filter="local">Locales</button>
      <button class="f-btn" data-filter="solar">Solares Residenciales</button>
      <button class="f-btn" data-filter="disponible">Disponibles</button>
    </div>"""

new_filters = """<div id="inmuebles-filters-container" style="display:flex; flex-wrap:wrap; gap:10px; margin-bottom:40px; justify-content:center; align-items:center;" class="reveal">
      <!-- Generado dinámicamente -->
    </div>"""

content = content.replace(old_filters, new_filters)

# 5. Remove the duplicate renderInmuebles that breaks the page and inject the real one.
import re

content = re.sub(
    r'// ================= RENDERIZADO =================.*?(?=<script src="proyectos-data\.js">)',
    '',
    content,
    flags=re.DOTALL
)

content = re.sub(
    r'// ============= INMUEBLES DYNAMIC LOGIC =============.*?startCarousel\(\);\s*// reiniciar timer\s*\}\);\s*\}\);',
    '',
    content,
    flags=re.DOTALL
)
content = re.sub(
    r'if\(document\.getElementById\(\'inmuebles-grid\'\)\)\{.*?nextBtn\.addEventListener.*?;.*?\}',
    '',
    content,
    flags=re.DOTALL
)

# Now, we will inject the unified Javascript logic at the end, right before </body>
js_injection = """
<script>
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
    'solar': 'Solares Residenciales',
    'disponible': 'Disponibles'
  };

  const cats = ['todos', 'casa', 'apartamento', 'villa', 'local', 'solar', 'disponible'];
  
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
    if(cat === 'disponible') return item.estado.toLowerCase() === 'disponible';
    if(cat === 'local') return item.tipo.toLowerCase() === 'local comercial';
    return item.tipo.toLowerCase() === cat.toLowerCase();
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
          <div class="inm-c-tag ${p.estado.toLowerCase() === 'disponible' ? 'green' : (p.estado.toLowerCase() === 'reservado' || p.estado.toLowerCase() === 'vendido' ? 'red' : 'gold')}">${p.estado}</div>
        </div>
        <div class="inm-c-body">
          <div class="inm-c-loc">${p.ciudad}</div>
          <h3 class="inm-c-name" style="font-size:15px; margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${p.nombre}</h3>
          <div class="inm-c-price">Desde <strong>${p.precio}</strong></div>
          <div class="inm-c-type">${p.tipo.toUpperCase()}</div>
          <button class="btn-gold mag" style="width:100%; margin-top:15px; border-radius:4px;" onclick="openProyectoModal(${p.id})">Ver Inmueble</button>
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
</script>
"""

content = content.replace("</body>", js_injection + "\\n</body>")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Update complete for REDEX_Premium_Final.")
