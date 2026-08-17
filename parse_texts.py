import os
import zipfile
import json
import re
import codecs

try:
    import docx
except ImportError:
    docx = None

try:
    from PyPDF2 import PdfReader
except ImportError:
    PdfReader = None

source_dir = "/Users/admin/Desktop/inmuebles Redex 1"
extract_dir = "/Users/admin/Desktop/inmuebles Redex 1/extracted"
final_proj_dir = "/Users/admin/Desktop/REDEX_Premium_Final"
opt_proj_dir = "/Users/admin/Desktop/REDEX_Premium_Optimizado"

# 1. Unzip to read texts
os.makedirs(extract_dir, exist_ok=True)
print("Extracting ZIPs...")
for f in os.listdir(source_dir):
    if f.lower().endswith('.zip'):
        zip_path = os.path.join(source_dir, f)
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                zip_ref.extractall(extract_dir)
        except Exception as e:
            pass

def extract_text(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    text = ""
    try:
        if ext == '.docx' and docx:
            doc = docx.Document(file_path)
            text = "\\n".join([para.text for para in doc.paragraphs])
        elif ext == '.pdf' and PdfReader:
            reader = PdfReader(file_path)
            for page in reader.pages:
                t = page.extract_text()
                if t: text += t + "\\n"
        elif ext == '.txt':
            with codecs.open(file_path, 'r', 'utf-8', errors='ignore') as f:
                text = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
    return text

def parse_info(text):
    info = {}
    
    # Precio
    price_match = re.search(r'(?i)(?:precio|desde)[\s:]*([A-Z\$]{1,4}\s*[\d,\.]+)', text)
    if price_match:
        info['precio'] = price_match.group(1).strip()
    
    # Metraje
    metros_match = re.search(r'(?i)(?:metraje|metros|área|area|construcción)[\s:]*([\d,\.]+\s*(?:mts|m2|m²|metros))', text)
    if metros_match:
        info['metros'] = metros_match.group(1).strip()
    
    # Habitaciones
    habs_match = re.search(r'(?i)(?:habitaciones|habs|hab)[\s:]*(\d+)', text)
    if habs_match:
        info['habitaciones'] = habs_match.group(1).strip() + " habs."
        
    # Baños
    banos_match = re.search(r'(?i)(?:baños|banos)[\s:]*([\d\.]+)', text)
    if banos_match:
        info['banos'] = banos_match.group(1).strip() + " baños"
        
    # Parqueos
    parq_match = re.search(r'(?i)(?:parqueos|estacionamientos|garaje)[\s:]*(\d+)', text)
    if parq_match:
        info['parqueos'] = parq_match.group(1).strip()
        
    # Forma de pago (reserva/separación)
    pago_match = re.search(r'(?i)(?:reserva|separación|inicial)[\scon:]*([A-Z\$]{1,4}\s*[\d,\.]+)', text)
    if pago_match:
        info['forma_pago'] = "Reserva con " + pago_match.group(1).strip()
        
    # Amenidades
    amenidades = []
    amen_section = re.search(r'(?i)amenidades:?(.*?)(?:\n\n|\Z)', text, re.DOTALL)
    if amen_section:
        lines = amen_section.group(1).split('\\n')
        for l in lines:
            cl = re.sub(r'^[-•*]\s*', '', l.strip())
            if cl and len(cl) > 3 and len(cl) < 50:
                amenidades.append(cl)
    if amenidades:
        info['amenidades'] = amenidades
        
    # Use the first 250 chars as description if none exists
    desc_clean = re.sub(r'\\n+', ' ', text).strip()
    if len(desc_clean) > 20:
        info['descripcion'] = desc_clean[:400] + ("..." if len(desc_clean) > 400 else "")

    return info

# Read current DB
js_path = os.path.join(final_proj_dir, 'data-inmuebles.js')
with codecs.open(js_path, 'r', 'utf-8') as f:
    js_content = f.read()

match = re.search(r'const inmueblesData\s*=\s*(\[[\s\S]*\]);?', js_content)
if not match:
    print("Could not find inmueblesData.")
    exit(1)

import ast
# We'll parse it using a small node script for safety
node_script = f"""
const fs = require('fs');
let str = fs.readFileSync('{js_path}', 'utf8');
let match = str.match(/const inmueblesData\\s*=\\s*(\\[[\\s\\S]*\\]);?/);
let arr = [];
eval('arr = ' + match[1]);
fs.writeFileSync('temp_db.json', JSON.stringify(arr));
"""
with open('parse_js.js', 'w') as f: f.write(node_script)
os.system('node parse_js.js')

with open('temp_db.json', 'r') as f:
    db = json.load(f)

print("Scanning for documents...")
stats = {"reales": 0, "genericos": 0}

for item in db:
    # 1. Category unification
    tipo_lower = (item.get('tipo', '')).lower()
    
    # If the property is Lote, Solar, Proyecto residencial, lotificación
    if 'lote' in tipo_lower or 'solar' in tipo_lower or 'proyecto' in tipo_lower or 'lotificación' in tipo_lower:
        item['tipo'] = 'Solar Residencial'
        
    # 2. Text Parsing (only for the ones loaded from Redex 1 which have folder names == nombre)
    # The image path usually contains the folder name
    img_path = item.get('imagenPrincipal', '')
    if 'assets/inmuebles/' in img_path:
        # It's a new one. We can find its original folder by matching name
        folder_found = None
        for root, dirs, files in os.walk(extract_dir):
            if os.path.basename(root).lower() == item['nombre'].lower():
                folder_found = root
                break
        
        if folder_found:
            # Found the original folder! Let's extract texts
            texts = []
            for f in os.listdir(folder_found):
                if f.lower().endswith(('.docx', '.pdf', '.txt')) and not f.startswith('._'):
                    texts.append(extract_text(os.path.join(folder_found, f)))
            
            combined_text = "\\n".join(texts)
            if combined_text.strip():
                extracted_info = parse_info(combined_text)
                
                if 'precio' in extracted_info: item['precio'] = extracted_info['precio']
                if 'metros' in extracted_info: item['metros'] = extracted_info['metros']
                if 'habitaciones' in extracted_info: item['habitaciones'] = extracted_info['habitaciones']
                if 'banos' in extracted_info: item['banos'] = extracted_info['banos']
                if 'parqueos' in extracted_info: item['parqueos'] = extracted_info['parqueos']
                if 'forma_pago' in extracted_info: item['forma_pago'] = extracted_info['forma_pago']
                if 'descripcion' in extracted_info: item['descripcion'] = extracted_info['descripcion']
                if 'amenidades' in extracted_info: item['amenidades'] = extracted_info['amenidades']
                
                stats['reales'] += 1
            else:
                stats['genericos'] += 1
        else:
            stats['genericos'] += 1
    else:
        # Old properties, already have real data mostly, but count as reales if not generic
        if item.get('precio') == 'Consultar':
            stats['genericos'] += 1
        else:
            stats['reales'] += 1

print("Writing back to JS...")
new_js_content = "const inmueblesData = " + json.dumps(db, indent=2, ensure_ascii=False) + ";"
with codecs.open(js_path, 'w', 'utf-8') as f:
    f.write(new_js_content)
    
opt_js_path = os.path.join(opt_proj_dir, 'data-inmuebles.js')
with codecs.open(opt_js_path, 'w', 'utf-8') as f:
    f.write(new_js_content)

# Cleanup
import shutil
shutil.rmtree(extract_dir)

print(f"DONE. Stats: {stats}")
