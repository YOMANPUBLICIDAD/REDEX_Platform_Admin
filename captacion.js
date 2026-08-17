import { supabase, LEADS_BUCKET, LEADS_TABLE, ADVISORS_TABLE } from './admin/js/supabase-config.js';

const form = document.getElementById('capture-form');
const canvas = document.getElementById('signature-pad');
const clearButton = document.getElementById('clear-signature');
const statusEl = document.getElementById('form-status');
const submitButton = document.getElementById('submit-btn');
const advisorNameEl = document.getElementById('advisor-name');
const advisorDocumentEl = document.getElementById('advisor-document');
const advisorNameInput = document.getElementById('advisor-name-input');
const advisorDocumentInput = document.getElementById('advisor-document-input');
const ATTRIBUTION_KEY = 'redex_advisor_attribution';

const context = {
  advisor: null,
  slug: advisorSlug(),
  attribution: storedAttribution(),
  drawing: false,
  signed: false
};

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function advisorSlug() {
  const params = new URLSearchParams(window.location.search);
  return slugify(params.get('asesor') || params.get('asesor_slug') || params.get('advisor') || params.get('ref') || params.get('a') || storedAttribution()?.asesor_slug);
}

function storedAttribution() {
  try {
    const stored = JSON.parse(localStorage.getItem(ATTRIBUTION_KEY) || 'null');
    if (!stored?.asesor_slug || !stored?.expires_at) return null;
    if (new Date(stored.expires_at).getTime() < Date.now()) {
      localStorage.removeItem(ATTRIBUTION_KEY);
      return null;
    }
    return stored;
  } catch (_) {
    return null;
  }
}

function advisorValue(advisor, keys) {
  const sources = [
    advisor,
    advisor?.datos,
    advisor?.datos?.solicitud_datos,
    advisor?.solicitud_datos
  ].filter(Boolean);
  for (const source of sources) {
    for (const key of keys) {
      const value = source?.[key];
      if (value !== undefined && value !== null && String(value).trim()) return String(value).trim();
    }
  }
  return '';
}

function advisorDocument(advisor) {
  return advisorValue(advisor, [
    'cedula',
    'cédula',
    'cedula_rnc',
    'cedula_identidad',
    'cédula_identidad',
    'documento',
    'documento_identidad',
    'numero_documento',
    'no_documento',
    'identificacion',
    'identificación',
    'rnc'
  ]) || 'Cédula pendiente';
}

function saveAttribution(advisor) {
  const current = storedAttribution();
  const expiresAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
  const attribution = {
    asesor_id: advisor?.id || current?.asesor_id || null,
    asesor_slug: advisor?.slug || context.slug,
    asesor_nombre: advisor?.nombre || current?.asesor_nombre || context.slug,
    asesor_telefono: advisor?.telefono || advisor?.whatsapp || current?.asesor_telefono || '',
    asesor_email: advisor?.email || current?.asesor_email || '',
    fuente: 'captacion_inmueble',
    first_url: current?.first_url || window.location.href,
    latest_url: window.location.href,
    started_at: current?.started_at || new Date().toISOString(),
    expires_at: expiresAt
  };
  try {
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch (_) {}
  context.attribution = attribution;
  return attribution;
}

function sessionId() {
  try {
    const key = 'redex_session_id';
    let value = localStorage.getItem(key);
    if (!value) {
      value = crypto.randomUUID();
      localStorage.setItem(key, value);
    }
    return value;
  } catch (_) {
    return crypto.randomUUID();
  }
}

function showStatus(message, type = '') {
  if (!statusEl) return;
  statusEl.textContent = message || '';
  statusEl.className = `status ${type}`.trim();
}

function setAdvisorUi(advisor) {
  const name = advisor?.nombre || context.attribution?.asesor_nombre || context.slug || 'REDEX Inmobiliaria';
  const documentValue = advisorDocument(advisor);
  if (advisorNameEl) advisorNameEl.textContent = name;
  if (advisorDocumentEl) advisorDocumentEl.textContent = documentValue;
  if (advisorNameInput) advisorNameInput.value = name;
  if (advisorDocumentInput) advisorDocumentInput.value = documentValue;
}

function resizeCanvas() {
  if (!canvas) return;
  const ratio = Math.max(window.devicePixelRatio || 1, 1);
  const rect = canvas.getBoundingClientRect();
  const data = canvas.toDataURL();
  canvas.width = Math.max(320, Math.floor(rect.width * ratio));
  canvas.height = Math.max(160, Math.floor(rect.height * ratio));
  const ctx = canvas.getContext('2d');
  ctx.scale(ratio, ratio);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, rect.width, rect.height);
  if (context.signed && data) {
    const image = new Image();
    image.onload = () => ctx.drawImage(image, 0, 0, rect.width, rect.height);
    image.src = data;
  }
}

function point(event) {
  const rect = canvas.getBoundingClientRect();
  const source = event.touches?.[0] || event.changedTouches?.[0] || event;
  return {
    x: source.clientX - rect.left,
    y: source.clientY - rect.top
  };
}

function startDraw(event) {
  event.preventDefault();
  context.drawing = true;
  const ctx = canvas.getContext('2d');
  const p = point(event);
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
}

function draw(event) {
  if (!context.drawing) return;
  event.preventDefault();
  const ctx = canvas.getContext('2d');
  const p = point(event);
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#101318';
  ctx.lineTo(p.x, p.y);
  ctx.stroke();
  context.signed = true;
}

