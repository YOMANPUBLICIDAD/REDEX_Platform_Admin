(function () {
  const MOBILE_QUERY = '(max-width: 900px)';
  const STYLE_ID = 'redex-mobile-nav-fix-style';

  function ensureStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      .redex-mobile-menu {
        display: none !important;
      }
      @media (max-width: 900px) {
        .redex-mobile-menu {
          position: fixed;
          left: 14px;
          right: 14px;
          top: 82px;
          z-index: 9998;
          display: none;
          max-height: calc(100vh - 104px);
          overflow-y: auto;
          padding: 14px;
          border: 1px solid rgba(200,164,74,.24);
          border-radius: 14px;
          background: rgba(6,9,18,.98);
          box-shadow: 0 24px 70px rgba(0,0,0,.55);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
        }
        .redex-mobile-menu.open { display: block !important; }
        .redex-mobile-menu .nav-links,
        .redex-mobile-menu .nav-cta {
          position: static !important;
          display: flex !important;
          width: 100% !important;
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 4px !important;
          padding: 0 !important;
          list-style: none !important;
          background: transparent !important;
        }
        .redex-mobile-menu .nav-cta { margin-top: 10px; }
        .redex-mobile-menu a,
        .redex-mobile-menu button,
        .redex-mobile-menu .lang-current {
          display: flex !important;
          width: 100% !important;
          min-height: 46px;
          align-items: center;
          justify-content: flex-start;
          padding: 13px 14px !important;
          border-radius: 8px;
          color: rgba(255,255,255,.78) !important;
          font-size: 12px !important;
          font-weight: 800 !important;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          text-align: left;
        }
        .redex-mobile-menu a:hover,
        .redex-mobile-menu button:hover,
        .redex-mobile-menu .lang-current:hover {
          background: rgba(255,255,255,.05);
          color: var(--gold) !important;
        }
        .redex-mobile-menu .btn-n {
          margin-top: 8px;
          justify-content: center !important;
          border: 1px solid rgba(200,164,74,.32);
        }
        .redex-mobile-menu .lang-wrap {
          display: block;
          margin: 0;
          width: 100%;
        }
        .redex-mobile-menu .lang-menu {
          position: static !important;
          display: none;
          opacity: 1 !important;
          pointer-events: auto !important;
          transform: none !important;
          margin: 4px 0 8px;
          border: 1px solid rgba(255,255,255,.08);
          width: 100%;
        }
        .redex-mobile-menu .lang-wrap.open .lang-menu,
        .redex-mobile-menu .lang-menu.open {
          display: block;
        }
        .ham.active span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
        .ham.active span:nth-child(2) { opacity: 0; }
        .ham.active span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }
      }
    `;
    document.head.appendChild(style);
  }

  function closePanel(panel, ham) {
    panel.classList.remove('open');
    ham.classList.remove('active');
    ham.setAttribute('aria-expanded', 'false');
  }

  function buildPanel(nav) {
    const panel = document.createElement('div');
    panel.className = 'redex-mobile-menu';
    panel.setAttribute('aria-label', 'Menú móvil');

    const links = nav.querySelector('.nav-links');
    const cta = nav.querySelector('.nav-cta');
    if (links) panel.appendChild(links.cloneNode(true));
    if (cta) panel.appendChild(cta.cloneNode(true));
    panel.querySelectorAll('[onclick]').forEach(element => {
      const action = element.getAttribute('onclick') || '';
      if (action.includes('openLoginModal')) {
        element.dataset.redexMobileAction = 'portal';
        element.removeAttribute('onclick');
        if (element.tagName === 'A') element.setAttribute('href', 'portal-asesor.html');
      }
    });
    nav.appendChild(panel);
    return panel;
  }

  function bindMobileMenu() {
    ensureStyle();
    document.querySelectorAll('nav').forEach(nav => {
      const ham = nav.querySelector('#ham-btn, .ham');
      if (!ham || ham.dataset.redexMobileReady === 'true') return;

      const panel = buildPanel(nav);
      ham.dataset.redexMobileReady = 'true';
      ham.setAttribute('aria-expanded', 'false');

      ham.addEventListener('click', event => {
        if (!window.matchMedia(MOBILE_QUERY).matches) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        const isOpen = panel.classList.toggle('open');
        ham.classList.toggle('active', isOpen);
        ham.setAttribute('aria-expanded', String(isOpen));
      }, true);

      panel.addEventListener('click', event => {
        const langCurrent = event.target.closest('.lang-current');
        if (langCurrent) {
          const wrap = langCurrent.closest('.lang-wrap');
          wrap?.classList.toggle('open');
          return;
        }
        const target = event.target.closest('a,button');
        if (!target) return;
        const href = target.getAttribute('href') || '';
        const label = (target.textContent || '').trim().toLowerCase();
        if (target.dataset.redexMobileAction === 'portal' || href === 'javascript:void(0)' || label.includes('portal asesor')) {
          event.preventDefault();
          if (document.querySelector('#login-modal') && typeof window.openLoginModal === 'function') {
            window.openLoginModal();
          } else {
            window.location.href = 'portal-asesor.html';
          }
        }
        setTimeout(() => closePanel(panel, ham), 120);
      });

      document.addEventListener('click', event => {
        if (!window.matchMedia(MOBILE_QUERY).matches) return;
        if (!panel.classList.contains('open')) return;
        if (panel.contains(event.target) || ham.contains(event.target)) return;
        closePanel(panel, ham);
      });

      window.addEventListener('resize', () => {
        if (!window.matchMedia(MOBILE_QUERY).matches) closePanel(panel, ham);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindMobileMenu);
  } else {
    bindMobileMenu();
  }
})();
