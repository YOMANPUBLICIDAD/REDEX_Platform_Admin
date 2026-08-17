(function () {
  var SUPABASE_URL = 'https://uwcxkwwtvvsplcnlncfd.supabase.co';
  var SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ZeMpdNfPRtxuALkJgnQf3g_G1xm50Th';
  var SOURCE = 'fallback';

  function normalizePath() {
    var file = window.location.pathname.split('/').pop() || 'index.html';
    return file === '' ? 'index.html' : file;
  }

  function request(path) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', SUPABASE_URL + path, false);
    xhr.setRequestHeader('apikey', SUPABASE_PUBLISHABLE_KEY);
    xhr.setRequestHeader('Authorization', 'Bearer ' + SUPABASE_PUBLISHABLE_KEY);
    xhr.send(null);
    if (xhr.status < 200 || xhr.status >= 300) throw new Error('CMS read failed');
    return JSON.parse(xhr.responseText || '[]');
  }

  function first(root, selector) {
    return root ? root.querySelector(selector) : null;
  }

  function setText(element, value) {
    if (!element || value === null || value === undefined || value === '') return;
    element.textContent = value;
  }

  function setMedia(section, url, kind) {
    if (!section || !url) return;
    if (kind === 'video') {
      var video = first(section, 'video');
      var source = first(video, 'source');
      if (source) {
        source.src = url;
        video.load();
      } else if (video) {
        video.src = url;
      } else {
        var iframe = first(section, 'iframe');
        if (iframe) iframe.src = url;
      }
      return;
    }

    var image = first(section, 'img');
    if (image) image.src = url;
  }

  function setBackground(section, url) {
    if (!section || !url) return;
    section.style.backgroundImage = "url('" + url.replace(/'/g, '%27') + "')";
  }

  function setButton(section, text, url) {
    if (!section) return;
    var button = first(section, 'a.btn-gh, a.btn-ph, a.btn-ph-gold, a.btn-ns, a.btn-gold, button, a');
    if (!button) return;
    if (text) button.textContent = text;
    if (url && button.tagName.toLowerCase() === 'a') button.href = url;
  }

  function setExtraTexts(section, texts) {
    if (!section || !Array.isArray(texts)) return;
    var targets = Array.prototype.slice.call(section.querySelectorAll('p, .p-desc, .t-desc, .edev-desc, .ft-desc')).slice(1);
    texts.forEach(function (text, index) {
      if (targets[index] && text) targets[index].textContent = text;
    });
  }

  function applySection(record) {
    var section = document.querySelector(record.selector_html);
    if (!section) return;
    if (!record.contenido || record.contenido.cms_publicado !== true) return;

    if (record.visible === false) {
      section.hidden = true;
      return;
    }

    section.hidden = false;
    section.style.order = String(record.orden || 0);

    setText(first(section, 'h1, h2, .s-title, .h-word-big'), record.titulo);
    setText(first(section, '.s-eye-txt, .h-badge-txt, .p-loc, h3'), record.subtitulo);
    setText(first(section, 'p, .s-sub, .p-desc, .ft-desc'), record.descripcion);
    setExtraTexts(section, record.contenido && record.contenido.textos);
    setBackground(section, record.imagen_fondo);
    setMedia(section, record.imagen_principal, 'image');
    setMedia(section, record.video_url, 'video');
    setButton(section, record.boton_texto, record.boton_url || record.whatsapp_url);

    if (record.whatsapp_url) {
      section.querySelectorAll('a[href*="wa.me"]').forEach(function (link) {
        link.href = record.whatsapp_url;
      });
    }
  }

  function reorderSections(records) {
    var byParent = new Map();
    records.forEach(function (record) {
      if (!record.contenido || record.contenido.cms_publicado !== true) return;
      var section = document.querySelector(record.selector_html);
      if (!section || !section.parentElement || section.tagName.toLowerCase() === 'nav') return;
      var parent = section.parentElement;
      if (!byParent.has(parent)) byParent.set(parent, []);
      byParent.get(parent).push({ element: section, order: Number(record.orden || 0) });
    });

    byParent.forEach(function (items, parent) {
      items.sort(function (a, b) { return a.order - b.order; });
      items.forEach(function (item) { parent.appendChild(item.element); });
    });
  }

  function init() {
    try {
      var file = normalizePath();
      var pages = request('/rest/v1/paginas?select=id,slug,archivo_html&publicado=eq.true&archivo_html=eq.' + encodeURIComponent(file) + '&limit=1');
      if (!pages.length) return;
      var sections = request('/rest/v1/secciones?select=*&publicado=eq.true&pagina_id=eq.' + encodeURIComponent(pages[0].id) + '&order=orden.asc');
      sections.forEach(applySection);
      reorderSections(sections);
      SOURCE = 'supabase';
    } catch (_) {
      SOURCE = 'fallback';
    }
    window.REDEX_WEB_CONTENT_SOURCE = SOURCE;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
