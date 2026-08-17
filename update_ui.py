import re
import os

filepath = '/Users/admin/Desktop/REDEX_Premium_Final/inmuebles.html'
opt_filepath = '/Users/admin/Desktop/REDEX_Premium_Optimizado/inmuebles.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update JS cats
old_cats = "const cats = ['todos', 'casa', 'apartamento', 'villa', 'local', 'solar', 'disponible'];"
new_cats = "const cats = ['todos', 'casa', 'apartamento', 'villa', 'local', 'solar residencial', 'lote', 'proyecto residencial', 'disponible'];"

old_cats_map = """  const categoriesMap = {
    'todos': 'Todos',
    'casa': 'Casas',
    'apartamento': 'Apartamentos',
    'villa': 'Villas',
    'local': 'Locales',
    'solar': 'Solares Residenciales',
    'disponible': 'Disponibles'
  };"""

new_cats_map = """  const categoriesMap = {
    'todos': 'Todos',
    'casa': 'Casas',
    'apartamento': 'Apartamentos',
    'villa': 'Villas',
    'local': 'Locales',
    'solar residencial': 'Solares Residenciales',
    'lote': 'Lotes',
    'proyecto residencial': 'Proyectos Residenciales',
    'disponible': 'Disponibles'
  };"""

content = content.replace(old_cats, new_cats)
content = content.replace(old_cats_map, new_cats_map)

# 2. Update render filters matching
old_match = """  function matchCat(item, cat) {
    if(cat === 'todos') return true;
    if(cat === 'disponible') return item.estado.toLowerCase() === 'disponible';
    if(cat === 'local') return item.tipo.toLowerCase() === 'local comercial';
    return item.tipo.toLowerCase() === cat.toLowerCase();
  }"""
new_match = """  function matchCat(item, cat) {
    if(cat === 'todos') return true;
    if(cat === 'disponible') return (item.estado || '').toLowerCase() === 'disponible';
    
    let itemType = (item.tipo || '').toLowerCase();
    
    if(cat === 'local') return itemType.includes('local');
    if(cat === 'solar residencial') return itemType.includes('solar');
    if(cat === 'lote') return itemType.includes('lote');
    if(cat === 'proyecto residencial') return itemType.includes('proyecto');
    
    return itemType === cat.toLowerCase();
  }"""
content = content.replace(old_match, new_match)

# 3. Update the Card UI to show metraje
old_card_inner = """        <div class="inm-c-img">
          <img src="${p.imagenPrincipal}" alt="${p.nombre}" loading="lazy">
          <div class="inm-c-tag ${p.estado.toLowerCase() === 'disponible' ? 'green' : (p.estado.toLowerCase() === 'reservado' || p.estado.toLowerCase() === 'vendido' ? 'red' : 'gold')}">${p.estado}</div>
        </div>
        <div class="inm-c-body">
          <div class="inm-c-loc">${p.ciudad}</div>
          <h3 class="inm-c-name" style="font-size:15px; margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${p.nombre}</h3>
          <div class="inm-c-price">Desde <strong>${p.precio}</strong></div>
          <div class="inm-c-type">${p.tipo.toUpperCase()}</div>
          <button class="btn-gold mag" style="width:100%; margin-top:15px; border-radius:4px;" onclick="openProyectoModal(${p.id})">Ver Inmueble</button>
        </div>"""

new_card_inner = """        <div class="inm-c-img">
          <img src="${p.imagenPrincipal}" alt="${p.nombre}" loading="lazy">
          <div class="inm-c-tag ${(p.estado||'').toLowerCase() === 'disponible' ? 'green' : ((p.estado||'').toLowerCase() === 'reservado' || (p.estado||'').toLowerCase() === 'vendido' ? 'red' : 'gold')}">${p.estado}</div>
        </div>
        <div class="inm-c-body">
          <div class="inm-c-loc">${p.ciudad} ${p.sector !== 'Varias Zonas' ? ' - ' + p.sector : ''}</div>
          <h3 class="inm-c-name" style="font-size:15px; margin-bottom:8px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${p.nombre}</h3>
          <div class="inm-c-price">Desde <strong>${p.precio}</strong></div>
          <div style="font-size:12px; color:var(--ww80); margin-bottom:8px;">${p.metros && p.metros !== 'Consultar' ? 'Construcción: ' + p.metros : (p.habitaciones && p.habitaciones !== 'Consultar' ? p.habitaciones + ' habs.' : '')}</div>
          <div class="inm-c-type">${(p.tipo||'').toUpperCase()}</div>
          <button class="btn-gold mag" style="width:100%; margin-top:15px; border-radius:4px;" onclick="openProyectoModal(${p.id})">Ver Inmueble</button>
        </div>"""

