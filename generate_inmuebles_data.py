import os
import glob
import json
import subprocess
import string

def sanitize_slug(text):
    valid_chars = "-_.() %s%s" % (string.ascii_letters, string.digits)
    text = ''.join(c for c in text if c in valid_chars)
    return text.lower().replace(' ', '-').replace('--', '-')

base_dir = "images/inmuebles"
data = []

# First, convert any HEIC files to JPG
print("Converting HEIC to JPG...")
for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.lower().endswith('.heic'):
            heic_path = os.path.join(root, file)
            jpg_path = os.path.splitext(heic_path)[0] + '.jpg'
            subprocess.run(['sips', '-s', 'format', 'jpeg', heic_path, '--out', jpg_path], capture_output=True)
            os.remove(heic_path)

# Ensure no empty dirs
for root, dirs, files in os.walk(base_dir, topdown=False):
    if not dirs and not files and root != base_dir:
        os.rmdir(root)

prop_id = 1

print("Parsing folders...")
# Traverse and find property folders
for root, dirs, files in os.walk(base_dir):
    # If the folder has images, consider it a property
    image_files = [f for f in files if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp'))]
    if image_files:
        # Sort images so we have a consistent main image
        image_files.sort()
        
        folder_name = os.path.basename(root)
        parent_folder = os.path.basename(os.path.dirname(root))
        
        # Deduce City/Zone from parent folder name
        ciudad = parent_folder.replace("INMUEBLES EN ", "").title()
        if not ciudad or ciudad == "Inmuebles":
            ciudad = "República Dominicana"
            
        nombre = folder_name.replace('_', ' ').replace('-', ' ').title()
        
        tipo = "Inmueble"
        tipo_lower = nombre.lower()
        if "casa" in tipo_lower: tipo = "Casa"
        elif "apartamento" in tipo_lower: tipo = "Apartamento"
        elif "villa" in tipo_lower: tipo = "Villa"
        elif "finca" in tipo_lower: tipo = "Finca"
        elif "local" in tipo_lower: tipo = "Local Comercial"
        elif "solar" in tipo_lower or "terreno" in tipo_lower: tipo = "Solar"
        
        # Create image paths relative to the HTML file
        main_image = os.path.join(root, image_files[0])
        gallery = [os.path.join(root, img) for img in image_files]
        
        item = {
            "id": prop_id,
            "nombre": nombre,
            "tipo": tipo,
            "estado": "Disponible",
            "ciudad": ciudad,
            "sector": "Varias Zonas",
            "precio": "Consultar precio",
            "habitaciones": 3 if tipo in ["Casa", "Apartamento", "Villa"] else "N/A",
            "banos": 2 if tipo in ["Casa", "Apartamento", "Villa"] else "N/A",
            "parqueos": 1 if type not in ["Solar", "Finca"] else "N/A",
            "metros": "N/A",
            "descripcion": f"Excelente {tipo.lower()} disponible en {ciudad}. Contáctanos para conocer todos los detalles de esta propiedad.",
            "imagenPrincipal": main_image,
            "galeria": gallery,
            "amenidades": [
                "Excelente ubicación",
                "Fácil acceso",
                "Oportunidad de inversión"
            ],
            "whatsapp": f"https://wa.me/18495180024?text=Hola,%20me%20interesa%20obtener%20más%20información%20sobre%20{nombre.replace(' ', '%20')}"
        }
        data.append(item)
        prop_id += 1

# Generate JS file
js_content = "const inmueblesData = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n"
with open("data-inmuebles.js", "w", encoding="utf-8") as f:
    f.write(js_content)

print(f"Generated data-inmuebles.js with {len(data)} properties.")
