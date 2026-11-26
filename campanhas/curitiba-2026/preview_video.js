const { chromium } = require('playwright'); const path=require('path');
const S={'1x1':[1080,1080],'9x16':[1080,1920],'16x9':[1920,1080]};
(async()=>{const b=await chromium.launch(); const out=process.argv[2]; const ts=[3,8,12.8,18.5,22.5,27.5];
for(const f of Object.keys(S)){const p=await b.newPage({viewport:{width:S[f][0],height:S[f][1]}});
p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('file://'+path.resolve(__dirname,'src/video.html')+'?f='+f); await p.evaluate(()=>window.READY);
for(const t of ts){await p.evaluate(t=>render(t),t); await p.screenshot({path:`${out}/v_${f}_${t}.jpg`,type:'jpeg',quality:70});}}
await b.close();})();
