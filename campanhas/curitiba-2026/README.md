# BreZZe Brasil: peças de comunicação

Campanha "BreZZe Brasil chega a Curitiba": estáticos (1:1, 4:5, 9:16, 16:9), vídeos de 28 s (1:1, 9:16, 16:9) e legendas.

- `entregas/`: arquivos finais (PNG, MP4, legendas)
- `src/`: layouts HTML editáveis (`static.html`, `video.html`), imagens e trilha
- `marca/`: QR Codes oficiais e logos de marcas parceiras (originais)
- `tools/music.py`: trilha original sintetizada

## Gerar novamente
```bash
node render_static.js "$PWD/entregas/estaticos"            # estáticos
node render_video.js 9x16 entregas/videos/BreZZe_Curitiba_video_9x16.mp4   # vídeo (1x1 | 9x16 | 16x9)
```
Requer Node + Playwright (Chromium) e ffmpeg.

**Regras da marca: ver `CLAUDE.md` na raiz do repositório** (ex.: usar somente os QR Codes oficiais).
