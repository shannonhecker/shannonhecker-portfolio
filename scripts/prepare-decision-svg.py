"""Normalize Figma's SVG text encoding and embed the site's licensed Inter font.
Run after replacing decision-map or user-flow SVGs with Figma SVG_STRING exports.
Geometry, labels and colours are authored in Figma, not regenerated here.
"""
import base64,re
from pathlib import Path
font=base64.b64encode(Path('node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2').read_bytes()).decode()
style='<style id="embedded-inter">@font-face{font-family:Inter;src:url(data:font/woff2;base64,'+font+') format("woff2");font-weight:100 900;font-style:normal}text{font-family:Inter,Arial,sans-serif}</style>'
def decode(match):
 try:return bytes(int(n) for n in re.findall(r'&#(\d+);',match[0])).decode('utf-8')
 except (ValueError,UnicodeDecodeError):return match[0]
for path in [*Path('public/art/decision-maps').glob('*.svg'), *Path('public/art/user-flows').glob('*.svg')]:
 svg=path.read_text()
 svg=re.sub(r'(?:&#(?:1[2-9]\d|2[0-5]\d);){2,}',decode,svg)
 svg=re.sub(r'<style id="embedded-inter">.*?</style>','',svg,flags=re.S)
 svg=re.sub(r'(<svg\b[^>]*>)',lambda m:m[0]+style,svg,count=1)
 path.write_text(svg)
