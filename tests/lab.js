/* Interaction test for the lab features: Does it run?, Dream rig, year walk, swap-meet hunt, advisor,
   trade matching on Wanted, plus item-page repair journal slider, video tab and benchmarks.
   Run: node tests/lab.js */
const http=require("http"),fs=require("fs"),path=require("path");const {chromium}=require("playwright");
const root=path.join(__dirname,"..");const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml"};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith("/"))f+="index.html";fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});r.end(d)})});
(async()=>{await new Promise(r=>srv.listen(0,r));const base="http://localhost:"+srv.address().port+"/index.html#/";
 const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM||undefined});const p=await b.newPage({viewport:{width:1100,height:900}});
 const fails=[],errs=[];p.on("pageerror",e=>errs.push(e.message));p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|ERR_/.test(m.text()))errs.push(m.text())});
 const ok=(c,m)=>{console.log((c?"ok   ":"FAIL ")+m);if(!c)fails.push(m)};const go=async(h)=>{await p.goto(base+h);await p.waitForTimeout(700)};const txt=()=>p.evaluate(()=>document.getElementById("app").innerText);
 // Does it run?
 await go("runs");ok(/Does it run/i.test(await txt()),"runs page renders");
 // Dream rig: two ISA cards on one IRQ must conflict, auto-resolve must clear it
 await go("rigs");let t=await txt();ok(/Dream rig/.test(t)&&/IRQ map/.test(t),"rig page renders");
 await p.click('input[data-d="s-awe"]');await p.waitForTimeout(300);
 ok(/bad/.test(await p.evaluate(()=>document.querySelector(".rg-stat").className)),"two SB cards on IRQ 5 conflict");
 await p.click("#rauto");await p.waitForTimeout(300);{const t2=await p.evaluate(()=>document.querySelector(".rg-stat").innerText);ok(!/IRQ \d+ is claimed/.test(t2)&&/I\/O port 220h/.test(t2),"auto-resolve clears the IRQ clash but I/O and DMA clashes remain (two Sound Blasters really cannot share)")}
 await p.click("#rrand");await p.waitForTimeout(300);ok(await p.evaluate(()=>!!document.querySelector(".rg-stat")),"random rig draws");
 // Walk
 await go("walk/1995");ok(/Stop 1 of/.test(await txt()),"walk starts at stop 1");await p.click("#wkn");await p.waitForTimeout(200);ok(/Stop 2 of/.test(await txt()),"walk next stop");
 await p.keyboard.press("ArrowRight");await p.waitForTimeout(200);ok(/Stop 3 of/.test(await txt()),"walk arrow key");
 // Hunt + advisor + bench
 await go("hunt");ok(/swap|hunt/i.test(await txt()),"hunt page renders");
 await go("advisor");ok(/next/i.test(await txt()),"advisor renders");
 await go("bench");ok(/Benchmark/.test(await txt()),"bench renders");
 // Trade matching
 await go("wanted");await p.fill("#td_w","Sound Blaster 16");await p.waitForTimeout(300);ok(await p.evaluate(()=>!!document.querySelector("#td_m")&&/Sound Blaster 16/.test(document.querySelector("#td_m").value)),"trade form builds a message");
 // Item page: journal slider, video tab, benchmarks
 await go("");const id=await p.evaluate(()=>{const it=ITEMS[0];const mk=c=>"data:image/svg+xml;base64,"+btoa('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30"><rect width="40" height="30" fill="'+c+'"/></svg>');
  it.photos=[mk("red"),mk("green")];it.videos=[{t:"Tour",u:"https://www.youtube.com/watch?v=dQw4w9WgXcQ",c:[{s:0,l:"Intro"},{s:80,l:"Boot"}]}];it.log=[{d:"2026-05-01",t:"Repair",n:"Recap",b:"photo#1",a:"photo#2",parts:"caps",hrs:2}];it.bench=[{t:"Quake timedemo1",v:20,u:"fps"}];return it.id});
 await go("item/"+id);ok(await p.evaluate(()=>!!document.querySelector('[data-gotab="video"]')),"hero has Watch button");
 await p.click('[data-gotab="video"]');await p.click('.vch .chip[data-s="80"]');await p.waitForTimeout(300);ok(await p.evaluate(()=>/start=80/.test(document.querySelector(".vf iframe")?.src||"")),"chapter button seeks the embed");
 await p.click('[data-tab="history"]');await p.evaluate(()=>{const r=document.querySelector(".ba input");r.value=20;r.dispatchEvent(new Event("input",{bubbles:true}))});ok(await p.evaluate(()=>document.querySelector(".ba")?.style.getPropertyValue("--p")==="20%"),"before/after slider moves");
 await p.click('[data-tab="specs"]');await p.waitForTimeout(600);ok(await p.evaluate(()=>/Quake/.test(document.getElementById("benchslot")?.innerText||"")),"item benchmarks load");
 ok(!errs.length,"no script errors"+(errs.length?": "+errs.join("|"):""));
 await b.close();srv.close();if(fails.length){console.error("FAILED "+fails.length);process.exit(1)}console.log("OK lab");})();
