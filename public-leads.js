import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://uwcxkwwtvvsplcnlncfd.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ZeMpdNfPRtxuALkJgnQf3g_G1xm50Th';
const LEADS_TABLE = 'solicitudes';
const LEADS_BUCKET = 'solicitudes';
const ADVISORS_TABLE = 'asesores';
const ATTRIBUTION_KEY = 'redex_advisor_attribution';
const SESSION_KEY = 'redex_session_id';
const ATTRIBUTION_DAYS = 90;
const REDEX_CORPORATE_SOCIALS = {
  instagram_url: 'https://www.instagram.com/redexinmobiliariasrl?igsh=NnptMjgxZTA2aHVn',
  facebook_url: 'https://www.facebook.com/share/1Q9NidvyTV/?mibextid=wwXIfr'
};

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
}

const handled = new WeakSet();
let attributionReady = null;

function slugify(value) {
  return String(value || 'solicitud')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70) || 'solicitud';
}

function fieldLabel(field) {
  if (field.name) return field.name;
  if (field.id) return field.id;
  const explicit = field.id ? document.querySelector(`label[for="${CSS.escape(field.id)}"]`) : null;
  if (explicit?.textContent) return explicit.textContent;
  const wrapped = field.closest('label');
  if (wrapped?.textContent) return wrapped.textContent;
  const container = field.closest('div');
  const label = container?.querySelector('label');
  return label?.textContent || field.placeholder || field.type || 'campo';
}

function cleanLabel(value) {
  return String(value || '')
    .replace(/\*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function formType(form) {
  if (form.id === 'vender-form') return 'quiero_vender';
  if (form.id === 'asesor-form') return 'quiero_ser_asesor';
  if (form.id === 'precalificate-form') return 'precalificacion';
  if (form.id === 'hipo-form-new') return 'hipoteca';
  if (form.id === 'contact-form') return 'contacto';
  return form.id || 'formulario';
}

function pageName() {
  return location.pathname.split('/').pop() || 'index.html';
}

function safeJsonParse(value, fallback = null) {
  try {
    return JSON.parse(value);
  } catch (_) {
    return fallback;
  }
}

function getSessionId() {
  try {
    let sessionId = localStorage.getItem(SESSION_KEY);
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem(SESSION_KEY, sessionId);
    }
    return sessionId;
  } catch (_) {
    return crypto.randomUUID();
  }
}

function advisorParam() {
  const params = new URLSearchParams(location.search);
  const raw =
    params.get('asesor')
    || params.get('asesor_slug')
    || params.get('advisor')
    || params.get('ref')
    || params.get('a');
  return raw ? slugify(raw) : '';
}

function activeStoredAttribution() {
  try {
    const stored = safeJsonParse(localStorage.getItem(ATTRIBUTION_KEY));
    if (!stored || !stored.asesor_slug || !stored.expires_at) return null;
    if (new Date(stored.expires_at).getTime() < Date.now()) {
      localStorage.removeItem(ATTRIBUTION_KEY);
      return null;
    }
    return stored;
  } catch (_) {
    return null;
  }
}

function saveAttribution(attribution) {
  try {
    localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify(attribution));
  } catch (_) {}
}

function activeAdvisorSlug() {
  return activeStoredAttribution()?.asesor_slug || '';
}

function isInternalUrl(url) {
  return url.origin === window.location.origin;
}

function shouldPreserveAdvisor(link, url) {
  const rawHref = link.getAttribute('href') || '';
  if (!rawHref || rawHref.startsWith('#')) return false;
  if (/^(mailto:|tel:|sms:|javascript:|data:)/i.test(rawHref)) return false;
  if (!isInternalUrl(url)) return false;
  if (url.pathname.includes('/admin/')) return false;
  if (url.pathname.endsWith('/portal-asesor.html')) return false;
  return true;
}

