import {
  createClient,
  supabase,
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  PROPERTIES_TABLE,
  PROPERTIES_BUCKET,
  PROJECTS_TABLE,
  PROJECTS_BUCKET,
  WEB_PAGES_TABLE,
  WEB_SECTIONS_TABLE,
  WEB_CONTENT_BUCKET,
  SALES_TABLE,
  SALES_LINKS_TABLE,
  SALES_REPORTS_TABLE,
  LEADS_TABLE,
  ADVISORS_TABLE,
  isSupabaseConfigured
} from './supabase-config.js';
import { requireSession } from './auth.js';

const state = {
  properties: [],
  filtered: [],
  projects: [],
  filteredProjects: [],
  webSections: [],
  filteredWebSections: [],
  webPages: [],
  sales: [],
  filteredSales: [],
  salesReports: [],
  leads: [],
  filteredLeads: [],
  advisors: [],
  filteredAdvisors: [],
  editingId: null,
  editingProjectId: null,
  editingWebSectionId: null,
  editingSaleId: null,
  editingAdvisorId: null,
  selectedStatusId: null,
  selectedProjectStatusId: null,
  activeModule: 'properties',
  filters: {
    query: '',
    ciudad: 'todos',
    tipo: 'todos',
    estado: 'todos',
    visibilidad: 'todos'
  },
  projectFilters: {
    query: '',
    estado: 'todos',
    visibilidad: 'todos'
  },
  webFilters: {
    query: '',
    pagina: 'todas',
    visibilidad: 'todas'
  },
  salesFilters: {
    query: '',
    tipo: 'todos',
    liquidacion: 'todos',
    dateFrom: '',
    dateTo: '',
    order: 'desc'
  },
  leadFilters: {
    query: '',
    tipo: 'todos',
    estado: 'todos'
  },
  advisorFilters: {
    query: '',
    estado: 'todos'
  }
};

const DEFAULT_ADVISOR_PASSWORD = 'Redex2026';

const els = {
  guardMessage: document.getElementById('guard-message'),
  total: document.getElementById('metric-total'),
  disponibles: document.getElementById('metric-disponibles'),
  reservadas: document.getElementById('metric-reservadas'),
  vendidas: document.getElementById('metric-vendidas'),
  propertiesSection: document.getElementById('properties-section'),
  propertiesTable: document.getElementById('properties-table-body'),
  emptyState: document.getElementById('empty-state'),
  manageBtn: document.getElementById('manage-properties-btn'),
  refreshBtn: document.getElementById('refresh-btn'),
  createBtn: document.getElementById('create-property-btn'),
  search: document.getElementById('property-search'),
  cityFilter: document.getElementById('city-filter'),
  typeFilter: document.getElementById('type-filter'),
  statusFilter: document.getElementById('status-filter'),
  visibilityFilter: document.getElementById('visibility-filter'),
  projectTotal: document.getElementById('metric-project-total'),
  projectDisponibles: document.getElementById('metric-project-disponibles'),
  projectReservados: document.getElementById('metric-project-reservados'),
  projectVendidos: document.getElementById('metric-project-vendidos'),
  moduleTabs: document.querySelectorAll('[data-module-tab]'),
  projectsMetrics: document.getElementById('projects-metrics'),
  projectsSection: document.getElementById('projects-section'),
  manageProjectsBtn: document.getElementById('manage-projects-btn'),
  manageWebContentBtn: document.getElementById('manage-web-content-btn'),
  projectsTable: document.getElementById('projects-table-body'),
  projectsEmptyState: document.getElementById('projects-empty-state'),
  createProjectBtn: document.getElementById('create-project-btn'),
  projectSearch: document.getElementById('project-search'),
  projectStatusFilter: document.getElementById('project-status-filter'),
  projectVisibilityFilter: document.getElementById('project-visibility-filter'),
  webContentSection: document.getElementById('web-content-section'),
  webContentTable: document.getElementById('web-content-table-body'),
  webContentEmptyState: document.getElementById('web-content-empty-state'),
  webContentSearch: document.getElementById('web-content-search'),
  webPageFilter: document.getElementById('web-page-filter'),
  webVisibilityFilter: document.getElementById('web-visibility-filter'),
  salesMetrics: document.getElementById('sales-metrics'),
  salesTotal: document.getElementById('metric-sales-total'),
  salesCompany: document.getElementById('metric-sales-company'),
  salesSellers: document.getElementById('metric-sales-sellers'),
  salesCosts: document.getElementById('metric-sales-costs'),
  salesTopSeller: document.getElementById('metric-sales-top-seller'),
  salesTopSellerAmount: document.getElementById('metric-sales-top-seller-amount'),
  salesSection: document.getElementById('sales-section'),
  salesTable: document.getElementById('sales-table-body'),
  salesEmptyState: document.getElementById('sales-empty-state'),
  salesReportsTable: document.getElementById('sales-reports-table-body'),
  salesReportsEmptyState: document.getElementById('sales-reports-empty-state'),
  manageSalesBtn: document.getElementById('manage-sales-btn'),
  createSaleBtn: document.getElementById('create-sale-btn'),
  generateSaleLinkBtn: document.getElementById('generate-sale-link-btn'),
  salesSearch: document.getElementById('sales-search'),
  salesTypeFilter: document.getElementById('sales-type-filter'),
  salesSettlementFilter: document.getElementById('sales-settlement-filter'),
  salesDateFrom: document.getElementById('sales-date-from'),
  salesDateTo: document.getElementById('sales-date-to'),
  salesOrderFilter: document.getElementById('sales-order-filter'),
  downloadSalesReportBtn: document.getElementById('download-sales-report-btn'),
  salesDayTitle: document.getElementById('sales-day-title'),
  salesDayCount: document.getElementById('sales-day-count'),
  salesDayProperties: document.getElementById('sales-day-properties'),
  salesDayProjects: document.getElementById('sales-day-projects'),
  salesDayAmount: document.getElementById('sales-day-amount'),
  salesDayCompany: document.getElementById('sales-day-company'),
  salesDaySellers: document.getElementById('sales-day-sellers'),
  propertyModal: document.getElementById('property-modal'),
  propertyForm: document.getElementById('property-form'),
  propertyModalTitle: document.getElementById('property-modal-title'),
  currentCover: document.getElementById('current-cover'),
  galleryManager: document.getElementById('gallery-manager'),
  videosManager: document.getElementById('videos-manager'),
  previewBtn: document.getElementById('preview-property-btn'),
  previewModal: document.getElementById('preview-modal'),
  previewContent: document.getElementById('preview-content'),
  propertyStatus: document.getElementById('property-status'),
  statusModal: document.getElementById('status-modal'),
  statusForm: document.getElementById('status-form'),
  statusSelect: document.getElementById('status-select'),
  projectModal: document.getElementById('project-modal'),
  projectForm: document.getElementById('project-form'),
  projectModalTitle: document.getElementById('project-modal-title'),
  projectCurrentCover: document.getElementById('project-current-cover'),
  projectGalleryManager: document.getElementById('project-gallery-manager'),
  projectVideosManager: document.getElementById('project-videos-manager'),
  projectPreviewBtn: document.getElementById('preview-project-btn'),
  projectStatusModal: document.getElementById('project-status-modal'),
  projectStatusForm: document.getElementById('project-status-form'),
  projectStatusSelect: document.getElementById('project-status-select'),
  webContentModal: document.getElementById('web-content-modal'),
  webContentForm: document.getElementById('web-content-form'),
  webContentModalTitle: document.getElementById('web-content-modal-title'),
  webContentPreviewBtn: document.getElementById('preview-web-content-btn'),
  saleModal: document.getElementById('sale-modal'),
  saleForm: document.getElementById('sale-form'),
  saleModalTitle: document.getElementById('sale-modal-title'),
  saleAssetType: document.getElementById('sale-asset-type'),
  saleAsset: document.getElementById('sale-asset'),
  salePreviewBtn: document.getElementById('preview-sale-btn'),
  saleLinkModal: document.getElementById('sale-link-modal'),
  saleLinkForm: document.getElementById('sale-link-form'),
  saleLinkAssetType: document.getElementById('sale-link-asset-type'),
  saleLinkAsset: document.getElementById('sale-link-asset'),
  saleLinkOutput: document.getElementById('sale-link-output'),
  copySaleLinkBtn: document.getElementById('copy-sale-link-btn'),
  leadsSection: document.getElementById('leads-section'),
  leadsTable: document.getElementById('leads-table-body'),
  leadsEmptyState: document.getElementById('leads-empty-state'),
  manageLeadsBtn: document.getElementById('manage-leads-btn'),
  leadsSearch: document.getElementById('leads-search'),
  leadsTypeFilter: document.getElementById('leads-type-filter'),
  leadsStatusFilter: document.getElementById('leads-status-filter'),
  leadsExportBtn: document.getElementById('leads-export-btn'),
  advisorsSection: document.getElementById('advisors-section'),
  advisorsTable: document.getElementById('advisors-table-body'),
  advisorsEmptyState: document.getElementById('advisors-empty-state'),
  manageAdvisorsBtn: document.getElementById('manage-advisors-btn'),
  createAdvisorBtn: document.getElementById('create-advisor-btn'),
  advisorsSearch: document.getElementById('advisors-search'),
  advisorsStatusFilter: document.getElementById('advisors-status-filter'),
  advisorModal: document.getElementById('advisor-modal'),
  advisorForm: document.getElementById('advisor-form'),
  advisorModalTitle: document.getElementById('advisor-modal-title'),
  advisorPreviewBtn: document.getElementById('preview-advisor-btn'),
  advisorPhotoPreview: document.getElementById('advisor-photo-preview'),
  toast: document.getElementById('toast')
};

let previewObjectUrl = '';
let advisorPhotoObjectUrl = '';
let activeModal = null;
let modalStack = [];
const modalFocus = new Map();

function toast(message, type = 'success') {
  if (!els.toast) return;
  els.toast.textContent = message;
  els.toast.className = `toast show ${type}`;
  setTimeout(() => {
    els.toast.className = 'toast';
  }, 3200);
}

function normalizeStatus(status) {
  const value = String(status || 'Disponible').trim();
  if (['Disponible', 'Reservado', 'Vendido'].includes(value)) return value;
  return 'Disponible';
}

function normalizeProjectStatus(status) {
  const value = String(status || 'Disponible').trim();
  if (['Disponible', 'Reservado', 'Vendido', 'En Construcción'].includes(value)) return value;
  return 'Disponible';
}

function statusClass(status) {
  return slugify(status || 'disponible');
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

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
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

function setMetric(el, value) {
  if (el) el.textContent = new Intl.NumberFormat('es-DO').format(value);
}

function money(value, currency = 'DOP') {
  const amount = Number(value || 0);
  const formatter = new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: currency || 'DOP',
    maximumFractionDigits: 0
  });
  return formatter.format(Number.isFinite(amount) ? amount : 0);
}

function normalizeCurrency(value) {
  return String(value || 'DOP').toUpperCase() === 'USD' ? 'USD' : 'DOP';
}

function groupedMoney(totals) {
  const dop = Number(totals?.DOP || 0);
  const usd = Number(totals?.USD || 0);
  const values = [];
  if (dop || !usd) values.push(money(dop, 'DOP'));
  if (usd) values.push(money(usd, 'USD'));
  return values.join(' / ');
}

function propertyPrice(value, currency = 'DOP') {
  if (value === null || value === undefined || value === '') return 'Consultar';
  if (typeof value === 'number') return money(value, currency);

  const raw = String(value).trim();
  if (!raw) return 'Consultar';
  if (/consultar|pendiente|disponible con asesor/i.test(raw)) return raw;
  if (/(RD\$|US\$|USD|DOP|\$)/i.test(raw)) return raw;

  const normalized = raw.replace(/[^\d.,-]/g, '').replace(/,/g, '');
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount <= 0) return raw;
  return money(amount, currency);
}

function isoToday() {
  return new Date().toISOString().slice(0, 10);
}

function prettyDate(dateValue) {
  const date = dateValue ? new Date(`${dateValue}T00:00:00`) : new Date();
  if (Number.isNaN(date.getTime())) return dateValue || '';
  return new Intl.DateTimeFormat('es-DO', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(date);
}

function renderMetrics() {
  const total = state.properties.length;
  const disponibles = state.properties.filter(p => normalizeStatus(p.estado) === 'Disponible').length;
  const reservadas = state.properties.filter(p => normalizeStatus(p.estado) === 'Reservado').length;
  const vendidas = state.properties.filter(p => normalizeStatus(p.estado) === 'Vendido').length;

  setMetric(els.total, total);
  setMetric(els.disponibles, disponibles);
  setMetric(els.reservadas, reservadas);
  setMetric(els.vendidas, vendidas);
}

function uniquePropertyOptions(key) {
  return [...new Set(
    state.properties
      .map(property => String(property?.[key] || '').trim())
      .filter(Boolean)
  )].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }));
}

function renderSelectOptions(select, values, defaultLabel, currentValue) {
  if (!select) return;
  const current = currentValue || select.value || 'todos';
  select.innerHTML = `<option value="todos">${defaultLabel}</option>` + values.map(value => (
    `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`
  )).join('');
  select.value = [...select.options].some(option => option.value === current) ? current : 'todos';
}

function renderPropertyFilterOptions() {
  renderSelectOptions(els.cityFilter, uniquePropertyOptions('ciudad'), 'Todas las ciudades', state.filters.ciudad);
  renderSelectOptions(els.typeFilter, uniquePropertyOptions('tipo'), 'Todos los tipos', state.filters.tipo);
}

function applyFilters() {
  const query = state.filters.query.toLowerCase();

  state.filtered = state.properties.filter(property => {
    const status = normalizeStatus(property.estado);
    const visible = property.visible !== false;
    const destacado = property.destacado === true;
    const searchable = [
      property.nombre,
      property.slug,
      property.ciudad,
      property.sector,
      property.tipo,
      property.precio,
      property.asesor_nombre
    ].join(' ').toLowerCase();

    if (query && !searchable.includes(query)) return false;
    if (state.filters.ciudad !== 'todos' && property.ciudad !== state.filters.ciudad) return false;
    if (state.filters.tipo !== 'todos' && property.tipo !== state.filters.tipo) return false;
    if (state.filters.estado !== 'todos' && status !== state.filters.estado) return false;
    if (state.filters.visibilidad === 'visible' && !visible) return false;
    if (state.filters.visibilidad === 'oculta' && visible) return false;
    if (state.filters.visibilidad === 'destacada' && !destacado) return false;
    return true;
  });
}