function stopDraw() {
  context.drawing = false;
}

function clearSignature() {
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, rect.width, rect.height);
  context.signed = false;
}

function canvasBlob() {
  return new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.92));
}

async function uploadFile(file, folder, fieldName) {
  const ext = file.name.includes('.') ? file.name.split('.').pop().toLowerCase() : 'bin';
  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(LEADS_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined
  });
  if (error) throw error;
  return {
    campo: fieldName,
    nombre: file.name,
    tipo: file.type,
    tamano: file.size,
    bucket: LEADS_BUCKET,
    path
  };
}

async function uploadSignature(folder) {
  const blob = await canvasBlob();
  if (!blob) throw new Error('No se pudo procesar la firma.');
  const file = new File([blob], 'firma-captacion.png', { type: 'image/png' });
  return uploadFile(file, folder, 'firma_captacion');
}

async function loadAdvisor() {
  if (!context.slug) {
    setAdvisorUi(null);
    return;
  }
  const { data } = await supabase
    .from(ADVISORS_TABLE)
    .select('*')
    .or(`slug.eq.${context.slug},codigo_referido.eq.${context.slug}`)
    .eq('estado', 'activo')
    .limit(1)
    .maybeSingle();
  context.advisor = data || null;
  if (context.advisor || context.slug) saveAttribution(context.advisor);
  setAdvisorUi(context.advisor);
}

function collectData(formData) {
  const data = {};
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) continue;
    if (!String(value || '').trim()) continue;
    data[key] = value;
  }
  return data;
}

async function submitCapture(event) {
  event.preventDefault();
  if (!context.signed) {
    showStatus('La firma digital es obligatoria.', 'error');
    return;
  }
  const formData = new FormData(form);
  const propertyLabel = `${formData.get('tipo_inmueble') || 'inmueble'}-${formData.get('ciudad') || formData.get('propietario_nombre') || 'captacion'}`;
  const folder = `captacion/${slugify(propertyLabel) || 'inmueble'}-${Date.now()}`;
  submitButton.disabled = true;
  submitButton.textContent = 'Enviando...';
  showStatus('Guardando captación...');
  try {
    const uploaded = [];
    for (const file of formData.getAll('fotos_inmueble')) {
      if (file instanceof File && file.size > 0) uploaded.push(await uploadFile(file, folder, 'fotos_inmueble'));
    }
    for (const file of formData.getAll('documentos_soporte')) {
      if (file instanceof File && file.size > 0) uploaded.push(await uploadFile(file, folder, 'documentos_soporte'));
    }
    uploaded.push(await uploadSignature(folder));

    const data = collectData(formData);
    const attribution = context.attribution || storedAttribution();
    const advisorName = context.advisor?.nombre || attribution?.asesor_nombre || context.slug || null;
    const advisorDoc = advisorDocument(context.advisor);
    const payload = {
      tipo: 'captacion_inmueble',
      pagina: 'captacion.html',
      origen_url: window.location.href,
      nombre: String(formData.get('propietario_nombre') || '').trim(),
      email: String(formData.get('propietario_email') || '').trim(),
      telefono: String(formData.get('propietario_telefono') || '').trim(),
      interes: `Captación: ${formData.get('tipo_inmueble') || 'Inmueble'} en ${formData.get('ciudad') || 'ubicación pendiente'}`,
      mensaje: String(formData.get('observaciones') || formData.get('otros_detalles') || 'Formulario de captación recibido.').trim(),
      datos: {
        ...data,
        asesor_id: context.advisor?.id || attribution?.asesor_id || null,
        asesor_slug: context.advisor?.slug || attribution?.asesor_slug || context.slug || null,
        asesor_nombre: advisorName,
        asesor_documento: advisorDoc,
        formulario: 'captacion_inmueble',
        firma_digital: true
      },
      archivos: uploaded,
      estado: 'Nuevo',
      asesor_id: context.advisor?.id || attribution?.asesor_id || null,
      asesor_slug: context.advisor?.slug || attribution?.asesor_slug || context.slug || null,
      asesor_nombre: advisorName,
      atribucion_fuente: context.slug || attribution?.asesor_slug ? 'captacion_inmueble_asesor' : 'captacion_inmueble_directo',
      atribucion_activa_hasta: attribution?.expires_at || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
      primer_origen_url: attribution?.first_url || window.location.href,
      ultima_actividad_url: window.location.href,
      redex_session_id: sessionId()
    };
    const { error } = await supabase.from(LEADS_TABLE).insert(payload);
    if (error) throw error;
    form.reset();
    setAdvisorUi(context.advisor);
    clearSignature();
    showStatus('Captación enviada correctamente. REDEX recibió la información.', 'success');
  } catch (error) {
    showStatus(error.message || 'No se pudo enviar la captación.', 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Enviar captación';
  }
}

function bindSignature() {
  if (!canvas) return;
  resizeCanvas();
  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  window.addEventListener('mouseup', stopDraw);
  canvas.addEventListener('touchstart', startDraw, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', stopDraw);
  clearButton?.addEventListener('click', clearSignature);
  window.addEventListener('resize', resizeCanvas);
}

bindSignature();
loadAdvisor().catch(() => setAdvisorUi(null));
form?.addEventListener('submit', submitCapture);
