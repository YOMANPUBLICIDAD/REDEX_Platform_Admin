const fs = require('fs');

const file1 = '/Users/admin/Desktop/REDEX_Premium_Final/data-inmuebles.js';
const file2 = '/Users/admin/Desktop/REDEX_Premium_Optimizado/data-inmuebles.js';

let content = fs.readFileSync(file1, 'utf8');

// Parse it
let inmueblesData;
eval(content.replace('const inmueblesData', 'inmueblesData'));

const solaresResidencialesList = [
  'Vista del Atlántico Residence',
  'Palmaretto Golden Village',
  'Residencial Don Martín',
  'Residencial El Molino',
  'Lotificación Iris',
  'Residencial Santa Fe',
  'Residencial Valle Verde',
  'Residencial Concepción'
];

let changed = 0;

for (let p of inmueblesData) {
  let name = (p.nombre || '').trim();
  
  // Explicitly handle Casa en Bonao
  if (name.includes('Casa En Bonao, Barrio San Jose')) {
    p.tipo = 'Solar';
    changed++;
    continue;
  }
  
  // If it's one of the priority ones
  if (solaresResidencialesList.includes(name)) {
    p.tipo = 'Proyecto Residencial';
    changed++;
    continue;
  }
  
  // For all other legacy projects that I blindly marked as Proyecto Residencial:
  if (p.tipo === 'Proyecto Residencial') {
    p.tipo = 'Solar';
    changed++;
  }
}

const newDataContent = `const inmueblesData = ${JSON.stringify(inmueblesData, null, 2)};\n`;

fs.writeFileSync(file1, newDataContent);
fs.writeFileSync(file2, newDataContent);

console.log(`Updated ${changed} properties successfully.`);