function withAdvisorParam(href, slug = activeAdvisorSlug()) {
  if (!slug) return href;
  try {
    const url = new URL(href, window.location.href);
    if (!isInternalUrl(url)) return href;
    url.searchParams.set('asesor', slug);
    return `${url.pathname}${url.search}${url.hash}`;
  } catch (_) {
    return href;
  }
}

function normalizePhone(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  if (digits.length === 10) return `1${digits}`;
  return digits;
}

function normalizedAdvisorPhoneKey(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
}

function firstAdvisorPhone(source, preferredKeys = []) {
  if (!source) return '';
  const data = source.datos && typeof source.datos === 'object' ? source.datos : {};
  const candidates = [
    ...preferredKeys.map(key => source[key]),
    ...preferredKeys.map(key => data[key]),
    source.asesor_whatsapp,
    source.whatsapp,
    source.asesor_telefono,
    source.telefono,
    source.celular,
    source.phone,
    data.asesor_whatsapp,
    data.whatsapp,
    data.whatsapp_url,
    data.telefono_whatsapp,
    data.telefono,
    data.celular,
    data.movil,
    data.phone
  ];
  return candidates.find(value => normalizePhone(value)) || '';
}

function advisorDuplicateKeys(advisor) {
  return [
    normalizedAdvisorPhoneKey(firstAdvisorPhone(advisor, ['telefono'])),
    normalizedAdvisorPhoneKey(firstAdvisorPhone(advisor, ['whatsapp']))
  ].filter(Boolean);
}

function sortAdvisorsWithDuplicatesLast(advisors) {
  const counts = new Map();
  advisors.forEach(advisor => {
    new Set(advisorDuplicateKeys(advisor)).forEach(key => counts.set(key, (counts.get(key) || 0) + 1));
  });
  return [...advisors].sort((a, b) => {
    const aDuplicate = advisorDuplicateKeys(a).some(key => (counts.get(key) || 0) > 1);
    const bDuplicate = advisorDuplicateKeys(b).some(key => (counts.get(key) || 0) > 1);
    if (aDuplicate !== bDuplicate) return aDuplicate ? 1 : -1;
    return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es', { sensitivity: 'base' });
  });
}

function isWhatsAppHref(href) {
  return /(?:wa\.me|api\.whatsapp\.com|whatsapp)/i.test(String(href || ''));
}

function advisorWhatsAppPhone(attribution = activeStoredAttribution()) {
  return normalizePhone(firstAdvisorPhone(attribution, ['asesor_whatsapp', 'whatsapp', 'asesor_telefono', 'telefono']));
}

