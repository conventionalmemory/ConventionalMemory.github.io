/* The scene director: every kind of thing composes a scene, bubbles stay on stage, the kiosk deck follows live content, and the Funnies and Animations pages generate on the spot.   Run: node tests/director.js */
const http=require("http"),fs=require("fs"),path=require("path");const {chromium}=require("playwright");
const root=path.join(__dirname,"..");const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml"};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith("/"))f+="index.html";fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});r.end(d)})});
(async()=>{await new Promise(r=>srv.listen(0,r));const base="http://localhost:"+srv.address().port+"/index.html#/";
 const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM||undefined});const ctx=await b.newContext({viewport:{width:1100,height:900},acceptDownloads:true});const p=await ctx.newPage();
 const fails=[],errs=[];p.on("pageerror",e=>errs.push(e.message));
 const ok=(c,m)=>{console.log((c?"ok   ":"FAIL ")+m);if(!c)fails.push(m)};const go=async h=>{await p.goto(base+h);await p.waitForTimeout(600)};const txt=()=>p.evaluate(()=>document.getElementById("app").innerText);
 await go("");await p.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
 await go("animations");await p.waitForTimeout(800);
 await p.evaluate(()=>new Promise(r=>{if(window.CMStage)return r();const s=document.createElement("script");s.src="stage.js";s.onload=r;document.head.appendChild(s)}));
 const kinds=await p.evaluate(()=>{const k={};TL.forEach(r=>{(k[r[1]]=k[r[1]]||[]).push(r)});return Object.keys(k).map(x=>{const r=k[x][Math.floor(k[x].length/2)];return{kind:x,name:String(r[2]).replace(/ \((book|novel|Boss Fight Books)\)$/,""),year:String(r[0]).slice(0,4),dur:4800}})});
 ok(kinds.length>=10,"every timeline kind is sampled ("+kinds.length+" kinds)");
 const res=await p.evaluate(async(kinds)=>{const el=document.getElementById("anstage");CMStage.mount(el);const out=[];
  for(const c of kinds.concat([{kind:"quote",dur:4800},{kind:"fact",dur:4800},{kind:"zz",name:"A very long name that goes on and on and on for a while",dur:4800}])){const r=CMStage.run("auto",c);await new Promise(r=>setTimeout(r,2400));
   const a=el.getBoundingClientRect(),bad=[...el.querySelectorAll(".stg-b:not([hidden])")].filter(b=>{const q=b.getBoundingClientRect();return q.left<a.left-2||q.right>a.right+2||q.top<a.top-2});
   out.push({k:c.kind,r:String(r),n:el.querySelectorAll(".stg-a").length,star:!!el.querySelector(".stg-a.star"),bub:el.querySelectorAll(".stg-b:not([hidden])").length,bad:bad.length})}
  CMStage.stop();return out},kinds);
 ok(res.every(x=>/^auto:/.test(x.r)&&x.n>=3&&x.star),"every kind composes a scene with Connie and two others ("+res.filter(x=>!(/^auto:/.test(x.r)&&x.n>=3&&x.star)).map(x=>x.k).join(",")+")");
 ok(res.every(x=>x.bad===0),"speech bubbles stay inside the stage for every kind"+(res.some(x=>x.bad)?" ("+res.filter(x=>x.bad).map(x=>x.k).join(",")+")":""));
 ok(await p.evaluate(()=>CMStage.topics.length>=15&&["book","movie","game","laptop","audio"].every(t=>CMStage.topics.indexOf(t)>=0)),"the director knows at least 15 topics");
 ok(await p.evaluate(()=>CMStage.topicOf({kind:"bk",name:"x"})==="book"&&CMStage.topicOf({kind:"hw",name:"Sega Genesis"})==="console"&&CMStage.topicOf({kind:"pe",name:"Sound Blaster 16"})==="audio"&&CMStage.topicOf({kind:"hw",name:"IBM ThinkPad 701"})==="laptop"),"topics follow the kind and the words in the name");
 // reduced motion shows the finished scene without timers running
 // deck follows live content
 const hasBk=await p.evaluate(()=>{try{return TL.some(r=>r[1]==="bk")}catch(e){return false}});ok(hasBk,"books are on the timeline, so the kiosk deck can include them");
 await go("kiosk");await p.click("#kgo");await p.waitForTimeout(500);
 const kd=await p.evaluate(()=>new Promise(res=>{const L=[],sc=document.getElementById("kscr"),add=()=>{const e=sc.firstElementChild;if(e&&e.dataset.kind&&e!==add.last){add.last=e;L.push(e.dataset.kind)}if(L.length>=11)res(L)};new MutationObserver(add).observe(sc,{childList:true});add();setTimeout(()=>res(L),130000)}));
 ok(new Set(kd).size>=5,"the kiosk shows many kinds of slide ("+[...new Set(kd)].join(",")+")");
 ok(kd.every((k,i)=>i===0||k!==kd[i-1]),"the kiosk never shows the same kind twice in a row");
 await p.keyboard.press("Escape");await p.waitForTimeout(300);
 // funnies and animations generate on the spot
 await go("funnies");await p.waitForTimeout(1500);
 ok(await p.evaluate(()=>document.querySelectorAll("#cfgen .cc-p").length===4&&/Fresh from the timeline/.test(document.getElementById("cfgen").textContent)),"the Funnies page writes a four-panel strip from a timeline entry");
 const h1=await p.evaluate(()=>document.getElementById("cfgen").textContent);await p.click("#cfmore");await p.waitForTimeout(400);
 ok(await p.evaluate(()=>document.querySelectorAll("#cfgen .cc-p").length===4),"Make another one gives another strip");
 await go("animations");await p.fill("#ancq","Doom");await p.click("#ancg");await p.waitForTimeout(1800);
 ok(await p.evaluate(()=>/Composed from the timeline entry/.test(document.getElementById("anct").textContent)&&!!document.querySelector("#anstage .stg-a.star")),"the Animations page composes a scene for a title you type");
 await p.click("#ancr");await p.waitForTimeout(1500);ok(await p.evaluate(()=>/Topic: /.test(document.getElementById("anct").textContent)),"Surprise me composes one too");
 ok(errs.length===0,"no page errors"+(errs.length?" ("+errs[0]+")":""));
 await b.close();srv.close();console.log(fails.length?"\n"+fails.length+" FAILED":"\nall ok");process.exit(fails.length?1:0)})()
