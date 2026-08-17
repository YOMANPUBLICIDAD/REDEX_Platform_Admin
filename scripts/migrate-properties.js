const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const INVENTORY_FILE = path.join(ROOT, 'admin', 'backups', 'latest-normalized-properties.json');
const REPORT_DIR = path.join(ROOT, 'admin', 'reports');
const BUCKET = process.env.SUPABASE_BUCKET || 'propiedades';
const TABLE = process.env.SUPABASE_TABLE || 'propiedades';
const APPLY = process.argv.includes('--apply');
const UPLOAD_TIMEOUT_MS = Number(process.env.UPLOAD_TIMEOUT_MS || 180000);
const UPSERT_BATCH_SIZE = Number(process.env.UPSERT_BATCH_SIZE || 25);
const SKIP_STORAGE_UPLOAD = process.env.SKIP_STORAGE_UPLOAD === '1';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const uploadedByHash = new Map();
let skippedExistingObjects = 0;

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function slugify(value) {
  return String(value || 'propiedad')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'propiedad';
}

function normalizePath(file) {
  return String(file || '').replace(/^\.?\//, '').split(path.sep).join('/');
}

function localPath(relativePath) {
  return path.join(ROOT, normalizePath(relativePath));
}

function contentType(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.png') return 'image/png';
  if (ext === '.webp') return 'image/webp';
  if (ext === '.gif') return 'image/gif';
  if (ext === '.heic') return 'image/heic';
  if (ext === '.mp4') return 'video/mp4';
  if (ext === '.mov') return 'video/quicktime';
  if (ext === '.pdf') return 'application/pdf';
  return 'application/octet-stream';
}

function sha1(file) {
  const hash = crypto.createHash('sha1');
  hash.update(fs.readFileSync(file));
  return hash.digest('hex');
}

function publicUrl(objectPath) {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${objectPath}`;
}

function requireEnv() {
  const missing = [];
  if (!SUPABASE_URL) missing.push('SUPABASE_URL');
  if (!SUPABASE_KEY) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (missing.length) {
    throw new Error(`Faltan variables de entorno: ${missing.join(', ')}`);
  }
}

async function supabaseFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function uploadObject(objectPath, file) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);

  try {
    const bytes = fs.readFileSync(file);
    const response = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${objectPath}`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': contentType(file),
        'x-upsert': 'false'
      },
      body: bytes
    });

    if (!response.ok) {
      const text = await response.text();
      const alreadyExists = response.status === 409 || /already exists|duplicate|exists/i.test(text);
      if (!alreadyExists) throw new Error(`${response.status} ${response.statusText}: ${text}`);
      skippedExistingObjects += 1;
    }
  } finally {
    clearTimeout(timeout);
  }
}

async function uploadFile(relativePath, propertySlug, index) {
  if (!relativePath) return '';

  const normalized = normalizePath(relativePath);
  const file = localPath(normalized);
  if (!fs.existsSync(file)) return '';

  const hash = sha1(file);
  if (uploadedByHash.has(hash)) return uploadedByHash.get(hash);

  const ext = path.extname(file).toLowerCase() || '.bin';
  const objectPath = `${propertySlug}/${String(index).padStart(3, '0')}-${hash.slice(0, 12)}${ext}`;

  if (APPLY && !SKIP_STORAGE_UPLOAD) {
    await uploadObject(objectPath, file);
  }

  const url = APPLY ? publicUrl(objectPath) : `DRY_RUN://${BUCKET}/${objectPath}`;
  uploadedByHash.set(hash, url);
  return url;
}

async function mapMedia(property) {
  const slug = property.slug || slugify(`${property.legacy_id}-${property.nombre}`);
  let index = 1;

  const portada = await uploadFile(property.imagen_portada, slug, index++);
  const galeria = [];
  for (const item of property.galeria || []) {
    const url = await uploadFile(item, slug, index++);
    if (url && !galeria.includes(url)) galeria.push(url);
  }

  const videos = [];
  for (const item of property.videos || []) {
    const url = await uploadFile(item, slug, index++);
    if (url && !videos.includes(url)) videos.push(url);
  }

  const documentos = [];
  for (const item of property.documentos || []) {
    const url = await uploadFile(item, slug, index++);
    if (url && !documentos.includes(url)) documentos.push(url);
  }

  return {
    ...property,
    imagen_portada: portada || galeria[0] || '',
    galeria,
    videos,
    documentos
  };
}

