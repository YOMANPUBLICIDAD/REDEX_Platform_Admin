import re

with open("index.html", "r") as f:
    html = f.read()

# Replace HTML
html_new = re.sub(
    r"<div class=\"asesor-static reveal\".*?</svg>\n\s*\+1 \(809\) 555-1200\n\s*</div>\n\s*</div>\n\s*<div.*?</div>\n\s*</div>",
    """<div class="asesor-carousel reveal" id="asesor-carousel">
      <!-- El contenido se generará dinámicamente vía JS -->
      <div class="asesor-nav">
        <button class="asesor-btn" onclick="nextAsesor(-1)" aria-label="Anterior"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg></button>
        <button class="asesor-btn" onclick="nextAsesor(1)" aria-label="Siguiente"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></button>
      </div>
    </div>""",
    html,
    flags=re.DOTALL
)

js_block = """
// ============= ADVISOR CAROUSEL =============
const advisors = [
  { name: 'Ana Martínez', role: 'Directora Regional', phone: '+1 (809) 555-1201', image: 'images/asesores/c_1.jpg', objectPosition: 'center 20%' },
  { name: 'Roberto Santos', role: 'Asesor Comercial', phone: '+1 (809) 555-1202', image: 'images/asesores/c_2.jpg', objectPosition: 'center 20%' },
  { name: 'Laura Pérez', role: 'Gerente de Ventas', phone: '+1 (809) 555-1203', image: 'images/asesores/c_3.jpg', objectPosition: 'center 20%' },
  { name: 'Carlos Mejía', role: 'Asesor Senior', phone: '+1 (809) 555-1204', image: 'images/asesores/c_4.jpg', objectPosition: 'center 20%' },
  { name: 'Miguel Vargas', role: 'Asesor de Lujo', phone: '+1 (809) 555-1205', image: 'images/asesores/c_5.jpg', objectPosition: 'center 20%' }
];

const carWrap = document.getElementById('asesor-carousel');
if (carWrap) {
  let currentAdvisorIndex = 0;
  let autoplayInterval;
  
  advisors.forEach((adv, index) => {
    const slide = document.createElement('div');
    slide.className = 'asesor-slide' + (index === 0 ? ' active' : '');
    slide.innerHTML = `
      <img src="${adv.image}" class="asesor-bg" alt="${adv.name}" style="object-position: ${adv.objectPosition};">
      <div class="asesor-info">
        <div class="asesor-name">${adv.name}</div>
        <div class="asesor-role">${adv.role}</div>
        <div class="asesor-phone">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
          </svg>
          ${adv.phone}
        </div>
      </div>
    `;
    carWrap.insertBefore(slide, carWrap.querySelector('.asesor-nav'));
  });

  const slides = carWrap.querySelectorAll('.asesor-slide');
  
  function nextAsesor(dir) {
    if(slides.length === 0) return;
    slides[currentAdvisorIndex].classList.remove('active');
    slides[currentAdvisorIndex].classList.add('prev');
    setTimeout((idx) => { if(slides[idx]) slides[idx].classList.remove('prev'); }, 800, currentAdvisorIndex);
    currentAdvisorIndex = (currentAdvisorIndex + dir + slides.length) % slides.length;
    slides[currentAdvisorIndex].classList.add('active');
  }
  
  function startAutoplay() {
    autoplayInterval = setInterval(() => { nextAsesor(1); }, 5000);
  }
  
  window.nextAsesor = function(dir) {
    clearInterval(autoplayInterval);
    nextAsesor(dir);
    startAutoplay();
  };
  
  startAutoplay();
}
"""

html_new = html_new.replace("</script>\n</body>", js_block + "\n</script>\n</body>")

with open("index.html", "w") as f:
    f.write(html_new)
print("Done")
