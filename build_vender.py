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

new_content = """
<!-- ============================================================
     QUIERO VENDER
============================================================ -->
<section id="quiero-vender" style="padding-top: 140px; padding-bottom: 80px; min-height: 100vh; display: flex; align-items: center;">
  <div style="max-width: 1200px; margin: 0 auto; width: 100%; display: grid; grid-template-columns: 1fr 1fr; gap: 60px; background: var(--g-dark); border-radius: 16px; overflow: hidden; box-shadow: 0 40px 100px rgba(0,0,0,0.5);">
    
    <!-- COLUMNA IZQUIERDA: FORMULARIO -->
    <div style="padding: 60px 50px;">
      <h2 style="font-family: var(--display); font-size: clamp(32px, 4vw, 42px); color: var(--gold); margin-bottom: 15px; line-height: 1.1;">Vende tu propiedad</h2>
      <p style="color: var(--ww60); margin-bottom: 40px; font-size: 15px; line-height: 1.6;">Déjanos tus datos y un asesor de REDEX se comunicará contigo para evaluar tu inmueble y conectarlo con compradores reales.</p>
      
      <form id="vender-form" style="display: flex; flex-direction: column; gap: 20px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <label style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--ww60); margin-bottom: 8px;">Nombre y apellido *</label>
            <input type="text" required style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); padding: 12px 16px; border-radius: 6px; color: #fff; font-family: var(--sans);">
          </div>
          <div>
            <label style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--ww60); margin-bottom: 8px;">Teléfono *</label>
            <input type="tel" required style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); padding: 12px 16px; border-radius: 6px; color: #fff; font-family: var(--sans);">
          </div>
        </div>
        
        <div>
          <label style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--ww60); margin-bottom: 8px;">Email *</label>
          <input type="email" required style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); padding: 12px 16px; border-radius: 6px; color: #fff; font-family: var(--sans);">
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <label style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--ww60); margin-bottom: 8px;">Provincia *</label>
            <input type="text" required style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); padding: 12px 16px; border-radius: 6px; color: #fff; font-family: var(--sans);">
          </div>
          <div>
            <label style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--ww60); margin-bottom: 8px;">Ciudad / Sector *</label>
            <input type="text" required style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); padding: 12px 16px; border-radius: 6px; color: #fff; font-family: var(--sans);">
          </div>
        </div>
        
        <div>
          <label style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--ww60); margin-bottom: 8px;">Dirección o referencia *</label>
          <input type="text" required style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); padding: 12px 16px; border-radius: 6px; color: #fff; font-family: var(--sans);">
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <label style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--ww60); margin-bottom: 8px;">Tipo de propiedad *</label>
            <select required style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); padding: 12px 16px; border-radius: 6px; color: #fff; font-family: var(--sans); appearance: none;">
              <option value="" disabled selected>Selecciona una opción</option>
              <option value="Casa" style="color:black">Casa</option>
              <option value="Apartamento" style="color:black">Apartamento</option>
              <option value="Solar" style="color:black">Solar</option>
              <option value="Villa" style="color:black">Villa</option>
              <option value="Finca" style="color:black">Finca</option>
              <option value="Local Comercial" style="color:black">Local comercial</option>
              <option value="Proyecto" style="color:black">Proyecto</option>
              <option value="Otro" style="color:black">Otro</option>
            </select>
          </div>
          <div>
            <label style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--ww60); margin-bottom: 8px;">Precio estimado *</label>
            <input type="text" required placeholder="Ej: $150,000 USD" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); padding: 12px 16px; border-radius: 6px; color: #fff; font-family: var(--sans);">
          </div>
        </div>
        
        <div>
          <label style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--ww60); margin-bottom: 8px;">¿La propiedad está ocupada? *</label>
          <div style="display: flex; gap: 20px;">
            <label style="display: flex; align-items: center; gap: 8px; color: #fff; font-size: 14px; cursor: pointer;">
              <input type="radio" name="ocupada" value="Si" required> Sí
            </label>
            <label style="display: flex; align-items: center; gap: 8px; color: #fff; font-size: 14px; cursor: pointer;">
              <input type="radio" name="ocupada" value="No" required> No
            </label>
          </div>
        </div>
        
        <div>
          <label style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--ww60); margin-bottom: 8px;">Comentarios (Opcional)</label>
          <textarea rows="3" style="width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); padding: 12px 16px; border-radius: 6px; color: #fff; font-family: var(--sans); resize: vertical;"></textarea>
        </div>
        
        <div>
          <label style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: var(--ww60); margin-bottom: 8px;">Adjuntar archivos / fotos * (JPG, PNG, PDF)</label>
          <div style="position: relative; border: 1px dashed rgba(200,164,74,0.4); border-radius: 6px; padding: 20px; text-align: center; background: rgba(200,164,74,0.02); cursor: pointer; transition: background 0.3s;" id="drop-zone">
            <input type="file" id="archivos" multiple accept=".jpg,.jpeg,.png,.pdf" required style="position: absolute; top:0; left:0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
            <div id="drop-text" style="color: var(--gold); font-size: 14px; font-weight: 600;">Haz clic aquí para seleccionar o arrastra tus archivos</div>
            <div id="file-list" style="margin-top: 10px; font-size: 12px; color: var(--ww60); display: flex; flex-direction: column; gap: 4px;"></div>
          </div>
        </div>
        
        <button type="submit" class="btn-gold mag" style="margin-top: 10px; justify-content: center; font-size: 13px; padding: 16px; width: 100%;">Enviar Solicitud</button>
        <div id="form-msg" style="display: none; margin-top: 10px; padding: 12px; background: rgba(26,107,58,0.2); border: 1px solid var(--wa-green); border-radius: 6px; color: #fff; text-align: center; font-size: 14px;">Solicitud enviada correctamente. Un asesor de REDEX se comunicará contigo.</div>
      </form>
    </div>
    
    <!-- COLUMNA DERECHA: IMAGEN -->
    <div style="position: relative; min-height: 400px; background: url('inmueble_bg.jpg') center/cover no-repeat;">
      <!-- Overlay degradado para texto encima de la imagen -->
      <div style="position: absolute; bottom: 0; left: 0; width: 100%; padding: 60px 40px 40px; background: linear-gradient(to top, var(--g-deep) 0%, transparent 100%);">
        <h3 style="font-family: var(--display); font-size: 28px; color: #fff; margin-bottom: 10px; line-height: 1.1;">Valoramos tu propiedad</h3>
        <p style="color: var(--gold); font-size: 16px; font-weight: 600;">La conectamos con compradores reales.</p>
      </div>
    </div>
    
  </div>
</section>

<script>
  // Lógica para archivos
  const fileInput = document.getElementById('archivos');
  const fileList = document.getElementById('file-list');
  const dropText = document.getElementById('drop-text');
  
  fileInput.addEventListener('change', function() {
    fileList.innerHTML = '';
    if(this.files.length > 0) {
      dropText.style.display = 'none';
      Array.from(this.files).forEach(f => {
        const div = document.createElement('div');
        div.textContent = '📄 ' + f.name;
        fileList.appendChild(div);
      });
    } else {
      dropText.style.display = 'block';
    }
  });

  // Lógica de envío (simulada por ahora)
  const form = document.getElementById('vender-form');
  const msg = document.getElementById('form-msg');
  
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    if(fileInput.files.length === 0) {
      alert("Por favor, adjunta al menos un archivo o foto de la propiedad.");
      return;
    }
    
    // Aquí iría la lógica para enviar a Supabase o CRM
    // ...
    
    // Simular carga
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Enviando...';
    btn.disabled = true;
    
    setTimeout(() => {
      btn.innerHTML = originalText;
      btn.disabled = false;
      form.reset();
      fileList.innerHTML = '';
      dropText.style.display = 'block';
      
      msg.style.display = 'block';
      setTimeout(() => msg.style.display = 'none', 8000);
    }, 1500);
  });
</script>

<style>
@media(max-width: 900px) {
  #quiero-vender > div { grid-template-columns: 1fr !important; }
  #quiero-vender .hero-bg { display: none; }
}
</style>
"""

with open("quiero-vender.html", "w") as f:
    f.write(header + new_content + footer)

