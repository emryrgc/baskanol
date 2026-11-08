#!/usr/bin/env python3
"""index.html + tüm scriptleri + fontu tek bir HTML dosyasında birleştirir.

Kullanım:  python3 tools/build_artifact.py cikti.html
Çıkan dosya internet olmadan da açılır; paylaşılabilir önizleme linki için kullanılır.
"""
import base64
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
out = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ROOT / "dist" / "baskan-ol.html")

html = (ROOT / "index.html").read_text(encoding="utf-8")

title = re.search(r"<title>.*?</title>", html, re.S).group(0)
style = re.search(r"<style>(.*?)</style>", html, re.S).group(1)
font = base64.b64encode((ROOT / "assets/fonts/PressStart2P.ttf").read_bytes()).decode()
style = style.replace('url("assets/fonts/PressStart2P.ttf")', f'url("data:font/ttf;base64,{font}")')

body = re.search(r"<body>(.*?)</body>", html, re.S).group(1)


def inline(m):
    code = (ROOT / m.group(1)).read_text(encoding="utf-8")
    code = code.replace("</script", "<\\/script")
    return f"<script>\n{code}\n</script>"


body = re.sub(r'<script src="([^"]+)"></script>', inline, body)

page = f"{title}\n<style>{style}</style>\n{body}"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(page, encoding="utf-8")
print(f"{out} ({out.stat().st_size // 1024} KB)")
