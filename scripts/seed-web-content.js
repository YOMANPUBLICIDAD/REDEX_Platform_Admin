#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const ENV_FILE = path.join(ROOT, '.env.local');
const FILES = [
  { file: 'index.html', slug: 'inicio', name: 'Inicio' },
  { file: 'inmuebles.html', slug: 'inmuebles', name: 'Inmuebles' },
  { file: 'proyectos-activos.html', slug: 'proyectos', name: 'Proyectos' },
  { file: 'calculadora.html', slug: 'calculadora', name: 'Calculadora' },
  { file: 'portal-asesor.html', slug: 'portal-asesor', name: 'Portal asesor' },
  { file: 'quiero-vender.html', slug: 'quiero-vender', name: 'Formulario quiero vender' },
  { file: 'quiero-ser-asesor.html', slug: 'quiero-ser-asesor', name: 'Formulario quiero ser asesor' },
  { file: 'precalificate.html', slug: 'precalificate', name: 'Formulario precalificación' }
];

function readEnv() {
  const env = {};
  for (const line of fs.readFileSync(ENV_FILE, 'utf8').split(/\r?\n/)) {
    const index = line.indexOf('=');
    if (index > 0) env[line.slice(0, index)] = line.slice(index + 1);
  }
  return env;
}

function clean(value) {
  return String(value || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function attr(attrs, name) {
  return (attrs.match(new RegExp(`\\b${name}=["']([^"']+)["']`, 'i')) || [])[1] || '';
}

function textFrom(fragment, tagOrClass) {
  const pattern = tagOrClass.startsWith('.')
    ? new RegExp(`<[^>]*class=["'][^"']*${tagOrClass.slice(1)}[^"']*["'][^>]*>([\\s\\S]*?)<\\/[^>]+>`, 'i')
    : new RegExp(`<${tagOrClass}\\b[^>]*>([\\s\\S]*?)<\\/${tagOrClass}>`, 'i');
  return clean((fragment.match(pattern) || [])[1]);
}

function allTexts(fragment, tag) {
  return [...fragment.matchAll(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi'))]
    .map(match => clean(match[1]))
    .filter(Boolean);
}

function firstMedia(fragment, regex) {
  return (fragment.match(regex) || [])[1] || '';
}

function selectorFor(tag, attrs, indexByTag) {
  const id = attr(attrs, 'id');
  if (id) return `#${id}`;
  indexByTag[tag] = (indexByTag[tag] || 0) + 1;
  return `body > ${tag}:nth-of-type(${indexByTag[tag]})`;
}

function sectionName(tag, id, title, order) {
  if (id) return id.replace(/[-_]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
  if (title) return title.slice(0, 80);
  return `${tag} ${order + 1}`;
}

function extractSections(html) {
  const matches = [...html.matchAll(/<(section|nav|footer|form|aside|main|header|div)\b([^>]*)>/gi)]
    .filter(match => {
      const tag = match[1].toLowerCase();
      const id = attr(match[2], 'id');
      return tag !== 'div' || /^panel-/.test(id);
    });
  const indexByTag = {};

  return matches.map((match, order) => {
    const tag = match[1].toLowerCase();
    const attrs = match[2];
    const id = attr(attrs, 'id');
    const next = matches[order + 1]?.index ?? html.length;
    const fragment = html.slice(match.index, next);
    const selector = selectorFor(tag, attrs, indexByTag);
    const title = textFrom(fragment, 'h1') || textFrom(fragment, 'h2') || textFrom(fragment, '.s-title');
    const subtitle = textFrom(fragment, 'h3') || textFrom(fragment, '.s-eye-txt') || textFrom(fragment, '.h-badge-txt');
    const paragraphs = allTexts(fragment, 'p');
    const image = firstMedia(fragment, /<img\b[^>]*\bsrc=["']([^"']+)["']/i);
    const video = firstMedia(fragment, /<(?:source|video|iframe)\b[^>]*\bsrc=["']([^"']+)["']/i);
    const linkMatch = fragment.match(/<a\b([^>]*)>([\s\S]*?)<\/a>|<button\b([^>]*)>([\s\S]*?)<\/button>/i);
    const linkAttrs = linkMatch ? (linkMatch[1] || linkMatch[3] || '') : '';

    return {
      slug: (id || `${tag}-${order + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      nombre: sectionName(tag, id, title, order),
      selector_html: selector,
      tipo: tag,
      titulo: title,
      subtitulo: subtitle,
      descripcion: paragraphs[0] || '',
      contenido: { textos: paragraphs.slice(1) },
      imagen_principal: image,
      video_url: video,
      boton_texto: linkMatch ? clean(linkMatch[2] || linkMatch[4]) : '',
      boton_url: attr(linkAttrs, 'href'),
      whatsapp_url: attr(linkAttrs, 'href').includes('wa.me') ? attr(linkAttrs, 'href') : '',
      visible: true,
      publicado: true,
      duplicable: false,
      orden: order
    };
  });
}

async function request(client, path, options = {}) {
  const response = await fetch(`${client.url}${path}`, {
    ...options,
    headers: {
      apikey: client.key,
      Authorization: `Bearer ${client.key}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch (_) { body = text; }
  if (!response.ok) throw new Error(`${response.status} ${text}`);
  return body;
}

async function upsertBy(client, table, filters, payload) {
  const query = Object.entries(filters)
    .map(([key, value]) => `${key}=eq.${encodeURIComponent(value)}`)
    .join('&');
  const existing = await request(client, `/rest/v1/${table}?select=id&${query}&limit=1`);
  if (existing[0]?.id) {
    await request(client, `/rest/v1/${table}?id=eq.${encodeURIComponent(existing[0].id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify(payload)
    });
    return existing[0].id;
  }
  const created = await request(client, `/rest/v1/${table}`, {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify(payload)
  });
  return created[0].id;
}

async function main() {
  const env = readEnv();
  const client = { url: env.SUPABASE_URL, key: env.SUPABASE_SERVICE_ROLE_KEY };
  if (!client.url || !client.key) throw new Error('Faltan credenciales en .env.local.');

  const report = { pages: 0, sections: 0, files: [] };

  for (const item of FILES) {
    const html = fs.readFileSync(path.join(ROOT, item.file), 'utf8');
    const pageId = await upsertBy(client, 'paginas', { slug: item.slug }, {
      slug: item.slug,
      nombre: item.name,
      archivo_html: item.file,
      publicado: true,
      orden: report.pages
    });

    const sections = extractSections(html);
    for (const section of sections) {
      await upsertBy(client, 'secciones', { pagina_id: pageId, slug: section.slug }, {
        ...section,
        pagina_id: pageId
      });
    }

    report.pages += 1;
    report.sections += sections.length;
    report.files.push({ file: item.file, sections: sections.length });
  }

  fs.mkdirSync(path.join(ROOT, 'admin', 'reports'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'admin', 'reports', 'latest-web-content-seed-report.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
}

main().catch(error => {
  console.error(error.message || error);
  process.exit(1);
});
