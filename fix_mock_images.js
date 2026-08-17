const fs = require('fs');
const path = require('path');

let text = fs.readFileSync('/Users/admin/Desktop/REDEX_Premium_Final/data-inmuebles.js', 'utf8');
text = text.replace('const inmueblesData =', 'var inmueblesData =');
eval(text);

const mockFolders = {
    'vista-del-atlantico': 'vista-del-atlantico',
    'palmaretto-golden-village': 'palmaretto',
    'residencial-don-martin': 'don-martin',
    'residencial-el-molino': 'el-molino',
    'lotificacion-iris': 'iris',
    'residencial-santa-fe': 'santa-fe',
    'residencial-valle-verde': 'valle-verde',
    'residencial-concepcion': 'concepcion'
};

inmueblesData.forEach(p => {
    if(mockFolders[p.id]) {
        const folderName = mockFolders[p.id];
        const dirPath = path.join('/Users/admin/Desktop/REDEX_Premium_Final/images/proyectos', folderName);
        
        if(fs.existsSync(dirPath)) {
            const files = fs.readdirSync(dirPath);
            let mainImg = files.find(f => f.startsWith('main'));
            if(!mainImg && files.length > 0) mainImg = files[0]; // fallback
            
            if(mainImg) {
                p.imagenPrincipal = `images/proyectos/${folderName}/${mainImg}`;
            }
            
            p.galeria = files.map(f => `images/proyectos/${folderName}/${f}`);
        }
    }
});

fs.writeFileSync('/Users/admin/Desktop/REDEX_Premium_Final/data-inmuebles.js', 'const inmueblesData = ' + JSON.stringify(inmueblesData, null, 2) + ';');
fs.writeFileSync('/Users/admin/Desktop/REDEX_Premium_Optimizado/data-inmuebles.js', 'const inmueblesData = ' + JSON.stringify(inmueblesData, null, 2) + ';');
console.log('Images fixed for Solares Residenciales!');
