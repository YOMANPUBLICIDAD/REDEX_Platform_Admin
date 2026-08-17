import re

with open("index.html", "r") as f:
    html = f.read()

# Replace all sections between </nav> and <!-- TWIN CARDS -->
# Find </nav>
start_idx = html.find("</nav>") + 6

# Find TWIN CARDS or FOOTER
end_idx = html.find("<!-- ============================================================\n     TWIN CARDS")
if end_idx == -1:
    end_idx = html.find("<!-- ============================================================\n     FOOTER")

header = html[:start_idx]
footer = html[end_idx:]

# New body for proyectos-activos.html
new_body = """

<!-- ============================================================
     HERO PROYECTO DESTACADO
============================================================ -->
<section id="hero-proyecto" style="min-height: 100vh; padding-top: 120px; display: flex; align-items: center;">
  <!-- Inyectado por JS -->
</section>

<!-- ============================================================
     OTROS PROYECTOS
============================================================ -->
<section id="otros-proyectos" style="background: var(--black); padding: 80px 7%;">
  <div class="s-eye reveal"><div class="s-eye-line"></div><span class="s-eye-txt">Explorar</span></div>
  <h2 class="s-title reveal" style="font-size:clamp(30px, 4vw, 50px) !important;">Otros Proyectos<br><em style="font-size:1.2em; display:inline-block; margin-top:5px;">Activos</em></h2>
  
  <div class="proj-grid-uniform" id="otros-grid" style="margin-top: 40px; display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; overflow: visible;">
    <!-- Inyectado por JS -->
  </div>
</section>

"""

# Add script tags to footer
footer = footer.replace("</body>", """
<!-- Scripts del Portal Dinámico -->
<script src="proyectos-data.js"></script>
<script src="proyectos-activos.js"></script>
</body>
""")

# We should also strip out the index.html specific scripts from footer like ScrollTriggers for elements that no longer exist, but it's safe to just let them fail silently or use try-catch if they throw. Actually gsap is pretty forgiving with null targets (it just warns).
# To be perfectly clean, let's remove the script block at the end that contains the animations.
# We will just write our own minimal animation script inside proyectos-activos.js
js_pattern = r"<script>\n\s*gsap\.registerPlugin.*?<\/script>"
footer = re.sub(js_pattern, "", footer, flags=re.DOTALL)

with open("proyectos-activos.html", "w") as f:
    f.write(header + new_body + footer)

print("proyectos-activos.html generated.")