function renderProperties() {
  if (!els.propertiesTable) return;

  applyFilters();

  els.propertiesTable.innerHTML = state.filtered.map(property => {
    const status = normalizeStatus(property.estado);
    const image = property.imagen_portada || '../hero_bg.png';
    const visible = property.visible !== false;
    const destacado = property.destacado === true;

    return `
      <tr>
        <td>
          <div class="property-cell">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(property.nombre)}" onerror="this.src='../hero_bg.png'">
            <div>
              <strong>${escapeHtml(property.nombre || 'Sin nombre')}</strong>
              <span>${escapeHtml(property.ciudad || 'Consultar')}${property.sector ? ' · ' + escapeHtml(property.sector) : ''}</span>
            </div>
          </div>
        </td>
        <td>${escapeHtml(property.tipo || 'Inmueble')}</td>
        <td>${escapeHtml(propertyPrice(property.precio, property.moneda || 'DOP'))}</td>
        <td><span class="status-pill ${statusClass(status)}">${status}</span></td>
        <td>
          <div class="publish-flags">
            <span class="flag ${visible ? 'on' : 'off'}">${visible ? 'Visible' : 'Oculta'}</span>
            ${destacado ? '<span class="flag featured">Destacada</span>' : ''}
          </div>
        </td>
        <td>
          <div class="table-actions">
            <button class="ghost-btn" data-action="view" data-id="${property.id}">Ver</button>
            <button class="ghost-btn" data-action="edit" data-id="${property.id}">Editar</button>
            <button class="ghost-btn" data-action="duplicate" data-id="${property.id}">Duplicar</button>
            <button class="ghost-btn" data-action="status" data-id="${property.id}">Estado</button>
            <button class="ghost-btn" data-action="toggle-featured" data-id="${property.id}">${destacado ? 'No destacar' : 'Destacar'}</button>
            <button class="ghost-btn" data-action="toggle-visible" data-id="${property.id}">${visible ? 'Ocultar' : 'Mostrar'}</button>
            <button class="danger-btn" data-action="delete" data-id="${property.id}">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (els.emptyState) {
    els.emptyState.hidden = state.filtered.length > 0;
  }
}

function openModal(modal) {
  if (!modal) return;
  modalFocus.set(modal, document.activeElement);
  modalStack = modalStack.filter(item => item !== modal);
  modalStack.push(modal);
  activeModal = modal;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  const firstField = getFocusable(modal)[0];
  firstField?.focus();
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('open');
  if (modal === els.previewModal) revokePreviewObjectUrl();
  if (activeModal === modal) {
    const previousFocus = modalFocus.get(modal);
    modalFocus.delete(modal);
    modalStack = modalStack.filter(item => item !== modal);
    activeModal = modalStack[modalStack.length - 1] || null;
    document.body.style.overflow = activeModal ? 'hidden' : '';
    previousFocus?.focus?.();
  }
}

function revokePreviewObjectUrl() {
  if (!previewObjectUrl) return;
  URL.revokeObjectURL(previewObjectUrl);
  previewObjectUrl = '';
}

function getFocusable(container) {
  return Array.from(container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
    .filter(element => element.offsetParent !== null);
}

function keepFocusInsideModal(event) {
  if (!activeModal || event.key !== 'Tab') return;
  const focusable = getFocusable(activeModal);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function resetPropertyForm() {
  state.editingId = null;
  els.propertyForm?.reset();
  if (els.propertyForm?.elements.estado) els.propertyForm.elements.estado.value = 'Disponible';
  if (els.propertyForm?.elements.moneda) els.propertyForm.elements.moneda.value = 'DOP';
  if (els.propertyForm?.elements.visible) els.propertyForm.elements.visible.value = 'true';
  if (els.propertyForm?.elements.destacado) els.propertyForm.elements.destacado.value = 'false';
  if (els.currentCover) els.currentCover.innerHTML = '';
  if (els.galleryManager) els.galleryManager.innerHTML = '';
  if (els.videosManager) els.videosManager.innerHTML = '';
  if (els.propertyModalTitle) els.propertyModalTitle.textContent = 'Crear propiedad';
}

function fillPropertyForm(property) {
  resetPropertyForm();
  state.editingId = property.id;
  if (els.propertyModalTitle) els.propertyModalTitle.textContent = 'Editar propiedad';

  for (const [key, value] of Object.entries(property)) {
    const field = els.propertyForm?.elements[key];
    if (!field || field.type === 'file') continue;
    if (Array.isArray(value)) field.value = value.join('\n');
    else if (typeof value === 'boolean') field.value = String(value);
    else field.value = value ?? '';
  }

  renderMediaManagers();
}

function getPropertyById(id) {
  return state.properties.find(property => String(property.id) === String(id));
}

function fieldList(name) {
  return String(els.propertyForm?.elements[name]?.value || '')
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean);
}

function setFieldList(name, values) {
  const field = els.propertyForm?.elements[name];
  if (!field) return;
  field.value = values.filter(Boolean).join('\n');
}

function shortUrl(url) {
  try {
    const parsed = new URL(url);
    return decodeURIComponent(parsed.pathname.split('/').filter(Boolean).pop() || parsed.hostname);
  } catch (_) {
    return String(url || '').split('/').filter(Boolean).pop() || String(url || '');
  }
}

function renderCurrentCover() {
  if (!els.currentCover) return;
  const cover = els.propertyForm?.elements.imagen_portada?.value;
  if (!cover) {
    els.currentCover.innerHTML = '<p class="preview-note">Sin portada guardada.</p>';
    return;
  }

  els.currentCover.innerHTML = `
    <div class="media-item">
      <img src="${escapeHtml(cover)}" alt="Portada actual" onerror="this.style.display='none'">
      <div class="media-item-body">
        <p>${escapeHtml(shortUrl(cover))}</p>
        <div class="media-actions">
          <button class="ghost-btn" type="button" data-media-action="clear-cover">Quitar portada</button>
        </div>
      </div>
    </div>
  `;
}

function renderGalleryManager() {
  if (!els.galleryManager) return;
  const gallery = fieldList('galeria');
  const cover = els.propertyForm?.elements.imagen_portada?.value;

  if (!gallery.length) {
    els.galleryManager.innerHTML = '<p class="preview-note">Sin imágenes vinculadas.</p>';
    return;
  }

  els.galleryManager.innerHTML = gallery.map((url, index) => `
    <div class="media-item">
      <img src="${escapeHtml(url)}" alt="Imagen ${index + 1}" onerror="this.style.display='none'">
      <div class="media-item-body">
        <p>${escapeHtml(shortUrl(url))}</p>
        <div class="media-actions">
          <button class="ghost-btn" type="button" data-media-action="move-gallery-up" data-index="${index}" ${index === 0 ? 'disabled' : ''}>Subir</button>
          <button class="ghost-btn" type="button" data-media-action="move-gallery-down" data-index="${index}" ${index === gallery.length - 1 ? 'disabled' : ''}>Bajar</button>
          <button class="ghost-btn" type="button" data-media-action="make-cover" data-index="${index}" ${url === cover ? 'disabled' : ''}>Portada</button>
          <button class="danger-btn" type="button" data-media-action="remove-gallery" data-index="${index}">Eliminar</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderVideosManager() {
  if (!els.videosManager) return;
  const videos = fieldList('videos');

  if (!videos.length) {
    els.videosManager.innerHTML = '<p class="preview-note">Sin videos vinculados.</p>';
    return;
  }

  els.videosManager.innerHTML = videos.map((url, index) => `
    <div class="media-row">
      <span>${escapeHtml(shortUrl(url))}</span>
      <button class="danger-btn" type="button" data-media-action="remove-video" data-index="${index}">Eliminar</button>
    </div>
  `).join('');
}

function renderMediaManagers() {
  renderCurrentCover();
  renderGalleryManager();
  renderVideosManager();
}

function arrayPreview(items, fallback = 'Sin registros') {
  const values = asArray(items);
  if (!values.length) return `<p class="preview-note">${fallback}</p>`;
  return `<div class="preview-tags">${values.map(item => `<span>${escapeHtml(item)}</span>`).join('')}</div>`;
}

function buildPreviewHtml(property, mode = 'saved') {
  const status = normalizeStatus(property.estado);
  const visible = property.visible !== false;
  const image = property.imagen_portada || '../hero_bg.png';
  const gallery = asArray(property.galeria);
  const videos = asArray(property.videos);
  const seoKeywords = asArray(property.seo_keywords);

  return `
    <div class="preview-hero">
      <img src="${escapeHtml(image)}" alt="${escapeHtml(property.nombre || 'Propiedad REDEX')}" onerror="this.src='../hero_bg.png'">
      <div class="preview-details">
        <span class="status-pill ${statusClass(status)}">${status}</span>
        <h3>${escapeHtml(property.nombre || 'Sin nombre')}</h3>
        <p class="preview-location">${escapeHtml(property.ciudad || 'Consultar')}${property.sector ? ' · ' + escapeHtml(property.sector) : ''}</p>
        <p class="preview-price">${escapeHtml(propertyPrice(property.precio, property.moneda || 'DOP'))}</p>
        <p class="preview-description">${escapeHtml(property.descripcion || 'Información pendiente de actualización')}</p>
        <div class="preview-grid">
          <div class="preview-metric"><span>Tipo</span><strong>${escapeHtml(property.tipo || 'Inmueble')}</strong></div>
          <div class="preview-metric"><span>Metraje</span><strong>${escapeHtml(property.metraje || 'Consultar')}</strong></div>
          <div class="preview-metric"><span>Hab.</span><strong>${escapeHtml(property.habitaciones || 'Consultar')}</strong></div>
          <div class="preview-metric"><span>Baños</span><strong>${escapeHtml(property.banos || 'Consultar')}</strong></div>
        </div>
        <div class="publish-flags">
          <span class="flag ${visible ? 'on' : 'off'}">${visible ? 'Visible' : 'Oculta'}</span>
          <span class="flag ${property.destacado === true ? 'featured' : 'off'}">${property.destacado === true ? 'Destacada' : 'No destacada'}</span>
          <span class="flag">${mode === 'draft' ? 'Vista sin guardar' : 'Registro guardado'}</span>
        </div>
      </div>
    </div>

    <div class="preview-sections">
      <div class="preview-section">
        <span>Características</span>
        ${arrayPreview(property.caracteristicas)}
      </div>
      <div class="preview-section">
        <span>Amenidades</span>
        ${arrayPreview(property.amenidades)}
      </div>
      <div class="preview-section">
        <span>Galería</span>
        <p>${gallery.length} imagen(es) vinculada(s)</p>
      </div>
      <div class="preview-section">
        <span>Videos</span>
        <p>${videos.length} video(s) vinculado(s)</p>
      </div>
    </div>

    <div class="preview-meta">
      <div class="preview-section">
        <span>Mapa</span>
        <p>${escapeHtml(property.mapa_url || [property.latitud, property.longitud].filter(Boolean).join(', ') || 'Sin mapa')}</p>
      </div>
      <div class="preview-section">
        <span>Asesor</span>
        <p>${escapeHtml(property.asesor_nombre || 'Sin asignar')}</p>
        <p>${escapeHtml(property.asesor_telefono || property.asesor_email || '')}</p>
      </div>
      <div class="preview-section">
        <span>SEO</span>
        <p>${escapeHtml(property.seo_titulo || property.nombre || 'Sin título SEO')}</p>
        ${seoKeywords.length ? arrayPreview(seoKeywords) : '<p class="preview-note">Sin palabras clave</p>'}
      </div>
    </div>
  `;
}

function openPreview(property, mode = 'saved') {
  if (!property || !els.previewContent) return;
  els.previewContent.innerHTML = buildPreviewHtml(property, mode);
  openModal(els.previewModal);
}

async function loadProperties() {
  const { data, error } = await supabase
    .from(PROPERTIES_TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  state.properties = data || [];
  renderPropertyFilterOptions();
  renderMetrics();
  renderProperties();
}

function fileExtension(file) {
  const name = file?.name || '';
  return name.includes('.') ? name.split('.').pop().toLowerCase() : 'bin';
}

async function uploadFile(file, slug, folder, bucket = PROPERTIES_BUCKET) {
  if (!file || file.size === 0) return '';

  const extension = fileExtension(file);
  const safeName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;
  const objectPath = `${slugify(slug)}/${folder}/${safeName}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(objectPath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined
    });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(objectPath);
  return data.publicUrl;
}

async function uploadMany(files, slug, folder, bucket = PROPERTIES_BUCKET) {
  const uploaded = [];
  for (const file of Array.from(files || [])) {
    const url = await uploadFile(file, slug, folder, bucket);
    if (url) uploaded.push(url);
  }
  return uploaded;
}

function mediaUrlsForProperty(property) {
  if (!property) return [];
  return [
    property.imagen_portada,
    ...asArray(property.galeria),
    ...asArray(property.videos)
  ].filter(Boolean);
}

function storagePathFromPublicUrl(url, bucket = PROPERTIES_BUCKET) {
  const needle = `/storage/v1/object/public/${bucket}/`;
  const index = String(url || '').indexOf(needle);
  if (index === -1) return '';
  return decodeURIComponent(String(url).slice(index + needle.length));
}

function isReferencedByAnotherProperty(url, currentId) {
  return state.properties.some(property => {
    if (String(property.id) === String(currentId)) return false;
    return mediaUrlsForProperty(property).includes(url);
  });
}

async function deleteUnreferencedStorageUrls(urls, currentId) {
  const paths = [...new Set(urls)]
    .filter(url => !isReferencedByAnotherProperty(url, currentId))
    .map(storagePathFromPublicUrl)
    .filter(Boolean);

  if (!paths.length) return;

  const { error } = await supabase.storage.from(PROPERTIES_BUCKET).remove(paths);
  if (error) {
    toast(`La propiedad se guardó, pero no se pudieron limpiar ${paths.length} archivo(s) del bucket.`, 'error');
  }
}

function removedMediaUrls(before, afterPayload) {
  const after = new Set(mediaUrlsForProperty(afterPayload));
  return mediaUrlsForProperty(before).filter(url => !after.has(url));
}

function renderProjectMetrics() {
  const total = state.projects.length;
  const disponibles = state.projects.filter(project => normalizeProjectStatus(project.estado) === 'Disponible').length;
  const reservados = state.projects.filter(project => normalizeProjectStatus(project.estado) === 'Reservado').length;
  const vendidos = state.projects.filter(project => normalizeProjectStatus(project.estado) === 'Vendido').length;

  setMetric(els.projectTotal, total);
  setMetric(els.projectDisponibles, disponibles);
  setMetric(els.projectReservados, reservados);
  setMetric(els.projectVendidos, vendidos);
}

function applyProjectFilters() {
  const query = state.projectFilters.query.toLowerCase();

  state.filteredProjects = state.projects.filter(project => {
    const status = normalizeProjectStatus(project.estado);
    const visible = project.visible !== false;
    const destacado = project.destacado === true;
    const searchable = [
      project.nombre,
      project.slug,
      project.ubicacion,
      project.ciudad,
      project.sector,
      project.tipo,
      project.precio_texto,
      project.etiqueta
    ].join(' ').toLowerCase();

    if (query && !searchable.includes(query)) return false;
    if (state.projectFilters.estado !== 'todos' && status !== state.projectFilters.estado) return false;
    if (state.projectFilters.visibilidad === 'visible' && !visible) return false;
    if (state.projectFilters.visibilidad === 'oculta' && visible) return false;
    if (state.projectFilters.visibilidad === 'destacada' && !destacado) return false;
    return true;
  });
}

function renderProjects() {
  if (!els.projectsTable) return;

  applyProjectFilters();

  els.projectsTable.innerHTML = state.filteredProjects.map(project => {
    const status = normalizeProjectStatus(project.estado);
    const image = project.imagen_portada || '../hero_bg.png';
    const visible = project.visible !== false;
    const destacado = project.destacado === true;

    return `
      <tr>
        <td>
          <div class="property-cell">
            <img src="${escapeHtml(image)}" alt="${escapeHtml(project.nombre)}" onerror="this.src='../hero_bg.png'">
            <div>
              <strong>${escapeHtml(project.nombre || 'Sin nombre')}</strong>
              <span>${escapeHtml(project.ubicacion || project.ciudad || 'Consultar')}</span>
            </div>
          </div>
        </td>
        <td>${escapeHtml(project.tipo || 'Proyecto')}</td>
        <td>${escapeHtml(project.precio_texto || 'Consultar')}</td>
        <td><span class="status-pill ${statusClass(status)}">${status}</span></td>
        <td>
          <div class="publish-flags">
            <span class="flag ${visible ? 'on' : 'off'}">${visible ? 'Visible' : 'Oculto'}</span>
            ${destacado ? '<span class="flag featured">Destacado</span>' : ''}
          </div>
        </td>
        <td>
          <div class="table-actions">
            <button class="ghost-btn" data-project-action="view" data-id="${project.id}">Ver</button>
            <button class="ghost-btn" data-project-action="edit" data-id="${project.id}">Editar</button>
            <button class="ghost-btn" data-project-action="duplicate" data-id="${project.id}">Duplicar</button>
            <button class="ghost-btn" data-project-action="status" data-id="${project.id}">Estado</button>
            <button class="ghost-btn" data-project-action="toggle-featured" data-id="${project.id}">${destacado ? 'No destacar' : 'Destacar'}</button>
            <button class="ghost-btn" data-project-action="toggle-visible" data-id="${project.id}">${visible ? 'Ocultar' : 'Mostrar'}</button>
            <button class="danger-btn" data-project-action="delete" data-id="${project.id}">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (els.projectsEmptyState) {
    els.projectsEmptyState.hidden = state.filteredProjects.length > 0;
  }
}

async function loadProjects() {
  const { data, error } = await supabase
    .from(PROJECTS_TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;

  state.projects = data || [];
  renderProjectMetrics();
  renderProjects();
}

function getProjectById(id) {
  return state.projects.find(project => String(project.id) === String(id));
}

function formList(form, name) {
  return String(form?.elements[name]?.value || '')
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean);
}

function setFormList(form, name, values) {
  const field = form?.elements[name];
  if (!field) return;
  field.value = values.filter(Boolean).join('\n');
}

function resetProjectForm() {
  state.editingProjectId = null;
  els.projectForm?.reset();
  if (els.projectForm?.elements.estado) els.projectForm.elements.estado.value = 'Disponible';
  if (els.projectForm?.elements.visible) els.projectForm.elements.visible.value = 'true';
  if (els.projectForm?.elements.destacado) els.projectForm.elements.destacado.value = 'false';
  if (els.projectCurrentCover) els.projectCurrentCover.innerHTML = '';
  if (els.projectGalleryManager) els.projectGalleryManager.innerHTML = '';
  if (els.projectVideosManager) els.projectVideosManager.innerHTML = '';
  if (els.projectModalTitle) els.projectModalTitle.textContent = 'Crear proyecto';
}

function fillProjectForm(project) {
  resetProjectForm();
  state.editingProjectId = project.id;
  if (els.projectModalTitle) els.projectModalTitle.textContent = 'Editar proyecto';

  for (const [key, value] of Object.entries(project)) {
    const field = els.projectForm?.elements[key];
    if (!field || field.type === 'file') continue;
    if (Array.isArray(value)) field.value = value.join('\n');
    else if (typeof value === 'boolean') field.value = String(value);
    else field.value = value ?? '';
  }

  renderProjectMediaManagers();
}

function projectFieldList(name) {
  return formList(els.projectForm, name);
}

function renderProjectCurrentCover() {
  if (!els.projectCurrentCover) return;
  const cover = els.projectForm?.elements.imagen_portada?.value;
  if (!cover) {
    els.projectCurrentCover.innerHTML = '<p class="preview-note">Sin portada guardada.</p>';
    return;
  }

  els.projectCurrentCover.innerHTML = `
    <div class="media-item">
      <img src="${escapeHtml(cover)}" alt="Portada actual" onerror="this.style.display='none'">
      <div class="media-item-body">
        <p>${escapeHtml(shortUrl(cover))}</p>
        <div class="media-actions">
          <button class="ghost-btn" type="button" data-project-media-action="clear-cover">Quitar portada</button>
        </div>
      </div>
    </div>
  `;
}

function renderProjectGalleryManager() {
  if (!els.projectGalleryManager) return;
  const gallery = projectFieldList('galeria');
  const cover = els.projectForm?.elements.imagen_portada?.value;

  if (!gallery.length) {
    els.projectGalleryManager.innerHTML = '<p class="preview-note">Sin imágenes vinculadas.</p>';
    return;
  }

  els.projectGalleryManager.innerHTML = gallery.map((url, index) => `
    <div class="media-item">
      <img src="${escapeHtml(url)}" alt="Imagen ${index + 1}" onerror="this.style.display='none'">
      <div class="media-item-body">
        <p>${escapeHtml(shortUrl(url))}</p>
        <div class="media-actions">
          <button class="ghost-btn" type="button" data-project-media-action="move-gallery-up" data-index="${index}" ${index === 0 ? 'disabled' : ''}>Subir</button>
          <button class="ghost-btn" type="button" data-project-media-action="move-gallery-down" data-index="${index}" ${index === gallery.length - 1 ? 'disabled' : ''}>Bajar</button>
          <button class="ghost-btn" type="button" data-project-media-action="make-cover" data-index="${index}" ${url === cover ? 'disabled' : ''}>Portada</button>
          <button class="danger-btn" type="button" data-project-media-action="remove-gallery" data-index="${index}">Eliminar</button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderProjectVideosManager() {
  if (!els.projectVideosManager) return;
  const videos = projectFieldList('videos');

  if (!videos.length) {
    els.projectVideosManager.innerHTML = '<p class="preview-note">Sin videos vinculados.</p>';
    return;
  }

  els.projectVideosManager.innerHTML = videos.map((url, index) => `
    <div class="media-row">
      <span>${escapeHtml(shortUrl(url))}</span>
      <button class="danger-btn" type="button" data-project-media-action="remove-video" data-index="${index}">Eliminar</button>
    </div>
  `).join('');
}

function renderProjectMediaManagers() {
  renderProjectCurrentCover();
  renderProjectGalleryManager();
  renderProjectVideosManager();
}

function mediaUrlsForProject(project) {
  if (!project) return [];
  return [
    project.imagen_portada,
    ...asArray(project.galeria),
    ...asArray(project.videos)
  ].filter(Boolean);
}

function isReferencedByAnotherProject(url, currentId) {
  return state.projects.some(project => {
    if (String(project.id) === String(currentId)) return false;
    return mediaUrlsForProject(project).includes(url);
  });
}

async function deleteUnreferencedProjectStorageUrls(urls, currentId) {
  const paths = [...new Set(urls)]
    .filter(url => !isReferencedByAnotherProject(url, currentId))
    .map(url => storagePathFromPublicUrl(url, PROJECTS_BUCKET))
    .filter(Boolean);

  if (!paths.length) return;

  const { error } = await supabase.storage.from(PROJECTS_BUCKET).remove(paths);
  if (error) {
    toast(`El proyecto se guardó, pero no se pudieron limpiar ${paths.length} archivo(s) del bucket.`, 'error');
  }
}

function removedProjectMediaUrls(before, afterPayload) {
  const after = new Set(mediaUrlsForProject(afterPayload));
  return mediaUrlsForProject(before).filter(url => !after.has(url));
}

function textValue(formData, key, fallback = '') {
  const value = String(formData.get(key) || '').trim();
  return value || fallback;
}

function listValue(formData, key) {
  return String(formData.get(key) || '')
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean);
}

function numericValue(formData, key) {
  const value = String(formData.get(key) || '').replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  return value ? Number(value[0]) : null;
}

function integerValue(formData, key) {
  const value = numericValue(formData, key);
  return value === null ? null : Math.round(value);
}

function buildPropertyPayload(form) {
  const formData = new FormData(form);
  const nombre = textValue(formData, 'nombre');
  const slug = slugify(textValue(formData, 'slug', nombre));

  return {
    slug,
    nombre,
    tipo: textValue(formData, 'tipo'),
    ciudad: textValue(formData, 'ciudad'),
    sector: textValue(formData, 'sector', 'Disponible con asesor'),
    precio: numericValue(formData, 'precio'),
    moneda: normalizeCurrency(formData.get('moneda')),
    estado: normalizeStatus(formData.get('estado')),
    metraje: numericValue(formData, 'metraje'),
    habitaciones: integerValue(formData, 'habitaciones'),
    banos: numericValue(formData, 'banos'),
    parqueos: integerValue(formData, 'parqueos'),
    descripcion: textValue(formData, 'descripcion', 'Información pendiente de actualización'),
    caracteristicas: listValue(formData, 'caracteristicas'),
    amenidades: listValue(formData, 'amenidades'),
    imagen_portada: textValue(formData, 'imagen_portada'),
    galeria: listValue(formData, 'galeria'),
    videos: listValue(formData, 'videos'),
    mapa_url: textValue(formData, 'mapa_url'),
    latitud: textValue(formData, 'latitud'),
    longitud: textValue(formData, 'longitud'),
    asesor_nombre: textValue(formData, 'asesor_nombre'),
    asesor_telefono: textValue(formData, 'asesor_telefono'),
    asesor_email: textValue(formData, 'asesor_email'),
    whatsapp: textValue(formData, 'whatsapp'),
    seo_titulo: textValue(formData, 'seo_titulo'),
    seo_descripcion: textValue(formData, 'seo_descripcion'),
    seo_keywords: listValue(formData, 'seo_keywords'),
    comision_asesor_porcentaje: numericValue(formData, 'comision_asesor_porcentaje'),
    comision_redex_porcentaje: numericValue(formData, 'comision_redex_porcentaje'),
    comision_asesor_monto: numericValue(formData, 'comision_asesor_monto'),
    comision_asesor_notas: textValue(formData, 'comision_asesor_notas'),
    visible: String(formData.get('visible')) !== 'false',
    destacado: String(formData.get('destacado')) === 'true'
  };
}

function buildProjectPayload(form) {
  const formData = new FormData(form);
  const nombre = textValue(formData, 'nombre');
  const slug = slugify(textValue(formData, 'slug', nombre));

  return {
    slug,
    nombre,
    ubicacion: textValue(formData, 'ubicacion', 'Disponible con asesor'),
    ciudad: textValue(formData, 'ciudad'),
    sector: textValue(formData, 'sector'),
    tipo: textValue(formData, 'tipo', 'Proyecto'),
    categoria_filtro: textValue(formData, 'categoria_filtro'),
    cantidad_disponible: textValue(formData, 'cantidad_disponible', 'Por consultar'),
    precio_texto: textValue(formData, 'precio_texto', 'Consultar'),
    reserva: textValue(formData, 'reserva', 'Consultar'),
    descripcion: textValue(formData, 'descripcion', 'Información pendiente de actualización'),
    imagen_portada: textValue(formData, 'imagen_portada'),
    etiqueta: textValue(formData, 'etiqueta'),
    color_etiqueta: textValue(formData, 'color_etiqueta'),
    pills: listValue(formData, 'pills'),
    amenidades: listValue(formData, 'amenidades'),
    caracteristicas: listValue(formData, 'caracteristicas'),
    galeria: listValue(formData, 'galeria'),
    videos: listValue(formData, 'videos'),
    estado: normalizeProjectStatus(formData.get('estado')),
    enlace_whatsapp: textValue(formData, 'enlace_whatsapp'),
    mapa_url: textValue(formData, 'mapa_url'),
    latitud: textValue(formData, 'latitud'),
    longitud: textValue(formData, 'longitud'),
    seo_titulo: textValue(formData, 'seo_titulo'),
    seo_descripcion: textValue(formData, 'seo_descripcion'),
    seo_keywords: listValue(formData, 'seo_keywords'),
    comision_asesor_porcentaje: numericValue(formData, 'comision_asesor_porcentaje'),
    comision_asesor_monto: numericValue(formData, 'comision_asesor_monto'),
    comision_asesor_notas: textValue(formData, 'comision_asesor_notas'),
    visible: String(formData.get('visible')) !== 'false',
    destacado: String(formData.get('destacado')) === 'true'
  };
}

function validatePayload(payload) {
  if (!payload.nombre) return 'El nombre es obligatorio.';
  if (!payload.slug) return 'El slug es obligatorio.';
  if (!payload.tipo) return 'El tipo es obligatorio.';
  if (!payload.ciudad) return 'La ciudad es obligatoria.';
  return '';
}

function validateProjectPayload(payload) {
  if (!payload.nombre) return 'El nombre es obligatorio.';
  if (!payload.slug) return 'El slug es obligatorio.';
  if (!payload.tipo) return 'El tipo es obligatorio.';
  if (!payload.ubicacion) return 'La ubicación es obligatoria.';
  return '';
}

async function saveProperty(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  submit.textContent = 'Guardando...';

  try {
    const payload = buildPropertyPayload(form);
    const validationError = validatePayload(payload);
    if (validationError) throw new Error(validationError);
    const beforeUpdate = state.editingId ? getPropertyById(state.editingId) : null;

    const coverFile = form.elements.imagen_portada_file?.files?.[0];
    const coverUrl = await uploadFile(coverFile, payload.slug, 'portada');
    if (coverUrl) payload.imagen_portada = coverUrl;

    const galleryUploads = await uploadMany(form.elements.galeria_files?.files, payload.slug, 'galeria');
    if (galleryUploads.length) payload.galeria = [...payload.galeria, ...galleryUploads];

    const videoUploads = await uploadMany(form.elements.video_files?.files, payload.slug, 'videos');
    if (videoUploads.length) payload.videos = [...payload.videos, ...videoUploads];

    if (state.editingId) {
      const { error } = await supabase
        .from(PROPERTIES_TABLE)
        .update(payload)
        .eq('id', state.editingId);
      if (error) throw error;
      await deleteUnreferencedStorageUrls(removedMediaUrls(beforeUpdate, payload), state.editingId);
      toast('Propiedad actualizada.');
    } else {
      const { error } = await supabase
        .from(PROPERTIES_TABLE)
        .insert(payload);
      if (error) throw error;
      toast('Propiedad creada.');
    }

    closeModal(els.propertyModal);
    resetPropertyForm();
    await loadProperties();
  } catch (error) {
    toast(error.message || 'No se pudo guardar la propiedad.', 'error');
  } finally {
    submit.disabled = false;
    submit.textContent = 'Guardar propiedad';
  }
}

async function saveProject(event) {
  event.preventDefault();

  const form = event.currentTarget;
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  submit.textContent = 'Guardando...';

  try {
    const payload = buildProjectPayload(form);
    const validationError = validateProjectPayload(payload);
    if (validationError) throw new Error(validationError);
    const beforeUpdate = state.editingProjectId ? getProjectById(state.editingProjectId) : null;

    const coverFile = form.elements.imagen_portada_file?.files?.[0];
    const coverUrl = await uploadFile(coverFile, payload.slug, 'portada', PROJECTS_BUCKET);
    if (coverUrl) payload.imagen_portada = coverUrl;

    const galleryUploads = await uploadMany(form.elements.galeria_files?.files, payload.slug, 'galeria', PROJECTS_BUCKET);
    if (galleryUploads.length) payload.galeria = [...payload.galeria, ...galleryUploads];

    const videoUploads = await uploadMany(form.elements.video_files?.files, payload.slug, 'videos', PROJECTS_BUCKET);
    if (videoUploads.length) payload.videos = [...payload.videos, ...videoUploads];

    if (state.editingProjectId) {
      const { error } = await supabase
        .from(PROJECTS_TABLE)
        .update(payload)
        .eq('id', state.editingProjectId);
      if (error) throw error;
      await deleteUnreferencedProjectStorageUrls(removedProjectMediaUrls(beforeUpdate, payload), state.editingProjectId);
      toast('Proyecto actualizado.');
    } else {
      const { error } = await supabase
        .from(PROJECTS_TABLE)
        .insert(payload);
      if (error) throw error;
      toast('Proyecto creado.');
    }

    closeModal(els.projectModal);
    resetProjectForm();
    await loadProjects();
  } catch (error) {
    toast(error.message || 'No se pudo guardar el proyecto.', 'error');
  } finally {
    submit.disabled = false;
    submit.textContent = 'Guardar proyecto';
  }
}

async function deleteProperty(id) {
  const property = getPropertyById(id);
  if (!property) return;

  const confirmed = window.confirm(`Eliminar "${property.nombre}"? Esta acción no se puede deshacer.`);
  if (!confirmed) return;

  const { error } = await supabase.from(PROPERTIES_TABLE).delete().eq('id', id);
  if (error) {
    toast(error.message || 'No se pudo eliminar.', 'error');
    return;
  }

  await deleteUnreferencedStorageUrls(mediaUrlsForProperty(property), id);
  toast('Propiedad eliminada.');
  await loadProperties();
}

async function deleteProject(id) {
  const project = getProjectById(id);
  if (!project) return;

  const confirmed = window.confirm(`Eliminar "${project.nombre}"? Esta acción no se puede deshacer.`);
  if (!confirmed) return;

  const { error } = await supabase.from(PROJECTS_TABLE).delete().eq('id', id);
  if (error) {
    toast(error.message || 'No se pudo eliminar.', 'error');
    return;
  }

  await deleteUnreferencedProjectStorageUrls(mediaUrlsForProject(project), id);
  toast('Proyecto eliminado.');
  await loadProjects();
}

async function duplicateProperty(id) {
  const property = getPropertyById(id);
  if (!property) return;

  const copy = { ...property };
  delete copy.id;
  delete copy.created_at;
  delete copy.updated_at;
  copy.legacy_id = `${property.legacy_id || property.id}-copy-${Date.now()}`;
  copy.nombre = `${property.nombre} Copia`;
  copy.slug = slugify(`${property.slug || property.nombre}-copia-${Date.now()}`);
  copy.visible = false;
  copy.destacado = false;

  const { error } = await supabase.from(PROPERTIES_TABLE).insert(copy);
  if (error) {
    toast(error.message || 'No se pudo duplicar.', 'error');
    return;
  }

  toast('Propiedad duplicada y oculta.');
  await loadProperties();
}

async function duplicateProject(id) {
  const project = getProjectById(id);
  if (!project) return;

  const copy = { ...project };
  delete copy.id;
  delete copy.created_at;
  delete copy.updated_at;
  copy.legacy_id = `${project.legacy_id || project.id}-copy-${Date.now()}`;
  copy.nombre = `${project.nombre} Copia`;
  copy.slug = slugify(`${project.slug || project.nombre}-copia-${Date.now()}`);
  copy.visible = false;
  copy.destacado = false;

  const { error } = await supabase.from(PROJECTS_TABLE).insert(copy);
  if (error) {
    toast(error.message || 'No se pudo duplicar.', 'error');
    return;
  }

  toast('Proyecto duplicado y oculto.');
  await loadProjects();
}

async function updateBoolean(id, key) {
  const property = getPropertyById(id);
  if (!property) return;

  const currentValue = key === 'visible' ? property.visible !== false : property[key] === true;
  const nextValue = !currentValue;
  const { error } = await supabase.from(PROPERTIES_TABLE).update({ [key]: nextValue }).eq('id', id);
  if (error) {
    toast(error.message || 'No se pudo actualizar.', 'error');
    return;
  }

  toast(key === 'destacado' ? 'Destacado actualizado.' : 'Visibilidad actualizada.');
  await loadProperties();
}

async function updateProjectBoolean(id, key) {
  const project = getProjectById(id);
  if (!project) return;

  const currentValue = key === 'visible' ? project.visible !== false : project[key] === true;
  const nextValue = !currentValue;
  const { error } = await supabase.from(PROJECTS_TABLE).update({ [key]: nextValue }).eq('id', id);
  if (error) {
    toast(error.message || 'No se pudo actualizar.', 'error');
    return;
  }

  toast(key === 'destacado' ? 'Destacado actualizado.' : 'Visibilidad actualizada.');
  await loadProjects();
}

function handleMediaAction(event) {
  const button = event.target.closest('button[data-media-action]');
  if (!button) return;

  const action = button.dataset.mediaAction;
  const index = Number(button.dataset.index);

  if (action === 'clear-cover') {
    const confirmed = window.confirm('Quitar la imagen de portada actual?');
    if (!confirmed) return;
    if (els.propertyForm?.elements.imagen_portada) els.propertyForm.elements.imagen_portada.value = '';
    renderMediaManagers();
    toast('Portada quitada. Guarda la propiedad para aplicar el cambio.');
    return;
  }

  if (action === 'make-cover') {
    const gallery = fieldList('galeria');
    const nextCover = gallery[index];
    if (!nextCover || !els.propertyForm?.elements.imagen_portada) return;
    els.propertyForm.elements.imagen_portada.value = nextCover;
    renderMediaManagers();
    toast('Portada seleccionada. Guarda la propiedad para aplicar el cambio.');
    return;
  }

  if (action === 'move-gallery-up' || action === 'move-gallery-down') {
    const gallery = fieldList('galeria');
    const nextIndex = action === 'move-gallery-up' ? index - 1 : index + 1;
    if (!gallery[index] || nextIndex < 0 || nextIndex >= gallery.length) return;
    [gallery[index], gallery[nextIndex]] = [gallery[nextIndex], gallery[index]];
    setFieldList('galeria', gallery);
    renderMediaManagers();
    toast('Orden actualizado. Guarda la propiedad para aplicar el cambio.');
    return;
  }

  if (action === 'remove-gallery') {
    const gallery = fieldList('galeria');
    const removed = gallery[index];
    if (!removed) return;
    const confirmed = window.confirm('Eliminar esta imagen de la galería de la propiedad?');
    if (!confirmed) return;
    gallery.splice(index, 1);
    setFieldList('galeria', gallery);
    if (els.propertyForm?.elements.imagen_portada?.value === removed) {
      els.propertyForm.elements.imagen_portada.value = gallery[0] || '';
    }
    renderMediaManagers();
    toast('Imagen quitada. Guarda la propiedad para aplicar el cambio.');
    return;
  }

  if (action === 'remove-video') {
    const videos = fieldList('videos');
    if (!videos[index]) return;
    const confirmed = window.confirm('Eliminar este video de la propiedad?');
    if (!confirmed) return;
    videos.splice(index, 1);
    setFieldList('videos', videos);
    renderMediaManagers();
    toast('Video quitado. Guarda la propiedad para aplicar el cambio.');
  }
}

function handleProjectMediaAction(event) {
  const button = event.target.closest('button[data-project-media-action]');
  if (!button) return;

  const action = button.dataset.projectMediaAction;
  const index = Number(button.dataset.index);

  if (action === 'clear-cover') {
    const confirmed = window.confirm('Quitar la imagen de portada actual?');
    if (!confirmed) return;
    if (els.projectForm?.elements.imagen_portada) els.projectForm.elements.imagen_portada.value = '';
    renderProjectMediaManagers();
    toast('Portada quitada. Guarda el proyecto para aplicar el cambio.');
    return;
  }

  if (action === 'make-cover') {
    const gallery = projectFieldList('galeria');
    const nextCover = gallery[index];
    if (!nextCover || !els.projectForm?.elements.imagen_portada) return;
    els.projectForm.elements.imagen_portada.value = nextCover;
    renderProjectMediaManagers();
    toast('Portada seleccionada. Guarda el proyecto para aplicar el cambio.');
    return;
  }

  if (action === 'move-gallery-up' || action === 'move-gallery-down') {
    const gallery = projectFieldList('galeria');
    const nextIndex = action === 'move-gallery-up' ? index - 1 : index + 1;
    if (!gallery[index] || nextIndex < 0 || nextIndex >= gallery.length) return;
    [gallery[index], gallery[nextIndex]] = [gallery[nextIndex], gallery[index]];
    setFormList(els.projectForm, 'galeria', gallery);
    renderProjectMediaManagers();
    toast('Orden actualizado. Guarda el proyecto para aplicar el cambio.');
    return;
  }

  if (action === 'remove-gallery') {
    const gallery = projectFieldList('galeria');
    const removed = gallery[index];
    if (!removed) return;
    const confirmed = window.confirm('Eliminar esta imagen de la galería del proyecto?');
    if (!confirmed) return;
    gallery.splice(index, 1);
    setFormList(els.projectForm, 'galeria', gallery);
    if (els.projectForm?.elements.imagen_portada?.value === removed) {
      els.projectForm.elements.imagen_portada.value = gallery[0] || '';
    }
    renderProjectMediaManagers();
    toast('Imagen quitada. Guarda el proyecto para aplicar el cambio.');
    return;
  }

  if (action === 'remove-video') {
    const videos = projectFieldList('videos');
    if (!videos[index]) return;
    const confirmed = window.confirm('Eliminar este video del proyecto?');
    if (!confirmed) return;
    videos.splice(index, 1);
    setFormList(els.projectForm, 'videos', videos);
    renderProjectMediaManagers();
    toast('Video quitado. Guarda el proyecto para aplicar el cambio.');
  }
}

function buildDraftPreview() {
  if (!els.propertyForm) return null;

  const draft = buildPropertyPayload(els.propertyForm);
  const saved = state.editingId ? getPropertyById(state.editingId) : null;
  const coverFile = els.propertyForm.elements.imagen_portada_file?.files?.[0];

  revokePreviewObjectUrl();
  if (coverFile) {
    previewObjectUrl = URL.createObjectURL(coverFile);
    draft.imagen_portada = previewObjectUrl;
  } else if (saved?.imagen_portada) {
    draft.imagen_portada = saved.imagen_portada;
  }

  const galleryNames = Array.from(els.propertyForm.elements.galeria_files?.files || []).map(file => file.name);
  const videoNames = Array.from(els.propertyForm.elements.video_files?.files || []).map(file => file.name);

  draft.galeria = [...asArray(draft.galeria), ...galleryNames];
  draft.videos = [...asArray(draft.videos), ...videoNames];

  return draft;
}

function previewDraftProperty() {
  const draft = buildDraftPreview();
  if (!draft) return;

  const validationError = validatePayload(draft);
  if (validationError) {
    toast(validationError, 'error');
    return;
  }

  openPreview(draft, 'draft');
}

function buildProjectPreviewHtml(project, mode = 'saved') {
  const status = normalizeProjectStatus(project.estado);
  const visible = project.visible !== false;
  const image = project.imagen_portada || '../hero_bg.png';
  const gallery = asArray(project.galeria);
  const videos = asArray(project.videos);

  return `
    <div class="preview-hero">
      <img src="${escapeHtml(image)}" alt="${escapeHtml(project.nombre || 'Proyecto REDEX')}" onerror="this.src='../hero_bg.png'">
      <div class="preview-details">
        <span class="status-pill ${statusClass(status)}">${status}</span>
        <h3>${escapeHtml(project.nombre || 'Sin nombre')}</h3>
        <p class="preview-location">${escapeHtml(project.ubicacion || 'Consultar')}</p>
        <p class="preview-price">${escapeHtml(project.precio_texto || 'Consultar')}</p>
        <p class="preview-description">${escapeHtml(project.descripcion || 'Información pendiente de actualización')}</p>
        <div class="preview-grid">
          <div class="preview-metric"><span>Tipo</span><strong>${escapeHtml(project.tipo || 'Proyecto')}</strong></div>
          <div class="preview-metric"><span>Disponibilidad</span><strong>${escapeHtml(project.cantidad_disponible || 'Consultar')}</strong></div>
          <div class="preview-metric"><span>Reserva</span><strong>${escapeHtml(project.reserva || 'Consultar')}</strong></div>
          <div class="preview-metric"><span>Etiqueta</span><strong>${escapeHtml(project.etiqueta || 'Sin etiqueta')}</strong></div>
        </div>
        <div class="publish-flags">
          <span class="flag ${visible ? 'on' : 'off'}">${visible ? 'Visible' : 'Oculto'}</span>
          <span class="flag ${project.destacado === true ? 'featured' : 'off'}">${project.destacado === true ? 'Destacado' : 'No destacado'}</span>
          <span class="flag">${mode === 'draft' ? 'Vista sin guardar' : 'Registro guardado'}</span>
        </div>
      </div>
    </div>

    <div class="preview-sections">
      <div class="preview-section">
        <span>Pills</span>
        ${arrayPreview(project.pills)}
      </div>
      <div class="preview-section">
        <span>Amenidades</span>
        ${arrayPreview(project.amenidades)}
      </div>
      <div class="preview-section">
        <span>Galería</span>
        <p>${gallery.length} imagen(es) vinculada(s)</p>
      </div>
      <div class="preview-section">
        <span>Videos</span>
        <p>${videos.length} video(s) vinculado(s)</p>
      </div>
    </div>

    <div class="preview-meta">
      <div class="preview-section">
        <span>Mapa</span>
        <p>${escapeHtml(project.mapa_url || [project.latitud, project.longitud].filter(Boolean).join(', ') || 'Sin mapa')}</p>
      </div>
      <div class="preview-section">
        <span>WhatsApp</span>
        <p>${escapeHtml(project.enlace_whatsapp || 'Sin enlace')}</p>
      </div>
      <div class="preview-section">
        <span>SEO</span>
        <p>${escapeHtml(project.seo_titulo || project.nombre || 'Sin título SEO')}</p>
        ${asArray(project.seo_keywords).length ? arrayPreview(project.seo_keywords) : '<p class="preview-note">Sin palabras clave</p>'}
      </div>
    </div>
  `;
}

function openProjectPreview(project, mode = 'saved') {
  if (!project || !els.previewContent) return;
  els.previewContent.innerHTML = buildProjectPreviewHtml(project, mode);
  openModal(els.previewModal);
}

function buildDraftProjectPreview() {
  if (!els.projectForm) return null;

  const draft = buildProjectPayload(els.projectForm);
  const saved = state.editingProjectId ? getProjectById(state.editingProjectId) : null;
  const coverFile = els.projectForm.elements.imagen_portada_file?.files?.[0];

  revokePreviewObjectUrl();
  if (coverFile) {
    previewObjectUrl = URL.createObjectURL(coverFile);
    draft.imagen_portada = previewObjectUrl;
  } else if (saved?.imagen_portada) {
    draft.imagen_portada = saved.imagen_portada;
  }

  const galleryNames = Array.from(els.projectForm.elements.galeria_files?.files || []).map(file => file.name);
  const videoNames = Array.from(els.projectForm.elements.video_files?.files || []).map(file => file.name);

  draft.galeria = [...asArray(draft.galeria), ...galleryNames];
  draft.videos = [...asArray(draft.videos), ...videoNames];

  return draft;
}

function previewDraftProject() {
  const draft = buildDraftProjectPreview();
  if (!draft) return;

  const validationError = validateProjectPayload(draft);
  if (validationError) {
    toast(validationError, 'error');
    return;
  }

  openProjectPreview(draft, 'draft');
}

function viewProperty(id) {
  const property = getPropertyById(id);
  if (!property) return;
  openPreview(property);
}

function viewProject(id) {
  const project = getProjectById(id);
  if (!project) return;
  openProjectPreview(project);
}

function openStatusModal(id) {
  const property = getPropertyById(id);
  if (!property) return;

  state.selectedStatusId = id;
  if (els.statusSelect) els.statusSelect.value = normalizeStatus(property.estado);
  openModal(els.statusModal);
}

async function saveStatus(event) {
  event.preventDefault();

  if (!state.selectedStatusId) return;
  const estado = normalizeStatus(els.statusSelect?.value);

  const { error } = await supabase
    .from(PROPERTIES_TABLE)
    .update({ estado })
    .eq('id', state.selectedStatusId);

  if (error) {
    toast(error.message || 'No se pudo cambiar el estado.', 'error');
    return;
  }

  closeModal(els.statusModal);
  state.selectedStatusId = null;
  toast('Estado actualizado.');
  await loadProperties();
}

function openProjectStatusModal(id) {
  const project = getProjectById(id);
  if (!project) return;

  state.selectedProjectStatusId = id;
  if (els.projectStatusSelect) els.projectStatusSelect.value = normalizeProjectStatus(project.estado);
  openModal(els.projectStatusModal);
}

async function saveProjectStatus(event) {
  event.preventDefault();

  if (!state.selectedProjectStatusId) return;
  const estado = normalizeProjectStatus(els.projectStatusSelect?.value);

  const { error } = await supabase
    .from(PROJECTS_TABLE)
    .update({ estado })
    .eq('id', state.selectedProjectStatusId);

  if (error) {
    toast(error.message || 'No se pudo cambiar el estado.', 'error');
    return;
  }

  closeModal(els.projectStatusModal);
  state.selectedProjectStatusId = null;
  toast('Estado actualizado.');
  await loadProjects();
}

function saleAssetName(sale) {
  return sale.activo_nombre || sale.propiedades?.nombre || sale.proyectos?.nombre || 'Inmueble vendido';
}

function saleAssetOptions(type, selectedId = '') {
  const source = type === 'proyecto' ? state.projects : state.properties;
  return source.map(item => {
    const selected = String(item.id) === String(selectedId) ? 'selected' : '';
    return `<option value="${escapeHtml(item.id)}" ${selected}>${escapeHtml(item.nombre || item.slug || 'Sin nombre')}</option>`;
  }).join('');
}

function refreshSaleAssetOptions(selectedId = '') {
  if (!els.saleAsset || !els.saleAssetType) return;
  const type = els.saleAssetType.value === 'proyecto' ? 'proyecto' : 'propiedad';
  const options = saleAssetOptions(type, selectedId);
  els.saleAsset.innerHTML = options || '<option value="">No hay registros disponibles</option>';
  syncSaleAssetDefaults();
}

function selectedSaleAsset() {
  if (!els.saleAsset || !els.saleAssetType) return null;
  const type = els.saleAssetType.value === 'proyecto' ? 'proyecto' : 'propiedad';
  const source = type === 'proyecto' ? state.projects : state.properties;
  return source.find(item => String(item.id) === String(els.saleAsset.value)) || null;
}

function syncSaleAssetDefaults() {
  const asset = selectedSaleAsset();
  const form = els.saleForm;
  if (!asset || !form) return;
  const currency = normalizeCurrency(asset.moneda);
  if (form.elements.moneda && !state.editingSaleId) form.elements.moneda.value = currency;
  if (form.elements.precio_publicado && !state.editingSaleId) {
    const price = asset.precio ?? asset.precio_desde ?? '';
    form.elements.precio_publicado.value = price || '';
  }
}

function refreshSaleLinkAssetOptions(selectedId = '') {
  if (!els.saleLinkAsset || !els.saleLinkAssetType) return;
  const type = els.saleLinkAssetType.value === 'proyecto' ? 'proyecto' : 'propiedad';
  const options = saleAssetOptions(type, selectedId);
  els.saleLinkAsset.innerHTML = options || '<option value="">No hay registros disponibles</option>';
}

function resetSaleLinkForm() {
  els.saleLinkForm?.reset();
  if (els.saleLinkForm?.elements.tipo_activo) els.saleLinkForm.elements.tipo_activo.value = 'propiedad';
  if (els.saleLinkForm?.elements.dias_vigencia) els.saleLinkForm.elements.dias_vigencia.value = '30';
  if (els.saleLinkOutput) els.saleLinkOutput.value = '';
  refreshSaleLinkAssetOptions();
}

function resetSaleForm() {
  state.editingSaleId = null;
  els.saleForm?.reset();
  if (els.saleModalTitle) els.saleModalTitle.textContent = 'Registrar venta';
  if (els.saleForm?.elements.fecha_venta) {
    els.saleForm.elements.fecha_venta.value = new Date().toISOString().slice(0, 10);
  }
  if (els.saleForm?.elements.moneda) els.saleForm.elements.moneda.value = 'DOP';
  if (els.saleForm?.elements.tipo_activo) els.saleForm.elements.tipo_activo.value = 'propiedad';
  if (els.saleForm?.elements.vendido_por) els.saleForm.elements.vendido_por.value = 'empresa';
  if (els.saleForm?.elements.estado_liquidacion) els.saleForm.elements.estado_liquidacion.value = 'Pendiente';
  renderAdvisorOptions();
  refreshSaleAssetOptions();
}

function fillSaleForm(sale) {
  resetSaleForm();
  state.editingSaleId = sale.id;
  if (els.saleModalTitle) els.saleModalTitle.textContent = 'Editar venta';

  const form = els.saleForm;
  if (!form) return;
  form.elements.tipo_activo.value = sale.tipo_activo || 'propiedad';
  refreshSaleAssetOptions(sale.tipo_activo === 'proyecto' ? sale.proyecto_id : sale.propiedad_id);

  [
    'fecha_venta',
    'moneda',
    'precio_publicado',
    'monto_venta',
    'porcentaje_empresa',
    'beneficio_empresa',
    'porcentaje_vendedor',
    'beneficio_vendedor',
    'impuestos_gastos',
    'vendido_por',
    'vendedor_nombre',
    'vendedor_contacto',
    'asesor_id',
    'estado_liquidacion',
    'notas'
  ].forEach(key => {
    const field = form.elements[key];
    if (field) field.value = sale[key] ?? '';
  });
}

function buildSalePayload(form) {
  const formData = new FormData(form);
  const tipo = formData.get('tipo_activo') === 'proyecto' ? 'proyecto' : 'propiedad';
  const assetId = textValue(formData, 'activo_id');
  const advisorId = textValue(formData, 'asesor_id');
  const source = tipo === 'proyecto' ? state.projects : state.properties;
  const asset = source.find(item => String(item.id) === String(assetId));
  const advisor = advisorId ? getAdvisorById(advisorId) : null;
  const amount = numericValue(formData, 'monto_venta') || 0;
  const companyPercent = numericValue(formData, 'porcentaje_empresa');
  const assetCompanyPercent = Number(asset?.comision_redex_porcentaje || 0);
  const finalCompanyPercent = companyPercent ?? (assetCompanyPercent > 0 ? assetCompanyPercent : null);
  const advisorDefaultPercent = Number(advisor?.porcentaje_comision || 0);
  const assetFixedCommission = Number(asset?.comision_asesor_monto || 0);
  const assetPercentCommission = Number(asset?.comision_asesor_porcentaje || 0);
  const sellerPercent = numericValue(formData, 'porcentaje_vendedor') ?? (assetPercentCommission > 0 ? assetPercentCommission : (advisorDefaultPercent > 0 ? advisorDefaultPercent : null));
  const companyBenefit = numericValue(formData, 'beneficio_empresa');
  const sellerBenefit = numericValue(formData, 'beneficio_vendedor');
  const grossCommission = assetFixedCommission > 0
    ? assetFixedCommission
    : (sellerPercent === null ? 0 : amount * (sellerPercent / 100));
  const calculatedCompanyBenefit = finalCompanyPercent !== null
    ? grossCommission * (finalCompanyPercent / 100)
    : 0;
  const companyFinalBenefit = companyBenefit && companyBenefit > 0 ? companyBenefit : calculatedCompanyBenefit;
  const finalSellerBenefit = sellerBenefit && sellerBenefit > 0
    ? sellerBenefit
    : Math.max(grossCommission - companyFinalBenefit, 0);

  return {
    tipo_activo: tipo,
    propiedad_id: tipo === 'propiedad' ? assetId : null,
    proyecto_id: tipo === 'proyecto' ? assetId : null,
    activo_nombre: asset?.nombre || textValue(formData, 'activo_nombre', 'Inmueble vendido'),
    precio_publicado: numericValue(formData, 'precio_publicado'),
    monto_venta: amount,
    moneda: textValue(formData, 'moneda', 'DOP'),
    fecha_venta: textValue(formData, 'fecha_venta', new Date().toISOString().slice(0, 10)),
    vendido_por: textValue(formData, 'vendido_por', 'empresa'),
    asesor_id: advisor?.id || null,
    asesor_slug: advisor?.slug || null,
    vendedor_nombre: textValue(formData, 'vendedor_nombre', advisor?.nombre || ''),
    vendedor_contacto: textValue(formData, 'vendedor_contacto', advisor?.telefono || advisor?.whatsapp || advisor?.email || ''),
    porcentaje_empresa: finalCompanyPercent,
    beneficio_empresa: companyFinalBenefit,
    porcentaje_vendedor: sellerPercent,
    beneficio_vendedor: finalSellerBenefit,
    impuestos_gastos: numericValue(formData, 'impuestos_gastos') || 0,
    estado_liquidacion: textValue(formData, 'estado_liquidacion', 'Pendiente'),
    notas: textValue(formData, 'notas')
  };
}

function validateSalePayload(payload) {
  if (!payload.propiedad_id && !payload.proyecto_id) return 'Selecciona una propiedad o proyecto.';
  if (!payload.activo_nombre) return 'El inmueble es obligatorio.';
  if (!payload.monto_venta || payload.monto_venta <= 0) return 'El monto vendido debe ser mayor que cero.';
  if (!payload.fecha_venta) return 'La fecha de venta es obligatoria.';
  return '';
}

function renderSalesMetrics() {
  const totals = state.sales.reduce((acc, sale) => {
    const currency = normalizeCurrency(sale.moneda);
    acc.amount[currency] += Number(sale.monto_venta || 0);
    acc.company[currency] += Number(sale.beneficio_empresa || 0);
    acc.sellers[currency] += Number(sale.beneficio_vendedor || 0);
    acc.costs[currency] += Number(sale.impuestos_gastos || 0);
    return acc;
  }, {
    amount: { DOP: 0, USD: 0 },
    company: { DOP: 0, USD: 0 },
    sellers: { DOP: 0, USD: 0 },
    costs: { DOP: 0, USD: 0 }
  });

  if (els.salesTotal) els.salesTotal.textContent = groupedMoney(totals.amount);
  if (els.salesCompany) els.salesCompany.textContent = groupedMoney(totals.company);
  if (els.salesSellers) els.salesSellers.textContent = groupedMoney(totals.sellers);
  if (els.salesCosts) els.salesCosts.textContent = groupedMoney(totals.costs);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const sellerTotals = new Map();

  state.sales.forEach(sale => {
    const seller = String(sale.vendedor_nombre || '').trim();
    const commission = Number(sale.beneficio_vendedor || 0);
    const saleDate = sale.fecha_venta ? new Date(`${sale.fecha_venta}T00:00:00`) : null;
    if (!seller || !commission || Number.isNaN(saleDate?.getTime())) return;
    if (saleDate.getMonth() !== currentMonth || saleDate.getFullYear() !== currentYear) return;
    sellerTotals.set(seller, (sellerTotals.get(seller) || 0) + commission);
  });

  const topSeller = [...sellerTotals.entries()].sort((a, b) => b[1] - a[1])[0];
  if (els.salesTopSeller) {
    els.salesTopSeller.textContent = topSeller ? topSeller[0] : 'Sin ventas';
  }
  if (els.salesTopSellerAmount) {
    els.salesTopSellerAmount.textContent = topSeller ? money(topSeller[1]) : money(0);
  }
}

function saleDateValue(sale) {
  return String(sale.fecha_venta || '').slice(0, 10);
}

function getFilteredSalesByDate() {
  const from = state.salesFilters.dateFrom;
  const to = state.salesFilters.dateTo;
  return state.sales.filter(sale => {
    const date = saleDateValue(sale);
    if (!date) return false;
    if (from && date < from) return false;
    if (to && date > to) return false;
    return true;
  });
}

function renderSalesDayReport() {
  if (!els.salesDayCount) return;
  const sales = getFilteredSalesByDate();
  const totals = sales.reduce((acc, sale) => {
    const currency = normalizeCurrency(sale.moneda);
    acc.count += 1;
    acc.properties += sale.tipo_activo === 'propiedad' ? 1 : 0;
    acc.projects += sale.tipo_activo === 'proyecto' ? 1 : 0;
    acc.amount[currency] += Number(sale.monto_venta || 0);
    acc.company[currency] += Number(sale.beneficio_empresa || 0);
    acc.sellers[currency] += Number(sale.beneficio_vendedor || 0);
    return acc;
  }, {
    count: 0,
    properties: 0,
    projects: 0,
    amount: { DOP: 0, USD: 0 },
    company: { DOP: 0, USD: 0 },
    sellers: { DOP: 0, USD: 0 }
  });

  const fromLabel = state.salesFilters.dateFrom ? prettyDate(state.salesFilters.dateFrom) : '';
  const toLabel = state.salesFilters.dateTo ? prettyDate(state.salesFilters.dateTo) : '';
  if (els.salesDayTitle) {
    els.salesDayTitle.textContent = fromLabel || toLabel
      ? `Ventas ${fromLabel ? `desde ${fromLabel}` : ''}${toLabel ? ` hasta ${toLabel}` : ''}`.trim()
      : 'Todas las ventas registradas';
  }
  setMetric(els.salesDayCount, totals.count);
  setMetric(els.salesDayProperties, totals.properties);
  setMetric(els.salesDayProjects, totals.projects);
  if (els.salesDayAmount) els.salesDayAmount.textContent = groupedMoney(totals.amount);
  if (els.salesDayCompany) els.salesDayCompany.textContent = groupedMoney(totals.company);
  if (els.salesDaySellers) els.salesDaySellers.textContent = groupedMoney(totals.sellers);
}

function downloadSalesDateReport() {
  const sales = [...state.filteredSales];
  if (!sales.length) {
    toast('No hay ventas para descargar con esos filtros.', 'error');
    return;
  }

  const rows = [
    ['Fecha', 'Tipo', 'Inmueble o proyecto', 'Monto vendido', 'Beneficio REDEX', 'Comisión asesor', 'Vendedor', 'Liquidación', 'Notas'],
    ...sales.map(sale => [
      sale.fecha_venta || '',
      sale.tipo_activo === 'proyecto' ? 'Proyecto' : 'Propiedad',
      saleAssetName(sale),
      Number(sale.monto_venta || 0),
      Number(sale.beneficio_empresa || 0),
      Number(sale.beneficio_vendedor || 0),
      sale.vendedor_nombre || (sale.vendido_por === 'empresa' ? 'REDEX' : ''),
      sale.estado_liquidacion || 'Pendiente',
      sale.notas || ''
    ])
  ];

  const csv = rows.map(row => row.map(csvCell).join(',')).join('\n');
  const blob = new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const from = state.salesFilters.dateFrom || 'inicio';
  const to = state.salesFilters.dateTo || 'todas';
  link.download = `reporte-ventas-${from}-${to}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function applySalesFilters() {
  const query = state.salesFilters.query.toLowerCase();
  state.filteredSales = state.sales.filter(sale => {
    const date = saleDateValue(sale);
    const searchable = [
      saleAssetName(sale),
      sale.vendedor_nombre,
      sale.vendedor_contacto,
      sale.vendido_por,
      sale.estado_liquidacion,
      sale.notas
    ].join(' ').toLowerCase();

    if (query && !searchable.includes(query)) return false;
    if (state.salesFilters.tipo !== 'todos' && sale.tipo_activo !== state.salesFilters.tipo) return false;
    if (state.salesFilters.liquidacion !== 'todos' && sale.estado_liquidacion !== state.salesFilters.liquidacion) return false;
    if (state.salesFilters.dateFrom && (!date || date < state.salesFilters.dateFrom)) return false;
    if (state.salesFilters.dateTo && (!date || date > state.salesFilters.dateTo)) return false;
    return true;
  }).sort((a, b) => {
    const first = saleDateValue(a);
    const second = saleDateValue(b);
    return state.salesFilters.order === 'asc'
      ? first.localeCompare(second)
      : second.localeCompare(first);
  });
}

function renderSales() {
  if (!els.salesTable) return;
  applySalesFilters();

  els.salesTable.innerHTML = state.filteredSales.map(sale => {
    const currency = sale.moneda || 'DOP';
    const seller = sale.vendido_por === 'empresa'
      ? 'REDEX'
      : (sale.vendedor_nombre || 'Sin vendedor');
    return `
      <tr>
        <td>
          <div>
            <strong>${escapeHtml(saleAssetName(sale))}</strong>
            <span>${escapeHtml(sale.tipo_activo === 'proyecto' ? 'Proyecto' : 'Propiedad')} · ${escapeHtml(sale.fecha_venta || '')}</span>
          </div>
        </td>
        <td>${escapeHtml(money(sale.monto_venta, currency))}</td>
        <td>
          <strong>${escapeHtml(money(sale.beneficio_empresa, currency))}</strong>
          <span>${sale.porcentaje_empresa ? escapeHtml(`${sale.porcentaje_empresa}%`) : ''}</span>
        </td>
        <td>
          <strong>${escapeHtml(seller)}</strong>
          <span>${escapeHtml(money(sale.beneficio_vendedor, currency))}</span>
        </td>
        <td><span class="status-pill ${statusClass(sale.estado_liquidacion || 'Pendiente')}">${escapeHtml(sale.estado_liquidacion || 'Pendiente')}</span></td>
        <td>
          <div class="table-actions">
            <button class="ghost-btn" data-sale-action="view" data-id="${sale.id}">Ver</button>
            <button class="ghost-btn" data-sale-action="edit" data-id="${sale.id}">Editar</button>
            <button class="danger-btn" data-sale-action="delete" data-id="${sale.id}">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (els.salesEmptyState) {
    els.salesEmptyState.hidden = state.filteredSales.length > 0;
  }
  renderSalesDayReport();
}

async function loadSales() {
  const { data, error } = await supabase
    .from(SALES_TABLE)
    .select('*, propiedades(nombre), proyectos(nombre)')
    .order('fecha_venta', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  state.sales = data || [];
  renderSalesMetrics();
  renderSalesDayReport();
  renderSales();
}

function getSaleById(id) {
  return state.sales.find(sale => String(sale.id) === String(id));
}

function getSaleReportById(id) {
  return state.salesReports.find(report => String(report.id) === String(id));
}

function reportAssetName(report) {
  return report.activo_nombre || report.propiedades?.nombre || report.proyectos?.nombre || 'Inmueble reportado';
}

function renderSalesReports() {
  if (!els.salesReportsTable) return;
  const pending = state.salesReports.filter(report => report.estado_revision === 'Pendiente');

  els.salesReportsTable.innerHTML = pending.map(report => {
    const financing = report.forma_pago === 'contado'
      ? 'Contado'
      : `${report.forma_pago === 'prestamo' ? 'Préstamo' : 'Financiamiento'}${report.porcentaje_interes ? ` · ${report.porcentaje_interes}%` : ''}`;
    return `
      <tr>
        <td>
          <div>
            <strong>${escapeHtml(reportAssetName(report))}</strong>
            <span>${escapeHtml(report.ubicacion_inmueble || report.cliente_ubicacion || '')}</span>
          </div>
        </td>
        <td>
          <strong>${escapeHtml(report.vendedor_nombre || 'Sin vendedor')}</strong>
          <span>${escapeHtml(report.vendedor_telefono || report.vendedor_correo || '')}</span>
        </td>
        <td>
          <strong>${escapeHtml(report.cliente_nombre || 'Sin cliente')}</strong>
          <span>${escapeHtml(report.cliente_telefono || report.cliente_correo || '')}</span>
        </td>
        <td>${escapeHtml(money(report.precio_final, 'DOP'))}</td>
        <td>${escapeHtml(financing)}</td>
        <td>
          <div class="table-actions">
            <button class="ghost-btn" data-sale-report-action="view" data-id="${report.id}">Ver</button>
            <button class="secondary-btn" data-sale-report-action="approve" data-id="${report.id}">Aprobar</button>
            <button class="danger-btn" data-sale-report-action="reject" data-id="${report.id}">Rechazar</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (els.salesReportsEmptyState) {
    els.salesReportsEmptyState.hidden = pending.length > 0;
  }
}

async function loadSalesReports() {
  const { data, error } = await supabase
    .from(SALES_REPORTS_TABLE)
    .select('*, propiedades(nombre), proyectos(nombre)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  state.salesReports = data || [];
  renderSalesReports();
}

async function saveSale(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  submit.textContent = 'Guardando...';

  try {
    const payload = buildSalePayload(form);
    const validationError = validateSalePayload(payload);
    if (validationError) throw new Error(validationError);

    if (state.editingSaleId) {
      const { error } = await supabase.from(SALES_TABLE).update(payload).eq('id', state.editingSaleId);
      if (error) throw error;
      toast('Venta actualizada.');
    } else {
      const { error } = await supabase.from(SALES_TABLE).insert(payload);
      if (error) throw error;
      toast('Venta registrada.');
    }

    closeModal(els.saleModal);
    resetSaleForm();
    await loadSales();
  } catch (error) {
    toast(error.message || 'No se pudo guardar la venta.', 'error');
  } finally {
    submit.disabled = false;
    submit.textContent = 'Guardar venta';
  }
}

function saleToken() {
  const values = new Uint8Array(24);
  crypto.getRandomValues(values);
  return Array.from(values, value => value.toString(16).padStart(2, '0')).join('');
}

async function generateSaleLink(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  submit.textContent = 'Generando...';

  try {
    const formData = new FormData(form);
    const type = formData.get('tipo_activo') === 'proyecto' ? 'proyecto' : 'propiedad';
    const assetId = textValue(formData, 'activo_id');
    const days = Math.max(1, Math.min(integerValue(formData, 'dias_vigencia') || 30, 90));
    const source = type === 'proyecto' ? state.projects : state.properties;
    const asset = source.find(item => String(item.id) === String(assetId));
    if (!asset) throw new Error('Selecciona un inmueble válido.');

    const token = saleToken();
    const expiresAt = new Date(Date.now() + days * 86400000).toISOString();
    const payload = {
      token,
      tipo_activo: type,
      propiedad_id: type === 'propiedad' ? asset.id : null,
      proyecto_id: type === 'proyecto' ? asset.id : null,
      activo_nombre: asset.nombre || 'Inmueble REDEX',
      expires_at: expiresAt
    };

    const { error } = await supabase.from(SALES_LINKS_TABLE).insert(payload);
    if (error) throw error;

    const link = `${window.location.origin}/registrar-venta.html?t=${encodeURIComponent(token)}`;
    if (els.saleLinkOutput) els.saleLinkOutput.value = link;
    toast('Link de venta generado.');
  } catch (error) {
    toast(error.message || 'No se pudo generar el link.', 'error');
  } finally {
    submit.disabled = false;
    submit.textContent = 'Generar link';
  }
}

async function copySaleLink() {
  const link = els.saleLinkOutput?.value;
  if (!link) {
    toast('Genera un link primero.', 'error');
    return;
  }
  await navigator.clipboard.writeText(link);
  toast('Link copiado.');
}

async function deleteSale(id) {
  const sale = getSaleById(id);
  if (!sale) return;
  const confirmed = window.confirm(`Eliminar la venta de "${saleAssetName(sale)}"?`);
  if (!confirmed) return;

  const { error } = await supabase.from(SALES_TABLE).delete().eq('id', id);
  if (error) {
    toast(error.message || 'No se pudo eliminar la venta.', 'error');
    return;
  }

  toast('Venta eliminada.');
  await loadSales();
}

function buildSalePreviewHtml(sale) {
  const currency = sale.moneda || 'DOP';
  const net = Number(sale.beneficio_empresa || 0) - Number(sale.impuestos_gastos || 0);
  return `
    <div class="preview-section">
      <span>${escapeHtml(sale.tipo_activo === 'proyecto' ? 'Proyecto vendido' : 'Propiedad vendida')}</span>
      <h3>${escapeHtml(saleAssetName(sale))}</h3>
      <p class="preview-price">${escapeHtml(money(sale.monto_venta, currency))}</p>
      <div class="preview-grid">
        <div class="preview-metric"><span>REDEX</span><strong>${escapeHtml(money(sale.beneficio_empresa, currency))}</strong></div>
        <div class="preview-metric"><span>Vendedor</span><strong>${escapeHtml(money(sale.beneficio_vendedor, currency))}</strong></div>
        <div class="preview-metric"><span>Gastos</span><strong>${escapeHtml(money(sale.impuestos_gastos, currency))}</strong></div>
        <div class="preview-metric"><span>Neto</span><strong>${escapeHtml(money(net, currency))}</strong></div>
      </div>
      <p>${escapeHtml(sale.vendedor_nombre || 'Venta directa REDEX')}</p>
      <p>${escapeHtml(sale.notas || '')}</p>
      <div class="publish-flags">
        <span class="flag featured">${escapeHtml(sale.estado_liquidacion || 'Pendiente')}</span>
        <span class="flag">${escapeHtml(sale.fecha_venta || '')}</span>
      </div>
    </div>
  `;
}

function buildSaleReportPreviewHtml(report) {
  const rule = commissionRuleForReport(report);
  const currency = normalizeCurrency(rule.asset?.moneda);
  return `
    <div class="preview-section">
      <span>Reporte enviado por vendedor</span>
      <h3>${escapeHtml(reportAssetName(report))}</h3>
      <p class="preview-price">${escapeHtml(money(report.precio_final, currency))}</p>
      <div class="preview-grid">
        <div class="preview-metric"><span>Vendedor</span><strong>${escapeHtml(report.vendedor_nombre || 'Sin vendedor')}</strong></div>
        <div class="preview-metric"><span>Cliente</span><strong>${escapeHtml(report.cliente_nombre || 'Sin cliente')}</strong></div>
        <div class="preview-metric"><span>Forma de pago</span><strong>${escapeHtml(report.forma_pago || 'contado')}</strong></div>
        <div class="preview-metric"><span>Interés</span><strong>${escapeHtml(report.porcentaje_interes ? `${report.porcentaje_interes}%` : 'No aplica')}</strong></div>
      </div>
      <div class="preview-sections">
        <div class="preview-section">
          <span>Contacto cliente</span>
          <p>${escapeHtml(report.cliente_telefono || '')}</p>
          <p>${escapeHtml(report.cliente_correo || '')}</p>
          <p>${escapeHtml(report.cliente_ubicacion || '')}</p>
        </div>
        <div class="preview-section">
          <span>Financiamiento</span>
          <p>${escapeHtml(report.banco_entidad || 'No aplica')}</p>
          <p>${escapeHtml(report.plazo_financiamiento || '')}</p>
          <p>Inicial: ${escapeHtml(money(report.monto_inicial, currency))}</p>
        </div>
      </div>
      <p>${escapeHtml(report.notas || '')}</p>
    </div>
  `;
}

function viewSaleReport(id) {
  const report = getSaleReportById(id);
  if (!report || !els.previewContent) return;
  els.previewContent.innerHTML = buildSaleReportPreviewHtml(report);
  openModal(els.previewModal);
}

function commissionRuleForReport(report, advisor = null) {
  const source = report.tipo_activo === 'proyecto' ? state.projects : state.properties;
  const assetId = report.tipo_activo === 'proyecto' ? report.proyecto_id : report.propiedad_id;
  const asset = source.find(item => String(item.id) === String(assetId));
  const fixed = Number(asset?.comision_asesor_monto || 0);
  const assetPercent = Number(asset?.comision_asesor_porcentaje || 0);
  const advisorPercent = Number(advisor?.porcentaje_comision || 0);
  const percent = assetPercent > 0 ? assetPercent : advisorPercent;
  const amount = Number(report.precio_final || 0);
  const grossCommission = fixed > 0 ? fixed : (percent > 0 ? amount * (percent / 100) : 0);
  return {
    asset,
    percent: percent > 0 ? percent : null,
    fixed: fixed > 0 ? fixed : null,
    grossCommission,
    sellerBenefit: grossCommission,
    notes: asset?.comision_asesor_notas || '',
    source: fixed > 0 || assetPercent > 0 ? 'activo' : (advisorPercent > 0 ? 'asesor' : '')
  };
}

function companyBenefitForReport(report, grossCommission = 0) {
  const source = report.tipo_activo === 'proyecto' ? state.projects : state.properties;
  const assetId = report.tipo_activo === 'proyecto' ? report.proyecto_id : report.propiedad_id;
  const asset = source.find(item => String(item.id) === String(assetId));
  const percent = Number(asset?.comision_redex_porcentaje || 0);
  if (percent > 0) {
    return {
      percent,
      benefit: Number(grossCommission || 0) * (percent / 100)
    };
  }
  return {
    percent: null,
    benefit: 0
  };
}

async function approveSaleReport(id) {
  const report = getSaleReportById(id);
  if (!report) return;
  const confirmed = window.confirm(`Aprobar la venta reportada de "${reportAssetName(report)}"?`);
  if (!confirmed) return;
  const advisor = report.asesor_id
    ? getAdvisorById(report.asesor_id)
    : state.advisors.find(item => {
      const reportName = (report.vendedor_nombre || '').trim().toLowerCase();
      return (report.asesor_slug && item.slug === report.asesor_slug) || (reportName && item.nombre?.trim().toLowerCase() === reportName);
    });
  const commissionRule = commissionRuleForReport(report, advisor);
  const companyRule = companyBenefitForReport(report, commissionRule.grossCommission);
  const currency = normalizeCurrency(commissionRule.asset?.moneda);
  const sellerNetBenefit = Math.max(Number(commissionRule.grossCommission || 0) - Number(companyRule.benefit || 0), 0);

  const salePayload = {
    tipo_activo: report.tipo_activo,
    propiedad_id: report.tipo_activo === 'propiedad' ? report.propiedad_id : null,
    proyecto_id: report.tipo_activo === 'proyecto' ? report.proyecto_id : null,
    activo_nombre: reportAssetName(report),
    precio_publicado: null,
    monto_venta: report.precio_final,
    moneda: currency,
    fecha_venta: report.fecha_venta,
    vendido_por: 'asesor',
    asesor_id: advisor?.id || report.asesor_id || null,
    asesor_slug: advisor?.slug || report.asesor_slug || null,
    solicitud_id: report.solicitud_id || null,
    atribucion_fuente: advisor?.slug || report.asesor_slug ? 'reporte_asesor' : null,
    vendedor_nombre: report.vendedor_nombre || advisor?.nombre || '',
    vendedor_contacto: report.vendedor_telefono || report.vendedor_correo || advisor?.telefono || advisor?.whatsapp || advisor?.email || '',
    porcentaje_empresa: companyRule.percent,
    beneficio_empresa: companyRule.benefit,
    porcentaje_vendedor: commissionRule.percent,
    beneficio_vendedor: sellerNetBenefit,
    impuestos_gastos: 0,
    estado_liquidacion: 'Pendiente',
    notas: [
      report.notas,
      commissionRule.notes ? `Comisión: ${commissionRule.notes}` : '',
      commissionRule.fixed ? `Comisión fija asesor: ${money(commissionRule.fixed, currency)}` : '',
      commissionRule.percent ? `Comisión captación: ${commissionRule.percent}%` : '',
      commissionRule.source ? `Regla aplicada desde: ${commissionRule.source}` : '',
      report.cliente_nombre ? `Cliente: ${report.cliente_nombre}` : '',
      report.cliente_telefono ? `Teléfono cliente: ${report.cliente_telefono}` : '',
      report.cliente_correo ? `Correo cliente: ${report.cliente_correo}` : '',
      report.forma_pago ? `Pago: ${report.forma_pago}` : '',
      report.banco_entidad ? `Entidad: ${report.banco_entidad}` : '',
      report.porcentaje_interes ? `Interés: ${report.porcentaje_interes}%` : ''
    ].filter(Boolean).join('\n')
  };

  const { data, error } = await supabase.from(SALES_TABLE).insert(salePayload).select('id').single();
  if (error) {
    toast(error.message || 'No se pudo aprobar el reporte.', 'error');
    return;
  }

  const { error: updateError } = await supabase
    .from(SALES_REPORTS_TABLE)
    .update({ estado_revision: 'Aprobada', venta_id: data.id })
    .eq('id', id);

  if (updateError) {
    toast(updateError.message || 'La venta se creó, pero no se actualizó el reporte.', 'error');
    return;
  }

  if (report.tipo_activo === 'propiedad' && report.propiedad_id) {
    await supabase.from(PROPERTIES_TABLE).update({ estado: 'Vendido' }).eq('id', report.propiedad_id);
  }
  if (report.tipo_activo === 'proyecto' && report.proyecto_id) {
    await supabase.from(PROJECTS_TABLE).update({ estado: 'Vendido' }).eq('id', report.proyecto_id);
  }

  toast('Reporte aprobado y venta creada.');
  await loadProperties();
  await loadProjects();
  await loadSales();
  await loadSalesReports();
}

async function rejectSaleReport(id) {
  const report = getSaleReportById(id);
  if (!report) return;
  const confirmed = window.confirm(`Rechazar el reporte de "${reportAssetName(report)}"?`);
  if (!confirmed) return;

  const { error } = await supabase
    .from(SALES_REPORTS_TABLE)
    .update({ estado_revision: 'Rechazada' })
    .eq('id', id);

  if (error) {
    toast(error.message || 'No se pudo rechazar el reporte.', 'error');
    return;
  }

  toast('Reporte rechazado.');
  await loadSalesReports();
}

function previewSaleFromForm() {
  if (!els.saleForm || !els.previewContent) return;
  const draft = buildSalePayload(els.saleForm);
  const validationError = validateSalePayload(draft);
  if (validationError) {
    toast(validationError, 'error');
    return;
  }
  els.previewContent.innerHTML = buildSalePreviewHtml(draft);
  openModal(els.previewModal);
}

function viewSale(id) {
  const sale = getSaleById(id);
  if (!sale || !els.previewContent) return;
  els.previewContent.innerHTML = buildSalePreviewHtml(sale);
  openModal(els.previewModal);
}

function advisorStatusClass(status) {
  const value = String(status || 'pendiente').toLowerCase();
  if (value === 'activo') return 'disponible';
  if (value === 'suspendido' || value === 'rechazado') return 'vendido';
  return 'reservado';
}

function advisorLink(advisor) {
  const slug = advisor?.slug || advisor?.codigo_referido || '';
  return slug ? `https://redexinmobiliaria.com/?asesor=${encodeURIComponent(slug)}` : '';
}

function getAdvisorById(id) {
  return state.advisors.find(advisor => String(advisor.id) === String(id));
}

function normalizedAdvisorPhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
}

function advisorDuplicateKeys(advisor) {
  return [normalizedAdvisorPhone(advisor.telefono), normalizedAdvisorPhone(advisor.whatsapp)].filter(Boolean);
}

function markDuplicateAdvisors(advisors) {
  const counts = new Map();
  advisors.forEach(advisor => {
    new Set(advisorDuplicateKeys(advisor)).forEach(key => counts.set(key, (counts.get(key) || 0) + 1));
  });
  return advisors.map(advisor => {
    const duplicate = advisorDuplicateKeys(advisor).some(key => (counts.get(key) || 0) > 1);
    return { ...advisor, _redexDuplicate: duplicate };
  });
}

function sortAdvisorsForDisplay(advisors) {
  return [...advisors].sort((a, b) => {
    if (Boolean(a._redexDuplicate) !== Boolean(b._redexDuplicate)) {
      return a._redexDuplicate ? 1 : -1;
    }
    return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es', { sensitivity: 'base' });
  });
}

function applyAdvisorFilters() {
  const query = state.advisorFilters.query.toLowerCase();
  state.filteredAdvisors = sortAdvisorsForDisplay(state.advisors.filter(advisor => {
    const searchable = [
      advisor.nombre,
      advisor.slug,
      advisor.rol,
      advisor.telefono,
      advisor.whatsapp,
      advisor.email,
      advisor.ciudad,
      advisor.sector,
      advisor.estado
    ].join(' ').toLowerCase();

    if (query && !searchable.includes(query)) return false;
    if (state.advisorFilters.estado !== 'todos' && advisor.estado !== state.advisorFilters.estado) return false;
    return true;
  }));
}

function renderAdvisorOptions(selectedId = '') {
  const options = [
    '<option value="">Sin asesor asignado</option>',
    ...state.advisors
      .filter(advisor => advisor.estado === 'activo')
      .map(advisor => `<option value="${escapeHtml(advisor.id)}"${String(advisor.id) === String(selectedId) ? ' selected' : ''}>${escapeHtml(advisor.nombre)}</option>`)
  ].join('');

  if (els.saleForm?.elements.asesor_id) els.saleForm.elements.asesor_id.innerHTML = options;
}

function socialUrl(value) {
  const url = String(value || '').trim();
  if (!url) return '';
  if (/^(https?:)?\/\//i.test(url)) return url.startsWith('//') ? `https:${url}` : url;
  if (/^@?[\w.-]+$/i.test(url)) return url;
  return `https://${url}`;
}

function advisorSocialsFromForm(formData) {
  return {
    instagram_url: socialUrl(textValue(formData, 'instagram_url')),
    facebook_url: socialUrl(textValue(formData, 'facebook_url')),
    tiktok_url: socialUrl(textValue(formData, 'tiktok_url')),
    linkedin_url: socialUrl(textValue(formData, 'linkedin_url')),
    youtube_url: socialUrl(textValue(formData, 'youtube_url')),
    web_url: socialUrl(textValue(formData, 'web_url'))
  };
}

function advisorSocials(advisor) {
  const data = advisor?.datos && typeof advisor.datos === 'object' ? advisor.datos : {};
  return data.redes_sociales && typeof data.redes_sociales === 'object' ? data.redes_sociales : {};
}

function advisorPhotoPosition(advisor) {
  const data = advisor?.datos && typeof advisor.datos === 'object' ? advisor.datos : {};
  return data.foto_posicion || data.object_position || 'center 18%';
}

function updateAdvisorPhotoPreview(url, position = 'center 18%') {
  if (!els.advisorPhotoPreview) return;
  els.advisorPhotoPreview.style.setProperty('--advisor-photo-position', position || 'center 18%');
  const value = String(url || '').trim();
  els.advisorPhotoPreview.innerHTML = value
    ? `<img src="${escapeHtml(value)}" alt="Vista previa foto asesor" onerror="this.parentElement.innerHTML='<span>Foto no disponible</span>'">`
    : '<span>Sin foto</span>';
}

function revokeAdvisorPhotoObjectUrl() {
  if (!advisorPhotoObjectUrl) return;
  URL.revokeObjectURL(advisorPhotoObjectUrl);
  advisorPhotoObjectUrl = '';
}

async function uploadAdvisorPhoto(file, advisor) {
  if (!file || file.size === 0) return '';
  return uploadFile(file, advisor?.slug || advisor?.nombre || 'asesor-redex', 'foto-perfil', WEB_CONTENT_BUCKET);
}

function advisorSocialsFromLead(lead) {
  return {
    instagram_url: socialUrl(leadValue(lead, ['instagram_url', 'instagram'], '')),
    facebook_url: socialUrl(leadValue(lead, ['facebook_url', 'facebook'], '')),
    tiktok_url: socialUrl(leadValue(lead, ['tiktok_url', 'tiktok', 'tik tok'], '')),
    linkedin_url: socialUrl(leadValue(lead, ['linkedin_url', 'linkedin'], '')),
    youtube_url: socialUrl(leadValue(lead, ['youtube_url', 'youtube'], '')),
    web_url: socialUrl(leadValue(lead, ['web_url', 'pagina web', 'página web', 'portafolio'], ''))
  };
}

function renderAdvisors() {
  if (!els.advisorsTable) return;
  applyAdvisorFilters();

  els.advisorsTable.innerHTML = state.filteredAdvisors.map(advisor => {
    const link = advisorLink(advisor);
    const photoPosition = advisorPhotoPosition(advisor);
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:12px;">
            ${advisor.foto_url ? `<img src="${escapeHtml(advisor.foto_url)}" alt="${escapeHtml(advisor.nombre)}" style="width:54px;height:54px;border-radius:50%;object-fit:cover;object-position:${escapeHtml(photoPosition)};">` : `<span class="status-pill ${advisorStatusClass(advisor.estado)}">${escapeHtml((advisor.nombre || 'A').slice(0, 1))}</span>`}
            <div>
              <strong>${escapeHtml(advisor.nombre || 'Sin nombre')}</strong>
              <span>${escapeHtml(advisor.rol || 'Asesor de Ventas')} · @${escapeHtml(advisor.slug || '')}</span>
              ${advisor._redexDuplicate ? '<span class="status-pill status-reserved">Posible duplicado</span>' : ''}
            </div>
          </div>
        </td>
        <td>
          <div>
            <strong>${escapeHtml(advisor.telefono || advisor.whatsapp || 'Sin teléfono')}</strong>
            <span>${escapeHtml(advisor.email || 'Sin correo')}</span>
          </div>
        </td>
        <td><span class="status-pill ${advisorStatusClass(advisor.estado)}">${escapeHtml(advisor.estado || 'pendiente')}</span></td>
        <td>${advisor.porcentaje_comision === null || advisor.porcentaje_comision === undefined ? 'Consultar' : `${escapeHtml(advisor.porcentaje_comision)}%`}</td>
        <td>
          <div>
            <strong>${link ? 'Link activo' : 'Sin link'}</strong>
            <span>${escapeHtml(link || 'Completa el slug')}</span>
          </div>
        </td>
        <td>
          <div class="table-actions">
            <button class="ghost-btn" data-advisor-action="copy-link" data-id="${advisor.id}">Copiar link</button>
            <button class="ghost-btn" data-advisor-action="view" data-id="${advisor.id}">Ver</button>
            <button class="ghost-btn" data-advisor-action="edit" data-id="${advisor.id}">Editar</button>
            <button class="ghost-btn" data-advisor-action="activate" data-id="${advisor.id}">Activar</button>
            <button class="ghost-btn" data-advisor-action="pending" data-id="${advisor.id}">Pendiente</button>
            <button class="ghost-btn" data-advisor-action="suspend" data-id="${advisor.id}">Suspender</button>
            <button class="ghost-btn" data-advisor-action="reject" data-id="${advisor.id}">Rechazar</button>
            <button class="danger-btn" data-advisor-action="delete" data-id="${advisor.id}">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (els.advisorsEmptyState) {
    els.advisorsEmptyState.hidden = state.filteredAdvisors.length > 0;
  }
  renderAdvisorOptions(els.saleForm?.elements.asesor_id?.value || '');
}

async function loadAdvisors() {
  const { data, error } = await supabase
    .from(ADVISORS_TABLE)
    .select('*')
    .order('nombre', { ascending: true });

  if (error) throw error;

  state.advisors = markDuplicateAdvisors(data || []);
  renderAdvisors();
}

function buildAdvisorPayload(form) {
  const formData = new FormData(form);
  const nombre = textValue(formData, 'nombre');
  const slug = slugify(textValue(formData, 'slug', nombre));
  const commission = numericValue(formData, 'porcentaje_comision');
  const current = state.editingAdvisorId ? getAdvisorById(state.editingAdvisorId) : null;
  const currentData = current?.datos && typeof current.datos === 'object' ? current.datos : {};

  return {
    nombre,
    slug,
    rol: textValue(formData, 'rol', 'Asesor de Ventas'),
    telefono: textValue(formData, 'telefono'),
    whatsapp: textValue(formData, 'whatsapp'),
    email: textValue(formData, 'email'),
    foto_url: textValue(formData, 'foto_url'),
    bio: textValue(formData, 'bio'),
    ciudad: textValue(formData, 'ciudad'),
    sector: textValue(formData, 'sector'),
    codigo_referido: textValue(formData, 'codigo_referido', slug),
    porcentaje_comision: commission,
    estado: textValue(formData, 'estado', 'pendiente'),
    visible_publico: String(formData.get('visible_publico')) !== 'false',
    aprobado_at: textValue(formData, 'estado') === 'activo' ? new Date().toISOString() : null,
    datos: {
      ...currentData,
      foto_posicion: textValue(formData, 'foto_posicion', advisorPhotoPosition(current)),
      object_position: textValue(formData, 'foto_posicion', advisorPhotoPosition(current)),
      redes_sociales: advisorSocialsFromForm(formData)
    }
  };
}

function advisorTempPassword(form) {
  const value = form?.elements?.password_temporal?.value || '';
  return value.trim();
}

function advisorInitialPassword() {
  return DEFAULT_ADVISOR_PASSWORD;
}

async function createAdvisorAuthAccess(email, password) {
  if (!email || !password) return { userId: null, message: '' };

  const authClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  const { data, error } = await authClient.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: 'https://redexinmobiliaria.com/portal-asesor',
      data: {
        role: 'asesor'
      }
    }
  });

  await authClient.auth.signOut();

  if (error) {
    const message = String(error.message || '').toLowerCase();
    if (message.includes('already') || message.includes('registered') || message.includes('exists')) {
      return {
        userId: null,
        message: 'El asesor ya tenía un acceso creado en Supabase Auth.'
      };
    }
    return {
      userId: null,
      message: `Asesor aprobado. Supabase Auth no confirmó el acceso automáticamente: ${error.message || 'revisar usuario manualmente'}.`
    };
  }

  return {
    userId: data?.user?.id || null,
    message: data?.user?.id
      ? 'Acceso del asesor creado automáticamente.'
      : 'Acceso solicitado. Revisa si Supabase requiere confirmación de correo.'
  };
}

function resetAdvisorForm() {
  state.editingAdvisorId = null;
  revokeAdvisorPhotoObjectUrl();
  els.advisorForm?.reset();
  if (els.advisorModalTitle) els.advisorModalTitle.textContent = 'Crear asesor';
  if (els.advisorForm?.elements.estado) els.advisorForm.elements.estado.value = 'pendiente';
  if (els.advisorForm?.elements.visible_publico) els.advisorForm.elements.visible_publico.value = 'true';
  if (els.advisorForm?.elements.password_temporal) els.advisorForm.elements.password_temporal.value = DEFAULT_ADVISOR_PASSWORD;
  if (els.advisorForm?.elements.foto_posicion) els.advisorForm.elements.foto_posicion.value = 'center 18%';
  if (els.advisorForm?.elements.foto_file) els.advisorForm.elements.foto_file.value = '';
  updateAdvisorPhotoPreview('', 'center 18%');
}

function fillAdvisorForm(advisor) {
  resetAdvisorForm();
  state.editingAdvisorId = advisor.id;
  if (els.advisorModalTitle) els.advisorModalTitle.textContent = 'Editar asesor';
  const form = els.advisorForm;
  if (!form) return;

  [
    'nombre',
    'slug',
    'rol',
    'telefono',
    'whatsapp',
    'email',
    'foto_url',
    'bio',
    'ciudad',
    'sector',
    'codigo_referido',
    'porcentaje_comision',
    'estado',
    'visible_publico'
  ].forEach(key => {
    const field = form.elements[key];
    if (field) field.value = advisor[key] ?? '';
  });
  const socials = advisorSocials(advisor);
  [
    'instagram_url',
    'facebook_url',
    'tiktok_url',
    'linkedin_url',
    'youtube_url',
    'web_url'
  ].forEach(key => {
    const field = form.elements[key];
    if (field) field.value = socials[key] || '';
  });
  if (form.elements.visible_publico) form.elements.visible_publico.value = String(advisor.visible_publico !== false);
  if (form.elements.password_temporal) form.elements.password_temporal.value = advisorInitialPassword();
  const photoPosition = advisorPhotoPosition(advisor);
  if (form.elements.foto_posicion) form.elements.foto_posicion.value = photoPosition;
  if (form.elements.foto_file) form.elements.foto_file.value = '';
  updateAdvisorPhotoPreview(advisor.foto_url, photoPosition);
}

function validateAdvisorPayload(payload) {
  if (!payload.nombre) return 'El nombre del asesor es obligatorio.';
  if (!payload.slug) return 'El slug del asesor es obligatorio.';
  if (!['pendiente', 'activo', 'suspendido', 'rechazado'].includes(payload.estado)) return 'Selecciona un estado válido.';
  return '';
}

async function saveAdvisor(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  submit.textContent = 'Guardando...';

  try {
    const payload = buildAdvisorPayload(form);
    const password = advisorTempPassword(form);
    const currentAdvisor = state.editingAdvisorId ? getAdvisorById(state.editingAdvisorId) : null;
    const emailChanged = Boolean(
      currentAdvisor &&
      payload.email &&
      String(currentAdvisor.email || '').toLowerCase() !== String(payload.email || '').toLowerCase()
    );
    const shouldCreateAccess = Boolean(
      payload.email &&
      password &&
      (!state.editingAdvisorId || !currentAdvisor?.user_id || emailChanged)
    );
    const validationError = validateAdvisorPayload(payload);
    if (validationError) throw new Error(validationError);
    if (shouldCreateAccess && !payload.email) throw new Error('Para crear acceso automático debes colocar el correo del asesor.');
    if (shouldCreateAccess && password.length < 6) throw new Error('La contraseña temporal debe tener al menos 6 caracteres.');

    const photoFile = form.elements.foto_file?.files?.[0] || null;
    if (photoFile) {
      payload.foto_url = await uploadAdvisorPhoto(photoFile, payload);
      if (form.elements.foto_url) form.elements.foto_url.value = payload.foto_url;
    }

    let advisorId = state.editingAdvisorId;
    let authMessage = '';

    if (state.editingAdvisorId) {
      const { error } = await supabase.from(ADVISORS_TABLE).update(payload).eq('id', state.editingAdvisorId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase.from(ADVISORS_TABLE).insert(payload).select('id').single();
      if (error) throw error;
      advisorId = data?.id || null;
    }

    if (shouldCreateAccess) {
      const authResult = await createAdvisorAuthAccess(payload.email, password);
      authMessage = emailChanged
        ? `Correo actualizado. ${authResult.message || 'Acceso del asesor vinculado al nuevo correo.'}`
        : authResult.message;
      if (advisorId && authResult.userId) {
        const { error } = await supabase
          .from(ADVISORS_TABLE)
          .update({ user_id: authResult.userId })
          .eq('id', advisorId);
        if (error) throw error;
      }
    }

    closeModal(els.advisorModal);
    toast(authMessage || (state.editingAdvisorId ? 'Asesor actualizado.' : 'Asesor creado.'));
    await loadAdvisors();
  } catch (error) {
    toast(error.message || 'No se pudo guardar el asesor.', 'error');
  } finally {
    submit.disabled = false;
    submit.textContent = 'Guardar asesor';
  }
}

async function updateAdvisorStatus(id, estado) {
  const advisor = getAdvisorById(id);
  const payload = {
    estado,
    aprobado_at: estado === 'activo' ? new Date().toISOString() : null
  };

  let authMessage = '';
  if (estado === 'activo' && advisor?.email && !advisor.user_id) {
    try {
      const authResult = await createAdvisorAuthAccess(advisor.email, DEFAULT_ADVISOR_PASSWORD);
      authMessage = authResult.message;
      if (authResult.userId) payload.user_id = authResult.userId;
    } catch (error) {
      toast(`Asesor activado pendiente de acceso: ${error.message || 'no se pudo crear el usuario.'}`, 'error');
    }
  }

  const { error } = await supabase.from(ADVISORS_TABLE).update(payload).eq('id', id);
  if (error) {
    toast(error.message || 'No se pudo actualizar el asesor.', 'error');
    return;
  }
  toast(authMessage || 'Estado del asesor actualizado.');
  await loadAdvisors();
}

async function deleteAdvisor(id) {
  const advisor = getAdvisorById(id);
  if (!advisor) return;
  const confirmed = window.confirm(`Eliminar el asesor "${advisor.nombre || 'sin nombre'}"?`);
  if (!confirmed) return;

  const { error } = await supabase.from(ADVISORS_TABLE).delete().eq('id', id);
  if (error) {
    toast(error.message || 'No se pudo eliminar el asesor.', 'error');
    return;
  }
  toast('Asesor eliminado.');
  await loadAdvisors();
}

function previewAdvisor(id = state.editingAdvisorId) {
  const advisor = id ? getAdvisorById(id) : null;
  const draft = els.advisorForm ? buildAdvisorPayload(els.advisorForm) : advisor;
  const data = draft || advisor;
  if (!data || !els.previewContent) return;
  const link = advisorLink(data);
  els.previewContent.innerHTML = `
    <div class="preview-section">
      <span>${escapeHtml(data.rol || 'Asesor')}</span>
      <h3>${escapeHtml(data.nombre || 'Asesor REDEX')}</h3>
      <p>${escapeHtml(data.telefono || data.whatsapp || '')}</p>
      <p>${escapeHtml(data.email || '')}</p>
      <p><strong>Contraseña inicial:</strong> ${escapeHtml(advisorInitialPassword())}</p>
      ${data.foto_url ? `<img src="${escapeHtml(data.foto_url)}" alt="${escapeHtml(data.nombre)}" style="width:100%;max-height:320px;object-fit:cover;object-position:${escapeHtml(advisorPhotoPosition(data))};border-radius:8px;margin-top:12px;">` : ''}
      <div class="publish-flags" style="margin-top:12px;">
        <span class="flag ${data.estado === 'activo' ? 'on' : 'off'}">${escapeHtml(data.estado || 'pendiente')}</span>
        <span class="flag featured">${escapeHtml(link || 'Sin link')}</span>
      </div>
    </div>
  `;
  openModal(els.previewModal);
}

async function copyAdvisorLink(id) {
  const advisor = getAdvisorById(id);
  const link = advisorLink(advisor);
  if (!link) {
    toast('Este asesor no tiene slug para generar link.', 'error');
    return;
  }
  try {
    await navigator.clipboard.writeText(link);
    toast('Link del asesor copiado.');
  } catch (_) {
    toast(link);
  }
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
  return asArray(leadFollowUp(lead).etiquetas).slice(0, 8);
}

function leadScore(lead) {
  return leadFollowUp(lead).calificacion || 'Sin calificar';
}

function leadHistory(lead) {
  return asArray(leadFollowUp(lead).historial).slice(-12).reverse();
}

function leadTagsHtml(lead) {
  const tags = leadTags(lead);
  if (!tags.length) return '';
  return `<div class="lead-tags">${tags.map(tag => `<span class="lead-tag">${escapeHtml(tag)}</span>`).join('')}</div>`;
}

function leadHistoryHtml(lead) {
  const history = leadHistory(lead);
  if (!history.length) return '<p class="preview-note">Sin historial de seguimiento todavía.</p>';
  return `
    <div class="lead-history">
      ${history.map(item => {
        const date = item.fecha ? new Date(item.fecha).toLocaleString('es-DO') : '';
        const tags = asArray(item.etiquetas).join(', ');
        return `
          <div class="lead-history-item">
            <strong>${escapeHtml(item.autor || item.asesor_nombre || 'REDEX')}</strong>
            <span>${escapeHtml([date, item.estado, item.calificacion, tags].filter(Boolean).join(' · '))}</span>
            <p>${escapeHtml(item.nota || 'Sin nota escrita.')}</p>
          </div>
        `;
      }).join('')}
    </div>
  `;
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
  applyLeadFilters();
  const rows = [[
    'Cliente',
    'Telefono',
    'Correo',
    'Tipo',
    'Asesor',
    'Asesor slug',
    'Interes',
    'Estado',
    'Calificacion',
    'Etiquetas',
    'Ultima nota',
    'Fecha solicitud',
    'Ultima actividad',
    'Origen'
  ]];

  state.filteredLeads.forEach(lead => {
    const followUp = leadFollowUp(lead);
    rows.push([
      lead.nombre || '',
      lead.telefono || '',
      lead.email || '',
      leadTypeLabel(lead.tipo),
      lead.asesor_nombre || 'Directo REDEX',
      lead.asesor_slug || '',
      lead.interes || lead.mensaje || '',
      lead.estado || 'Nuevo',
      leadScore(lead),
      leadTags(lead).join(', '),
      followUp.nota || '',
      lead.created_at ? new Date(lead.created_at).toLocaleString('es-DO') : '',
      lead.updated_at ? new Date(lead.updated_at).toLocaleString('es-DO') : '',
      lead.primer_origen_url || lead.origen_url || ''
    ]);
  });

  downloadCsv(`leads-redex-${new Date().toISOString().slice(0, 10)}.csv`, rows);
}

function applyLeadFilters() {
  const query = state.leadFilters.query.toLowerCase();
  state.filteredLeads = state.leads.filter(lead => {
    const followUp = leadFollowUp(lead);
    const searchable = [
      lead.nombre,
      lead.email,
      lead.telefono,
      lead.interes,
      lead.mensaje,
      lead.tipo,
      lead.estado,
      lead.pagina,
      lead.asesor_nombre,
      lead.asesor_slug,
      followUp.nota,
      followUp.calificacion,
      asArray(followUp.etiquetas).join(' '),
      JSON.stringify(lead.datos || {})
    ].join(' ').toLowerCase();

    if (query && !searchable.includes(query)) return false;
    if (state.leadFilters.tipo !== 'todos' && lead.tipo !== state.leadFilters.tipo) return false;
    if (state.leadFilters.estado !== 'todos' && lead.estado !== state.leadFilters.estado) return false;
    return true;
  });
}

function renderLeads() {
  if (!els.leadsTable) return;
  applyLeadFilters();

  els.leadsTable.innerHTML = state.filteredLeads.map(lead => {
    const date = lead.created_at ? new Date(lead.created_at).toLocaleDateString('es-DO') : '';
    const canApproveAdvisor = lead.tipo === 'quiero_ser_asesor' && lead.estado !== 'Atendida';
    const leadActions = `
      <div class="table-actions">
        <button class="ghost-btn" data-lead-action="view" data-id="${lead.id}">Ver</button>
        ${canApproveAdvisor ? `<button class="secondary-btn" data-lead-action="approve-advisor" data-id="${lead.id}">Aprobar asesor</button>` : ''}
        <button class="ghost-btn" data-lead-action="process" data-id="${lead.id}">Proceso</button>
        <button class="ghost-btn" data-lead-action="done" data-id="${lead.id}">Atendida</button>
        <button class="ghost-btn" data-lead-action="discard" data-id="${lead.id}">Descartar</button>
        <button class="danger-btn" data-lead-action="delete" data-id="${lead.id}">Eliminar</button>
      </div>
    `;
    return `
      <tr>
        <td>
          <div>
            <strong>${escapeHtml(lead.nombre || 'Sin nombre')}</strong>
            <span>${escapeHtml(lead.telefono || lead.email || 'Sin contacto')}</span>
            <div class="lead-actions-inline">
              ${leadActions}
            </div>
          </div>
        </td>
        <td>${escapeHtml(leadTypeLabel(lead.tipo))}</td>
        <td>
          <div>
            <strong>${escapeHtml(lead.asesor_nombre || 'Directo REDEX')}</strong>
            <span>${escapeHtml(lead.asesor_slug ? `@${lead.asesor_slug}` : lead.atribucion_fuente || 'Sin atribución')}</span>
          </div>
        </td>
        <td>${escapeHtml(lead.interes || lead.mensaje || 'Consultar')}</td>
        <td>
          <strong>${escapeHtml(leadScore(lead))}</strong>
          ${leadTagsHtml(lead)}
        </td>
        <td><span class="status-pill ${statusClass(lead.estado || 'Nuevo')}">${escapeHtml(lead.estado || 'Nuevo')}</span></td>
        <td>${escapeHtml(date)}</td>
        <td>
          ${leadActions}
        </td>
      </tr>
    `;
  }).join('');

  if (els.leadsEmptyState) {
    els.leadsEmptyState.hidden = state.filteredLeads.length > 0;
  }
}

async function loadLeads() {
  const { data, error } = await supabase
    .from(LEADS_TABLE)
    .select('*')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) throw error;

  state.leads = data || [];
  renderLeads();
}

function getLeadById(id) {
  return state.leads.find(lead => String(lead.id) === String(id));
}

function normalizedLeadKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function leadValue(lead, aliases, fallback = '') {
  const direct = aliases
    .map(alias => lead?.[alias])
    .find(value => String(value || '').trim());
  if (direct) return String(direct).trim();

  const data = lead?.datos && typeof lead.datos === 'object' ? lead.datos : {};
  const normalizedAliases = aliases.map(normalizedLeadKey);
  const found = Object.entries(data).find(([key, value]) => {
    const normalizedKey = normalizedLeadKey(key);
    return normalizedAliases.some(alias => normalizedKey.includes(alias)) && String(value || '').trim();
  });
  return found ? String(found[1]).trim() : fallback;
}

function advisorPayloadFromLead(lead) {
  const nombre = leadValue(lead, ['nombre', 'nombre completo'], '');
  const email = leadValue(lead, ['email', 'correo', 'correo electronico'], '');
  const telefono = leadValue(lead, ['telefono', 'teléfono', 'celular'], '');
  const whatsapp = leadValue(lead, ['whatsapp'], telefono);
  const cedula = leadValue(lead, ['cedula', 'cédula', 'documento', 'identificacion', 'identificación'], '');
  const ciudad = leadValue(lead, ['ciudad', 'zona a trabajar'], '');
  const sector = leadValue(lead, ['provincia', 'sector'], '');
  const ocupacion = leadValue(lead, ['ocupacion actual', 'ocupación actual'], '');
  const motivacion = leadValue(lead, ['por que quieres ser asesor', 'por qué quieres ser asesor', 'mensaje'], lead.mensaje || '');
  const baseSlug = slugify(nombre || email.split('@')[0] || `asesor-${Date.now()}`);

  return {
    nombre,
    slug: baseSlug,
    rol: 'Asesor de Ventas',
    telefono,
    whatsapp,
    email,
    foto_url: '',
    bio: [ocupacion, motivacion].filter(Boolean).join(' · '),
    ciudad,
    sector,
    codigo_referido: baseSlug,
    porcentaje_comision: null,
    estado: 'activo',
    visible_publico: true,
    aprobado_at: new Date().toISOString(),
    datos: {
      redes_sociales: advisorSocialsFromLead(lead),
      cedula,
      solicitud_id: lead.id,
      solicitud_tipo: lead.tipo,
      solicitud_origen_url: lead.origen_url || '',
      solicitud_archivos: asArray(lead.archivos),
      solicitud_datos: lead.datos || {}
    }
  };
}

async function uniqueAdvisorSlug(baseSlug, currentAdvisorId = '') {
  const existing = new Set(
    state.advisors
      .filter(advisor => String(advisor.id) !== String(currentAdvisorId))
      .flatMap(advisor => [advisor.slug, advisor.codigo_referido])
      .filter(Boolean)
  );
  if (!existing.has(baseSlug)) return baseSlug;

  for (let index = 2; index < 200; index += 1) {
    const candidate = `${baseSlug}-${index}`;
    if (!existing.has(candidate)) return candidate;
  }
  return `${baseSlug}-${Date.now()}`;
}

async function approveLeadAsAdvisor(id) {
  const lead = getLeadById(id);
  if (!lead) return;
  if (lead.tipo !== 'quiero_ser_asesor') {
    toast('Esta solicitud no corresponde a un asesor.', 'error');
    return;
  }

  const payload = advisorPayloadFromLead(lead);
  if (!payload.nombre) {
    toast('La solicitud no tiene nombre para crear el asesor.', 'error');
    return;
  }
  if (!payload.email) {
    toast('La solicitud no tiene correo para crear el acceso.', 'error');
    return;
  }

  const confirmed = window.confirm(`Aprobar a "${payload.nombre}" como asesor activo con acceso temporal ${DEFAULT_ADVISOR_PASSWORD}?`);
  if (!confirmed) return;

  try {
    const existingAdvisor = state.advisors.find(advisor => {
      const sameEmail = advisor.email && payload.email && advisor.email.toLowerCase() === payload.email.toLowerCase();
      const sameSlug = advisor.slug && advisor.slug === payload.slug;
      return sameEmail || sameSlug;
    });

    let advisorId = existingAdvisor?.id || null;
    let advisorSlug = existingAdvisor?.slug || payload.slug;
    let authMessage = '';

    if (existingAdvisor) {
      advisorSlug = await uniqueAdvisorSlug(existingAdvisor.slug || payload.slug, advisorId);
      const updatePayload = {
        ...payload,
        slug: advisorSlug,
        codigo_referido: existingAdvisor.codigo_referido || advisorSlug,
        foto_url: existingAdvisor.foto_url || payload.foto_url,
        porcentaje_comision: existingAdvisor.porcentaje_comision ?? payload.porcentaje_comision
      };
      const { error } = await supabase
        .from(ADVISORS_TABLE)
        .update(updatePayload)
        .eq('id', advisorId);
      if (error) throw error;
    } else {
      advisorSlug = await uniqueAdvisorSlug(payload.slug);
      const insertPayload = {
        ...payload,
        slug: advisorSlug,
        codigo_referido: advisorSlug
      };
      const { data, error } = await supabase
        .from(ADVISORS_TABLE)
        .insert(insertPayload)
        .select('id, slug')
        .single();
      if (error) throw error;
      advisorId = data?.id || null;
      advisorSlug = data?.slug || advisorSlug;
    }

    const authResult = await createAdvisorAuthAccess(payload.email, DEFAULT_ADVISOR_PASSWORD);
    authMessage = authResult.message;
    if (advisorId && authResult.userId) {
      const { error } = await supabase
        .from(ADVISORS_TABLE)
        .update({ user_id: authResult.userId })
        .eq('id', advisorId);
      if (error) throw error;
    }

    const { error: leadError } = await supabase
      .from(LEADS_TABLE)
      .update({
        estado: 'Atendida',
        asesor_id: advisorId,
        asesor_slug: advisorSlug,
        asesor_nombre: payload.nombre,
        notas_admin: [
          lead.notas_admin,
          `Asesor aprobado automáticamente desde CMS. Acceso: ${payload.email} / ${DEFAULT_ADVISOR_PASSWORD}.`
        ].filter(Boolean).join('\n')
      })
      .eq('id', id);
    if (leadError) throw leadError;

    toast(authMessage || 'Asesor aprobado y acceso creado.');
    await loadAdvisors();
    await loadLeads();
  } catch (error) {
    toast(error.message || 'No se pudo aprobar el asesor.', 'error');
  }
}

function leadDataHtml(lead) {
  const data = lead?.datos && typeof lead.datos === 'object' ? lead.datos : {};
  const rows = Object.entries(data)
    .filter(([key]) => key !== 'seguimiento_asesor')
    .filter(([, value]) => String(Array.isArray(value) ? value.join(', ') : value || '').trim())
    .map(([key, value]) => `
      <div class="preview-section">
        <span>${escapeHtml(key)}</span>
        <p>${escapeHtml(Array.isArray(value) ? value.join(', ') : value)}</p>
      </div>
    `).join('');
  return rows || '<p class="preview-note">Sin datos adicionales.</p>';
}

function leadFilesHtml(lead) {
  const files = asArray(lead?.archivos);
  if (!files.length) return '<p class="preview-note">Sin archivos adjuntos.</p>';
  return files.map(file => `
    <div class="media-row">
      <span>${escapeHtml(file.nombre || file.path || 'Archivo')}</span>
      ${file.signed_url
        ? `<a class="ghost-btn" href="${escapeHtml(file.signed_url)}" target="_blank" rel="noopener">Abrir</a>`
        : `<span>${escapeHtml(file.path || '')}</span>`}
    </div>
  `).join('');
}

async function withLeadFileLinks(lead) {
  const files = asArray(lead?.archivos);
  if (!files.length) return lead;
  const linkedFiles = await Promise.all(files.map(async file => {
    if (!file?.path) return file;
    const bucket = file.bucket || LEADS_BUCKET;
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(file.path, 60 * 20);
    if (error) return file;
    return { ...file, signed_url: data?.signedUrl || '' };
  }));
  return { ...lead, archivos: linkedFiles };
}

function leadAttributionHtml(lead) {
  const hasAttribution = lead?.asesor_nombre || lead?.asesor_slug || lead?.atribucion_fuente || lead?.redex_session_id;
  if (!hasAttribution) return '<p class="preview-note">Lead directo sin asesor atribuido.</p>';
  const activeUntil = lead.atribucion_activa_hasta
    ? new Date(lead.atribucion_activa_hasta).toLocaleDateString('es-DO')
    : 'Sin fecha';
  return `
    <div class="preview-section">
      <span>Asesor atribuido</span>
      <p>${escapeHtml(lead.asesor_nombre || 'Sin nombre')} ${lead.asesor_slug ? `(@${escapeHtml(lead.asesor_slug)})` : ''}</p>
    </div>
    <div class="preview-section">
      <span>Fuente</span>
      <p>${escapeHtml(lead.atribucion_fuente || 'Sin fuente')}</p>
    </div>
    <div class="preview-section">
      <span>Atribución protegida hasta</span>
      <p>${escapeHtml(activeUntil)}</p>
    </div>
    <div class="preview-section">
      <span>Primera entrada</span>
      <p>${escapeHtml(lead.primer_origen_url || lead.origen_url || '')}</p>
    </div>
    <div class="preview-section">
      <span>Última actividad</span>
      <p>${escapeHtml(lead.ultima_actividad_url || '')}</p>
    </div>
  `;
}

async function saveAdminLeadFollowUp(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const id = form.elements.id?.value;
  const lead = getLeadById(id);
  if (!lead) return;

  const estado = form.elements.estado?.value || lead.estado || 'Nuevo';
  const calificacion = form.elements.calificacion?.value || 'Sin calificar';
  const nota = form.elements.nota?.value.trim() || '';
  const etiquetas = Array.from(form.elements.etiquetas?.selectedOptions || []).map(option => option.value);
  const datos = lead.datos && typeof lead.datos === 'object' ? { ...lead.datos } : {};
  const previousFollowUp = datos.seguimiento_asesor && typeof datos.seguimiento_asesor === 'object'
    ? datos.seguimiento_asesor
    : {};
  const history = asArray(previousFollowUp.historial);
  const entry = {
    fecha: new Date().toISOString(),
    autor: 'CMS REDEX',
    origen: 'cms',
    nota,
    estado,
    calificacion,
    etiquetas
  };
  if (nota || estado !== lead.estado || calificacion !== previousFollowUp.calificacion || etiquetas.join('|') !== asArray(previousFollowUp.etiquetas).join('|')) {
    history.push(entry);
  }

  datos.seguimiento_asesor = {
    ...previousFollowUp,
    nota: nota || previousFollowUp.nota || '',
    estado,
    calificacion,
    etiquetas,
    historial: history.slice(-30),
    actualizado_at: new Date().toISOString(),
    actualizado_por: 'CMS REDEX'
  };

  const adminNotes = [
    lead.notas_admin,
    nota ? `[${new Date().toLocaleString('es-DO')}] CMS: ${nota}` : ''
  ].filter(Boolean).join('\n');

  const { error } = await supabase
    .from(LEADS_TABLE)
    .update({
      estado,
      datos,
      notas_admin: adminNotes
    })
    .eq('id', id);

  if (error) {
    toast(error.message || 'No se pudo guardar el seguimiento.', 'error');
    return;
  }

  const index = state.leads.findIndex(item => String(item.id) === String(id));
  if (index >= 0) {
    state.leads[index] = {
      ...state.leads[index],
      estado,
      datos,
      notas_admin: adminNotes,
      updated_at: new Date().toISOString()
    };
  }
  renderLeads();
  toast('Seguimiento guardado.');
  await viewLead(id);
}

async function viewLead(id) {
  const rawLead = getLeadById(id);
  const lead = rawLead ? await withLeadFileLinks(rawLead) : null;
  if (!lead || !els.previewContent) return;
  const selectedTags = leadTags(lead);
  const tagOptions = ['Alta prioridad', 'Llamar hoy', 'Enviar catálogo', 'Documentos pendientes', 'Financiamiento', 'Visita pendiente', 'Negociación', 'Cierre probable'];
  els.previewContent.innerHTML = `
    <div class="preview-section">
      <span>${escapeHtml(leadTypeLabel(lead.tipo))}</span>
      <h3>${escapeHtml(lead.nombre || 'Solicitud REDEX')}</h3>
      <p>${escapeHtml(lead.telefono || '')}</p>
      <p>${escapeHtml(lead.email || '')}</p>
      <p>${escapeHtml(lead.mensaje || '')}</p>
      <div class="publish-flags">
        <span class="flag featured">${escapeHtml(lead.estado || 'Nuevo')}</span>
        <span class="flag">${escapeHtml(lead.pagina || '')}</span>
      </div>
    </div>
    <div class="preview-sections">
      ${leadDataHtml(lead)}
    </div>
    <div class="preview-section" style="margin-top:18px;">
      <span>Atribución comercial</span>
      ${leadAttributionHtml(lead)}
    </div>
    <div class="preview-section" style="margin-top:18px;">
      <span>Archivos</span>
      ${leadFilesHtml(lead)}
    </div>
    <div class="preview-section" style="margin-top:18px;">
      <span>Seguimiento comercial</span>
      <p><strong>${escapeHtml(leadScore(lead))}</strong></p>
      ${leadTagsHtml(lead)}
      ${leadHistoryHtml(lead)}
      <form class="lead-followup-form" id="admin-lead-followup-form">
        <input type="hidden" name="id" value="${escapeHtml(lead.id)}">
        <label>
          Estado
          <select class="admin-filter" name="estado">
            ${['Nuevo', 'En proceso', 'Atendida', 'Descartada'].map(option => `<option value="${option}" ${String(lead.estado || 'Nuevo') === option ? 'selected' : ''}>${option}</option>`).join('')}
          </select>
        </label>
        <label>
          Calificación
          <select class="admin-filter" name="calificacion">
            ${['Sin calificar', 'Alta prioridad', 'Interés medio', 'Bajo interés', 'No califica'].map(option => `<option value="${option}" ${leadScore(lead) === option ? 'selected' : ''}>${option}</option>`).join('')}
          </select>
        </label>
        <label>
          Etiquetas
          <select class="admin-filter" name="etiquetas" multiple size="4">
            ${tagOptions.map(option => `<option value="${option}" ${selectedTags.includes(option) ? 'selected' : ''}>${option}</option>`).join('')}
          </select>
        </label>
        <label class="lead-followup-note">
          Nota de seguimiento
          <textarea name="nota" rows="4" placeholder="Escribe la llamada, avance o próxima acción.">${escapeHtml(leadFollowUp(lead).nota || '')}</textarea>
        </label>
        <button class="secondary-btn" type="submit">Guardar seguimiento</button>
      </form>
    </div>
  `;
  document.getElementById('admin-lead-followup-form')?.addEventListener('submit', saveAdminLeadFollowUp);
  openModal(els.previewModal);
}

async function updateLeadStatus(id, estado) {
  const { error } = await supabase.from(LEADS_TABLE).update({ estado }).eq('id', id);
  if (error) {
    toast(error.message || 'No se pudo actualizar la solicitud.', 'error');
    return;
  }
  toast('Solicitud actualizada.');
  await loadLeads();
}

async function deleteLead(id) {
  const lead = getLeadById(id);
  if (!lead) return;
  const confirmed = window.confirm(`Eliminar la solicitud de "${lead.nombre || 'cliente'}"?`);
  if (!confirmed) return;

  const { error } = await supabase.from(LEADS_TABLE).delete().eq('id', id);
  if (error) {
    toast(error.message || 'No se pudo eliminar la solicitud.', 'error');
    return;
  }
  toast('Solicitud eliminada.');
  await loadLeads();
}

function pageLabel(section) {
  return section.paginas?.nombre || section.pagina_nombre || 'Página';
}

function pageSlug(section) {
  return section.paginas?.slug || section.pagina_slug || '';
}

function webSectionKind(section = {}) {
  const text = [
    section.nombre,
    section.slug,
    section.selector_html,
    section.titulo,
    section.subtitulo,
    pageLabel(section),
    pageSlug(section)
  ].join(' ').toLowerCase();

  const kinds = [
    { key: 'hero', label: 'Hero', patterns: ['hero', 'principal', 'inicio'] },
    { key: 'nav', label: 'Menu', patterns: ['nav', 'menu', 'navbar', 'sidebar'] },
    { key: 'property', label: 'Inmuebles', patterns: ['inmueble', 'propiedad', 'propiedades', 'destacada'] },
    { key: 'project', label: 'Proyectos', patterns: ['proyecto', 'residencial'] },
    { key: 'form', label: 'Formulario', patterns: ['form', 'formulario', 'contacto', 'precalificacion', 'quiero vender', 'asesor'] },
    { key: 'media', label: 'Media', patterns: ['video', 'galeria', 'banner', 'carousel', 'carrusel', 'imagen'] },
    { key: 'company', label: 'Empresa', patterns: ['nosotros', 'historia', 'valores', 'beneficio', 'oficina', 'equipo', 'testimonio'] },
    { key: 'footer', label: 'Footer', patterns: ['footer', 'pie'] },
    { key: 'calculator', label: 'Calculadora', patterns: ['calculadora', 'hipoteca', 'cuota'] }
  ];

  return kinds.find(kind => kind.patterns.some(pattern => text.includes(pattern))) || { key: 'general', label: 'General' };
}

function renderWebPageFilter() {
  if (!els.webPageFilter) return;
  const current = els.webPageFilter.value || 'todas';
  els.webPageFilter.innerHTML = '<option value="todas">Todas las páginas</option>' + state.webPages.map(page => (
    `<option value="${escapeHtml(page.slug)}">${escapeHtml(page.nombre)}</option>`
  )).join('');
  els.webPageFilter.value = [...els.webPageFilter.options].some(option => option.value === current) ? current : 'todas';
}

function applyWebFilters() {
  const query = state.webFilters.query.toLowerCase();
  state.filteredWebSections = state.webSections.filter(section => {
    const visible = section.visible !== false;
    const searchable = [
      section.nombre,
      section.slug,
      section.selector_html,
      section.titulo,
      section.subtitulo,
      section.descripcion,
      pageLabel(section),
      pageSlug(section)
    ].join(' ').toLowerCase();

    if (query && !searchable.includes(query)) return false;
    if (state.webFilters.pagina !== 'todas' && pageSlug(section) !== state.webFilters.pagina) return false;
    if (state.webFilters.visibilidad === 'visible' && !visible) return false;
    if (state.webFilters.visibilidad === 'oculta' && visible) return false;
    return true;
  });
}

function renderWebSections() {
  if (!els.webContentTable) return;
  applyWebFilters();

  els.webContentTable.innerHTML = state.filteredWebSections.map(section => {
    const visible = section.visible !== false;
    const kind = webSectionKind(section);
    return `
      <tr class="web-section-row web-section-${kind.key}">
        <td>
          <div class="web-section-cell">
            <span class="section-kind-pill">${escapeHtml(kind.label)}</span>
            <div>
              <strong>${escapeHtml(section.nombre || 'Sección')}</strong>
              <span>${escapeHtml(section.titulo || section.subtitulo || 'Sin texto principal')}</span>
            </div>
          </div>
        </td>
        <td>${escapeHtml(pageLabel(section))}</td>
        <td>${escapeHtml(section.selector_html || '')}</td>
        <td>${escapeHtml(section.orden ?? 0)}</td>
        <td>
          <div class="publish-flags">
            <span class="flag ${visible ? 'on' : 'off'}">${visible ? 'Visible' : 'Oculta'}</span>
            <span class="flag ${section.publicado !== false ? 'featured' : 'off'}">${section.publicado !== false ? 'Publicada' : 'Borrador'}</span>
          </div>
        </td>
        <td>
          <div class="table-actions">
            <button class="ghost-btn" data-web-action="edit" data-id="${section.id}">Editar</button>
            <button class="ghost-btn" data-web-action="toggle-visible" data-id="${section.id}">${visible ? 'Ocultar' : 'Mostrar'}</button>
            <button class="ghost-btn" data-web-action="move-up" data-id="${section.id}">Subir</button>
            <button class="ghost-btn" data-web-action="move-down" data-id="${section.id}">Bajar</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  if (els.webContentEmptyState) {
    els.webContentEmptyState.hidden = state.filteredWebSections.length > 0;
  }
}

async function loadWebContent() {
  const [{ data: pages, error: pagesError }, { data: sections, error: sectionsError }] = await Promise.all([
    supabase.from(WEB_PAGES_TABLE).select('*').order('orden', { ascending: true }),
    supabase.from(WEB_SECTIONS_TABLE).select('*, paginas(slug,nombre,archivo_html)').order('orden', { ascending: true })
  ]);

  if (pagesError) throw pagesError;
  if (sectionsError) throw sectionsError;

  state.webPages = pages || [];
  state.webSections = sections || [];
  renderWebPageFilter();
  renderWebSections();
}

function getWebSectionById(id) {
  return state.webSections.find(section => String(section.id) === String(id));
}

function webContentTextList(section) {
  const content = section?.contenido || {};
  return Array.isArray(content.textos) ? content.textos.filter(Boolean) : [];
}

function fillWebContentForm(section) {
  state.editingWebSectionId = section.id;
  if (els.webContentModalTitle) {
    els.webContentModalTitle.textContent = `Editar ${section.nombre || 'sección'}`;
  }
  const form = els.webContentForm;
  if (!form) return;
  form.reset();
  form.elements.id.value = section.id;
  form.elements.titulo.value = section.titulo || '';
  form.elements.subtitulo.value = section.subtitulo || '';
  form.elements.descripcion.value = section.descripcion || '';
  form.elements.textos.value = webContentTextList(section).join('\n');
  form.elements.imagen_fondo.value = section.imagen_fondo || '';
  form.elements.imagen_principal.value = section.imagen_principal || '';
  form.elements.video_url.value = section.video_url || '';
  form.elements.boton_texto.value = section.boton_texto || '';
  form.elements.boton_url.value = section.boton_url || '';
  form.elements.whatsapp_url.value = section.whatsapp_url || '';
  form.elements.orden.value = section.orden ?? 0;
  form.elements.visible.value = String(section.visible !== false);
}

function buildWebSectionPayload(form) {
  const formData = new FormData(form);
  const current = getWebSectionById(state.editingWebSectionId);
  const currentContent = current?.contenido && typeof current.contenido === 'object' ? current.contenido : {};
  return {
    titulo: textValue(formData, 'titulo'),
    subtitulo: textValue(formData, 'subtitulo'),
    descripcion: textValue(formData, 'descripcion'),
    contenido: {
      ...currentContent,
      cms_publicado: true,
      textos: listValue(formData, 'textos')
    },
    imagen_fondo: textValue(formData, 'imagen_fondo'),
    imagen_principal: textValue(formData, 'imagen_principal'),
    video_url: textValue(formData, 'video_url'),
    boton_texto: textValue(formData, 'boton_texto'),
    boton_url: textValue(formData, 'boton_url'),
    whatsapp_url: textValue(formData, 'whatsapp_url'),
    orden: integerValue(formData, 'orden') ?? 0,
    visible: String(formData.get('visible')) !== 'false',
    publicado: true
  };
}

async function saveWebContent(event) {
  event.preventDefault();
  if (!state.editingWebSectionId) return;

  const form = event.currentTarget;
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  submit.textContent = 'Guardando...';

  try {
    const current = getWebSectionById(state.editingWebSectionId);
    const slug = `${pageSlug(current) || 'contenido'}-${current?.slug || state.editingWebSectionId}`;
    const payload = buildWebSectionPayload(form);

    const imageFile = form.elements.image_file?.files?.[0];
    const imageUrl = await uploadFile(imageFile, slug, 'imagenes', WEB_CONTENT_BUCKET);
    if (imageUrl) payload.imagen_principal = imageUrl;

    const videoFile = form.elements.video_file?.files?.[0];
    const videoUrl = await uploadFile(videoFile, slug, 'videos', WEB_CONTENT_BUCKET);
    if (videoUrl) payload.video_url = videoUrl;

    const { error } = await supabase
      .from(WEB_SECTIONS_TABLE)
      .update(payload)
      .eq('id', state.editingWebSectionId);

    if (error) throw error;

    closeModal(els.webContentModal);
    toast('Sección actualizada.');
    await loadWebContent();
  } catch (error) {
    toast(error.message || 'No se pudo guardar la sección.', 'error');
  } finally {
    submit.disabled = false;
    submit.textContent = 'Guardar sección';
  }
}

async function toggleWebSectionVisible(id) {
  const section = getWebSectionById(id);
  if (!section) return;
  const { error } = await supabase
    .from(WEB_SECTIONS_TABLE)
    .update({ visible: section.visible === false })
    .eq('id', id);

  if (error) {
    toast(error.message || 'No se pudo actualizar la visibilidad.', 'error');
    return;
  }

  toast('Visibilidad actualizada.');
  await loadWebContent();
}

async function moveWebSection(id, direction) {
  const section = getWebSectionById(id);
  if (!section) return;
  const nextOrder = Number(section.orden || 0) + direction;
  const { error } = await supabase
    .from(WEB_SECTIONS_TABLE)
    .update({ orden: nextOrder })
    .eq('id', id);

  if (error) {
    toast(error.message || 'No se pudo cambiar el orden.', 'error');
    return;
  }

  toast('Orden actualizado.');
  await loadWebContent();
}

function previewWebContent() {
  const current = getWebSectionById(state.editingWebSectionId);
  if (!current || !els.previewContent || !els.webContentForm) return;
  const draft = { ...current, ...buildWebSectionPayload(els.webContentForm) };
  els.previewContent.innerHTML = `
    <div class="preview-section">
      <span>${escapeHtml(pageLabel(current))} · ${escapeHtml(current.selector_html || '')}</span>
      <h3>${escapeHtml(draft.titulo || current.nombre || 'Sección')}</h3>
      <p>${escapeHtml(draft.subtitulo || '')}</p>
      <p>${escapeHtml(draft.descripcion || '')}</p>
      ${draft.imagen_principal ? `<img src="${escapeHtml(draft.imagen_principal)}" alt="${escapeHtml(draft.titulo || current.nombre)}" style="width:100%;max-height:280px;object-fit:cover;border-radius:8px;margin-top:12px;">` : ''}
      <div class="publish-flags" style="margin-top:12px;">
        <span class="flag ${draft.visible ? 'on' : 'off'}">${draft.visible ? 'Visible' : 'Oculta'}</span>
        <span class="flag featured">Orden ${escapeHtml(draft.orden)}</span>
      </div>
    </div>
  `;
  openModal(els.previewModal);
}

function showModule(moduleName) {
  state.activeModule = moduleName;
  const isProjects = moduleName === 'projects';
  const isWebContent = moduleName === 'web-content';
  const isSales = moduleName === 'sales';
  const isLeads = moduleName === 'leads';
  const isAdvisors = moduleName === 'advisors';
  const isProperties = moduleName === 'properties';

  els.propertiesSection.hidden = !isProperties;
  els.projectsSection.hidden = !isProjects;
  if (els.webContentSection) els.webContentSection.hidden = !isWebContent;
  if (els.salesSection) els.salesSection.hidden = !isSales;
  if (els.leadsSection) els.leadsSection.hidden = !isLeads;
  if (els.advisorsSection) els.advisorsSection.hidden = !isAdvisors;
  const propertyMetrics = document.querySelector('section.metrics-grid:not(#projects-metrics)');
  if (propertyMetrics) propertyMetrics.hidden = !isProperties;
  if (els.projectsMetrics) els.projectsMetrics.hidden = !isProjects;
  if (els.salesMetrics) els.salesMetrics.hidden = !isSales;

  els.moduleTabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.moduleTab === moduleName);
  });
}

function bindEvents() {
  els.manageBtn?.addEventListener('click', () => {
    showModule('properties');
    els.propertiesSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  els.manageProjectsBtn?.addEventListener('click', () => {
    showModule('projects');
    els.projectsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  els.manageWebContentBtn?.addEventListener('click', () => {
    showModule('web-content');
    els.webContentSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  els.manageSalesBtn?.addEventListener('click', () => {
    showModule('sales');
    els.salesSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  els.manageLeadsBtn?.addEventListener('click', () => {
    showModule('leads');
    els.leadsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  els.manageAdvisorsBtn?.addEventListener('click', () => {
    showModule('advisors');
    els.advisorsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  els.moduleTabs.forEach(tab => {
    tab.addEventListener('click', () => showModule(tab.dataset.moduleTab));
  });

  els.refreshBtn?.addEventListener('click', async () => {
    els.refreshBtn.disabled = true;
    await loadProperties().catch(error => toast(error.message, 'error'));
    await loadProjects().catch(error => toast(`Proyectos pendiente: ${error.message}`, 'error'));
    await loadWebContent().catch(error => toast(`Contenido web pendiente: ${error.message}`, 'error'));
    await loadSales().catch(error => toast(`Ventas pendiente: ${error.message}`, 'error'));
    await loadSalesReports().catch(error => toast(`Reportes de venta pendiente: ${error.message}`, 'error'));
    await loadLeads().catch(error => toast(`Solicitudes pendiente: ${error.message}`, 'error'));
    await loadAdvisors().catch(error => toast(`Asesores pendiente: ${error.message}`, 'error'));
    els.refreshBtn.disabled = false;
  });

  els.createBtn?.addEventListener('click', () => {
    resetPropertyForm();
    openModal(els.propertyModal);
  });

  els.search?.addEventListener('input', event => {
    state.filters.query = event.target.value.trim();
    renderProperties();
  });

  els.cityFilter?.addEventListener('change', event => {
    state.filters.ciudad = event.target.value;
    renderProperties();
  });

  els.typeFilter?.addEventListener('change', event => {
    state.filters.tipo = event.target.value;
    renderProperties();
  });

  els.statusFilter?.addEventListener('change', event => {
    state.filters.estado = event.target.value;
    renderProperties();
  });

  els.visibilityFilter?.addEventListener('change', event => {
    state.filters.visibilidad = event.target.value;
    renderProperties();
  });

  els.createProjectBtn?.addEventListener('click', () => {
    resetProjectForm();
    openModal(els.projectModal);
  });

  els.projectSearch?.addEventListener('input', event => {
    state.projectFilters.query = event.target.value.trim();
    renderProjects();
  });

  els.projectStatusFilter?.addEventListener('change', event => {
    state.projectFilters.estado = event.target.value;
    renderProjects();
  });

  els.projectVisibilityFilter?.addEventListener('change', event => {
    state.projectFilters.visibilidad = event.target.value;
    renderProjects();
  });

  els.webContentSearch?.addEventListener('input', event => {
    state.webFilters.query = event.target.value.trim();
    renderWebSections();
  });

  els.webPageFilter?.addEventListener('change', event => {
    state.webFilters.pagina = event.target.value;
    renderWebSections();
  });

  els.webVisibilityFilter?.addEventListener('change', event => {
    state.webFilters.visibilidad = event.target.value;
    renderWebSections();
  });

  els.createSaleBtn?.addEventListener('click', () => {
    resetSaleForm();
    openModal(els.saleModal);
  });

  els.generateSaleLinkBtn?.addEventListener('click', () => {
    resetSaleLinkForm();
    openModal(els.saleLinkModal);
  });

  els.saleAssetType?.addEventListener('change', () => refreshSaleAssetOptions());
  els.saleAsset?.addEventListener('change', syncSaleAssetDefaults);
  els.saleLinkAssetType?.addEventListener('change', () => refreshSaleLinkAssetOptions());

  els.salesSearch?.addEventListener('input', event => {
    state.salesFilters.query = event.target.value.trim();
    renderSales();
  });

  els.salesTypeFilter?.addEventListener('change', event => {
    state.salesFilters.tipo = event.target.value;
    renderSales();
  });

  els.salesSettlementFilter?.addEventListener('change', event => {
    state.salesFilters.liquidacion = event.target.value;
    renderSales();
  });

  els.salesDateFrom?.addEventListener('change', event => {
    state.salesFilters.dateFrom = event.target.value;
    renderSales();
  });

  els.salesDateTo?.addEventListener('change', event => {
    state.salesFilters.dateTo = event.target.value;
    renderSales();
  });

  els.salesOrderFilter?.addEventListener('change', event => {
    state.salesFilters.order = event.target.value;
    renderSales();
  });

  els.downloadSalesReportBtn?.addEventListener('click', downloadSalesDateReport);

  els.leadsSearch?.addEventListener('input', event => {
    state.leadFilters.query = event.target.value.trim();
    renderLeads();
  });

  els.leadsTypeFilter?.addEventListener('change', event => {
    state.leadFilters.tipo = event.target.value;
    renderLeads();
  });

  els.leadsStatusFilter?.addEventListener('change', event => {
    state.leadFilters.estado = event.target.value;
    renderLeads();
  });

  els.leadsExportBtn?.addEventListener('click', exportLeads);

  els.createAdvisorBtn?.addEventListener('click', () => {
    resetAdvisorForm();
    openModal(els.advisorModal);
  });

  els.advisorsSearch?.addEventListener('input', event => {
    state.advisorFilters.query = event.target.value.trim();
    renderAdvisors();
  });

  els.advisorsStatusFilter?.addEventListener('change', event => {
    state.advisorFilters.estado = event.target.value;
    renderAdvisors();
  });

  document.querySelectorAll('[data-close-modal]').forEach(button => {
    button.addEventListener('click', () => {
      closeModal(button.closest('.admin-modal'));
    });
  });

  document.querySelectorAll('.admin-modal').forEach(modal => {
    modal.addEventListener('click', event => {
      if (event.target === modal) closeModal(modal);
    });
  });

  els.propertyForm?.addEventListener('submit', saveProperty);
  els.propertyForm?.addEventListener('click', handleMediaAction);
  els.previewBtn?.addEventListener('click', previewDraftProperty);
  els.statusForm?.addEventListener('submit', saveStatus);
  els.projectForm?.addEventListener('submit', saveProject);
  els.projectForm?.addEventListener('click', handleProjectMediaAction);
  els.projectPreviewBtn?.addEventListener('click', previewDraftProject);
  els.projectStatusForm?.addEventListener('submit', saveProjectStatus);
  els.webContentForm?.addEventListener('submit', saveWebContent);
  els.webContentPreviewBtn?.addEventListener('click', previewWebContent);
  els.saleForm?.addEventListener('submit', saveSale);
  els.salePreviewBtn?.addEventListener('click', previewSaleFromForm);
  els.saleLinkForm?.addEventListener('submit', generateSaleLink);
  els.copySaleLinkBtn?.addEventListener('click', copySaleLink);
  els.advisorForm?.addEventListener('submit', saveAdvisor);
  els.advisorPreviewBtn?.addEventListener('click', () => previewAdvisor());
  els.advisorForm?.elements.foto_url?.addEventListener('input', event => {
    updateAdvisorPhotoPreview(event.target.value, els.advisorForm?.elements.foto_posicion?.value || 'center 18%');
  });
  els.advisorForm?.elements.foto_posicion?.addEventListener('change', event => {
    const file = els.advisorForm?.elements.foto_file?.files?.[0];
    const url = file && advisorPhotoObjectUrl
      ? advisorPhotoObjectUrl
      : els.advisorForm?.elements.foto_url?.value;
    updateAdvisorPhotoPreview(url, event.target.value);
  });
  els.advisorForm?.elements.foto_file?.addEventListener('change', event => {
    revokeAdvisorPhotoObjectUrl();
    const file = event.target.files?.[0];
    if (!file) {
      updateAdvisorPhotoPreview(els.advisorForm?.elements.foto_url?.value, els.advisorForm?.elements.foto_posicion?.value || 'center 18%');
      return;
    }
    advisorPhotoObjectUrl = URL.createObjectURL(file);
    updateAdvisorPhotoPreview(advisorPhotoObjectUrl, els.advisorForm?.elements.foto_posicion?.value || 'center 18%');
  });

  ['imagen_portada', 'galeria', 'videos'].forEach(name => {
    els.propertyForm?.elements[name]?.addEventListener('input', renderMediaManagers);
    els.projectForm?.elements[name]?.addEventListener('input', renderProjectMediaManagers);
  });

  els.propertiesTable?.addEventListener('click', event => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    if (action === 'view') viewProperty(id);
    if (action === 'edit') {
      const property = getPropertyById(id);
      if (property) {
        fillPropertyForm(property);
        openModal(els.propertyModal);
      }
    }
    if (action === 'duplicate') duplicateProperty(id);
    if (action === 'status') openStatusModal(id);
    if (action === 'toggle-featured') updateBoolean(id, 'destacado');
    if (action === 'toggle-visible') updateBoolean(id, 'visible');
    if (action === 'delete') deleteProperty(id);
  });

  els.projectsTable?.addEventListener('click', event => {
    const button = event.target.closest('button[data-project-action]');
    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.projectAction;

    if (action === 'view') viewProject(id);
    if (action === 'edit') {
      const project = getProjectById(id);
      if (project) {
        fillProjectForm(project);
        openModal(els.projectModal);
      }
    }
    if (action === 'duplicate') duplicateProject(id);
    if (action === 'status') openProjectStatusModal(id);
    if (action === 'toggle-featured') updateProjectBoolean(id, 'destacado');
    if (action === 'toggle-visible') updateProjectBoolean(id, 'visible');
    if (action === 'delete') deleteProject(id);
  });

  els.webContentTable?.addEventListener('click', event => {
    const button = event.target.closest('button[data-web-action]');
    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.webAction;

    if (action === 'edit') {
      const section = getWebSectionById(id);
      if (section) {
        fillWebContentForm(section);
        openModal(els.webContentModal);
      }
    }
    if (action === 'toggle-visible') toggleWebSectionVisible(id);
    if (action === 'move-up') moveWebSection(id, -1);
    if (action === 'move-down') moveWebSection(id, 1);
  });

  els.salesTable?.addEventListener('click', event => {
    const button = event.target.closest('button[data-sale-action]');
    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.saleAction;

    if (action === 'view') viewSale(id);
    if (action === 'edit') {
      const sale = getSaleById(id);
      if (sale) {
        fillSaleForm(sale);
        openModal(els.saleModal);
      }
    }
    if (action === 'delete') deleteSale(id);
  });

  els.salesReportsTable?.addEventListener('click', event => {
    const button = event.target.closest('button[data-sale-report-action]');
    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.saleReportAction;

    if (action === 'view') viewSaleReport(id);
    if (action === 'approve') approveSaleReport(id);
    if (action === 'reject') rejectSaleReport(id);
  });

  els.leadsTable?.addEventListener('click', event => {
    const button = event.target.closest('button[data-lead-action]');
    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.leadAction;

    if (action === 'view') viewLead(id);
    if (action === 'approve-advisor') approveLeadAsAdvisor(id);
    if (action === 'process') updateLeadStatus(id, 'En proceso');
    if (action === 'done') updateLeadStatus(id, 'Atendida');
    if (action === 'discard') updateLeadStatus(id, 'Descartada');
    if (action === 'delete') deleteLead(id);
  });

  els.advisorsTable?.addEventListener('click', event => {
    const button = event.target.closest('button[data-advisor-action]');
    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.advisorAction;

    if (action === 'copy-link') copyAdvisorLink(id);
    if (action === 'view') previewAdvisor(id);
    if (action === 'edit') {
      const advisor = getAdvisorById(id);
      if (advisor) {
        fillAdvisorForm(advisor);
        openModal(els.advisorModal);
      }
    }
    if (action === 'activate') updateAdvisorStatus(id, 'activo');
    if (action === 'pending') updateAdvisorStatus(id, 'pendiente');
    if (action === 'suspend') updateAdvisorStatus(id, 'suspendido');
    if (action === 'reject') updateAdvisorStatus(id, 'rechazado');
    if (action === 'delete') deleteAdvisor(id);
  });

  document.addEventListener('keydown', event => {
    keepFocusInsideModal(event);
    if (event.key !== 'Escape') return;
    if (activeModal) closeModal(activeModal);
  });
}

async function init() {
  bindEvents();
  showModule('properties');

  if (!isSupabaseConfigured()) {
    if (els.guardMessage) {
      els.guardMessage.hidden = false;
      els.guardMessage.textContent = 'Configura Supabase en admin/js/supabase-config.js para activar el panel.';
    }
    return;
  }

  const session = await requireSession();
  if (!session) return;

  await loadProperties();
  await loadProjects().catch(error => {
    state.projects = [];
    renderProjectMetrics();
    renderProjects();
    toast(`Proyectos pendiente: ${error.message}`, 'error');
  });
  await loadWebContent().catch(error => {
    state.webPages = [];
    state.webSections = [];
    renderWebPageFilter();
    renderWebSections();
    toast(`Contenido web pendiente: ${error.message}`, 'error');
  });
  await loadAdvisors().catch(error => {
    state.advisors = [];
    renderAdvisors();
    toast(`Asesores pendiente: ${error.message}`, 'error');
  });
  await loadSales().catch(error => {
    state.sales = [];
    renderSalesMetrics();
    renderSales();
    toast(`Ventas pendiente: ${error.message}`, 'error');
  });
  await loadSalesReports().catch(error => {
    state.salesReports = [];
    renderSalesReports();
    toast(`Reportes de venta pendiente: ${error.message}`, 'error');
  });
  await loadLeads().catch(error => {
    state.leads = [];
    renderLeads();
    toast(`Solicitudes pendiente: ${error.message}`, 'error');
  });
}

init().catch(error => {
  toast(error.message || 'No se pudo iniciar el dashboard.', 'error');
});