function buildAdvisorWhatsAppHref(originalHref, attribution = activeStoredAttribution()) {
  if (!attribution) return originalHref;
  try {
    const url = new URL(originalHref, window.location.href);
    const advisorPhone = advisorWhatsAppPhone(attribution);
    const targetPhone = advisorPhone || normalizePhone(url.pathname.replace(/\//g, ''));
    const params = new URLSearchParams(url.search);
    const currentText = params.get('text') || '';
    const reference = `\n\nAsesor REDEX: ${attribution.asesor_nombre || attribution.asesor_slug} (@${attribution.asesor_slug})`;
    const text = currentText.includes(attribution.asesor_slug)
      ? currentText
      : `${currentText || 'Hola, me interesa recibir información de REDEX.'}${reference}`;
    return `https://wa.me/${targetPhone || '18495180024'}?text=${encodeURIComponent(text)}`;
  } catch (_) {
    return originalHref;
  }
}

function advisorSocials(source) {
  const direct = source?.redes_sociales && typeof source.redes_sociales === 'object' ? source.redes_sociales : null;
  const data = source?.datos && typeof source.datos === 'object' ? source.datos : {};
  const fromData = data.redes_sociales && typeof data.redes_sociales === 'object' ? data.redes_sociales : null;
  return direct || fromData || {};
}

function advisorPhotoPosition(source) {
  const data = source?.datos && typeof source.datos === 'object' ? source.datos : {};
  return data.foto_posicion || data.object_position || 'center 20%';
}

function institutionalSocials(source) {
  const socials = advisorSocials(source);
  return {
    ...socials,
    instagram_url: socials.instagram_url || REDEX_CORPORATE_SOCIALS.instagram_url,
    facebook_url: socials.facebook_url || REDEX_CORPORATE_SOCIALS.facebook_url
  };
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

function displayPhone(value) {
  const digits = normalizePhone(value);
  const local = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (local.length !== 10) return digits || '';
  return `${local.slice(0, 3)}-${local.slice(3, 6)}-${local.slice(6)}`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function isInstitutionalAttribution(attribution) {
  const slug = slugify(attribution?.asesor_slug || '');
  const name = slugify(attribution?.asesor_nombre || '');
  const institutionalKeys = ['solicitud', 'redex', 'redex-inmobiliaria'];
  if (institutionalKeys.includes(slug) || institutionalKeys.includes(name)) return true;
  return !attribution?.asesor_id && !slug;
}

function advisorPublicCardHtml(attribution) {
  const institutional = isInstitutionalAttribution(attribution);
  const socials = institutional ? institutionalSocials(attribution) : advisorSocials(attribution);
  const links = [
    ['instagram_url', 'Instagram', 'Instagram'],
    ['facebook_url', 'Facebook', 'Facebook'],
    ['linkedin_url', 'LinkedIn', 'LinkedIn'],
    ['tiktok_url', 'TikTok', 'TikTok'],
    ['youtube_url', 'YT', 'YouTube'],
    ['web_url', 'WEB', 'Web']
  ]
    .map(([key, label, title]) => {
      const href = socialHref(key, socials[key]);
      const platform = key.replace('_url', '');
      return href ? `<a class="redex-advisor-card__social redex-advisor-card__social--${escapeHtml(platform)}" href="${escapeHtml(href)}" target="_blank" rel="noopener" title="${escapeHtml(title)}">${label}</a>` : '';
    })
    .join('');
  const photo = institutional ? 'logo-redex-color.png' : (attribution.asesor_foto_url || 'images/asesores/jordan-fabian.jpg');
  const displayName = institutional ? 'Contáctame' : (attribution.asesor_nombre || 'REDEX Inmobiliaria');
  const displayLabel = institutional ? 'Asesor REDEX' : 'Asesor REDEX';
  const phone = advisorWhatsAppPhone(attribution);
  const whatsapp = phone
    ? `<a class="redex-advisor-card__wa" href="${escapeHtml(buildAdvisorWhatsAppHref(`https://wa.me/${phone}`))}" target="_blank" rel="noopener">WhatsApp</a>`
    : '';
  const phoneLine = phone ? `<em class="redex-advisor-card__phone">${escapeHtml(displayPhone(phone))}</em>` : '';

  return `
    <div class="redex-advisor-card__person${institutional ? ' is-redex-brand' : ''}">
      <img src="${escapeHtml(photo)}" alt="${escapeHtml(displayName)}" onerror="this.src='logo-redex-color.png'">
      <div>
        <span>${escapeHtml(displayLabel)}</span>
        <strong>${escapeHtml(displayName)}</strong>
        ${phoneLine}
      </div>
    </div>
    <div class="redex-advisor-card__actions">
      ${whatsapp}
      ${links}
    </div>
  `;
}

function renderAdvisorPublicCard() {
  const attribution = activeStoredAttribution();
  if (!attribution?.asesor_slug || document.getElementById('redex-advisor-card')) return;
  if (location.pathname.includes('/admin/') || location.pathname.endsWith('/portal-asesor.html')) return;

  if (!document.getElementById('redex-advisor-card-style')) {
    const style = document.createElement('style');
    style.id = 'redex-advisor-card-style';
    style.textContent = `
      #redex-advisor-card {
        position: fixed;
        right: 22px;
        bottom: 92px;
        z-index: 9997;
        width: min(292px, calc(100vw - 28px));
        padding: 10px 11px;
        border: 1px solid rgba(200, 164, 74, 0.42);
        border-radius: 15px;
        background: rgba(8, 12, 24, 0.88);
        color: #fff;
        box-shadow: 0 18px 48px rgba(0,0,0,0.32);
        backdrop-filter: blur(14px);
        font-family: Inter, system-ui, sans-serif;
        opacity: 0;
        visibility: hidden;
        transform: translateY(12px);
        pointer-events: none;
        transition: opacity 0.22s ease, visibility 0.22s ease, transform 0.22s ease;
      }
      #redex-advisor-card.is-visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
        pointer-events: auto;
      }
      .redex-advisor-card__person {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 9px;
        min-width: 0;
      }
      .redex-advisor-card__person img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        object-fit: cover;
        border: 1px solid rgba(200,164,74,0.5);
        flex: 0 0 auto;
      }
      .redex-advisor-card__person.is-redex-brand img {
        object-fit: contain;
        background: rgba(255,255,255,0.96);
        padding: 4px;
        order: 1;
        margin-left: 0;
      }
      .redex-advisor-card__person.is-redex-brand > div {
        order: 2;
        min-width: 0;
        display: flex;
        align-items: baseline;
        justify-content: flex-end;
        gap: 6px;
        flex: 1;
        text-align: right;
        margin-left: 0;
      }
      .redex-advisor-card__person span {
        display: block;
        color: #fff;
        font-size: 9px;
        font-weight: 800;
        letter-spacing: 1px;
        text-transform: uppercase;
        white-space: nowrap;
      }
      .redex-advisor-card__person strong {
        display: block;
        margin-top: 0;
        font-size: 13px;
        line-height: 1.15;
        color: #0f67c8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 104px;
      }
      .redex-advisor-card__phone {
        display: block;
        margin-top: 2px;
        color: #25D366;
        font-size: 9px;
        font-style: normal;
        font-weight: 900;
        letter-spacing: 0.2px;
        white-space: nowrap;
      }
      .redex-advisor-card__actions {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        justify-content: flex-end;
        margin-top: 8px;
      }
      .redex-advisor-card__actions a {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-height: 29px;
        padding: 0 11px;
        border: 1px solid rgba(255,255,255,0.14);
        border-radius: 999px;
        color: #c8a44a;
        text-decoration: none;
        font-size: 9.5px;
        font-weight: 900;
        letter-spacing: 0.7px;
        transition: border-color 0.18s ease, color 0.18s ease, background 0.18s ease, transform 0.18s ease;
      }
      .redex-advisor-card__actions a:hover {
        transform: translateY(-1px);
      }
      .redex-advisor-card__social--instagram:hover,
      .redex-advisor-card__social--facebook:hover {
        border-color: rgba(203, 19, 43, 0.72);
        background: rgba(203, 19, 43, 0.16);
        color: #ff4d61;
      }
      .redex-advisor-card__actions .redex-advisor-card__wa {
        border-color: rgba(37,211,102,0.52);
        color: #25D366;
      }
      @media (max-width: 760px) {
        #redex-advisor-card {
          left: auto;
          right: 14px;
          bottom: 84px;
          width: auto;
          max-width: 172px;
          padding: 8px 10px;
          border-radius: 999px;
          background: rgba(8, 12, 24, 0.74);
          box-shadow: 0 12px 34px rgba(0,0,0,0.24);
          backdrop-filter: blur(12px);
        }
        .redex-advisor-card__person {
          gap: 8px;
        }
        .redex-advisor-card__person img {
          width: 34px;
          height: 34px;
        }
        .redex-advisor-card__person span {
          font-size: 8px;
          letter-spacing: 0.8px;
        }
        .redex-advisor-card__person strong {
          max-width: 92px;
          font-size: 12px;
          line-height: 1.05;
        }
        .redex-advisor-card__phone {
          font-size: 8px;
        }
        .redex-advisor-card__actions {
          display: flex;
          justify-content: flex-end;
          gap: 4px;
          margin-top: 5px;
          padding-right: 2px;
        }
        .redex-advisor-card__actions a {
          min-height: 19px;
          padding: 0 6px;
          font-size: 7px;
          letter-spacing: 0.2px;
        }
        .redex-advisor-card__actions .redex-advisor-card__wa {
          display: none;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const card = document.createElement('aside');
  card.id = 'redex-advisor-card';
  card.setAttribute('aria-label', 'Asesor asignado');
  card.innerHTML = advisorPublicCardHtml(attribution);
  document.body.appendChild(card);

  const toggleCardVisibility = () => {
    const hero = document.getElementById('hero') || document.getElementById('inicio');
    if (!hero) {
      card.classList.add('is-visible');
      return;
    }
    const heroBottom = hero.getBoundingClientRect().bottom;
    card.classList.toggle('is-visible', heroBottom <= 80);
  };

  toggleCardVisibility();
  window.addEventListener('scroll', toggleCardVisibility, { passive: true });
  window.addEventListener('resize', toggleCardVisibility, { passive: true });
}

function preserveAdvisorAttributionInLinks() {
  const attribution = activeStoredAttribution();
  if (!attribution?.asesor_slug) return;

  document.querySelectorAll('a[href]').forEach(link => {
    const rawHref = link.getAttribute('href') || '';
    if (isWhatsAppHref(rawHref)) {
      const nextHref = buildAdvisorWhatsAppHref(rawHref, attribution);
      if (rawHref !== nextHref) link.setAttribute('href', nextHref);
      link.dataset.redexAdvisorAttributed = attribution.asesor_slug;
      if (link.id === 'float-wa') {
        link.setAttribute('aria-label', `WhatsApp ${attribution.asesor_nombre || 'asesor REDEX'}`);
        link.dataset.redexAdvisorPhone = advisorWhatsAppPhone(attribution);
      }
      return;
    }

    try {
      const url = new URL(rawHref, window.location.href);
      if (!shouldPreserveAdvisor(link, url)) return;
      const nextHref = withAdvisorParam(rawHref, attribution.asesor_slug);
      if (rawHref !== nextHref) link.setAttribute('href', nextHref);
      link.dataset.redexAdvisorAttributed = attribution.asesor_slug;
    } catch (_) {}
  });
}

function bindDynamicLinkAttribution() {
  let scheduled = false;
  let refreshes = 0;
  const run = () => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      preserveAdvisorAttributionInLinks();
    });
  };
  run();
  document.addEventListener('DOMContentLoaded', run);
  window.addEventListener('load', run);
  window.addEventListener('redex:content-updated', run);
  const interval = setInterval(() => {
    refreshes += 1;
    run();
    if (refreshes >= 20) clearInterval(interval);
  }, 500);
  try {
    const observer = new MutationObserver(() => run());
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['href']
    });
  } catch (_) {}
}

async function saveWhatsAppIntent(href) {
  const attribution = activeStoredAttribution();
  if (!attribution || !isSupabaseConfigured()) return;
  const key = `redex_whatsapp_intent_${getSessionId()}_${pageName()}_${attribution.asesor_slug}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch (_) {}

  const payload = {
    tipo: 'whatsapp_click',
    pagina: pageName(),
    origen_url: location.href,
    nombre: '',
    email: '',
    telefono: '',
    interes: 'Contacto por WhatsApp',
    mensaje: `Cliente tocó WhatsApp desde link de asesor: ${attribution.asesor_nombre || attribution.asesor_slug}`,
    datos: {
      href,
      asesor_slug: attribution.asesor_slug,
      asesor_nombre: attribution.asesor_nombre,
      primer_origen_url: attribution.first_url,
      ultima_actividad_url: location.href
    },
    archivos: [],
    estado: 'Nuevo',
    asesor_id: attribution.asesor_id || null,
    asesor_slug: attribution.asesor_slug || null,
    asesor_nombre: attribution.asesor_nombre || null,
    atribucion_fuente: 'click_whatsapp_asesor',
    atribucion_activa_hasta: attribution.expires_at || null,
    primer_origen_url: attribution.first_url || location.href,
    ultima_actividad_url: location.href,
    redex_session_id: getSessionId()
  };

  const { error } = await supabase.from(LEADS_TABLE).insert(payload);
  if (error) throw error;
}

async function findAdvisor(slug) {
  if (!slug || !isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from(ADVISORS_TABLE)
    .select('id,nombre,slug,telefono,whatsapp,email,foto_url,codigo_referido,estado,visible_publico,datos')
    .or(`slug.eq.${slug},codigo_referido.eq.${slug}`)
    .eq('estado', 'activo')
    .eq('visible_publico', true)
    .limit(1);
  if (error) throw error;
  return Array.isArray(data) ? (data[0] || null) : (data || null);
}

async function hydrateAdvisorCarouselFromSupabase() {
  if (!isSupabaseConfigured()) return;
  const { data, error } = await supabase
    .from(ADVISORS_TABLE)
    .select('nombre,rol,telefono,whatsapp,foto_url,estado,visible_publico,datos')
    .eq('estado', 'activo')
    .eq('visible_publico', true)
    .order('nombre', { ascending: true });
  if (error) throw error;
  const advisors = sortAdvisorsWithDuplicatesLast(data || [])
    .filter(advisor => advisor.nombre && advisor.foto_url)
    .map(advisor => ({
      name: advisor.nombre,
      role: advisor.rol || 'Asesor de Ventas',
      phone: advisor.telefono || advisor.whatsapp || 'Consultar',
      image: advisor.foto_url,
      objectPosition: advisorPhotoPosition(advisor)
    }));
  if (!advisors.length) return;
  if (typeof window.renderRedexAdvisorCarousel === 'function') {
    window.renderRedexAdvisorCarousel(advisors);
    return;
  }
  renderPublicAdvisorCarousel(advisors);
}

function renderPublicAdvisorCarousel(advisors) {
  const carWrap = document.getElementById('asesor-carousel');
  if (!carWrap || !advisors.length) return;
  const nav = carWrap.querySelector('.asesor-nav');
  carWrap.querySelectorAll('.asesor-slide').forEach(slide => slide.remove());

  advisors.forEach((advisor, index) => {
    const slide = document.createElement('div');
    slide.className = `asesor-slide${index === 0 ? ' active' : ''}`;
    slide.innerHTML = `
      <img src="${escapeHtml(advisor.image)}" class="asesor-bg" alt="${escapeHtml(advisor.name)}" style="object-position: ${escapeHtml(advisor.objectPosition || 'center 20%')};">
      <div class="asesor-info">
        <div class="asesor-name">${escapeHtml(advisor.name)}</div>
        <div class="asesor-role">${escapeHtml(advisor.role)}</div>
        <div class="asesor-phone">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
          </svg>
          ${escapeHtml(advisor.phone || 'Consultar')}
        </div>
      </div>
    `;
    carWrap.insertBefore(slide, nav);
  });

  let currentIndex = 0;
  function moveAdvisor(dir) {
    const slides = carWrap.querySelectorAll('.asesor-slide');
    if (!slides.length) return;
    slides[currentIndex]?.classList.remove('active');
    slides[currentIndex]?.classList.add('prev');
    setTimeout(index => { slides[index]?.classList.remove('prev'); }, 800, currentIndex);
    currentIndex = (currentIndex + dir + slides.length) % slides.length;
    slides[currentIndex]?.classList.add('active');
  }

  if (window.redexAdvisorCarouselTimer) clearInterval(window.redexAdvisorCarouselTimer);
  window.nextAsesor = dir => {
    if (window.redexAdvisorCarouselTimer) clearInterval(window.redexAdvisorCarouselTimer);
    moveAdvisor(dir);
    window.redexAdvisorCarouselTimer = setInterval(() => moveAdvisor(1), 5000);
  };
  window.redexAdvisorCarouselTimer = setInterval(() => moveAdvisor(1), 5000);
}

async function recordTrackingEvent(evento, extra = {}) {
  const attribution = activeStoredAttribution();
  if (!attribution || !isSupabaseConfigured()) return;

  const { error } = await supabase.rpc('registrar_evento_asesor', {
    p_asesor_slug: attribution.asesor_slug,
    p_redex_session_id: getSessionId(),
    p_evento: evento,
    p_pagina: pageName(),
    p_origen_url: location.href,
    p_datos: {
      referrer: document.referrer || '',
      user_agent: navigator.userAgent || '',
      ...extra
    }
  });
  if (error) throw error;
}

async function initAdvisorAttribution() {
  const slug = advisorParam();
  const current = activeStoredAttribution();

  if (!slug) {
    if (current) {
      recordTrackingEvent('visita').catch(() => {});
    }
    return current;
  }

  let advisor = null;
  try {
    advisor = await findAdvisor(slug);
  } catch (error) {
    console.warn('REDEX asesor no verificado:', error.message);
  }

  const expiresAt = new Date(Date.now() + ATTRIBUTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const attribution = {
    asesor_id: advisor?.id || null,
    asesor_slug: advisor?.slug || slug,
    asesor_nombre: advisor?.nombre || slug,
    asesor_telefono: firstAdvisorPhone(advisor, ['telefono', 'whatsapp']),
    asesor_whatsapp: firstAdvisorPhone(advisor, ['whatsapp', 'telefono']),
    asesor_email: advisor?.email || '',
    asesor_foto_url: advisor?.foto_url || '',
    redes_sociales: advisorSocials(advisor),
    fuente: 'link_asesor',
    first_url: current?.first_url || location.href,
    latest_url: location.href,
    started_at: current?.started_at || new Date().toISOString(),
    expires_at: expiresAt
  };

  saveAttribution(attribution);
  recordTrackingEvent('visita', { entrada_por_link: true }).catch(() => {});
  return attribution;
}

function collectFields(form) {
  const data = {};
  const files = [];

  Array.from(form.elements || []).forEach(field => {
    if (!field || field.disabled || !field.type) return;
    if (['submit', 'button', 'reset'].includes(field.type)) return;

    const label = cleanLabel(fieldLabel(field));
    if (!label) return;

    if (field.type === 'file') {
      Array.from(field.files || []).forEach(file => files.push({ field, file, label }));
      data[label] = Array.from(field.files || []).map(file => file.name);
      return;
    }

    if ((field.type === 'radio' || field.type === 'checkbox') && !field.checked) return;
    data[label] = field.value || '';
  });

  return { data, files };
}

function firstByKeys(data, keys) {
  const entries = Object.entries(data);
  const found = entries.find(([key, value]) => keys.some(item => key.includes(item)) && String(value || '').trim());
  return found ? String(found[1]).trim() : '';
}

async function uploadLeadFiles(files, type) {
  const uploaded = [];
  for (const item of files) {
    const extension = item.file.name.includes('.') ? item.file.name.split('.').pop().toLowerCase() : 'bin';
    const path = `${slugify(type)}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage.from(LEADS_BUCKET).upload(path, item.file, {
      cacheControl: '3600',
      upsert: false,
      contentType: item.file.type || undefined
    });
    if (error) throw error;
    uploaded.push({
      campo: item.label,
      nombre: item.file.name,
      tipo: item.file.type,
      tamano: item.file.size,
      bucket: LEADS_BUCKET,
      path
    });
  }
  return uploaded;
}

function cachePendingLead(payload) {
  try {
    const key = 'redex_pending_leads';
    const current = JSON.parse(localStorage.getItem(key) || '[]');
    current.push({ ...payload, pendiente_desde: new Date().toISOString() });
    localStorage.setItem(key, JSON.stringify(current.slice(-25)));
  } catch (_) {}
}

async function saveLead(form) {
  if (!isSupabaseConfigured()) return;
  const attribution = await (attributionReady || Promise.resolve(activeStoredAttribution()));
  const type = formType(form);
  const { data, files } = collectFields(form);
  const uploadedFiles = await uploadLeadFiles(files, type);
  const enrichedData = {
    ...data,
    _atribucion_asesor: attribution ? {
      asesor_slug: attribution.asesor_slug,
      asesor_nombre: attribution.asesor_nombre,
      fuente: attribution.fuente,
      primer_origen_url: attribution.first_url,
      ultima_actividad_url: location.href,
      activa_hasta: attribution.expires_at
    } : null
  };
  const payload = {
    tipo: type,
    pagina: pageName(),
    origen_url: location.href,
    nombre: firstByKeys(data, ['nombre']),
    email: firstByKeys(data, ['email', 'correo']),
    telefono: firstByKeys(data, ['telefono', 'teléfono', 'whatsapp']),
    interes: firstByKeys(data, ['interes', 'interés', 'proyecto', 'propiedad']),
    mensaje: firstByKeys(data, ['mensaje', 'comentario', 'observacion', 'observación']),
    datos: enrichedData,
    archivos: uploadedFiles,
    estado: 'Nuevo',
    asesor_id: attribution?.asesor_id || null,
    asesor_slug: attribution?.asesor_slug || null,
    asesor_nombre: attribution?.asesor_nombre || null,
    atribucion_fuente: attribution?.fuente || null,
    atribucion_activa_hasta: attribution?.expires_at || null,
    primer_origen_url: attribution?.first_url || location.href,
    ultima_actividad_url: location.href,
    redex_session_id: getSessionId()
  };

  const { error } = await supabase.from(LEADS_TABLE).insert(payload);
  if (error) throw error;
  recordTrackingEvent('formulario', {
    tipo_formulario: type,
    nombre: payload.nombre,
    email: payload.email,
    telefono: payload.telefono
  }).catch(() => {});
}

function shouldCapture(form) {
  return ['contact-form', 'vender-form', 'asesor-form', 'precalificate-form', 'hipo-form-new'].includes(form.id);
}

document.addEventListener('submit', event => {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !shouldCapture(form) || handled.has(form)) return;
  handled.add(form);

  saveLead(form)
    .catch(error => {
      cachePendingLead({
        tipo: formType(form),
        pagina: pageName(),
        origen_url: location.href,
        error: error.message,
        datos: collectFields(form).data,
        atribucion: activeStoredAttribution()
      });
      console.warn('REDEX lead pendiente de sincronizacion:', error.message);
    })
    .finally(() => {
      setTimeout(() => handled.delete(form), 5000);
    });
}, true);

function bindAdvisorTrackingClicks() {
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (href.includes('wa.me') || href.includes('api.whatsapp.com') || href.includes('whatsapp')) {
      const attribution = activeStoredAttribution();
      const nextHref = buildAdvisorWhatsAppHref(href, attribution);
      if (nextHref && nextHref !== href) link.setAttribute('href', nextHref);
      recordTrackingEvent('click_whatsapp', { href: nextHref || href }).catch(() => {});
      saveWhatsAppIntent(link.href || nextHref || href).catch(error => {
        console.warn('REDEX intención WhatsApp pendiente:', error.message);
      });
    }
  }, true);
}

window.RedexAdvisorAttribution = {
  current: activeStoredAttribution,
  withAdvisorParam,
  buildWhatsAppHref: buildAdvisorWhatsAppHref,
  refreshLinks: preserveAdvisorAttributionInLinks
};
window.redexBuildAdvisorWhatsAppHref = buildAdvisorWhatsAppHref;

attributionReady = initAdvisorAttribution().then(attribution => {
  preserveAdvisorAttributionInLinks();
  renderAdvisorPublicCard();
  hydrateAdvisorCarouselFromSupabase().catch(error => {
    console.warn('REDEX asesores usando respaldo local:', error.message);
  });
  return attribution;
});
bindDynamicLinkAttribution();
bindAdvisorTrackingClicks();
