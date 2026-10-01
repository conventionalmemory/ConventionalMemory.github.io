const {chromium}=require('playwright');process.exitCode=0;const S=(process.env.S||'/tmp');(async()=>{const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM});
const W=[320,360,390,600,768,1024,1280,1920],R=process.env.WROUTES?process.env.WROUTES.split(','):['','catalog','catalog/cat/Laptops','item/compaq-lte-elite-4-40c-no-hard-drive','item/doom-ii-big-box-ibm-pc-3-5-inch-floppies','timeline','hub/explore','more','play','search','stats','mine','wanted','follow','scale','mem','runs','bench','advisor','hunt','rigs','walk/1995','wish','prizes','labels','labels/toshiba-libretto-110ct','scan','backup','kiosk','hub/play','hub/stuff','report','catalog?c=Laptops','zoom','era/1995','nowhere'];
let issues=0;
for(const w of W){const p=await b.newPage({viewport:{width:w,height:800}});const er=[];p.on('pageerror',e=>er.push(e.message));
 for(const r of R){await p.goto('http://localhost:8123/#/'+r);await p.waitForTimeout(350);
  const o=await p.evaluate((w)=>{const bad=[];document.querySelectorAll('#app *,header *,footer *').forEach(e=>{const rc=e.getBoundingClientRect();if(rc.width&&rc.right>w+1){let p=e.parentElement,sc=false;while(p&&p!==document.body){const cs=getComputedStyle(p);if(/(auto|scroll|hidden)/.test(cs.overflowX)&&p.scrollWidth>=p.clientWidth){sc=true;break}p=p.parentElement}if(!sc)bad.push((e.tagName+'.'+(e.className&&e.className.baseVal===undefined?e.className:'')).slice(0,40)+' r='+Math.round(rc.right))}});
   const h=document.querySelector('header.top').getBoundingClientRect().height;return{sw:document.documentElement.scrollWidth,h:Math.round(h),bad:bad.slice(0,4)}},w);
  if(o.sw>w||o.bad.length){issues++;console.log(w,r||'home',JSON.stringify(o))}}
 if(er.length)console.log(w,'ERR',er[0]);
 if(w===390||w===1280||w===320){await p.goto('http://localhost:8123/#/catalog');await p.waitForTimeout(400);await p.screenshot({path:`${S}/w_${w}.png`,clip:{x:0,y:0,width:w,height:420}})}
 await p.close()}
console.log('issues',issues);await b.close()})()