function toRow(property) {
  const numericValue = value => {
    const cleaned = String(value || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
    return cleaned ? Number(cleaned[0]) : null;
  };
  const integerValue = value => {
    const number = numericValue(value);
    return number === null ? null : Math.round(number);
  };

  const clean = value => {
    if (typeof value === 'string') return value
      .replace(/\u0000/g, '')
      .replace(/[\u0001-\u0008\u000b\u000c\u000e-\u001f]/g, ' ')
      .replace(/[\ud800-\udfff]/g, '')
      .trim();
    if (Array.isArray(value)) return value.map(clean).filter(value => value !== '');
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clean(item)]));
    }
    return value;
  };

  return clean({
    legacy_id: String(property.legacy_id),
    source: property.source,
    source_index: String(property.source_index ?? ''),
    slug: property.slug,
    nombre: property.nombre,
    precio: numericValue(property.precio),
    moneda: property.moneda,
    ciudad: property.ciudad,
    sector: property.sector,
    tipo: property.tipo,
    estado: property.estado,
    metraje: numericValue(property.metraje),
    habitaciones: integerValue(property.habitaciones),
    banos: numericValue(property.banos),
    parqueos: integerValue(property.parqueos),
    descripcion: property.descripcion,
    descripcion_corta: property.descripcion_corta,
    caracteristicas: property.caracteristicas || [],
    amenidades: property.amenidades || [],
    observaciones: property.observaciones || [],
    forma_pago: property.forma_pago,
    imagen_portada: property.imagen_portada,
    galeria: property.galeria || [],
    videos: property.videos || [],
    documentos: property.documentos || [],
    whatsapp: property.whatsapp,
    mapa_url: property.mapa_url,
    latitud: property.latitud,
    longitud: property.longitud,
    asesor_id: property.asesor_id || null,
    asesor_nombre: property.asesor_nombre,
    asesor_telefono: property.asesor_telefono,
    asesor_email: property.asesor_email,
    seo_titulo: property.seo_titulo,
    seo_descripcion: property.seo_descripcion,
    seo_keywords: property.seo_keywords || [],
    visible: property.visible !== false,
    destacado: property.destacado === true
  });
}

async function upsertRows(rows) {
  if (!APPLY) return [];
  const inserted = [];

  for (let index = 0; index < rows.length; index += UPSERT_BATCH_SIZE) {
    const batch = rows.slice(index, index + UPSERT_BATCH_SIZE);
    if (APPLY) console.error(`Upsert ${index + 1}-${index + batch.length}/${rows.length}`);
    const legacyIds = batch.map(row => row.legacy_id).filter(Boolean);
    const existing = legacyIds.length
      ? await supabaseFetch(`${SUPABASE_URL}/rest/v1/${TABLE}?select=id,legacy_id&legacy_id=in.(${legacyIds.map(encodeURIComponent).join(',')})`)
      : [];
    const existingByLegacyId = new Map((existing || []).map(row => [String(row.legacy_id), row.id]));
    const toInsert = [];

    for (const row of batch) {
      const existingId = existingByLegacyId.get(String(row.legacy_id));
      if (!existingId) {
        toInsert.push(row);
        continue;
      }

      const result = await supabaseFetch(`${SUPABASE_URL}/rest/v1/${TABLE}?id=eq.${encodeURIComponent(existingId)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Prefer: 'return=representation'
        },
        body: JSON.stringify(row)
      });
      inserted.push(...(result || []));
    }

    if (!toInsert.length) continue;

    const result = await supabaseFetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Prefer: 'return=representation'
      },
      body: JSON.stringify(toInsert)
    });
    inserted.push(...(result || []));
  }

  return inserted;
}

async function main() {
  ensureDir(REPORT_DIR);

  if (!fs.existsSync(INVENTORY_FILE)) {
    throw new Error('No existe admin/backups/latest-normalized-properties.json. Ejecuta primero: node scripts/audit-properties.js');
  }

  if (APPLY) requireEnv();

  const properties = JSON.parse(fs.readFileSync(INVENTORY_FILE, 'utf8'));
  const rows = [];
  const errors = [];

  for (const [propertyIndex, property] of properties.entries()) {
    try {
      if (APPLY) {
        console.error(`[${propertyIndex + 1}/${properties.length}] ${property.nombre}`);
      }
      const withMedia = await mapMedia(property);
      rows.push(toRow(withMedia));
    } catch (error) {
      errors.push({
        legacy_id: property.legacy_id,
        nombre: property.nombre,
        error: error.message
      });
    }
  }

  let inserted = [];
  if (APPLY && rows.length) {
    inserted = await upsertRows(rows);
  }

  const mediaUrls = new Set();
  for (const row of rows) {
    if (row.imagen_portada) mediaUrls.add(row.imagen_portada);
    for (const item of row.galeria || []) mediaUrls.add(item);
    for (const item of row.videos || []) mediaUrls.add(item);
    for (const item of row.documentos || []) mediaUrls.add(item);
  }

  const report = {
    generated_at: new Date().toISOString(),
    mode: APPLY ? 'apply' : 'dry-run',
    table: TABLE,
    bucket: BUCKET,
    properties_in_inventory: properties.length,
    properties_prepared: rows.length,
    properties_migrated: APPLY ? inserted.length : 0,
    unique_files_prepared_or_uploaded: uploadedByHash.size,
    skipped_existing_storage_objects: skippedExistingObjects,
    storage_upload_skipped: SKIP_STORAGE_UPLOAD,
    media_urls_generated: mediaUrls.size,
    errors
  };

  const outFile = path.join(REPORT_DIR, APPLY ? 'latest-migration-report.json' : 'latest-migration-dry-run-report.json');
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
