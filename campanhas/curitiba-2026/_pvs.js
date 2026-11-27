const { chromium } = require('playwright');
(async()=>{const b=await chromium.launch(); const out=process.argv[2]; const fm=(process.argv[3]||'9x16,1x1,16x9').split(',');
const SZ={'9x16':[1080,1920],'1x1':[1080,1080],'16x9':[1920,1080]};
const ts=['0.5','1.6','2.6','2.85','3.5','4.8','7.2','9.6','10.5','13.0','16.0','18.5','20.2','21.6','24.0','28.0'];
for(const f of fm){const p=await b.newPage({viewport:{width:SZ[f][0],height:SZ[f][1]}});
p.on('pageerror',e=>console.log('ERR',f,e.message));
await p.goto('file:///home/user/brezzebrasil/campanhas/curitiba-2026/src/show.html?f='+f); await p.evaluate(()=>window.READY);
for(const t of ts){await p.evaluate(t=>render(t),+t); await p.screenshot({path:`${out}/${f}_${t}.jpg`,type:'jpeg',quality:70});}}
await b.close();})();
