/* Tony's iPod Bench (ipodbench.js, ipod-data.js): every model page loads, draws its layers, lists sources, and keeps its promises.
   Run: node tests/ipodbench.js */
const http=require("http"),fs=require("fs"),path=require("path");const {chromium}=require("playwright");
const root=path.join(__dirname,"..");const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml"};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith("/"))f+="index.html";fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});r.end(d)})});
(async()=>{await new Promise(r=>srv.listen(0,r));const base="http://localhost:"+srv.address().port+"/index.html#/";
 const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM||undefined});const p=await(await b.newContext({viewport:{width:1100,height:900}})).newPage();
 const fails=[],errs=[];p.on("pageerror",e=>errs.push(e.message));
 const ok=(c,m)=>{console.log((c?"ok   ":"FAIL ")+m);if(!c)fails.push(m)};const go=async h=>{await p.goto(base+h);await p.waitForSelector(".ipb",{timeout:8000});await p.waitForTimeout(150)};
 await go("ipods/bench");
 const ids=await p.evaluate(()=>IPOD.m.map(m=>m.id));
 ok(ids.length===10,"ten models: "+ids.join(","));
 ok(await p.evaluate(()=>document.querySelectorAll(".ipb-pk").length===10),"the picker lists ten iPods");
 ok(await p.evaluate(()=>/numbered|plain square/.test(document.getElementById("app").textContent)),"the index explains how to read the drawings");
 for(const id of ids){await go("ipods/bench/"+id);
  const r=await p.evaluate(id=>{const m=IPOD.m.filter(x=>x.id===id)[0],a=document.getElementById("app"),t=a.textContent;return{layers:m.layers.length,plates:a.querySelectorAll(".ipb-pl").length,leg:a.querySelectorAll(".ipb-leg li").length,src:a.querySelectorAll(".ipb-src a").length,undef:/undefined|NaN|\[object/.test(t),h:document.title,wins:a.querySelectorAll(".ipb-win").length,bad:[...a.querySelectorAll("a[target=_blank]")].filter(x=>!/noopener/.test(x.rel)).length,ext:[...a.querySelectorAll(".ipb-src a, .ipb-mod a")].filter(x=>!/^https:\/\//.test(x.href)).length,gap:a.querySelectorAll(".ipb-gap li").length}},id);
  ok(r.plates===r.layers&&r.leg===r.layers,id+": "+r.layers+" layers drawn and listed");
  ok(r.src>=3&&r.ext===0,id+": "+r.src+" https sources");ok(!r.undef,id+": no undefined text");ok(r.bad===0,id+": every new-tab link has noopener");ok(r.gap>=1,id+": says what we have not confirmed");ok(r.wins>=9,id+": all the windows are there");}
 await go("ipods/bench/g1");ok(await p.evaluate(()=>/not drawn it/.test(document.getElementById("app").textContent)&&!document.querySelector(".ipb-svg")),"the 1st generation is not drawn, and says why");
 await go("ipods/bench/c6");ok(await p.evaluate(()=>[...document.querySelectorAll(".ipb-no")].map(e=>e.textContent).join("")==="123456"),"the classic is numbered in the published order");
 await go("ipods/bench/g4");ok(await p.evaluate(()=>!document.querySelector(".ipb-no")||![...document.querySelectorAll(".ipb-no")].some(e=>/^\d$/.test(e.textContent))),"the 4th generation shows squares, not invented numbers");
 await go("ipods/bench/n2");ok(await p.evaluate(()=>!/flash storage swap/i.test(document.querySelector(".ipb-mod")?document.querySelector(".ipb-mod").textContent:"")),"the nano 2nd generation offers no flash swap mod");
 // legend hover lifts the plate
 await go("ipods/bench/c6");await p.hover(".ipb-leg li[data-i='2']");ok(await p.evaluate(()=>document.querySelector(".ipb-pl[data-i='2']").classList.contains("on")),"hovering a legend row lights its plate");
 // unknown model falls back to the index
 await go("ipods/bench/zzz");ok(await p.evaluate(()=>document.querySelectorAll(".ipb-pk").length===10&&!document.querySelector(".ipb-svg")),"an unknown model shows the picker");
 // phone width
 await p.setViewportSize({width:375,height:800});await go("ipods/bench/v5");ok(await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),"v5 fits a phone with no sideways scroll");
 await p.setViewportSize({width:1100,height:900});
 // store still works and links across
 await p.goto(base+"ipods");await p.waitForSelector("#ipm");ok(await p.evaluate(()=>!!document.querySelector('a[href="#/ipods/bench"]')),"the iPod Works links to the bench");
 ok(errs.length===0,"no page errors"+(errs.length?": "+errs[0]:""));
 await b.close();srv.close();console.log(fails.length?"\nFAILED "+fails.length:"\nOK ipodbench");process.exit(fails.length?1:0)})();
