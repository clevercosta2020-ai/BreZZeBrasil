const { chromium } = require('playwright'); const path=require('path'); const {spawn}=require('child_process');
const S={'1x1':[1080,1080],'9x16':[1080,1920],'16x9':[1920,1080]};
const f=process.argv[2], out=process.argv[3], FPS=30;
(async()=>{
  const b=await chromium.launch(); const p=await b.newPage({viewport:{width:S[f][0],height:S[f][1]}});
  p.on('pageerror',e=>console.log('ERR',e.message));
  await p.goto('file://'+path.resolve(__dirname,'src/video.html')+'?f='+f); await p.evaluate(()=>window.READY);
  const T=await p.evaluate(()=>window.T); const n=Math.round(T*FPS);
  const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(FPS),'-c:v','mjpeg','-i','-',
    '-i',path.resolve(__dirname,'src/trilha_final.wav'),'-c:v','libx264','-preset','slow','-crf','18','-pix_fmt','yuv420p','-profile:v','high',
    '-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart',out],{stdio:['pipe','inherit','inherit']});
  for(let i=0;i<n;i++){ await p.evaluate(t=>render(t),i/FPS);
    const buf=await p.screenshot({type:'jpeg',quality:95});
    if(!ff.stdin.write(buf)) await new Promise(r=>ff.stdin.once('drain',r));
    if(i%120===0) console.log(f,i,'/',n); }
  ff.stdin.end(); await new Promise(r=>ff.on('close',r)); await b.close(); console.log('done',f);
})();
