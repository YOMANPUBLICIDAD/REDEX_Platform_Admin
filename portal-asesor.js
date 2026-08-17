import { supabase } from './admin/js/supabase-config.js';

const PUBLIC_BASE = 'https://redexinmobiliaria.com';
const state = {
  session: null,
  advisor: null,
  properties: [],
  projects: [],
  leads: [],
  sales: [],
  saleReports: [],
  ranking: [],
  filteredLeads: [],
  selectedLeadId: null,
  leadFilters: {
    query: '',
    estado: 'todos',
    fecha: 'todos'
  },
  catalogSearch: '',
  catalogType: 'todos',
  catalogCity: 'todos',
  photoCrop: {
    file: null,
    croppedFile: null,
    objectUrl: '',
    image: null,
    scale: 1,
    minScale: 1,
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    dragging: false
  }
};

const els = {
  loginShell: document.getElementById('login-shell'),
  loginForm: document.getElementById('advisor-login-form'),
  loginStatus: document.getElementById('login-status'),
  sidebar: document.getElementById('sidebar'),
  portalShell: document.getElementById('portal-shell'),
  mobileMenuBtn: document.getElementById('mobile-menu-btn'),
  logoutBtn: document.getElementById('logout-btn'),
  pageTitle: document.getElementById('page-title'),
  copyMainLink: document.getElementById('copy-main-link'),
  copyKycLink: document.getElementById('copy-kyc-link'),
  copyCaptureLink: document.getElementById('copy-capture-link'),
  dashboardCopyKyc: document.getElementById('dashboard-copy-kyc'),
  dashboardCopyCapture: document.getElementById('dashboard-copy-capture'),
  dashboardCopyMain: document.getElementById('dashboard-copy-main'),
  dashboardWhatsappLink: document.getElementById('dashboard-whatsapp-link'),
  avatar: document.getElementById('u-avatar'),
  userName: document.getElementById('u-name'),
  userRole: document.getElementById('u-role'),
  topbarAvatar: document.getElementById('topbar-avatar'),
  topbarName: document.getElementById('topbar-name'),
  topbarRole: document.getElementById('topbar-role'),
  statLeads: document.getElementById('stat-leads'),
  statSales: document.getElementById('stat-sales'),
  statCommission: document.getElementById('stat-commission'),
  commissionMonth: document.getElementById('commission-month'),
  commissionPending: document.getElementById('commission-pending'),
  commissionPaid: document.getElementById('commission-paid'),
  commissionReview: document.getElementById('commission-review'),
  commissionPartial: document.getElementById('commission-partial'),
  commissionTotal: document.getElementById('commission-total'),
  commissionsWrap: document.getElementById('commissions-wrap'),
  rankingStarPhoto: document.getElementById('ranking-star-photo'),
  rankingStarName: document.getElementById('ranking-star-name'),
  rankingStarSummary: document.getElementById('ranking-star-summary'),
  rankingMyPosition: document.getElementById('ranking-my-position'),
  rankingMySales: document.getElementById('ranking-my-sales'),
  rankingMyCommission: document.getElementById('ranking-my-commission'),
  rankingList: document.getElementById('ranking-list'),
  recentActivity: document.getElementById('recent-activity'),
  profilePhoto: document.getElementById('profile-photo'),
  profileName: document.getElementById('profile-name'),
  profileBio: document.getElementById('profile-bio'),
  profileStatus: document.getElementById('profile-status'),
  profilePercent: document.getElementById('profile-percent'),
  profilePhone: document.getElementById('profile-phone'),
  profileWhatsapp: document.getElementById('profile-whatsapp'),
  profileEmail: document.getElementById('profile-email'),
  profileSlug: document.getElementById('profile-slug'),
  profileInfoForm: document.getElementById('profile-info-form'),
  profileInfoStatus: document.getElementById('profile-info-status'),
  profileSocials: document.getElementById('profile-socials'),
  profileSocialForm: document.getElementById('profile-social-form'),
  profileSocialStatus: document.getElementById('profile-social-status'),
  profilePhotoForm: document.getElementById('profile-photo-form'),
  profilePhotoFile: document.getElementById('profile-photo-file'),
  profilePhotoCropCurrent: document.getElementById('profile-photo-crop-current'),
  profilePhotoStatus: document.getElementById('profile-photo-status'),
  photoCropModal: document.getElementById('photo-crop-modal'),
  photoCropStage: document.getElementById('photo-crop-stage'),
  photoCropImage: document.getElementById('photo-crop-image'),
  photoCropZoom: document.getElementById('photo-crop-zoom'),
  photoCropCancel: document.getElementById('photo-crop-cancel'),
  photoCropConfirm: document.getElementById('photo-crop-confirm'),
  catalogGrid: document.getElementById('catalog-grid'),
  catalogSearch: document.getElementById('catalog-search'),
  catalogType: document.getElementById('catalog-type'),
  catalogCity: document.getElementById('catalog-city'),
  leadsWrap: document.getElementById('leads-wrap'),
  leadDetail: document.getElementById('lead-detail'),
  leadSearch: document.getElementById('lead-search'),
  leadStatusFilter: document.getElementById('lead-status-filter'),
  leadDateFilter: document.getElementById('lead-date-filter'),
  exportLeadsBtn: document.getElementById('export-leads-btn'),
  salesWrap: document.getElementById('sales-wrap'),
  saleForm: document.getElementById('advisor-sale-form'),
  saleAsset: document.getElementById('advisor-sale-asset'),
  saleDate: document.getElementById('advisor-sale-date'),
  saleStatus: document.getElementById('advisor-sale-status'),
  calcPrice: document.getElementById('calc-price'),
  calcDown: document.getElementById('calc-down'),
  calcRate: document.getElementById('calc-rate'),
  calcYears: document.getElementById('calc-years'),
  calcResult: document.getElementById('calc-result'),
  calcClientName: document.getElementById('calc-client-name'),
  calcClientPhone: document.getElementById('calc-client-phone'),
  calcAsset: document.getElementById('calc-asset'),
  proposalSummary: document.getElementById('proposal-summary'),
  proposalStatus: document.getElementById('proposal-status'),
  saveProposalBtn: document.getElementById('save-proposal-btn'),
  copyProposalBtn: document.getElementById('copy-proposal-btn'),
  sendProposalWhatsapp: document.getElementById('send-proposal-whatsapp')
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[char]));
}

function asArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch (_) {
      return value.split('\n').map(item => item.trim()).filter(Boolean);
    }
  }
  return [];
}

