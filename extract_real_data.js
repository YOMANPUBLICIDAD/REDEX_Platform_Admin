const fs = require('fs');
const path = require('path');

const extractDir = '/Users/admin/Desktop/inmuebles Redex 1/extracted';
const file1 = '/Users/admin/Desktop/REDEX_Premium_Final/data-inmuebles.js';
const file2 = '/Users/admin/Desktop/REDEX_Premium_Optimizado/data-inmuebles.js';

let content = fs.readFileSync(file1, 'utf8');
let inmueblesData;
eval(content.replace('const inmueblesData =', 'inmueblesData ='));

function norm(s) {
    return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

let textFilesByFolder = {};
function walkDir(dir) {
    let files = fs.readdirSync(dir);
    for (let f of files) {
        let fullPath = path.join(dir, f);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath);
        } else {
            if (f.toLowerCase().endsWith('.txt') || f.toLowerCase().endsWith('.docx') || f.toLowerCase().endsWith('.pdf')) {
                let folderName = norm(path.basename(dir));
                if (!textFilesByFolder[folderName]) textFilesByFolder[folderName] = [];
                // Only read txt files for now, as docx/pdf are binary
                if (f.toLowerCase().endsWith('.txt')) {
                    textFilesByFolder[folderName].push(fullPath);
                }
            }
        }
    }
}
walkDir(extractDir);

let reales = 0;

for (let p of inmueblesData) {
    let name = norm(p.nombre);
    if (textFilesByFolder[name] && textFilesByFolder[name].length > 0) {
        let combinedText = '';
        for (let t of textFilesByFolder[name]) {
            combinedText += fs.readFileSync(t, 'utf8') + '\n';
        }
        
        let text = combinedText;
        
        let priceMatch = text.match(/(?:precio|desde)[\s:]*([A-Z\$]{1,4}\s*[\d,\.]+)/i);
        if (priceMatch) p.precio = priceMatch[1].trim();
        
        let metrosMatch = text.match(/(?:metraje|metros|área|area|construcción)[\s:]*([\d,\.]+\s*(?:mts|m2|m²|metros))/i);
        if (metrosMatch) p.metros = metrosMatch[1].trim();
        
        let habsMatch = text.match(/(?:habitaciones|habs|hab)[\s:]*(\d+)/i);
        if (habsMatch) p.habitaciones = habsMatch[1].trim() + " habs.";
        
        let banosMatch = text.match(/(?:baños|banos)[\s:]*([\d\.]+)/i);
        if (banosMatch) p.banos = banosMatch[1].trim() + " baños";
        
        let parqMatch = text.match(/(?:parqueos|estacionamientos|garaje)[\s:]*(\d+)/i);
        if (parqMatch) p.parqueos = parqMatch[1].trim();
        
        let pagoMatch = text.match(/(?:reserva|separación|inicial)[\scon:]*([A-Z\$]{1,4}\s*[\d,\.]+)/i);
        if (pagoMatch) p.forma_pago = "Reserva con " + pagoMatch[1].trim();
        
        let amenMatch = text.match(/amenidades:?([\s\S]*?)(?:\n\n|$)/i);
        if (amenMatch) {
            let lines = amenMatch[1].split('\n');
            let amens = [];
            for (let l of lines) {
                let cl = l.replace(/^[-•*]\s*/, '').trim();
                if (cl && cl.length > 3 && cl.length < 50) amens.push(cl);
            }
            if (amens.length > 0) p.amenidades = amens;
        }
        
        let descClean = text.replace(/\n+/g, ' ').trim();
        if (descClean.length > 20) {
            p.descripcion = descClean.substring(0, 350) + (descClean.length > 350 ? '...' : '');
        }
        
        reales++;
    }
}

const newDataContent = `const inmueblesData = ${JSON.stringify(inmueblesData, null, 2)};\n`;
fs.writeFileSync(file1, newDataContent);
fs.writeFileSync(file2, newDataContent);

console.log(`Extracted real texts for ${reales} properties!`);
