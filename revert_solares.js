const fs = require('fs');

let text = fs.readFileSync('/Users/admin/Desktop/REDEX_Premium_Final/data-inmuebles.js', 'utf8');
text = text.replace('const inmueblesData =', 'var inmueblesData =');
eval(text);

const mockData = [
  { 
    id: 'vista-del-atlantico', 
    nombre: 'Vista del Atlántico Residence', 
    precio: 'USD $185,000', 
    tipo: 'Proyecto Residencial',
    ciudad: 'Puerto Plata',
    sector: 'Costa Dorada',
    estado: 'Disponible',
    imagenPrincipal: 'project_atlantico.png',
    descripcion: 'Residencias de lujo frente al Atlántico con piscina infinita, diseño arquitectónico premium y retorno de inversión garantizado.'
  },
  { 
    id: 'palmaretto-golden-village', 
    nombre: 'Palmaretto Golden Village', 
    precio: 'RD$15,000 por m²', 
    tipo: 'Proyecto Residencial',
    ciudad: 'La Vega',
    sector: 'Centro',
    estado: 'Disponible',
    imagenPrincipal: 'project_palmaretto.png',
    descripcion: 'Palmaretto Golden Village es un proyecto residencial ubicado en La Vega, diseñado para familias e inversores exigentes.'
  },
  { 
    id: 'residencial-don-martin', 
    nombre: 'Residencial Don Martín', 
    precio: 'USD $95,000', 
    tipo: 'Proyecto Residencial',
    ciudad: 'Santiago',
    sector: 'Los Jardines',
    estado: 'Disponible',
    imagenPrincipal: 'project_don_martin.png',
    descripcion: 'Townhouses modernos en el corazón de Santiago, con acabados de primera, estacionamiento techado y plaza comercial integrada.'
  },
  { 
    id: 'residencial-el-molino', 
    nombre: 'Residencial El Molino', 
    precio: 'USD $78,000', 
    tipo: 'Proyecto Residencial',
    ciudad: 'Moca',
    sector: 'Centro',
    estado: 'Disponible',
    imagenPrincipal: 'project_molino.png',
    descripcion: 'Villas familiares con jardines privativos, piscina comunitaria y acceso controlado. Entrega inmediata.'
  },
  { 
    id: 'lotificacion-iris', 
    nombre: 'Lotificación Iris', 
    precio: 'USD $22,000', 
    tipo: 'Proyecto Residencial',
    ciudad: 'Puerto Plata',
    sector: 'Playa Dorada',
    estado: 'Disponible',
    imagenPrincipal: 'project_iris.png',
    descripcion: 'Lotes residenciales con vista al mar Atlántico, infraestructura completa y posibilidad de construcción personalizada.'
  },
  { 
    id: 'residencial-santa-fe', 
    nombre: 'Residencial Santa Fe', 
    precio: 'USD $85,000', 
    tipo: 'Proyecto Residencial',
    ciudad: 'La Vega',
    sector: 'Jeremías',
    estado: 'Disponible',
    imagenPrincipal: 'project_santa_fe.png',
    descripcion: 'Urbanización con fuente central, áreas verdes diseñadas y casas tipo colón con detalles arquitectónicos de primera.'
  },
  { 
    id: 'residencial-valle-verde', 
    nombre: 'Residencial Valle Verde', 
    precio: 'USD $72,000', 
    tipo: 'Proyecto Residencial',
    ciudad: 'Jarabacoa',
    sector: 'Montaña',
    estado: 'Disponible',
    imagenPrincipal: 'project_valle_verde.png',
    descripcion: 'Proyecto eco-sostenible con vistas panorámicas al valle, materiales de bajo impacto ambiental y un entorno natural incomparable.'
  },
  { 
    id: 'residencial-concepcion', 
    nombre: 'Residencial Concepción', 
    precio: 'USD $68,000', 
    tipo: 'Proyecto Residencial',
    ciudad: 'La Vega',
    sector: 'Centro',
    estado: 'Disponible',
    imagenPrincipal: 'project_concepcion.png',
    descripcion: 'Apartamentos modernos con piscina y gimnasio comunitario, en la zona de mayor crecimiento de La Vega.'
  }
];

// Add detalles to mocks to match the new parser logic
mockData.forEach(m => {
    m.detalles = {
        desc_corta: m.descripcion,
        distribucion: [],
        caracteristicas: ['Seguridad 24/7', 'Áreas Verdes', 'Control de Acceso', 'Calles Asfaltadas'],
        amenidades: ['Agua Potable', 'Energía Eléctrica', 'Iluminación', 'Tranquilidad'],
        terminaciones: [],
        observaciones: []
    };
});

// Remove if already exists (shouldn't, but just in case)
const mockIds = mockData.map(m => m.id);
inmueblesData = inmueblesData.filter(p => !mockIds.includes(p.id));

// Add the mocks
inmueblesData = [...mockData, ...inmueblesData];

// Revert the real Solares back to 'Solar'
const realSolaresResIds = [4, 13, 15, 70, 81, 128];
inmueblesData.forEach(p => {
    if(realSolaresResIds.includes(parseInt(p.id))) {
        // We originally mapped them as Solar
        p.tipo = 'Solar';
        // Keep the updated formas de pago because the user liked that, 
        // they just didn't want the categorizations swapped.
    }
});

fs.writeFileSync('/Users/admin/Desktop/REDEX_Premium_Final/data-inmuebles.js', 'const inmueblesData = ' + JSON.stringify(inmueblesData, null, 2) + ';');
fs.writeFileSync('/Users/admin/Desktop/REDEX_Premium_Optimizado/data-inmuebles.js', 'const inmueblesData = ' + JSON.stringify(inmueblesData, null, 2) + ';');
console.log('Reverted logic for Solares Residenciales!');