function numberValue(value) {
  const match = String(value ?? '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function money(value, currency = 'DOP') {
  const amount = Number(value || 0);
  const prefix = String(currency || 'DOP').toUpperCase() === 'USD' ? 'USD $' : 'RD$';
  return `${prefix}${new Intl.NumberFormat('es-DO', { maximumFractionDigits: 0 }).format(amount)}`;
}

function advisorSocials(source) {
  const direct = source?.redes_sociales && typeof source.redes_sociales === 'object' ? source.redes_sociales : null;
  const data = source?.datos && typeof source.datos === 'object' ? source.datos : {};
  const fromData = data.redes_sociales && typeof data.redes_sociales === 'object' ? data.redes_sociales : null;
  return direct || fromData || {};
}

function socialHref(platform, value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  if (/^(https?:)?\/\//i.test(raw)) return raw.startsWith('//') ? `https:${raw}` : raw;
  const clean = raw.replace(/^@/, '');
  const routes = {
    instagram_url: `https://instagram.com/${clean}`,
    facebook_url: `https://facebook.com/${clean}`,
    tiktok_url: `https://tiktok.com/@${clean}`,
    linkedin_url: `https://linkedin.com/in/${clean}`,
    youtube_url: `https://youtube.com/@${clean}`,
    web_url: `https://${clean}`
  };
  return routes[platform] || `https://${clean}`;
}

function normalizeSocialValue(platform, value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  return socialHref(platform, raw);
}

function socialLinksHtml(source) {
  const socials = advisorSocials(source);
  const items = [
    ['instagram_url', 'Instagram'],
    ['facebook_url', 'Facebook'],
    ['tiktok_url', 'TikTok'],
    ['linkedin_url', 'LinkedIn'],
    ['youtube_url', 'YouTube'],
    ['web_url', 'Web']
  ];

  const links = items.map(([key, label]) => {
    const href = socialHref(key, socials[key]);
    return href ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(label)}</a>` : '';
  }).filter(Boolean);

  return links.length
    ? links.join('')
    : '<div class="profile-socials-empty">Todavía no hay redes sociales registradas en este perfil.</div>';
}

function fillSocialForm() {
  if (!els.profileSocialForm) return;
  const socials = advisorSocials(state.advisor);
  ['instagram_url', 'facebook_url', 'tiktok_url', 'linkedin_url', 'youtube_url', 'web_url'].forEach(key => {
    if (els.profileSocialForm.elements[key]) {
      els.profileSocialForm.elements[key].value = socials[key] || '';
    }
  });
}

function fillProfileInfoForm() {
  if (!els.profileInfoForm || !state.advisor) return;
  ['nombre', 'telefono', 'whatsapp', 'ciudad', 'sector', 'bio'].forEach(key => {
    if (els.profileInfoForm.elements[key]) {
      els.profileInfoForm.elements[key].value = state.advisor[key] || '';
    }
  });
}

function currentMonthRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
  return { start, end };
}

function currentMonthIsoRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    startTimestamp: start.toISOString(),
    endTimestamp: end.toISOString()
  };
}

function isCurrentMonth(value) {
  const time = new Date(value || 0).getTime();
  if (!time) return false;
  const range = currentMonthRange();
  return time >= range.start && time < range.end;
}

function advisorCommissionPercent() {
  return Number(state.advisor?.porcentaje_comision || 0);
}

function estimatedCommission(amount) {
  const percent = advisorCommissionPercent();
  return percent > 0 ? Number(amount || 0) * (percent / 100) : 0;
}

function buildMonthlyRanking(advisors, sales, leads) {
  const map = new Map();
  advisors.forEach(advisor => {
    map.set(String(advisor.id), {
      advisor,
      asesor_id: advisor.id,
      asesor_slug: advisor.slug,
      asesor_nombre: advisor.nombre,
      foto_url: advisor.foto_url,
      ventas_total: 0,
      monto_vendido: 0,
      comision_total: 0,
      leads_total: 0
    });
  });

  function findRowBySale(sale) {
    if (sale.asesor_id && map.has(String(sale.asesor_id))) return map.get(String(sale.asesor_id));
    return Array.from(map.values()).find(row => row.asesor_slug && row.asesor_slug === sale.asesor_slug);
  }

  sales.forEach(sale => {
    const row = findRowBySale(sale);
    if (!row) return;
    row.ventas_total += 1;
    row.monto_vendido += Number(sale.monto_venta || 0);
    row.comision_total += Number(sale.beneficio_vendedor || 0);
  });

  leads.forEach(lead => {
    const row = lead.asesor_id && map.has(String(lead.asesor_id))
      ? map.get(String(lead.asesor_id))
      : Array.from(map.values()).find(item => item.asesor_slug && item.asesor_slug === lead.asesor_slug);
    if (row) row.leads_total += 1;
  });

  return Array.from(map.values())
    .sort((a, b) =>
      Number(b.ventas_total || 0) - Number(a.ventas_total || 0) ||
      Number(b.monto_vendido || 0) - Number(a.monto_vendido || 0) ||
      Number(b.leads_total || 0) - Number(a.leads_total || 0) ||
      String(a.asesor_nombre || '').localeCompare(String(b.asesor_nombre || ''))
    )
    .map((row, index) => ({ ...row, posicion: index + 1 }));
}

function advisorSlug() {
  return state.advisor?.slug || state.advisor?.codigo_referido || '';
}

function isCurrentAdvisorRankingRow(row) {
  const advisorId = state.advisor?.id ? String(state.advisor.id) : '';
  const rowAdvisorId = row?.asesor_id ? String(row.asesor_id) : '';
  const slug = advisorSlug();
  const rowSlug = row?.asesor_slug || '';
  return Boolean(
    (advisorId && rowAdvisorId && advisorId === rowAdvisorId) ||
    (slug && rowSlug && slug === rowSlug)
  );
}

function advisorLink(path = '/') {
  const slug = advisorSlug();
  const url = new URL(path, PUBLIC_BASE);
  if (slug) url.searchParams.set('asesor', slug);
  return url.toString();
}

function kycLink() {
  return advisorLink('/conoce-tu-cliente.html');
}

function captureLink() {
  return advisorLink('/captacion.html');
}

function itemLink(item) {
  const url = new URL('/inmuebles.html', PUBLIC_BASE);
  const detailId = item.legacyId || item.slug || item.id;
  url.searchParams.set('id', detailId);
  url.searchParams.set('asesor', advisorSlug());
  return url.toString();
}

function shareLink(text, link) {
  return `https://wa.me/?text=${encodeURIComponent(`${text}\n${link}`)}`;
}

function makeToken() {
  const values = new Uint8Array(24);
  crypto.getRandomValues(values);
  return Array.from(values, value => value.toString(16).padStart(2, '0')).join('');
}

async function copyText(text) {
  await navigator.clipboard.writeText(text);
  const previous = els.copyMainLink?.textContent || '';
  if (els.copyMainLink) {
    els.copyMainLink.textContent = 'Link copiado';
    setTimeout(() => { els.copyMainLink.textContent = previous || 'Copiar mi link'; }, 1400);
  }
}

function showStatus(element, message, type = '') {
  if (!element) return;
  element.textContent = message;
  element.className = `status ${type}`.trim();
}

function storageSafeName(value) {
  return String(value || 'archivo')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'archivo';
}

function closePhotoCropper(clearFile = false) {
  els.photoCropModal?.classList.remove('open');
  els.photoCropStage?.classList.remove('dragging');
  state.photoCrop.dragging = false;
  if (clearFile && els.profilePhotoFile) els.profilePhotoFile.value = '';
}

function clampPhotoCrop() {
  const crop = state.photoCrop;
  const stage = els.photoCropStage;
  if (!crop.image || !stage) return;
  const box = stage.clientWidth || 320;
  const width = crop.image.naturalWidth * crop.scale;
  const height = crop.image.naturalHeight * crop.scale;
  crop.x = Math.min(0, Math.max(box - width, crop.x));
  crop.y = Math.min(0, Math.max(box - height, crop.y));
}

function renderPhotoCrop() {
  const crop = state.photoCrop;
  if (!els.photoCropImage || !crop.image) return;
  clampPhotoCrop();
  els.photoCropImage.style.width = `${crop.image.naturalWidth * crop.scale}px`;
  els.photoCropImage.style.height = `${crop.image.naturalHeight * crop.scale}px`;
  els.photoCropImage.style.transform = `translate(${crop.x}px, ${crop.y}px)`;
}

function setPhotoCropZoom(value) {
  const crop = state.photoCrop;
  const stage = els.photoCropStage;
  if (!crop.image || !stage) return;
  const box = stage.clientWidth || 320;
  const previousScale = crop.scale || crop.minScale;
  const nextScale = crop.minScale * (Number(value || 110) / 100);
  const centerX = (box / 2 - crop.x) / previousScale;
  const centerY = (box / 2 - crop.y) / previousScale;
  crop.scale = Math.max(crop.minScale, nextScale);
  crop.x = box / 2 - centerX * crop.scale;
  crop.y = box / 2 - centerY * crop.scale;
  renderPhotoCrop();
}

async function openPhotoCropper(file) {
  if (!file) return;
  if (!/^image\/(jpeg|png|webp)$/i.test(file.type || '')) {
    showStatus(els.profilePhotoStatus, 'La foto debe ser JPG, PNG o WebP.', 'error');
    if (els.profilePhotoFile) els.profilePhotoFile.value = '';
    return;
  }
  if (file.size > 6 * 1024 * 1024) {
    showStatus(els.profilePhotoStatus, 'La foto no debe pasar de 6 MB.', 'error');
    if (els.profilePhotoFile) els.profilePhotoFile.value = '';
    return;
  }

  if (state.photoCrop.objectUrl) URL.revokeObjectURL(state.photoCrop.objectUrl);
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();
  image.src = objectUrl;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
  });

  const stage = els.photoCropStage;
  const box = stage?.clientWidth || 320;
  const minScale = Math.max(box / image.naturalWidth, box / image.naturalHeight);
  state.photoCrop = {
    ...state.photoCrop,
    file,
    croppedFile: null,
    objectUrl,
    image,
    minScale,
    scale: minScale * 1.1,
    x: (box - image.naturalWidth * minScale * 1.1) / 2,
    y: (box - image.naturalHeight * minScale * 1.1) / 2,
    dragging: false
  };
  if (els.photoCropImage) els.photoCropImage.src = objectUrl;
  if (els.photoCropZoom) els.photoCropZoom.value = '110';
  els.photoCropModal?.classList.add('open');
  renderPhotoCrop();
  showStatus(els.profilePhotoStatus, 'Ajusta la foto y confirma el recorte antes de subirla.');
}

async function openCurrentProfilePhotoCropper() {
  const photoUrl = state.advisor?.foto_url || els.profilePhoto?.src || '';
  if (!photoUrl || /logo-redex-color\.png$/i.test(photoUrl)) {
    showStatus(els.profilePhotoStatus, 'Primero sube una fotografía para poder recortarla.', 'error');
    return;
  }

  showStatus(els.profilePhotoStatus, 'Abriendo foto actual...');
  const response = await fetch(photoUrl, { mode: 'cors' });
  if (!response.ok) throw new Error('No se pudo abrir la foto actual.');
  const blob = await response.blob();
  if (!/^image\//i.test(blob.type || '')) {
    throw new Error('La foto actual no se pudo leer como imagen.');
  }
  const file = new File([blob], `perfil-actual-${advisorSlug() || 'asesor'}.jpg`, {
    type: blob.type || 'image/jpeg'
  });
  await openPhotoCropper(file);
}

function makeCroppedProfileFile() {
  const crop = state.photoCrop;
  const stage = els.photoCropStage;
  if (!crop.image || !stage) throw new Error('Selecciona y ajusta una fotografía.');
  const box = stage.clientWidth || 320;
  const size = 900;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#050914';
  ctx.fillRect(0, 0, size, size);
  const sx = Math.max(0, -crop.x / crop.scale);
  const sy = Math.max(0, -crop.y / crop.scale);
  const sw = box / crop.scale;
  const sh = box / crop.scale;
  ctx.drawImage(crop.image, sx, sy, sw, sh, 0, 0, size, size);
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => {
      if (!blob) {
        reject(new Error('No se pudo generar el recorte.'));
        return;
      }
      resolve(new File([blob], `perfil-${advisorSlug() || 'asesor'}.jpg`, { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.9);
  });
}

async function uploadAdvisorProfilePhoto(file) {
  if (!file) throw new Error('Selecciona una imagen.');
  if (!/^image\/(jpeg|png|webp)$/i.test(file.type || '')) {
    throw new Error('La foto debe ser JPG, PNG o WebP.');
  }
  if (file.size > 6 * 1024 * 1024) {
    throw new Error('La foto no debe pasar de 6 MB.');
  }

  const folder = advisorSlug() || state.advisor?.id || 'asesor';
  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
  const objectPath = `asesores/${storageSafeName(folder)}/perfil-${Date.now()}.${storageSafeName(extension)}`;
  const { error: uploadError } = await supabase.storage
    .from('propiedades')
    .upload(objectPath, file, {
      cacheControl: '3600',
      upsert: true,
      contentType: file.type || 'image/jpeg'
    });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('propiedades').getPublicUrl(objectPath);
  const publicUrl = data?.publicUrl;
  if (!publicUrl) throw new Error('No se pudo generar la URL pública de la foto.');

  const { data: updated, error: updateError } = await supabase
    .from('asesores')
    .update({ foto_url: publicUrl })
    .eq('id', state.advisor.id)
    .select('*')
    .single();
  if (updateError) throw updateError;

  state.advisor = updated;
  return publicUrl;
}

async function handleProfilePhotoSubmit(event) {
  event.preventDefault();
  const selectedFile = els.profilePhotoFile?.files?.[0];
  if (selectedFile && !state.photoCrop.croppedFile) {
    await openPhotoCropper(selectedFile);
    return;
  }
  const file = state.photoCrop.croppedFile || selectedFile;
  const submit = event.currentTarget.querySelector('button[type="submit"]');
  submit.disabled = true;
  submit.textContent = 'Subiendo...';
  showStatus(els.profilePhotoStatus, '');
  try {
    await uploadAdvisorProfilePhoto(file);
    renderProfile();
    if (els.profilePhotoFile) els.profilePhotoFile.value = '';
    state.photoCrop.croppedFile = null;
    showStatus(els.profilePhotoStatus, 'Foto actualizada. Ya se verá en tu portal y enlaces públicos.', 'success');
  } catch (error) {
    showStatus(els.profilePhotoStatus, error.message || 'No se pudo actualizar la foto.', 'error');
  } finally {
    submit.disabled = false;
    submit.textContent = 'Actualizar foto';
  }
}

async function handleProfileInfoSubmit(event) {
  event.preventDefault();
  if (!state.advisor?.id) return;
  const form = event.currentTarget;
  const submit = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  const payload = {
    nombre: String(formData.get('nombre') || '').trim(),
    telefono: String(formData.get('telefono') || '').trim(),
    whatsapp: String(formData.get('whatsapp') || '').trim(),
    ciudad: String(formData.get('ciudad') || '').trim(),
    sector: String(formData.get('sector') || '').trim(),
    bio: String(formData.get('bio') || '').trim()
  };

  if (!payload.nombre) {
    showStatus(els.profileInfoStatus, 'El nombre público es obligatorio.', 'error');
    return;
  }

  submit.disabled = true;
  submit.textContent = 'Guardando...';
  showStatus(els.profileInfoStatus, '');
  try {
    const { data: updated, error } = await supabase
      .from('asesores')
      .update(payload)
      .eq('id', state.advisor.id)
      .select('*')
      .single();
    if (error) throw error;

    state.advisor = updated;
    renderProfile();
    showStatus(els.profileInfoStatus, 'Perfil actualizado. Ya se verá en tu portal y enlaces públicos.', 'success');
  } catch (error) {
    showStatus(els.profileInfoStatus, error.message || 'No se pudo actualizar el perfil.', 'error');
  } finally {
    submit.disabled = false;
    submit.textContent = 'Guardar perfil';
  }
}

async function handleProfileSocialSubmit(event) {
  event.preventDefault();
  if (!state.advisor?.id) return;
  const form = event.currentTarget;
  const submit = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  const redes_sociales = {
    instagram_url: normalizeSocialValue('instagram_url', formData.get('instagram_url')),
    facebook_url: normalizeSocialValue('facebook_url', formData.get('facebook_url')),
    tiktok_url: normalizeSocialValue('tiktok_url', formData.get('tiktok_url')),
    linkedin_url: normalizeSocialValue('linkedin_url', formData.get('linkedin_url')),
    youtube_url: normalizeSocialValue('youtube_url', formData.get('youtube_url')),
    web_url: normalizeSocialValue('web_url', formData.get('web_url'))
  };
  Object.keys(redes_sociales).forEach(key => {
    if (!redes_sociales[key]) delete redes_sociales[key];
  });

  const datos = state.advisor.datos && typeof state.advisor.datos === 'object'
    ? { ...state.advisor.datos }
    : {};
  datos.redes_sociales = redes_sociales;

  submit.disabled = true;
  submit.textContent = 'Guardando...';
  showStatus(els.profileSocialStatus, '');
  try {
    const { data: updated, error } = await supabase
      .from('asesores')
      .update({ datos })
      .eq('id', state.advisor.id)
      .select('*')
      .single();
    if (error) throw error;

    state.advisor = updated;
    renderProfile();
    showStatus(els.profileSocialStatus, 'Redes actualizadas. Ya están disponibles en tu perfil público.', 'success');
  } catch (error) {
    showStatus(els.profileSocialStatus, error.message || 'No se pudieron actualizar las redes.', 'error');
  } finally {
    submit.disabled = false;
    submit.textContent = 'Guardar redes';
  }
}

function initials(name) {
  return String(name || 'RD').split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'RD';
}

function setPanel(panelId, trigger) {
  document.querySelectorAll('.panel').forEach(panel => panel.classList.toggle('active', panel.id === `panel-${panelId}`));
  document.querySelectorAll('.sb-link').forEach(link => link.classList.toggle('active', link === trigger));
  const title = trigger?.textContent?.replace(/^[^\wáéíóúñ]+/i, '').trim() || 'Portal Asesor';
  if (els.pageTitle) els.pageTitle.textContent = title;
  if (window.innerWidth <= 920) els.sidebar?.classList.remove('open');
}

async function loadAdvisor(session) {
  const email = session?.user?.email;
  if (!email) throw new Error('No encontramos el correo del usuario.');
  const requestedSlug = new URLSearchParams(window.location.search).get('asesor');
  if (requestedSlug && email === 'admin@redexinmobiliaria.com') {
    const { data: previewAdvisor, error: previewError } = await supabase
      .from('asesores')
      .select('*')
      .or(`slug.eq.${requestedSlug},codigo_referido.eq.${requestedSlug}`)
      .limit(1)
      .maybeSingle();
    if (previewError) throw previewError;
    if (previewAdvisor) return previewAdvisor;
  }
  const { data, error } = await supabase
    .from('asesores')
    .select('*')
    .ilike('email', email)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Este usuario todavía no está registrado como asesor en REDEX.');
  if (data.estado && data.estado !== 'activo') throw new Error(`Tu perfil de asesor está en estado: ${data.estado}.`);
  return data;
}

async function fetchTable(table, columns, queryBuilder) {
  let query = supabase.from(table).select(columns);
  if (queryBuilder) query = queryBuilder(query);
  const { data, error } = await query;
  if (error) throw error;
  return Array.isArray(data) ? data : [];
}

function normalizeProperty(row) {
  const galeria = asArray(row.galeria);
  return {
    kind: 'propiedad',
    id: row.id,
    legacyId: row.legacy_id || '',
    slug: row.slug || row.legacy_id || row.id,
    nombre: row.nombre || 'Propiedad REDEX',
    ciudad: row.ciudad || 'República Dominicana',
    sector: row.sector || '',
    tipo: row.tipo || 'Propiedad',
    estado: row.estado || 'Disponible',
    precio: row.precio ? money(row.precio, row.moneda) : 'Consultar',
    imagen: row.imagen_portada || galeria[0] || 'hero_bg.png',
    metraje: row.metraje ? `${row.metraje} m²` : ''
  };
}

function normalizeProject(row) {
  const galeria = asArray(row.galeria);
  return {
    kind: 'proyecto',
    id: row.id,
    legacyId: row.legacy_id || '',
    slug: row.slug || row.legacy_id || row.id,
    nombre: row.nombre || 'Proyecto REDEX',
    ciudad: row.ciudad || 'República Dominicana',
    sector: row.sector || row.ubicacion || '',
    tipo: row.tipo || 'Proyecto',
    estado: row.estado || row.etiqueta || 'Disponible',
    precio: row.precio_texto || 'Consultar',
    imagen: row.imagen_portada || galeria[0] || 'hero_bg.png',
    metraje: row.cantidad_disponible || ''
  };
}

async function loadData() {
  const advisorId = state.advisor.id;
  const advisorSlugValue = advisorSlug();
  const monthRange = currentMonthIsoRange();
  const propertyColumns = 'id,legacy_id,slug,nombre,precio,moneda,ciudad,sector,tipo,estado,metraje,imagen_portada,galeria,visible,destacado';
  const projectColumns = 'id,legacy_id,slug,nombre,ciudad,sector,ubicacion,tipo,estado,etiqueta,precio_texto,cantidad_disponible,imagen_portada,galeria,visible,destacado';

  const [properties, projects, leads, sales, saleReports, advisors, monthSales, monthLeads] = await Promise.all([
    fetchTable('propiedades', propertyColumns, query => query.eq('visible', true).order('created_at', { ascending: false }).limit(300)),
    fetchTable('proyectos', projectColumns, query => query.eq('visible', true).order('created_at', { ascending: false }).limit(120)),
    fetchTable('solicitudes', 'id,tipo,pagina,origen_url,nombre,email,telefono,interes,mensaje,datos,estado,notas_admin,asesor_id,asesor_slug,asesor_nombre,primer_origen_url,ultima_actividad_url,created_at,updated_at', query => query.or(`asesor_id.eq.${advisorId},asesor_slug.eq.${advisorSlugValue}`).order('created_at', { ascending: false }).limit(120)),
    fetchTable('ventas', 'id,activo_nombre,monto_venta,moneda,fecha_venta,estado_liquidacion,beneficio_vendedor,asesor_id,asesor_slug,vendedor_nombre', query => query.or(`asesor_id.eq.${advisorId},asesor_slug.eq.${advisorSlugValue}`).order('fecha_venta', { ascending: false }).limit(120)),
    fetchTable('ventas_reportadas', 'id,activo_nombre,precio_final,fecha_venta,estado_revision,asesor_id,asesor_slug,cliente_nombre,created_at', query => query.or(`asesor_id.eq.${advisorId},asesor_slug.eq.${advisorSlugValue}`).order('created_at', { ascending: false }).limit(120)),
    fetchTable('asesores', 'id,nombre,slug,foto_url,estado,visible_publico', query => query.eq('estado', 'activo').order('nombre', { ascending: true }).limit(500)),
    fetchTable('ventas', 'id,monto_venta,beneficio_vendedor,fecha_venta,asesor_id,asesor_slug', query => query.gte('fecha_venta', monthRange.startDate).lt('fecha_venta', monthRange.endDate).limit(1000)),
    fetchTable('solicitudes', 'id,asesor_id,asesor_slug,created_at', query => query.gte('created_at', monthRange.startTimestamp).lt('created_at', monthRange.endTimestamp).limit(1000))
  ]);

  state.properties = properties.map(normalizeProperty);
  state.projects = projects.map(normalizeProject);
  state.leads = leads;
  state.sales = sales;
  state.saleReports = saleReports;
  state.ranking = buildMonthlyRanking(advisors, monthSales, monthLeads);
}

function renderProfile() {
  const advisor = state.advisor;
  const photo = advisor.foto_url || 'logo-redex-color.png';
  els.userName.textContent = advisor.nombre || 'Asesor REDEX';
  els.userRole.textContent = advisor.rol || 'Asesor';
  els.avatar.innerHTML = advisor.foto_url ? `<img src="${escapeHtml(photo)}" alt="${escapeHtml(advisor.nombre)}">` : escapeHtml(initials(advisor.nombre));
  if (els.topbarName) els.topbarName.textContent = advisor.nombre || 'Asesor REDEX';
  if (els.topbarRole) els.topbarRole.textContent = advisor.rol || 'Asesor';
  if (els.topbarAvatar) {
    els.topbarAvatar.innerHTML = advisor.foto_url
      ? `<img src="${escapeHtml(photo)}" alt="${escapeHtml(advisor.nombre)}">`
      : escapeHtml(initials(advisor.nombre));
  }
  els.profilePhoto.src = photo;
  els.profileName.textContent = advisor.nombre || 'Asesor REDEX';
  els.profileBio.textContent = advisor.bio || 'Perfil comercial aprobado por REDEX Inmobiliaria.';
  els.profileStatus.textContent = advisor.estado || 'activo';
  els.profilePercent.textContent = `${Number(advisor.porcentaje_comision || 0)}%`;
  els.profilePhone.textContent = advisor.telefono || 'Consultar';
  els.profileWhatsapp.textContent = advisor.whatsapp || 'Consultar';
  els.profileEmail.textContent = advisor.email || state.session?.user?.email || 'Consultar';
  els.profileSlug.textContent = advisorSlug();
  fillProfileInfoForm();
  if (els.profileSocials) els.profileSocials.innerHTML = socialLinksHtml(advisor);
  fillSocialForm();
  if (els.dashboardWhatsappLink) {
    els.dashboardWhatsappLink.href = shareLink(`Hola, soy ${advisor.nombre || 'asesor REDEX'}. Te comparto mi catálogo inmobiliario REDEX:`, advisorLink('/'));
  }
}

function renderDashboard() {
  const approvedSales = state.sales;
  const commission = approvedSales.reduce((sum, sale) => sum + Number(sale.beneficio_vendedor || 0), 0);
  els.statLeads.textContent = state.leads.length;
  els.statSales.textContent = approvedSales.length;
  els.statCommission.textContent = money(commission, 'DOP');

  const activity = [
    ...state.leads.slice(0, 4).map(lead => ({ type: 'Lead', name: lead.nombre, date: lead.created_at, detail: lead.tipo || lead.estado || 'Nuevo' })),
    ...state.sales.slice(0, 4).map(sale => ({ type: 'Venta', name: sale.activo_nombre, date: sale.fecha_venta, detail: sale.estado_liquidacion || money(sale.monto_venta, sale.moneda) }))
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 6);

  els.recentActivity.innerHTML = activity.length ? `
    <table>
      <thead><tr><th>Tipo</th><th>Registro</th><th>Detalle</th><th>Fecha</th></tr></thead>
      <tbody>
        ${activity.map(item => `
          <tr>
            <td data-label="Tipo">${escapeHtml(item.type)}</td>
            <td data-label="Registro">${escapeHtml(item.name || 'Sin nombre')}</td>
            <td data-label="Detalle">${escapeHtml(item.detail || '')}</td>
            <td data-label="Fecha">${escapeHtml(formatDate(item.date))}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<div class="empty">Todavía no hay actividad asignada a este asesor.</div>';
}

function formatDate(value) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('es-DO', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function statusClass(status) {
  if (status === 'Atendida') return 'status-ok';
  if (status === 'Descartada') return 'status-off';
  return 'status-pend';
}

function leadTypeLabel(type) {
  const labels = {
    contacto: 'Contacto',
    quiero_vender: 'Quiero vender',
    quiero_ser_asesor: 'Quiero ser asesor',
    precalificacion: 'Precalificación',
    hipoteca: 'Hipoteca',
    propuesta_asesor: 'Propuesta asesor',
    conoce_tu_cliente: 'Conoce tu cliente',
    captacion_inmueble: 'Captación de inmueble'
  };
  return labels[type] || type || 'Solicitud';
}

function leadFollowUp(lead) {
  const data = lead?.datos && typeof lead.datos === 'object' ? lead.datos : {};
  return data.seguimiento_asesor && typeof data.seguimiento_asesor === 'object'
    ? data.seguimiento_asesor
    : {};
}

function leadTags(lead) {
  const followUp = leadFollowUp(lead);
  return asArray(followUp.etiquetas).slice(0, 8);
}

function leadScore(lead) {
  return leadFollowUp(lead).calificacion || 'Sin calificar';
}

function leadHistory(lead) {
  return asArray(leadFollowUp(lead).historial).slice(-8).reverse();
}

function getLeadById(id) {
  return state.leads.find(lead => String(lead.id) === String(id));
}

function filterLeads() {
  const query = state.leadFilters.query.toLowerCase();
  const now = Date.now();
  state.filteredLeads = state.leads.filter(lead => {
    const followUp = leadFollowUp(lead);
    const haystack = [
      lead.nombre,
      lead.telefono,
      lead.email,
      lead.tipo,
      lead.estado,
      lead.interes,
      lead.mensaje,
      lead.pagina,
      followUp.nota,
      followUp.calificacion,
      asArray(followUp.etiquetas).join(' '),
      JSON.stringify(lead.datos || {})
    ].join(' ').toLowerCase();
    if (query && !haystack.includes(query)) return false;
    if (state.leadFilters.estado !== 'todos' && lead.estado !== state.leadFilters.estado) return false;
    if (state.leadFilters.fecha !== 'todos') {
      const leadTime = new Date(lead.created_at || 0).getTime();
      if (!leadTime) return false;
      if (state.leadFilters.fecha === 'hoy') {
        const date = new Date();
        const start = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        if (leadTime < start) return false;
      } else {
        const days = Number(state.leadFilters.fecha);
        if (now - leadTime > days * 86400000) return false;
      }
    }
    return true;
  });
}

function leadWhatsAppLink(lead) {
  const phone = String(lead?.telefono || '').replace(/[^\d]/g, '');
  if (!phone) return '';
  const normalized = phone.length === 10 ? `1${phone}` : phone;
  return `https://wa.me/${normalized}?text=${encodeURIComponent('Hola, soy tu asesor REDEX. Vi tu solicitud y quiero ayudarte con la información que necesitas.')}`;
}

function leadDataRows(lead) {
  const data = lead?.datos && typeof lead.datos === 'object' ? lead.datos : {};
  return Object.entries(data)
    .filter(([key, value]) => key !== 'seguimiento_asesor' && String(Array.isArray(value) ? value.join(', ') : value || '').trim())
    .slice(0, 10)
    .map(([key, value]) => `
      <div class="lead-detail-item">
        <span>${escapeHtml(key.replace(/_/g, ' '))}</span>
        <strong>${escapeHtml(Array.isArray(value) ? value.join(', ') : value)}</strong>
      </div>
    `).join('');
}

function leadTagsHtml(lead) {
  const tags = leadTags(lead);
  return tags.length
    ? `<div class="lead-tags">${tags.map(tag => `<span class="lead-tag">${escapeHtml(tag)}</span>`).join('')}</div>`
    : '';
}

function leadHistoryHtml(lead) {
  const history = leadHistory(lead);
  return history.length ? `
    <div class="lead-history">
      <div class="eyebrow">Historial de seguimiento</div>
      ${history.map(item => `
        <div class="lead-history-item">
          <strong>${escapeHtml(item.nota || 'Seguimiento actualizado')}</strong>
          <span>${escapeHtml([item.estado, item.calificacion, item.etiquetas].filter(Boolean).join(' · '))}</span><br>
          <span>${escapeHtml(formatDate(item.fecha))} · ${escapeHtml(item.asesor_nombre || state.advisor?.nombre || 'Asesor')}</span>
        </div>
      `).join('')}
    </div>
  ` : '';
}

function renderCatalogCities() {
  const cities = Array.from(new Set([...state.properties, ...state.projects].map(item => item.ciudad).filter(Boolean))).sort();
  els.catalogCity.innerHTML = '<option value="todos">Todas las ciudades</option>' + cities.map(city => `<option value="${escapeHtml(city)}">${escapeHtml(city)}</option>`).join('');
}

function filteredCatalog() {
  const search = state.catalogSearch.toLowerCase();
  return [...state.properties, ...state.projects].filter(item => {
    const haystack = [item.nombre, item.ciudad, item.sector, item.tipo, item.estado].join(' ').toLowerCase();
    const matchesSearch = !search || haystack.includes(search);
    const matchesType = state.catalogType === 'todos' || item.kind === state.catalogType;
    const matchesCity = state.catalogCity === 'todos' || item.ciudad === state.catalogCity;
    return matchesSearch && matchesType && matchesCity;
  });
}

function renderCatalog() {
  const items = filteredCatalog();
  els.catalogGrid.innerHTML = items.length ? items.map(item => {
    const link = itemLink(item);
    return `
      <article class="asset-card">
        <img src="${escapeHtml(item.imagen)}" alt="${escapeHtml(item.nombre)}" loading="lazy">
        <div class="asset-body">
          <span class="pill">${escapeHtml(item.kind)}</span>
          <h4>${escapeHtml(item.nombre)}</h4>
          <div class="asset-meta">
            ${escapeHtml([item.ciudad, item.sector].filter(Boolean).join(' · '))}<br>
            ${escapeHtml(item.tipo)} · ${escapeHtml(item.estado)}<br>
            ${escapeHtml(item.precio)} ${item.metraje ? `· ${escapeHtml(item.metraje)}` : ''}
          </div>
          <div class="asset-actions">
            <button class="copy-btn" type="button" data-copy="${escapeHtml(link)}">Copiar link</button>
            <a class="copy-btn" href="${escapeHtml(shareLink(`Hola, soy ${state.advisor?.nombre || 'tu asesor REDEX'}. Te comparto esta opción: ${item.nombre}`, link))}" target="_blank" rel="noopener">WhatsApp</a>
            <a class="copy-btn" href="${escapeHtml(link)}" target="_blank" rel="noopener">Ver</a>
          </div>
        </div>
      </article>
    `;
  }).join('') : '<div class="empty">No hay resultados con esos filtros.</div>';
}

function renderSaleAssetOptions() {
  if (!els.saleAsset) return;
  const items = [...state.properties, ...state.projects];
  els.saleAsset.innerHTML = items.length
    ? items.map(item => `<option value="${escapeHtml(`${item.kind}:${item.id}`)}">${escapeHtml(item.kind === 'proyecto' ? 'Proyecto' : 'Propiedad')} · ${escapeHtml(item.nombre)}</option>`).join('')
    : '<option value="">No hay inventario disponible</option>';
  if (els.saleDate && !els.saleDate.value) els.saleDate.value = new Date().toISOString().slice(0, 10);
}

function renderCalcAssetOptions() {
  if (!els.calcAsset) return;
  const items = [...state.properties, ...state.projects];
  els.calcAsset.innerHTML = items.length
    ? items.map(item => `<option value="${escapeHtml(`${item.kind}:${item.id}`)}">${escapeHtml(item.kind === 'proyecto' ? 'Proyecto' : 'Propiedad')} · ${escapeHtml(item.nombre)}</option>`).join('')
    : '<option value="">Sin inventario disponible</option>';
}

function renderLeads() {
  filterLeads();
  els.leadsWrap.innerHTML = state.filteredLeads.length ? `
    <table>
      <thead><tr><th>Cliente</th><th>Contacto</th><th>Interés</th><th>Seguimiento</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr></thead>
      <tbody>
        ${state.filteredLeads.map(lead => {
          const whatsApp = leadWhatsAppLink(lead);
          return `
          <tr>
            <td data-label="Cliente">${escapeHtml(lead.nombre || 'Sin nombre')}</td>
            <td data-label="Contacto">${escapeHtml([lead.telefono, lead.email].filter(Boolean).join(' · ') || 'Sin contacto')}</td>
            <td data-label="Interés">${escapeHtml(lead.interes || lead.mensaje || leadTypeLabel(lead.tipo))}</td>
            <td data-label="Seguimiento">${escapeHtml(leadScore(lead))}${leadTagsHtml(lead)}</td>
            <td data-label="Estado"><span class="${statusClass(lead.estado)}">${escapeHtml(lead.estado || 'Nuevo')}</span></td>
            <td data-label="Fecha">${escapeHtml(formatDate(lead.created_at))}</td>
            <td data-label="Acciones">
              <div class="lead-actions">
                <button class="copy-btn" type="button" data-lead-action="view" data-id="${lead.id}">Ver</button>
                ${whatsApp ? `<a class="copy-btn" href="${escapeHtml(whatsApp)}" target="_blank" rel="noopener">WhatsApp</a>` : ''}
              </div>
            </td>
          </tr>
        `;}).join('')}
      </tbody>
    </table>
  ` : '<div class="empty">No hay leads con esos filtros.</div>';
  renderLeadDetail();
}

function renderLeadDetail() {
  if (!els.leadDetail) return;
  const lead = getLeadById(state.selectedLeadId) || state.filteredLeads[0];
  state.selectedLeadId = lead?.id || null;
  if (!lead) {
    els.leadDetail.hidden = true;
    els.leadDetail.innerHTML = '';
    return;
  }
  const followUp = leadFollowUp(lead);
  const whatsApp = leadWhatsAppLink(lead);
  const selectedTags = leadTags(lead);
  const tagOptions = ['Caliente', 'Tibio', 'Frío', 'Financiamiento', 'Contado', 'Pendiente documentos', 'Visita agendada', 'Seguimiento urgente'];
  els.leadDetail.hidden = false;
  els.leadDetail.innerHTML = `
    <div class="eyebrow">Detalle del lead</div>
    <h3>${escapeHtml(lead.nombre || 'Cliente REDEX')}</h3>
    <p class="muted">${escapeHtml(lead.mensaje || lead.interes || 'Solicitud recibida por el enlace del asesor.')}</p>
    <div class="lead-detail-grid">
      <div class="lead-detail-item"><span>Teléfono</span><strong>${escapeHtml(lead.telefono || 'Sin teléfono')}</strong></div>
      <div class="lead-detail-item"><span>Correo</span><strong>${escapeHtml(lead.email || 'Sin correo')}</strong></div>
      <div class="lead-detail-item"><span>Tipo</span><strong>${escapeHtml(leadTypeLabel(lead.tipo))}</strong></div>
      <div class="lead-detail-item"><span>Estado</span><strong>${escapeHtml(lead.estado || 'Nuevo')}</strong></div>
      <div class="lead-detail-item"><span>Origen</span><strong>${escapeHtml(lead.pagina || lead.origen_url || 'Web REDEX')}</strong></div>
      <div class="lead-detail-item"><span>Fecha</span><strong>${escapeHtml(formatDate(lead.created_at))}</strong></div>
      <div class="lead-detail-item"><span>Calificación</span><strong>${escapeHtml(leadScore(lead))}</strong></div>
      ${leadDataRows(lead)}
    </div>
    ${leadTagsHtml(lead)}
    <div class="lead-actions">
      ${lead.telefono ? `<a class="copy-btn" href="tel:${escapeHtml(lead.telefono)}">Llamar</a>` : ''}
      ${whatsApp ? `<a class="copy-btn" href="${escapeHtml(whatsApp)}" target="_blank" rel="noopener">Abrir WhatsApp</a>` : ''}
      <button class="copy-btn" type="button" data-lead-action="copy" data-id="${lead.id}">Copiar datos</button>
    </div>
    ${leadHistoryHtml(lead)}
    <form class="lead-note-form expanded" id="lead-note-form">
      <div>
        <label for="lead-detail-status">Estado</label>
        <select id="lead-detail-status" name="estado">
          ${['Nuevo', 'En proceso', 'Atendida', 'Descartada'].map(status => `<option value="${status}" ${lead.estado === status ? 'selected' : ''}>${status}</option>`).join('')}
        </select>
      </div>
      <div>
        <label for="lead-detail-score">Calificación</label>
        <select id="lead-detail-score" name="calificacion">
          ${['Sin calificar', 'Alta prioridad', 'Interés medio', 'Bajo interés', 'No califica'].map(option => `<option value="${option}" ${leadScore(lead) === option ? 'selected' : ''}>${option}</option>`).join('')}
        </select>
      </div>
      <div>
        <label for="lead-detail-tags">Etiquetas</label>
        <select id="lead-detail-tags" name="etiquetas" multiple size="4">
          ${tagOptions.map(option => `<option value="${option}" ${selectedTags.includes(option) ? 'selected' : ''}>${option}</option>`).join('')}
        </select>
      </div>
      <div>
        <label for="lead-detail-note">Nota de seguimiento</label>
        <textarea id="lead-detail-note" name="nota" rows="2">${escapeHtml(followUp.nota || '')}</textarea>
      </div>
      <button class="btn-primary" type="submit">Guardar</button>
    </form>
    <p class="status" id="lead-detail-status-message"></p>
  `;
  document.getElementById('lead-note-form')?.addEventListener('submit', saveLeadFollowUp);
}

async function copyLeadData(id) {
  const lead = getLeadById(id);
  if (!lead) return;
  const text = [
    `Cliente: ${lead.nombre || ''}`,
    `Teléfono: ${lead.telefono || ''}`,
    `Correo: ${lead.email || ''}`,
    `Interés: ${lead.interes || lead.mensaje || leadTypeLabel(lead.tipo)}`,
    `Estado: ${lead.estado || 'Nuevo'}`
  ].join('\n');
  await navigator.clipboard.writeText(text);
  const status = document.getElementById('lead-detail-status-message');
  showStatus(status, 'Datos copiados.', 'success');
}

async function saveLeadFollowUp(event) {
  event.preventDefault();
  const lead = getLeadById(state.selectedLeadId);
  if (!lead) return;
  const form = event.currentTarget;
  const submit = form.querySelector('button[type="submit"]');
  const status = document.getElementById('lead-detail-status-message');
  const formData = new FormData(form);
  const estado = String(formData.get('estado') || 'Nuevo');
  const nota = String(formData.get('nota') || '').trim();
  const calificacion = String(formData.get('calificacion') || 'Sin calificar');
  const etiquetas = Array.from(form.querySelector('select[name="etiquetas"]')?.selectedOptions || []).map(option => option.value);
  const datos = lead.datos && typeof lead.datos === 'object' ? { ...lead.datos } : {};
  const previousFollowUp = datos.seguimiento_asesor && typeof datos.seguimiento_asesor === 'object' ? datos.seguimiento_asesor : {};
  const history = asArray(previousFollowUp.historial);
  if (nota || estado !== lead.estado || calificacion !== previousFollowUp.calificacion || etiquetas.join('|') !== asArray(previousFollowUp.etiquetas).join('|')) {
    history.push({
      nota,
      estado,
      calificacion,
      etiquetas: etiquetas.join(', '),
      asesor_id: state.advisor.id,
      asesor_slug: advisorSlug(),
      asesor_nombre: state.advisor.nombre,
      fecha: new Date().toISOString()
    });
  }
  datos.seguimiento_asesor = {
    ...previousFollowUp,
    nota,
    calificacion,
    etiquetas,
    historial: history.slice(-30),
    asesor_id: state.advisor.id,
    asesor_slug: advisorSlug(),
    asesor_nombre: state.advisor.nombre,
    actualizado_at: new Date().toISOString()
  };
  submit.disabled = true;
  submit.textContent = 'Guardando...';
  showStatus(status, '');
  try {
    const { error } = await supabase
      .from('solicitudes')
      .update({ estado, datos })
      .eq('id', lead.id);
    if (error) throw error;
    lead.estado = estado;
    lead.datos = datos;
    showStatus(status, 'Seguimiento guardado.', 'success');
    renderDashboard();
    renderLeads();
  } catch (error) {
    showStatus(status, error.message || 'No se pudo guardar el seguimiento.', 'error');
  } finally {
    submit.disabled = false;
    submit.textContent = 'Guardar';
  }
}

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""').replace(/\n/g, ' ')}"`;
}

function downloadCsv(filename, rows) {
  const csv = rows.map(row => row.map(csvCell).join(',')).join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function exportLeads() {
  filterLeads();
  const rows = [
    ['Cliente', 'Telefono', 'Correo', 'Interes', 'Tipo', 'Estado', 'Calificacion', 'Etiquetas', 'Ultima nota', 'Asesor', 'Fecha', 'Origen']
  ];
  state.filteredLeads.forEach(lead => {
    const followUp = leadFollowUp(lead);
    rows.push([
      lead.nombre || '',
      lead.telefono || '',
      lead.email || '',
      lead.interes || lead.mensaje || leadTypeLabel(lead.tipo),
      leadTypeLabel(lead.tipo),
      lead.estado || 'Nuevo',
      followUp.calificacion || 'Sin calificar',
      asArray(followUp.etiquetas).join(', '),
      followUp.nota || '',
      lead.asesor_nombre || state.advisor?.nombre || '',
      formatDate(lead.created_at),
      lead.origen_url || lead.pagina || ''
    ]);
  });
  downloadCsv(`leads-${advisorSlug()}-${new Date().toISOString().slice(0, 10)}.csv`, rows);
}

function renderSales() {
  const pendingRows = state.saleReports.map(report => ({
    date: report.fecha_venta || report.created_at,
    name: report.activo_nombre,
    amount: report.precio_final,
    commission: 0,
    status: report.estado_revision || 'Pendiente',
    pending: true
  }));
  const approvedRows = state.sales.map(sale => ({
    date: sale.fecha_venta,
    name: sale.activo_nombre,
    amount: sale.monto_venta,
    commission: sale.beneficio_vendedor,
    status: sale.estado_liquidacion || 'Pendiente',
    pending: false
  }));
  const rows = [...pendingRows, ...approvedRows].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  els.salesWrap.innerHTML = rows.length ? `
    <table>
      <thead><tr><th>Fecha</th><th>Inmueble / proyecto</th><th>Monto</th><th>Comisión</th><th>Estado</th></tr></thead>
      <tbody>
        ${rows.map(sale => `
          <tr>
            <td data-label="Fecha">${escapeHtml(formatDate(sale.date))}</td>
            <td data-label="Activo">${escapeHtml(sale.name || 'Venta REDEX')}</td>
            <td data-label="Monto">${escapeHtml(money(sale.amount, 'DOP'))}</td>
            <td data-label="Comisión">${sale.pending ? 'En revisión' : escapeHtml(money(sale.commission, 'DOP'))}</td>
            <td data-label="Estado"><span class="${sale.status === 'Liquidada' ? 'status-ok' : 'status-pend'}">${escapeHtml(sale.status)}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<div class="empty">Todavía no hay ventas aprobadas para este asesor.</div>';
}

function commissionRows() {
  const reportRows = state.saleReports.map(report => ({
    date: report.fecha_venta || report.created_at,
    name: report.activo_nombre,
    saleAmount: Number(report.precio_final || 0),
    commission: estimatedCommission(report.precio_final),
    status: 'En revisión',
    source: 'Reporte pendiente'
  }));
  const saleRows = state.sales.map(sale => ({
    date: sale.fecha_venta,
    name: sale.activo_nombre,
    saleAmount: Number(sale.monto_venta || 0),
    commission: Number(sale.beneficio_vendedor || 0),
    status: sale.estado_liquidacion || 'Pendiente',
    source: 'Venta aprobada'
  }));
  return [...reportRows, ...saleRows].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

function renderCommissions() {
  if (!els.commissionsWrap) return;
  const rows = commissionRows();
  const total = state.sales.reduce((sum, sale) => sum + Number(sale.beneficio_vendedor || 0), 0);
  const pending = state.sales
    .filter(sale => (sale.estado_liquidacion || 'Pendiente') === 'Pendiente')
    .reduce((sum, sale) => sum + Number(sale.beneficio_vendedor || 0), 0);
  const partial = state.sales
    .filter(sale => sale.estado_liquidacion === 'Parcial')
    .reduce((sum, sale) => sum + Number(sale.beneficio_vendedor || 0), 0);
  const paid = state.sales
    .filter(sale => sale.estado_liquidacion === 'Liquidada')
    .reduce((sum, sale) => sum + Number(sale.beneficio_vendedor || 0), 0);
  const review = state.saleReports
    .filter(report => (report.estado_revision || 'Pendiente') === 'Pendiente')
    .reduce((sum, report) => sum + estimatedCommission(report.precio_final), 0);
  const month = rows
    .filter(row => isCurrentMonth(row.date))
    .reduce((sum, row) => sum + Number(row.commission || 0), 0);

  if (els.commissionMonth) els.commissionMonth.textContent = money(month, 'DOP');
  if (els.commissionPending) els.commissionPending.textContent = money(pending, 'DOP');
  if (els.commissionPaid) els.commissionPaid.textContent = money(paid, 'DOP');
  if (els.commissionReview) els.commissionReview.textContent = money(review, 'DOP');
  if (els.commissionPartial) els.commissionPartial.textContent = money(partial, 'DOP');
  if (els.commissionTotal) els.commissionTotal.textContent = money(total, 'DOP');

  els.commissionsWrap.innerHTML = rows.length ? `
    <table>
      <thead><tr><th>Fecha</th><th>Inmueble / proyecto</th><th>Venta</th><th>Comisión</th><th>Estado</th><th>Fuente</th></tr></thead>
      <tbody>
        ${rows.map(row => `
          <tr>
            <td data-label="Fecha">${escapeHtml(formatDate(row.date))}</td>
            <td data-label="Activo">${escapeHtml(row.name || 'Venta REDEX')}</td>
            <td data-label="Venta">${escapeHtml(money(row.saleAmount, 'DOP'))}</td>
            <td data-label="Comisión">${escapeHtml(row.status === 'En revisión' && !advisorCommissionPercent() ? 'Por definir' : money(row.commission, 'DOP'))}</td>
            <td data-label="Estado"><span class="${row.status === 'Liquidada' ? 'status-ok' : row.status === 'En revisión' ? 'status-pend' : 'status-pend'}">${escapeHtml(row.status)}</span></td>
            <td data-label="Fuente">${escapeHtml(row.source)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : '<div class="empty">Todavía no hay comisiones asociadas a este asesor.</div>';
}

function renderRanking() {
  if (!els.rankingList) return;
  const rows = state.ranking || [];
  const current = rows.find(row => isCurrentAdvisorRankingRow(row));
  const star = rows.find(row => Number(row.ventas_total || 0) > 0) || rows[0];

  if (star) {
    if (els.rankingStarPhoto) els.rankingStarPhoto.src = star.foto_url || 'logo-redex-color.png';
    if (els.rankingStarName) els.rankingStarName.textContent = star.asesor_nombre || 'Asesor REDEX';
    if (els.rankingStarSummary) {
      const starIsCurrent = isCurrentAdvisorRankingRow(star);
      els.rankingStarSummary.textContent = starIsCurrent
        ? `${Number(star.ventas_total || 0)} ventas · ${money(star.comision_total, 'DOP')} en tu comisión del mes · ${Number(star.leads_total || 0)} leads.`
        : `Top 1 del mes · ${Number(star.ventas_total || 0)} ventas · ${Number(star.leads_total || 0)} leads.`;
    }
  }

  if (els.rankingMyPosition) els.rankingMyPosition.textContent = current ? `#${current.posicion}` : '-';
  if (els.rankingMySales) els.rankingMySales.textContent = String(current?.ventas_total || 0);
  if (els.rankingMyCommission) els.rankingMyCommission.textContent = money(current?.comision_total || 0, 'DOP');

  els.rankingList.innerHTML = rows.length ? rows.slice(0, 3).map(row => {
    const isCurrent = isCurrentAdvisorRankingRow(row);
    return `
      <article class="rank-row ${isCurrent ? 'current' : ''}">
        <div class="rank-pos">#${row.posicion}</div>
        <img class="rank-avatar" src="${escapeHtml(row.foto_url || 'logo-redex-color.png')}" alt="${escapeHtml(row.asesor_nombre || 'Asesor REDEX')}">
        <div class="rank-name">
          <strong>${escapeHtml(row.asesor_nombre || 'Asesor REDEX')}</strong>
          <span>${escapeHtml(row.asesor_slug ? `@${row.asesor_slug}` : '')}${isCurrent ? ' · Tu posición' : ''}</span>
        </div>
        <div class="rank-metric"><span>Ventas</span><strong>${escapeHtml(row.ventas_total || 0)}</strong></div>
        <div class="rank-metric"><span>Leads</span><strong>${escapeHtml(row.leads_total || 0)}</strong></div>
      </article>
    `;
  }).join('') : '<div class="empty">Todavía no hay asesores activos para mostrar ranking.</div>';
}

function selectedSaleAsset() {
  const [kind, id] = String(els.saleAsset?.value || '').split(':');
  const source = kind === 'proyecto' ? state.projects : state.properties;
  const item = source.find(asset => String(asset.id) === String(id));
  return item ? { kind, item } : null;
}

async function submitAdvisorSale(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  const selected = selectedSaleAsset();
  if (!selected) {
    showStatus(els.saleStatus, 'Selecciona una propiedad o proyecto.', 'error');
    return;
  }

  const finalPrice = numberValue(formData.get('precio_final'));
  const clientName = String(formData.get('cliente_nombre') || '').trim();
  const clientPhone = String(formData.get('cliente_telefono') || '').trim();
  if (!finalPrice || !clientName || !clientPhone) {
    showStatus(els.saleStatus, 'Completa cliente, teléfono y precio final.', 'error');
    return;
  }

  submit.disabled = true;
  submit.textContent = 'Enviando...';
  showStatus(els.saleStatus, '');

  try {
    const token = makeToken();
    const linkPayload = {
      token,
      tipo_activo: selected.kind,
      propiedad_id: selected.kind === 'propiedad' ? selected.item.id : null,
      proyecto_id: selected.kind === 'proyecto' ? selected.item.id : null,
      activo_nombre: selected.item.nombre,
      asesor_id: state.advisor.id,
      asesor_slug: advisorSlug(),
      asesor_nombre: state.advisor.nombre,
      expires_at: new Date(Date.now() + 30 * 86400000).toISOString()
    };
    const { error: linkError } = await supabase.from('ventas_links').insert(linkPayload);
    if (linkError) throw linkError;

    const assetDetails = String(formData.get('detalles_activo') || '').trim();
    const notes = String(formData.get('notas') || '').trim();
    const reportPayload = {
      p_token: token,
      p_vendedor_nombre: state.advisor.nombre || '',
      p_vendedor_telefono: state.advisor.telefono || state.advisor.whatsapp || '',
      p_vendedor_correo: state.advisor.email || state.session?.user?.email || '',
      p_cliente_nombre: clientName,
      p_cliente_telefono: clientPhone,
      p_cliente_correo: String(formData.get('cliente_correo') || '').trim(),
      p_cliente_ubicacion: String(formData.get('cliente_ubicacion') || '').trim(),
      p_fecha_venta: String(formData.get('fecha_venta') || new Date().toISOString().slice(0, 10)),
      p_precio_final: finalPrice,
      p_monto_inicial: numberValue(formData.get('monto_inicial')) || null,
      p_forma_pago: String(formData.get('forma_pago') || 'contado'),
      p_banco_entidad: String(formData.get('banco_entidad') || '').trim(),
      p_porcentaje_interes: numberValue(formData.get('porcentaje_interes')) || null,
      p_plazo_financiamiento: String(formData.get('plazo_financiamiento') || '').trim(),
      p_metraje: selected.item.metraje || '',
      p_ubicacion_inmueble: [selected.item.ciudad, selected.item.sector].filter(Boolean).join(', '),
      p_notas: [
        assetDetails ? `Otros detalles del inmueble o proyecto: ${assetDetails}` : '',
        notes
      ].filter(Boolean).join('\n\n')
    };
    const { data, error: reportError } = await supabase.rpc('crear_reporte_venta', reportPayload);
    if (reportError) throw reportError;
    if (!data?.ok) throw new Error(data?.message || 'No se pudo registrar la venta.');

    const { error: updateError } = await supabase
      .from('ventas_reportadas')
      .update({ asesor_id: state.advisor.id, asesor_slug: advisorSlug() })
      .eq('id', data.reporte_id);
    if (updateError) throw updateError;

    form.reset();
    if (els.saleDate) els.saleDate.value = new Date().toISOString().slice(0, 10);
    showStatus(els.saleStatus, 'Venta enviada al CMS para aprobación.', 'success');
    await loadData();
    renderDashboard();
    renderSales();
    renderCommissions();
    renderSaleAssetOptions();
  } catch (error) {
    showStatus(els.saleStatus, error.message || 'No se pudo enviar la venta.', 'error');
  } finally {
    submit.disabled = false;
    submit.textContent = 'Enviar venta para aprobación';
  }
}

function renderCalculator() {
  const price = numberValue(els.calcPrice.value);
  const down = numberValue(els.calcDown.value);
  const annualRate = numberValue(els.calcRate.value) / 100;
  const years = Math.max(1, numberValue(els.calcYears.value));
  const principal = Math.max(0, price - down);
  const monthlyRate = annualRate / 12;
  const months = years * 12;
  const payment = monthlyRate > 0
    ? principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
    : principal / months;
  els.calcResult.textContent = `${money(payment, 'DOP')} / mes`;
  const selected = selectedCalcAsset();
  const client = els.calcClientName?.value?.trim() || 'Cliente';
  const assetName = selected?.item?.nombre || 'Inmueble REDEX';
  const summary = [
    `Hola ${client}, soy ${state.advisor?.nombre || 'tu asesor REDEX'}.`,
    '',
    `Te comparto una simulación para: ${assetName}`,
    `Precio: ${money(price, 'DOP')}`,
    `Inicial: ${money(down, 'DOP')}`,
    `Monto a financiar: ${money(principal, 'DOP')}`,
    `Plazo: ${years} años`,
    `Interés anual estimado: ${Number(els.calcRate.value || 0)}%`,
    `Cuota estimada: ${money(payment, 'DOP')} mensual`,
    '',
    'Esta simulación es referencial y puede variar según evaluación financiera.'
  ].join('\n');
  if (els.proposalSummary) els.proposalSummary.value = summary;
  const phone = String(els.calcClientPhone?.value || '').replace(/[^\d]/g, '');
  const normalized = phone.length === 10 ? `1${phone}` : phone;
  if (els.sendProposalWhatsapp) {
    els.sendProposalWhatsapp.href = normalized ? `https://wa.me/${normalized}?text=${encodeURIComponent(summary)}` : '#';
  }
}

function selectedCalcAsset() {
  const [kind, id] = String(els.calcAsset?.value || '').split(':');
  const source = kind === 'proyecto' ? state.projects : state.properties;
  const item = source.find(asset => String(asset.id) === String(id));
  return item ? { kind, item } : null;
}

async function copyProposal() {
  const summary = els.proposalSummary?.value || '';
  if (!summary) return;
  await navigator.clipboard.writeText(summary);
  showStatus(els.proposalStatus, 'Resumen copiado.', 'success');
}

async function saveProposal() {
  const selected = selectedCalcAsset();
  const clientName = els.calcClientName?.value?.trim();
  const clientPhone = els.calcClientPhone?.value?.trim();
  if (!clientName || !clientPhone) {
    showStatus(els.proposalStatus, 'Coloca nombre y teléfono del cliente.', 'error');
    return;
  }
  if (!selected) {
    showStatus(els.proposalStatus, 'Selecciona una propiedad o proyecto.', 'error');
    return;
  }
  const price = numberValue(els.calcPrice.value);
  const down = numberValue(els.calcDown.value);
  const annualRate = numberValue(els.calcRate.value);
  const years = Math.max(1, numberValue(els.calcYears.value));
  const principal = Math.max(0, price - down);
  const monthly = numberValue(els.calcResult.textContent);
  const payload = {
    tipo: 'propuesta_asesor',
    pagina: 'portal-asesor',
    origen_url: window.location.href,
    nombre: clientName,
    telefono: clientPhone,
    email: '',
    interes: selected.item.nombre,
    mensaje: els.proposalSummary?.value || '',
    estado: 'En proceso',
    asesor_id: state.advisor.id,
    asesor_slug: advisorSlug(),
    asesor_nombre: state.advisor.nombre,
    datos: {
      propuesta: true,
      activo_tipo: selected.kind,
      activo_id: selected.item.id,
      activo_nombre: selected.item.nombre,
      precio: price,
      inicial: down,
      monto_financiado: principal,
      interes_anual: annualRate,
      plazo_anios: years,
      cuota_estimada: monthly,
      resumen: els.proposalSummary?.value || '',
      asesor_nombre: state.advisor.nombre,
      asesor_slug: advisorSlug()
    }
  };
  els.saveProposalBtn.disabled = true;
  els.saveProposalBtn.textContent = 'Guardando...';
  showStatus(els.proposalStatus, '');
  try {
    const { error } = await supabase.from('solicitudes').insert(payload);
    if (error) throw error;
    showStatus(els.proposalStatus, 'Propuesta guardada en el CMS.', 'success');
    await loadData();
    renderDashboard();
    renderLeads();
  } catch (error) {
    showStatus(els.proposalStatus, error.message || 'No se pudo guardar la propuesta.', 'error');
  } finally {
    els.saveProposalBtn.disabled = false;
    els.saveProposalBtn.textContent = 'Guardar propuesta';
  }
}

function renderAll() {
  renderProfile();
  renderDashboard();
  renderCatalogCities();
  renderCatalog();
  renderSaleAssetOptions();
  renderCalcAssetOptions();
  renderLeads();
  renderSales();
  renderCommissions();
  renderRanking();
  renderCalculator();
}

function showPortal() {
  document.body.className = 'ready';
  els.loginShell.hidden = true;
  els.sidebar.hidden = false;
  els.portalShell.hidden = false;
}

function showLogin(message = '') {
  document.body.className = 'locked';
  els.loginShell.hidden = false;
  els.sidebar.hidden = true;
  els.portalShell.hidden = true;
  showStatus(els.loginStatus, message, message ? 'error' : '');
}

async function openSession(session) {
  state.session = session;
  state.advisor = await loadAdvisor(session);
  await loadData();
  showPortal();
  renderAll();
}

async function handleLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = form.querySelector('button[type="submit"]');
  const email = form.elements.email.value.trim();
  const password = form.elements.password.value;
  submit.disabled = true;
  submit.textContent = 'Verificando...';
  showStatus(els.loginStatus, '');
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await openSession(data.session);
  } catch (error) {
    await supabase.auth.signOut();
    showLogin(error.message || 'No se pudo iniciar sesión.');
  } finally {
    submit.disabled = false;
    submit.textContent = 'Entrar al portal';
  }
}

async function logout() {
  await supabase.auth.signOut();
  showLogin('');
}

function bindPhotoCropper() {
  els.profilePhotoFile?.addEventListener('change', event => {
    const file = event.target.files?.[0];
    state.photoCrop.croppedFile = null;
    if (file) openPhotoCropper(file).catch(error => showStatus(els.profilePhotoStatus, error.message, 'error'));
  });

  els.profilePhotoCropCurrent?.addEventListener('click', async () => {
    els.profilePhotoCropCurrent.disabled = true;
    try {
      state.photoCrop.croppedFile = null;
      await openCurrentProfilePhotoCropper();
    } catch (error) {
      showStatus(els.profilePhotoStatus, error.message || 'No se pudo abrir la foto actual.', 'error');
    } finally {
      els.profilePhotoCropCurrent.disabled = false;
    }
  });

  els.photoCropZoom?.addEventListener('input', event => setPhotoCropZoom(event.target.value));
  els.photoCropCancel?.addEventListener('click', () => {
    state.photoCrop.croppedFile = null;
    closePhotoCropper(true);
    showStatus(els.profilePhotoStatus, 'Cambio de fotografía cancelado.');
  });
  els.photoCropConfirm?.addEventListener('click', async () => {
    try {
      const croppedFile = await makeCroppedProfileFile();
      state.photoCrop.croppedFile = croppedFile;
      closePhotoCropper(false);
      showStatus(els.profilePhotoStatus, 'Recorte listo. Pulsa “Actualizar foto” para guardarlo.', 'success');
    } catch (error) {
      showStatus(els.profilePhotoStatus, error.message || 'No se pudo preparar el recorte.', 'error');
    }
  });

  const stage = els.photoCropStage;
  if (!stage) return;
  stage.addEventListener('pointerdown', event => {
    if (!state.photoCrop.image) return;
    event.preventDefault();
    stage.setPointerCapture?.(event.pointerId);
    state.photoCrop.dragging = true;
    state.photoCrop.startX = event.clientX;
    state.photoCrop.startY = event.clientY;
    state.photoCrop.originX = state.photoCrop.x;
    state.photoCrop.originY = state.photoCrop.y;
    stage.classList.add('dragging');
  });
  stage.addEventListener('pointermove', event => {
    if (!state.photoCrop.dragging) return;
    event.preventDefault();
    state.photoCrop.x = state.photoCrop.originX + (event.clientX - state.photoCrop.startX);
    state.photoCrop.y = state.photoCrop.originY + (event.clientY - state.photoCrop.startY);
    renderPhotoCrop();
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(type => {
    stage.addEventListener(type, event => {
      if (!state.photoCrop.dragging) return;
      stage.releasePointerCapture?.(event.pointerId);
      state.photoCrop.dragging = false;
      stage.classList.remove('dragging');
      renderPhotoCrop();
    });
  });
}

function bindEvents() {
  els.loginForm?.addEventListener('submit', handleLogin);
  els.logoutBtn?.addEventListener('click', logout);
  els.mobileMenuBtn?.addEventListener('click', () => els.sidebar?.classList.toggle('open'));
  bindPhotoCropper();
  document.querySelectorAll('.sb-link').forEach(link => {
    link.addEventListener('click', () => setPanel(link.dataset.panel, link));
  });
  els.copyMainLink?.addEventListener('click', () => copyText(advisorLink('/')));
  els.copyKycLink?.addEventListener('click', () => copyText(kycLink()));
  els.copyCaptureLink?.addEventListener('click', () => copyText(captureLink()));
  els.dashboardCopyKyc?.addEventListener('click', () => copyText(kycLink()));
  els.dashboardCopyCapture?.addEventListener('click', () => copyText(captureLink()));
  els.dashboardCopyMain?.addEventListener('click', () => copyText(advisorLink('/')));
  els.catalogSearch?.addEventListener('input', event => {
    state.catalogSearch = event.target.value.trim();
    renderCatalog();
  });
  els.catalogType?.addEventListener('change', event => {
    state.catalogType = event.target.value;
    renderCatalog();
  });
  els.catalogCity?.addEventListener('change', event => {
    state.catalogCity = event.target.value;
    renderCatalog();
  });
  els.catalogGrid?.addEventListener('click', event => {
    const button = event.target.closest('[data-copy]');
    if (button) copyText(button.dataset.copy);
  });
  els.leadSearch?.addEventListener('input', event => {
    state.leadFilters.query = event.target.value.trim();
    state.selectedLeadId = null;
    renderLeads();
  });
  els.leadStatusFilter?.addEventListener('change', event => {
    state.leadFilters.estado = event.target.value;
    state.selectedLeadId = null;
    renderLeads();
  });
  els.leadDateFilter?.addEventListener('change', event => {
    state.leadFilters.fecha = event.target.value;
    state.selectedLeadId = null;
    renderLeads();
  });
  els.exportLeadsBtn?.addEventListener('click', exportLeads);
  els.leadsWrap?.addEventListener('click', event => {
    const action = event.target.closest('[data-lead-action]');
    if (!action) return;
    const id = action.dataset.id;
    if (action.dataset.leadAction === 'view') {
      state.selectedLeadId = id;
      renderLeadDetail();
    }
  });
  els.leadDetail?.addEventListener('click', event => {
    const action = event.target.closest('[data-lead-action]');
    if (!action) return;
    if (action.dataset.leadAction === 'copy') copyLeadData(action.dataset.id);
  });
  els.saleForm?.addEventListener('submit', submitAdvisorSale);
  els.profilePhotoForm?.addEventListener('submit', handleProfilePhotoSubmit);
  els.profileInfoForm?.addEventListener('submit', handleProfileInfoSubmit);
  els.profileSocialForm?.addEventListener('submit', handleProfileSocialSubmit);
  [els.calcPrice, els.calcDown, els.calcRate, els.calcYears, els.calcClientName, els.calcClientPhone].forEach(input => {
    input?.addEventListener('input', renderCalculator);
  });
  els.calcAsset?.addEventListener('change', renderCalculator);
  els.copyProposalBtn?.addEventListener('click', copyProposal);
  els.saveProposalBtn?.addEventListener('click', saveProposal);
}

async function init() {
  bindEvents();
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    showLogin('');
    return;
  }
  try {
    await openSession(data.session);
  } catch (error) {
    await supabase.auth.signOut();
    showLogin(error.message || 'No se pudo abrir el portal.');
  }
}

init();
