// Format setup: ?f=1x1 | 9x16 | 16x9
const FORMATS = { '1x1': [1080, 1080], '9x16': [1080, 1920], '16x9': [1920, 1080], '4x5': [1080, 1350] };
const F = new URLSearchParams(location.search).get('f') || '1x1';
const [W, H] = FORMATS[F];
const stage = document.getElementById('stage');
stage.style.width = W + 'px'; stage.style.height = H + 'px';
stage.classList.add('f' + F);
document.documentElement.style.setProperty('--u', (Math.min(W, H) / 100) + 'px');

const ICON = {
  pin: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" fill="#3CCBF4"/><circle cx="12" cy="10" r="2.6" fill="#06223D"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  bolt: '<svg viewBox="0 0 24 24"><path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="#3CCBF4"/></svg>',
};

// Generative "wave lines" (brand motif from the deck)
function waves(n = 26, w = 1600, h = 400, amp = 70, phase = 0) {
  let s = `<svg class="waves" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs><linearGradient id="wg" x1="0" x2="1"><stop offset="0" stop-color="#3CCBF4" stop-opacity="0"/><stop offset=".45" stop-color="#3CCBF4" stop-opacity=".55"/><stop offset="1" stop-color="#8FE3FF" stop-opacity=".15"/></linearGradient></defs>`;
  for (let i = 0; i < n; i++) {
    const k = i / n, pts = [];
    for (let x = 0; x <= w; x += 20) {
      const y = h / 2 + Math.sin(x / w * Math.PI * 2 + k * 2.2 + phase) * amp * (0.4 + k) + Math.sin(x / w * Math.PI * 5 + k * 4 + phase * 1.7) * amp * 0.25;
      pts.push(`${x},${y.toFixed(1)}`);
    }
    s += `<path d="M${pts.join(' L')}"/>`;
  }
  return s + '</svg>';
}

// Line-art of Curitiba's Jardim Botânico greenhouse
const CWB = `<svg viewBox="0 0 400 210" fill="none" stroke="#3CCBF4" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" class="cwb">
<path d="M20 195 H380"/>
<path d="M60 195 V140 Q60 112 95 112 H130 V195"/><path d="M270 195 V112 H305 Q340 112 340 140 V195"/>
<path d="M130 195 V100 Q130 60 200 52 Q270 60 270 100 V195"/>
<path d="M165 72 Q200 20 235 72"/><path d="M200 24 V8"/><circle cx="200" cy="30" r="5"/>
<path d="M150 195 V95 M175 195 V80 M200 195 V60 M225 195 V80 M250 195 V95"/>
<path d="M130 120 H270 M130 150 H270 M60 150 H130 M270 150 H340"/>
<path d="M78 195 V125 M95 195 V115 M112 195 V115 M288 195 V115 M305 195 V115 M322 195 V125"/>
<path d="M150 195 Q150 175 165 175 Q180 175 180 195 M220 195 Q220 175 235 175 Q250 175 250 195"/>
</svg>`;

// [type, src/text, scale, keepColor]
const LOGOS = [
  ['wm', 'Azul'], ['img', 'img/logo_viracopos.png'], ['wm', 'Itaú'], ['img', 'img/logo_viaquatro.png'],
  ['img', 'img/logo_neon.png'], ['img', 'img/logo_teleperformance.png'], ['img', 'img/logo_quicko.png'], ['img', 'img/logo_consigamais.png'],
  ['img', 'img/logo_icities.png', 1.25], ['img', 'img/logo_valedopinhao.png', 1.6], ['img', 'img/logo_habitat_mobilidade.png', 1.3, true],
];
function logoItem([t, v, sc = 1, keep], h, cls = '', extra = '') {
  return t === 'wm'
    ? `<div class="wm ${cls}" ${extra} style="font-size:${h * 0.95}px">${v}</div>`
    : `<img class="${cls}" ${extra} src="${v}" style="height:${h * sc}px;max-width:${h * 4.2}px${keep ? ';filter:none;opacity:1' : ''}">`;
}
function logosHTML(h) { return LOGOS.map(l => logoItem(l, h)).join(''); }

// OFFICIAL QR codes only (see CLAUDE.md): WhatsApp contact + app download
const QR = { wa: 'img/qr_wa.png', app: 'img/qr_app.png' };
function qrPair(w, gap, cls = '', extraWa = '', extraApp = '') {
  const lab = Math.max(11, w * 0.115), ww = w * 1.3;   // WA QR is dense: bigger card keeps it scannable
  return `<div class="qrcard ${cls}" ${extraWa} style="width:${ww}px;padding:${ww*0.07}px;flex:none"><img src="${QR.wa}"><small style="font-size:${lab}px">Fale conosco<br>WhatsApp</small></div>
          <div class="qrcard ${cls}" ${extraApp} style="width:${w}px;padding:${w*0.06}px;flex:none;margin-left:${gap}px"><img src="${QR.app}"><small style="font-size:${lab}px">Baixe o<br>app</small></div>`;
}
document.fonts && document.fonts.load('900 20px Montserrat');
