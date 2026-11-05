const {chromium}=require('playwright');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
p.on('pageerror',e=>console.log('PAGEERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
await p.goto('file://'+path.resolve('index.html'));await p.evaluate(()=>window.READY);
const ts=process.argv.slice(3).map(Number);
for(const t of ts){try{await p.evaluate(t=>window.R(t),t);await p.screenshot({path:process.argv[2]+'/f_'+t.toFixed(2)+'.png'});}catch(e){console.log('ERR at',t,e.message)}}
await b.close()})();
