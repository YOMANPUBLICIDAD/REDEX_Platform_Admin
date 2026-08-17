const fs = require('fs');

const dataFile = '/Users/admin/Desktop/REDEX_Premium_Final/data-inmuebles.js';
const legacyFile = '/Users/admin/Desktop/REDEX_Premium_Final/proyectos-data.js';

let dataContent = fs.readFileSync(dataFile, 'utf8');
let legacyContent = fs.readFileSync(legacyFile, 'utf8');

// Replace const with var so it leaks to global scope in eval, or just extract the JSON
let cleanDataContent = dataContent.replace('const inmueblesData =', 'var inmueblesData =');
let cleanLegacyContent = legacyContent.replace('const proyectosData =', 'var proyectosData =');

eval(cleanDataContent + '\n' + cleanLegacyContent);

let existingNames = new Set(inmueblesData.map(i => (i.nombre || '').toLowerCase()));
let added = 0;

for (let p of proyectosData) {
    if (!existingNames.has((p.nombre || '').toLowerCase())) {
        let mapped = {
            id: p.slug || p.id,
            nombre: p.nombre,
            tipo: 'Proyecto Residencial',
            estado: p.estado || 'Disponible',
            ciudad: p.ubicacion || 'República Dominicana',
            sector: 'Varias Zonas',
            precio: p.precio || 'Consultar',
            habitaciones: 'Consultar',
            banos: 'Consultar',
            parqueos: 'Consultar',
            metros: 'Consultar',
            descripcion: p.descripcion || '',
            imagenPrincipal: p.imagenPrincipal || '',
            galeria: p.galeria || [],
            amenidades: p.amenidades || []
        };
        inmueblesData.push(mapped);
        added++;
    }
}

const newDataContent = `const inmueblesData = ${JSON.stringify(inmueblesData, null, 2)};\n`;

fs.writeFileSync(dataFile, newDataContent);
fs.writeFileSync('/Users/admin/Desktop/REDEX_Premium_Optimizado/data-inmuebles.js', newDataContent);

console.log(`Merged ${added} legacy projects successfully!`);