content = content.replace(old_card_inner, new_card_inner)


# 4. Update Modal HTML structure in inmuebles.html
old_modal_grid = """          <div class="m-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px; font-size:13px;">
            <div><strong>Precio:</strong> <span id="m-precio" style="color:var(--gold);"></span></div>
            <div><strong>Disponibilidad:</strong> <span id="m-disp"></span></div>
            <div><strong>Estado:</strong> <span id="m-estado"></span></div>
            <div><strong>Reserva:</strong> <span id="m-reserva"></span></div>
          </div>"""
new_modal_grid = """          <div class="m-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:20px; font-size:13px;">
            <div><strong>Precio:</strong> <span id="m-precio" style="color:var(--gold);"></span></div>
            <div><strong>Metraje:</strong> <span id="m-metros"></span></div>
            <div><strong>Tipo:</strong> <span id="m-tipo"></span></div>
            <div><strong>Estado:</strong> <span id="m-estado"></span></div>
            <div><strong>Habitaciones:</strong> <span id="m-habs"></span></div>
            <div><strong>Baños:</strong> <span id="m-banos"></span></div>
            <div><strong>Parqueos:</strong> <span id="m-parq"></span></div>
            <div><strong>Disponibilidad:</strong> <span id="m-disp"></span></div>
            <div><strong>Forma de Pago:</strong> <span id="m-forma"></span></div>
            <div><strong>Financiamiento:</strong> <span id="m-finan"></span></div>
          </div>"""
content = content.replace(old_modal_grid, new_modal_grid)


# 5. Update openProyectoModal logic
old_open_modal = """  const mUbicacion = document.getElementById('m-ubicacion');
  if(mUbicacion) mUbicacion.textContent = (p.ciudad && p.sector) ? `${p.ciudad}, ${p.sector}` : (p.ciudad || '');
  
  document.getElementById('m-precio').innerHTML = `Desde <strong>${p.precio}</strong>`;
  
  const mDisp = document.getElementById('m-disp');
  if(mDisp) mDisp.textContent = '1';
  
  const mEstado = document.getElementById('m-estado');
  if(mEstado) mEstado.textContent = p.estado;
  
  const mReserva = document.getElementById('m-reserva');
  if(mReserva) mReserva.textContent = p.precio === 'Consultar precio' ? 'Contactar' : 'Consultar';
  
  const mDesc = document.getElementById('m-desc');"""

new_open_modal = """  const mUbicacion = document.getElementById('m-ubicacion');
  if(mUbicacion) mUbicacion.textContent = (p.ciudad && p.sector) ? `${p.ciudad}, ${p.sector}` : (p.ciudad || '');
  
  document.getElementById('m-precio').innerHTML = `Desde <strong>${p.precio}</strong>`;
  
  if(document.getElementById('m-metros')) document.getElementById('m-metros').textContent = p.metros || 'Consultar';
  if(document.getElementById('m-tipo')) document.getElementById('m-tipo').textContent = p.tipo || 'Consultar';
  if(document.getElementById('m-estado')) document.getElementById('m-estado').textContent = p.estado || 'Disponible';
  if(document.getElementById('m-habs')) document.getElementById('m-habs').textContent = p.habitaciones || 'Consultar';
  if(document.getElementById('m-banos')) document.getElementById('m-banos').textContent = p.banos || 'Consultar';
  if(document.getElementById('m-parq')) document.getElementById('m-parq').textContent = p.parqueos || 'Consultar';
  if(document.getElementById('m-disp')) document.getElementById('m-disp').textContent = p.disponibilidad || '1';
  if(document.getElementById('m-forma')) document.getElementById('m-forma').textContent = p.forma_pago || 'Consultar';
  if(document.getElementById('m-finan')) document.getElementById('m-finan').textContent = p.financiamiento || 'Disponible con asesor';

  const mDesc = document.getElementById('m-desc');"""

content = content.replace(old_open_modal, new_open_modal)


# Save both
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
with open(opt_filepath, 'w', encoding='utf-8') as f:
    f.write(content)
    
print("Updated HTML UI successfully.")
