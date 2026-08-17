const fs = require('fs');

let text = fs.readFileSync('/Users/admin/Desktop/REDEX_Premium_Final/data-inmuebles.js', 'utf8');
text = text.replace('const inmueblesData =', 'var inmueblesData =');
eval(text);

const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{2B55}\u{2194}\u{2195}\u{25AA}\u{25AB}\u{25FE}\u{25FD}\u{25FC}\u{25FB}\u{25B6}\u{25C0}\u{FE0F}]/gu;

function parseSection(lines, startIdx, allHeaders) {
    let result = [];
    for(let i = startIdx; i < lines.length; i++) {
        const line = lines[i].trim();
        if(!line) continue;
        
        let isHeader = false;
        for(let h of allHeaders) {
            if(line.toUpperCase().startsWith(h)) {
                isHeader = true;
                break;
            }
        }
        if(isHeader && i !== startIdx) break; // Reached next section
        
        // Remove header prefix if it's the first line
        let cleanLine = line;
        for(let h of allHeaders) {
            if(cleanLine.toUpperCase().startsWith(h)) {
                cleanLine = cleanLine.substring(h.length).replace(/^[:\s\-]+/, '').trim();
                break;
            }
        }
        
        if(cleanLine) {
            // Remove leading bullets
            cleanLine = cleanLine.replace(/^[•\-\*\✓\>]\s*/, '').trim();
            if(cleanLine) result.push(cleanLine);
        }
    }
    return result;
}

inmueblesData.forEach(p => {
    let desc = p.descripcion || '';
    desc = desc.replace(emojiRegex, '').trim();
    
    const lines = desc.split(/[\n\r]+/).map(l => l.trim()).filter(l => l);
    
    let detalles = {
        desc_corta: "",
        distribucion: [],
        caracteristicas: [],
        amenidades: [],
        terminaciones: [],
        observaciones: []
    };
    
    // Some properties might just be one block of text, so we dump everything into desc_corta
    // If they have keywords, we parse them.
    const headers = {
        'DISTRIBUCI': 'distribucion',
        'CARACTERÍSTICAS': 'caracteristicas',
        'CARACTERISTICAS': 'caracteristicas',
        'AMENIDAD': 'amenidades',
        'TERMINACI': 'terminaciones',
        'OBSERVACI': 'observaciones'
    };
    
    let allHeaderKeys = Object.keys(headers);
    
    let currentSection = 'desc_corta';
    
    for(let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        let foundHeader = null;
        for(let h of allHeaderKeys) {
            if(line.toUpperCase().includes(h)) {
                foundHeader = headers[h];
                break;
            }
        }
        
        if(foundHeader) {
            currentSection = foundHeader;
            // Also clean the line if the header is on the same line as the first item
            let prefixIndex = -1;
            for(let h of allHeaderKeys) {
                let idx = line.toUpperCase().indexOf(h);
                if(idx !== -1) {
                    prefixIndex = idx + h.length;
                    break;
                }
            }
            if(prefixIndex !== -1) {
                let remainder = line.substring(prefixIndex).replace(/^[:\s\-]+/, '').trim();
                remainder = remainder.replace(/^[•\-\*\✓\>]\s*/, '').trim();
                if(remainder) {
                    if(Array.isArray(detalles[currentSection])) {
                        detalles[currentSection].push(remainder);
                    } else {
                        detalles[currentSection] += (detalles[currentSection] ? ' ' : '') + remainder;
                    }
                }
            }
            continue;
        }
        
        let cleanLine = line.replace(/^[•\-\*\✓\>\.]\s*/, '').trim();
        if(!cleanLine) continue;
        
        if(currentSection === 'desc_corta') {
            detalles.desc_corta += (detalles.desc_corta ? ' ' : '') + cleanLine;
        } else if (Array.isArray(detalles[currentSection])) {
            detalles[currentSection].push(cleanLine);
        } else {
            detalles[currentSection] += (detalles[currentSection] ? ' ' : '') + cleanLine;
        }
    }
    
    // Fallback: If everything ended up in desc_corta and we have p.amenidades, use them
    if(detalles.caracteristicas.length === 0 && p.amenidades && p.amenidades.length > 0 && p.amenidades[0] !== 'Información disponible con un asesor') {
        p.amenidades.forEach(am => {
            let cleanAm = am.replace(emojiRegex, '').replace(/^[•\-\*\✓\>\.]\s*/, '').trim();
            if(cleanAm) detalles.caracteristicas.push(cleanAm);
        });
    }
    
    p.detalles = detalles;
});

fs.writeFileSync('/Users/admin/Desktop/REDEX_Premium_Final/data-inmuebles.js', 'const inmueblesData = ' + JSON.stringify(inmueblesData, null, 2) + ';');
fs.writeFileSync('/Users/admin/Desktop/REDEX_Premium_Optimizado/data-inmuebles.js', 'const inmueblesData = ' + JSON.stringify(inmueblesData, null, 2) + ';');
console.log('Descriptions parsed into structured format!');
