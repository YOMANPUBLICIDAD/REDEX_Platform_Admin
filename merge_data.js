const fs = require('fs');
const path = require('path');

const finalDir = '/Users/admin/Desktop/REDEX_Premium_Final';
const optDir = '/Users/admin/Desktop/REDEX_Premium_Optimizado';

// Read new properties
let dataInmueblesStr = fs.readFileSync(path.join(finalDir, 'data-inmuebles.js'), 'utf8');
let matchNew = dataInmueblesStr.match(/const inmueblesData\s*=\s*(\[[\s\S]*\]);?/);
let newArr = [];
eval('newArr = ' + matchNew[1]);

// Read old properties
let proyectosDataStr = fs.readFileSync(path.join(finalDir, 'proyectos-data.js'), 'utf8');
let matchOld = proyectosDataStr.match(/const proyectosData\s*=\s*(\[[\s\S]*\]);?/);
let oldArr = [];
eval('oldArr = ' + matchOld[1]);

// We want to combine oldArr into newArr.
// The new schema:
/*
{
  "id": 1,
  "nombre": "Apartamentos vista sol proyecto (nuevo) ",
  "tipo": "Apartamento", // Casa, Apartamento, Villa, Local, Solar Residencial, Lote, Proyecto Residencial
  "estado": "Disponible",
  "ciudad": "Santiago De Los Caballeros",
  "sector": "Varias Zonas",
  "precio": "Consultar",
  "metros": "Consultar",
  "habitaciones": "Consultar",
  "banos": "Consultar",
  "parqueos": "Consultar",
  "forma_pago": "Consultar",
  "financiamiento": "Consultar",
  "descripcion": "...",
  "imagenPrincipal": "...",
  "galeria": [...],
  "amenidades": [...],
  "whatsapp": "..."
}
*/

let startId = 1000;

oldArr.forEach(old => {
    let tipo = "Inmueble";
    let filterCat = (old.categoriaFiltro || '').toLowerCase();
    if (filterCat === 'lote') tipo = 'Lote';
    else if (filterCat === 'proyecto') tipo = 'Proyecto Residencial';
    else if (filterCat === 'solar') tipo = 'Solar Residencial';
    else {
        let nameLower = (old.nombre || '').toLowerCase();
        if (nameLower.includes('casa')) tipo = 'Casa';
        else if (nameLower.includes('apartamento')) tipo = 'Apartamento';
        else if (nameLower.includes('villa')) tipo = 'Villa';
        else if (nameLower.includes('residencial')) tipo = 'Proyecto Residencial';
        else if (nameLower.includes('lote') || nameLower.includes('solar')) tipo = 'Solar Residencial';
    }

    let item = {
        id: startId++,
        nombre: old.nombre || "Consultar",
        tipo: tipo,
        estado: old.estado || old.etiqueta || "Disponible",
        ciudad: old.ubicacion || "Consultar",
        sector: "Varias Zonas",
        precio: old.precio || "Consultar",
        metros: "Consultar",
        habitaciones: "Consultar",
        banos: "Consultar",
        parqueos: "Consultar",
        forma_pago: old.reserva || "Consultar",
        financiamiento: "Disponible con asesor",
        descripcion: old.descripcion || "Propiedad disponible en República Dominicana. Para más información, contacta a un asesor REDEX.",
        imagenPrincipal: old.imagenPrincipal,
        galeria: old.galeria || [old.imagenPrincipal],
        amenidades: old.amenidades || ["Información disponible con un asesor"],
        whatsapp: old.enlaceWhatsApp || "https://wa.me/18495180024"
    };

    // Try to extract some data from pills
    if (old.pills && Array.isArray(old.pills)) {
        old.pills.forEach(pill => {
            let pl = pill.toLowerCase();
            if (pl.includes('hab')) item.habitaciones = pill;
            if (pl.includes('baño') || pl.includes('bano')) item.banos = pill;
            if (pl.includes('parq') || pl.includes('estacionamiento')) item.parqueos = pill;
            if (pl.includes('m2') || pl.includes('m²')) item.metros = pill;
        });
    }

    newArr.push(item);
});

// Ensure ALL new schema fields exist on newArr items (the 136 ones)
newArr.forEach(item => {
    if (!item.forma_pago) item.forma_pago = "Consultar";
    if (!item.financiamiento) item.financiamiento = "Disponible con asesor";
});

const mergedDataStr = "const inmueblesData = " + JSON.stringify(newArr, null, 2) + ";";

fs.writeFileSync(path.join(finalDir, 'data-inmuebles.js'), mergedDataStr);
fs.writeFileSync(path.join(optDir, 'data-inmuebles.js'), mergedDataStr);

console.log("Merged data successfully. Total properties:", newArr.length);
