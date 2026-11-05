const {chromium}=require('playwright');const path=require('path');const fs=require('fs');
const FPS=30,N=1800,WORKERS=4;fs.mkdirSync('out/frames',{recursive:true});
(async()=>{const b=await chromium.launch();
await Promise.all([...Array(WORKERS).keys()].map(async w=>{
 const p=await b.newPage({viewport:{width:1920,height:1080}});p.on('pageerror',e=>console.log('PAGEERR',e.message));
 await p.goto('file://'+path.resolve('index.html'));await p.evaluate(()=>window.READY);
 for(let i=w;i<N;i+=WORKERS){await p.evaluate(t=>window.R(t),i/FPS);await p.screenshot({path:`out/frames/${String(i).padStart(5,'0')}.jpg`,type:'jpeg',quality:94});if(i%120===w)console.log('frame',i)}
}));await b.close();console.log('DONE')})();
