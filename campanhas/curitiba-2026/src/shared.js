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

// Rosácea (Jardim Botânico de Curitiba) line-art — rosette only, no building
const CWB = (() => {
  const P = [], N = 12;
  const pt = (a, r, w) => { const c = Math.cos(a), s = Math.sin(a); return `${(c * r - s * w).toFixed(2)} ${(s * r + c * w).toFixed(2)}`; };
  for (let i = 0; i < N; i++) {
    const a = -Math.PI / 2 + i * 2 * Math.PI / N, h = a + Math.PI / N;
    // long spoke ending in a diamond tip
    P.push(`<path d="M${pt(a,9,0)} L${pt(a,20,3.6)} L${pt(a,30,2.2)} L${pt(a,34,4.4)} L${pt(a,40,0)} L${pt(a,34,-4.4)} L${pt(a,30,-2.2)} L${pt(a,20,-3.6)} Z"/>`);
    // short inner spoke between long ones
    P.push(`<path d="M${pt(h,10,0)} L${pt(h,16,2)} L${pt(h,23,0)} L${pt(h,16,-2)} Z"/>`);
    // outer teardrop
    P.push(`<path d="M${pt(h,42,0)} Q${pt(h,46,3.4)} ${pt(h,50,0)} Q${pt(h,46,-3.4)} ${pt(h,42,0)} Z"/>`);
  }
  return `<svg viewBox="-58 -58 116 116" fill="none" stroke="#3CCBF4" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round" class="cwb">
<circle r="54"/><circle r="5.5"/><circle r="2"/>
${P.join('')}
</svg>`;
})();

// [type, src/text, scale, keepColor]
const LOGOS = [
  ['wm', 'Azul'], ['img', 'img/logo_viracopos.png'], ['wm', 'Itaú'], ['img', 'img/logo_viaquatro.png'],
  ['img', 'img/logo_neon.png'], ['img', 'img/logo_teleperformance.png'], ['img', 'img/logo_quicko.png'], ['img', 'img/logo_consigamais.png'],
  ['img', 'img/logo_icities.png', 1.25], ['img', 'img/logo_valedopinhao.png', 1.6], ['img', 'img/logo_habitat_mobilidade.png', 1.3, true],
  ['img', 'img/logo_inove_mais.png', 1.25, true],
];
function logoItem([t, v, sc = 1, keep], h, cls = '', extra = '') {
  return t === 'wm'
    ? `<div class="wm ${cls}" ${extra} style="font-size:${h * 0.95}px">${v}</div>`
    : `<img class="${cls}" ${extra} src="${v}" style="height:${h * sc}px;max-width:${h * 4.2}px${keep ? ';filter:none;opacity:1' : ''}">`;
}
function logosHTML(h) { return LOGOS.map(l => logoItem(l, h)).join(''); }

// OFFICIAL QR codes only (see CLAUDE.md): WhatsApp contact + app download
const QR = { wa: 'img/qr_wa.png', app: 'img/qr_app.png' };
// One official QR card. WA QR is dense, so its card is 1.3x larger to stay scannable.
function qrCard(kind, w, cls = '', extra = '', pos = '') {
  const ww = kind === 'wa' ? Math.max(w * 1.3, Math.min(W, H) * 0.19) : w, lab = Math.max(11, w * 0.115);  // WA floor: 19% keeps the dense code scannable
  const label = kind === 'wa' ? 'Fale conosco<br>WhatsApp' : 'Baixe o<br>app';
  return `<div class="qrcard ${cls}" ${extra} style="width:${ww}px;padding:${ww*0.07}px;${pos}"><img src="${QR[kind]}"><small style="font-size:${lab}px">${label}</small></div>`;
}
// The two QR codes in opposite bottom corners: WhatsApp left, app right
function qrCorners(w, side, bottom, cls = '', exWa = '', exApp = '') {
  return qrCard('wa', w, cls + ' abs', exWa, `left:${side}px;bottom:${bottom}px`) +
         qrCard('app', w, cls + ' abs', exApp, `right:${side}px;bottom:${bottom}px`);
}
document.fonts && document.fonts.load('900 20px Montserrat');
