const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const out = process.argv[2]; const fmts = (process.argv[3]||'1x1,4x5,9x16,16x9').split(',');
  const S = {'1x1':[1080,1080],'4x5':[1080,1350],'9x16':[1080,1920],'16x9':[1920,1080]};
  for (const f of fmts) {
    const p = await b.newPage({ viewport: { width: S[f][0], height: S[f][1] }, deviceScaleFactor: +(process.argv[4]||1) });
    p.on('pageerror', e => console.log('ERR', f, e.message));
    await p.goto('file://' + path.resolve(__dirname, 'src/static.html') + '?f=' + f);
    await p.evaluate(() => window.READY); await p.waitForTimeout(400);
    await p.locator('#stage').screenshot({ path: `${out}/BreZZe_Curitiba_estatico_${f}.png` });
    console.log('ok', f);
  }
  await b.close();
})();
