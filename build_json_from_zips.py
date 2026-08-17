import os
import glob
import json
import subprocess
import zipfile

def is_image(filename):
    return filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'))

def parse_zips():
    base_dir = "/Users/admin/Desktop/inmuebles redex 1/"
    zip_files = glob.glob(os.path.join(base_dir, "*.zip"))
    
    properties = {}
    
    for zf_path in zip_files:
        try:
            with zipfile.ZipFile(zf_path, 'r') as z:
                file_list = z.namelist()
                
                for f in file_list:
                    # Filter only image files
                    if not is_image(f):
                        continue
                    if "__MACOSX" in f:
                        continue
                        
                    parts = f.split('/')
                    if len(parts) >= 3:
                        # e.g. INMUEBLES EN ZONAS TURISTICAS/Proyecto Tropical Breeze /img.jpg
                        # parts[0] = INMUEBLES EN ZONAS TURISTICAS
                        # parts[1] = Proyecto Tropical Breeze 
                        # parts[2] = img.jpg
                        zone = parts[0].strip()
                        prop_name = parts[1].strip()
                        img_name = parts[-1].strip()
                        
                        if not img_name:
                            continue
                            
                        # If heic, change to jpg for the frontend path
                        if img_name.lower().endswith(('.heic', '.heif')):
                            img_name = os.path.splitext(img_name)[0] + '.jpg'
                            
                        # Reconstruct the expected local path assuming the user unzips directly into images/inmuebles/
                        # So the path would be images/inmuebles/INMUEBLES EN.../Proyecto.../img.jpg
                        local_path = f"images/inmuebles/{zone}/{prop_name}/{img_name}"
                        
                        if prop_name not in properties:
                            ciudad = zone.replace("INMUEBLES EN ", "").title()
                            if ciudad.upper() == "ZONAS TURISTICAS":
                                ciudad = "Zona Turística"
                            
                            tipo = "Inmueble"
                            tl = prop_name.lower()
                            if "casa" in tl: tipo = "Casa"
                            elif "apartamento" in tl: tipo = "Apartamento"
                            elif "villa" in tl: tipo = "Villa"
                            elif "finca" in tl: tipo = "Finca"
                            elif "local" in tl: tipo = "Local Comercial"
                            elif "solar" in tl or "terreno" in tl: tipo = "Solar"
                                
                            properties[prop_name] = {
                                "nombre": prop_name.title(),
                                "tipo": tipo,
                                "estado": "Disponible",
                                "ciudad": ciudad,
                                "sector": "Varias Zonas",
                                "precio": "Consultar precio",
                                "habitaciones": 3 if tipo in ["Casa", "Apartamento", "Villa"] else "N/A",
                                "banos": 2 if tipo in ["Casa", "Apartamento", "Villa"] else "N/A",
                                "parqueos": 1 if tipo not in ["Solar", "Finca"] else "N/A",
                                "metros": "N/A",
                                "descripcion": f"Excelente {tipo.lower()} disponible en {ciudad}. Contáctanos para conocer todos los detalles de esta propiedad.",
                                "imagenPrincipal": local_path,
                                "galeria": [local_path],
                                "amenidades": [
                                    "Excelente ubicación",
                                    "Fácil acceso",
                                    "Oportunidad de inversión"
                                ],
                                "whatsapp": f"https://wa.me/18495180024?text=Hola,%20me%20interesa%20obtener%20más%20información%20sobre%20{prop_name.replace(' ', '%20')}"
                            }
                        else:
                            # Add to gallery
                            properties[prop_name]["galeria"].append(local_path)
                            
        except Exception as e:
            print(f"Error reading {zf_path}: {e}")
            
    # Convert dict to array
    data = []
    prop_id = 1
    for k, v in properties.items():
        v["id"] = prop_id
        # Sort gallery so main image is consistent
        v["galeria"].sort()
        if v["galeria"]:
            v["imagenPrincipal"] = v["galeria"][0]
        data.append(v)
        prop_id += 1
        
    js_content = "const inmueblesData = " + json.dumps(data, indent=2, ensure_ascii=False) + ";\n"
    with open("data-inmuebles.js", "w", encoding="utf-8") as f:
        f.write(js_content)
        
    print(f"Generated data-inmuebles.js with {len(data)} properties.")

if __name__ == "__main__":
    parse_zips()
