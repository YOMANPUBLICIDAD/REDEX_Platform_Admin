const fs = require('fs');
const path = require('path');

const dirs = [
  '/Users/admin/Desktop/REDEX_Premium_Final',
  '/Users/admin/Desktop/REDEX_Premium_Optimizado'
];

const filesToUpdate = ['index.html', 'netlify.html', 'netlify2.html', 'proyectos-activos.html', 'quiero-vender.html', 'precalificate.html', 'quiero-ser-asesor.html', 'calculadora.html'];

dirs.forEach(dir => {
  if(!fs.existsSync(dir)) return;
  filesToUpdate.forEach(f => {
    const filePath = path.join(dir, f);
    if(!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Update Ubicacion
    if(content.includes('<select style="background:transparent; border:none; outline:none; font-family:var(--sans); font-size:11px; font-weight:700; color:#0d1221; width:100%; appearance:none; cursor:pointer;" aria-label="Ubicación">')) {
      content = content.replace(
        '<select style="background:transparent; border:none; outline:none; font-family:var(--sans); font-size:11px; font-weight:700; color:#0d1221; width:100%; appearance:none; cursor:pointer;" aria-label="Ubicación">',
        '<select id="search-city" style="background:transparent; border:none; outline:none; font-family:var(--sans); font-size:11px; font-weight:700; color:#0d1221; width:100%; appearance:none; cursor:pointer;" aria-label="Ubicación">'
      );
      content = content.replace('<option value="">UBICACIÓN</option>', '<option value="">UBICACIÓN (TODAS)</option>');
      // add values to options if missing
      content = content.replace(/<option>La Vega<\/option>/g, '<option value="La Vega">La Vega</option>');
      content = content.replace(/<option>Puerto Plata<\/option>/g, '<option value="Puerto Plata">Puerto Plata</option>');
      content = content.replace(/<option>Punta Cana<\/option>/g, '<option value="Punta Cana">Punta Cana</option>');
      content = content.replace(/<option>Santiago<\/option>/g, '<option value="Santiago">Santiago</option>');
      changed = true;
    }

    // Update Tipo (Regex to replace the whole block because it has different inner options)
    const selectTipoRegex = /<select style="background:transparent; border:none; outline:none; font-family:var\(--sans\); font-size:11px; font-weight:700; color:#0d1221; width:100%; appearance:none; cursor:pointer;" aria-label="Tipo">[\s\S]*?<\/select>/;
    if(selectTipoRegex.test(content)) {
      const newTipoHtml = `<select id="search-cat" style="background:transparent; border:none; outline:none; font-family:var(--sans); font-size:11px; font-weight:700; color:#0d1221; width:100%; appearance:none; cursor:pointer;" aria-label="Tipo">
          <option value="">TIPO (TODOS)</option>
          <option value="Proyecto Residencial">Proyecto Residencial</option>
          <option value="Apartamento">Apartamento</option>
          <option value="Solar">Solar</option>
          <option value="Casa">Casa</option>
          <option value="Villa">Villa</option>
          <option value="Local Comercial">Local Comercial</option>
        </select>`;
      content = content.replace(selectTipoRegex, newTipoHtml);
      changed = true;
    }

    // Update Precio
    if(content.includes('<select style="background:transparent; border:none; outline:none; font-family:var(--sans); font-size:11px; font-weight:700; color:#0d1221; width:100%; appearance:none; cursor:pointer;" aria-label="Precio">')) {
      content = content.replace(
        '<select style="background:transparent; border:none; outline:none; font-family:var(--sans); font-size:11px; font-weight:700; color:#0d1221; width:100%; appearance:none; cursor:pointer;" aria-label="Precio">',
        '<select id="search-price" style="background:transparent; border:none; outline:none; font-family:var(--sans); font-size:11px; font-weight:700; color:#0d1221; width:100%; appearance:none; cursor:pointer;" aria-label="Precio">'
      );
      content = content.replace('<option value="">PRECIO</option>', '<option value="">PRECIO (TODOS)</option>');
      content = content.replace(/<option>- USD 50K<\/option>/g, '<option value="-50000">- USD 50K</option>');
      content = content.replace(/<option>USD 50-100K<\/option>/g, '<option value="50000-100000">USD 50-100K</option>');
      content = content.replace(/<option>USD 100K\+<\/option>/g, '<option value="100000+">USD 100K+</option>');
      changed = true;
    }

    // Update BUSCAR Button
    const btnRegex = /<button style="([^"]*)" onmouseover="([^"]*)" onmouseout="([^"]*)">\s*<svg[^>]*>.*?<\/svg>\s*BUSCAR\s*<\/button>/;
    if(btnRegex.test(content) && !content.includes('onclick="executeHomeSearch()"')) {
      content = content.replace(btnRegex, (match) => {
        return match.replace('<button ', '<button onclick="executeHomeSearch()" ');
      });
      changed = true;
    }

    // Add executeHomeSearch Script if not present
    if(changed && !content.includes('function executeHomeSearch()')) {
      content = content.replace('</body>', `
<script>
function executeHomeSearch() {
  const city = document.getElementById('search-city') ? document.getElementById('search-city').value : '';
  const cat = document.getElementById('search-cat') ? document.getElementById('search-cat').value : '';
  const price = document.getElementById('search-price') ? document.getElementById('search-price').value : '';
  let url = 'inmuebles.html?';
  const params = new URLSearchParams();
  if(city) params.append('ciudad', city);
  if(cat) params.append('cat', cat);
  if(price) params.append('precio', price);
  window.location.href = url + params.toString();
}
</script>
</body>`);
    }

    if(changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated search bar in:', filePath);
    }
  });
});
