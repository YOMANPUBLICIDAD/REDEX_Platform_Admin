import os

filepath = '/Users/admin/Desktop/REDEX_Premium_Final/inmuebles.html'
opt_filepath = '/Users/admin/Desktop/REDEX_Premium_Optimizado/inmuebles.html'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update JS cats
old_cats = "const cats = ['todos', 'casa', 'apartamento', 'villa', 'local', 'solar residencial', 'lote', 'proyecto residencial', 'disponible'];"
new_cats = "const cats = ['todos', 'casa', 'apartamento', 'villa', 'local', 'solar residencial', 'lote', 'disponible'];"

old_cats_map = """  const categoriesMap = {
    'todos': 'Todos',
    'casa': 'Casas',
    'apartamento': 'Apartamentos',
    'villa': 'Villas',
    'local': 'Locales',
    'solar residencial': 'Solares Residenciales',
    'lote': 'Lotes',
    'proyecto residencial': 'Proyectos Residenciales',
    'disponible': 'Disponibles'
  };"""

new_cats_map = """  const categoriesMap = {
    'todos': 'Todos',
    'casa': 'Casas',
    'apartamento': 'Apartamentos',
    'villa': 'Villas',
    'local': 'Locales',
    'solar residencial': 'Solares Residenciales',
    'lote': 'Lotes',
    'disponible': 'Disponibles'
  };"""

content = content.replace(old_cats, new_cats)
content = content.replace(old_cats_map, new_cats_map)

# Save both
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
with open(opt_filepath, 'w', encoding='utf-8') as f:
    f.write(content)
    
print("Updated HTML filters successfully.")
