#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'proyectos-data.js');
const ENV_FILE = path.join(ROOT, '.env.local');
const REPORT_FILE = path.join(ROOT, 'admin', 'reports', 'latest-projects-migration-report.json');
const TABLE = 'proyectos';
const BUCKET = 'proyectos';

function readEnv() {
  const env = {};
  if (!fs.existsSync(ENV_FILE)) return env;
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match) env[match[1]] = match[2];
  }
  return env;
}

function slugify(value) {
  return String(value || 'proyecto')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'proyecto';
}

function asArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function loadProjects() {
  const code = fs.readFileSync(DATA_FILE, 'utf8');
  const context = {};
  vm.createContext(context);
  vm.runInContext(code, context, { filename: DATA_FILE });
  const projects = context.proyectosData || [];
  return projects.filter(project => {
    const type = String(project.tipo || '').toLowerCase();
    return Number(project.id) <= 8 || type === 'lujo' || type === 'lotificacion';
  });
}

function resolveAsset(filePath) {
  if (!filePath) return '';
  const candidates = [
    path.join(ROOT, filePath),
    path.join(ROOT, 'assets', filePath),
    path.join(ROOT, filePath.replace(/^images\//, 'assets/'))
  ];
  return candidates.find(candidate => fs.existsSync(candidate) && fs.statSync(candidate).isFile()) || '';
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (['.jpg', '.jpeg'].includes(ext)) return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.mp4') return 'video/mp4';
  if (ext === '.mov') return 'video/quicktime';
  return 'application/octet-stream';
}

function hashFile(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function publicStorageUrl(baseUrl, bucket, objectPath) {
  return `${baseUrl}/storage/v1/object/public/${bucket}/${objectPath.split('/').map(encodeURIComponent).join('/')}`;
}

async function uploadAsset(client, sourcePath, projectSlug, folder, uploadedByHash, report) {
  const localPath = resolveAsset(sourcePath);
  if (!localPath) {
    report.missing_files.push(sourcePath);
    return sourcePath;
  }

  const hash = hashFile(localPath);
  if (uploadedByHash.has(hash)) {
    report.deduplicated_files += 1;
    return uploadedByHash.get(hash);
  }

  const ext = path.extname(localPath).toLowerCase() || '.bin';
  const baseName = path.basename(localPath, ext).replace(/[^a-zA-Z0-9._-]+/g, '-').slice(0, 80);
  const objectPath = `${projectSlug}/${folder}/${baseName}-${hash.slice(0, 12)}${ext}`;

  const response = await fetch(`${client.url}/storage/v1/object/${BUCKET}/${objectPath}`, {
    method: 'POST',
    headers: {
      apikey: client.key,
      Authorization: `Bearer ${client.key}`,
      'Content-Type': contentType(localPath),
      'Cache-Control': '3600',
      'x-upsert': 'true'
    },
    body: fs.readFileSync(localPath)
  });

  if (!response.ok) {
    const message = await response.text();
    report.upload_errors.push({ sourcePath, message });
    return sourcePath;
  }

  const publicUrl = publicStorageUrl(client.url, BUCKET, objectPath);
  uploadedByHash.set(hash, publicUrl);
  report.uploaded_files += 1;
  return publicUrl;
}

function splitLocation(ubicacion) {
  const parts = String(ubicacion || '').split(/[·,]/).map(item => item.trim()).filter(Boolean);
  return {
    sector: parts[0] || '',
    ciudad: parts[1] || parts[0] || ''
  };
}

async function main() {
  const env = readEnv();
  const url = env.SUPABASE_URL;
  const key = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local.');

  const client = { url, key };

  const sourceProjects = loadProjects();
  const report = {
    source_file: 'proyectos-data.js',
    projects_found: sourceProjects.length,
    projects_migrated: 0,
    uploaded_files: 0,
    deduplicated_files: 0,
    missing_files: [],
    upload_errors: [],
    row_errors: []
  };

  const uploadedByHash = new Map();

  const tableCheck = await fetch(`${url}/rest/v1/${TABLE}?select=id&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`
    }
  });

  if (!tableCheck.ok) {
    report.row_errors.push({ legacy_id: 'preflight', message: await tableCheck.text() });
    fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
    fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = 1;
    return;
  }

  for (const project of sourceProjects) {
    const slug = slugify(project.slug || project.nombre);
    const location = splitLocation(project.ubicacion);
    const cover = await uploadAsset(client, project.imagenPrincipal, slug, 'portada', uploadedByHash, report);
    const gallery = [];

    for (const item of asArray(project.galeria)) {
      gallery.push(await uploadAsset(client, item, slug, 'galeria', uploadedByHash, report));
    }

    const payload = {
      legacy_id: `proyecto-${project.id}`,
      slug,
      nombre: project.nombre || 'Proyecto REDEX',
      ubicacion: project.ubicacion || 'Disponible con asesor',
      ciudad: location.ciudad,
      sector: location.sector,
      tipo: project.tipo || 'Proyecto',
      categoria_filtro: project.categoriaFiltro || '',
      cantidad_disponible: project.cantidadDisponible || 'Por consultar',
      precio_texto: project.precio || 'Consultar',
      reserva: project.reserva || 'Consultar',
      descripcion: project.descripcion || 'Información pendiente de actualización',
      imagen_portada: cover,
      etiqueta: project.etiqueta || '',
      color_etiqueta: project.colorEtiqueta || '',
      pills: asArray(project.pills),
      amenidades: asArray(project.amenidades),
      caracteristicas: asArray(project.caracteristicas),
      galeria: gallery,
      videos: asArray(project.videos),
      estado: project.estado || 'Disponible',
      enlace_whatsapp: project.enlaceWhatsApp || '',
      seo_titulo: project.nombre || '',
      seo_descripcion: project.descripcion || '',
      seo_keywords: [project.nombre, project.tipo, location.ciudad].filter(Boolean),
      visible: true,
      destacado: Number(project.id) <= 8
    };

    const existingResponse = await fetch(`${url}/rest/v1/${TABLE}?select=id&legacy_id=eq.${encodeURIComponent(payload.legacy_id)}&limit=1`, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`
      }
    });

    if (!existingResponse.ok) {
      report.row_errors.push({ legacy_id: payload.legacy_id, message: await existingResponse.text() });
      continue;
    }

    const existing = await existingResponse.json();
    const existingId = existing[0]?.id;
    const rowUrl = existingId
      ? `${url}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(existingId)}`
      : `${url}/rest/v1/${TABLE}`;
    const response = await fetch(rowUrl, {
      method: existingId ? 'PATCH' : 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      report.row_errors.push({ legacy_id: payload.legacy_id, message: await response.text() });
      continue;
    }

    report.projects_migrated += 1;
  }

  fs.mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
  fs.writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
