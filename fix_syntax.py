import re
import os

files = [
    '/Users/admin/Desktop/REDEX_Premium_Final/inmuebles.html',
    '/Users/admin/Desktop/REDEX_Premium_Optimizado/inmuebles.html'
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The orphaned block to remove:
    orphaned_block = """
  
  if(wrap) {
    wrap.addEventListener('mouseenter', () => { isCarouselPaused = true; });
    wrap.addEventListener('mouseleave', () => { isCarouselPaused = false; });
    // Soporte para touch
    wrap.addEventListener('touchstart', () => { isCarouselPaused = true; }, {passive: true});
    wrap.addEventListener('touchend', () => { 
      setTimeout(() => { isCarouselPaused = false; }, 2000); 
    }, {passive: true});
  }
  
  startCarousel();
}"""
    
    if orphaned_block in content:
        content = content.replace(orphaned_block, "")
        print(f"Removed orphaned block from {filepath}")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Finished fixing orphaned blocks.")
