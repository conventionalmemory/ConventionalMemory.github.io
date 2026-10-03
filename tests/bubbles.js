/* Mascot text boxes: each character has a box shape of their own, they layer, and nothing scrolls sideways.   Run: node tests/bubbles.js */
const http=require("http"),fs=require("fs"),path=require("path");const {chromium}=require("playwright");
const root=path.join(__dirname,"..");const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml"};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith("/"))f+="index.html";fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});r.end(d)})});
const fails=[],errs=[];const ok=(c,m)=>{console.log((c?"ok   ":"FAIL ")+m);if(!c)fails.push(m)};
(async()=>{await new Promise(r=>srv.listen(0,r));const base="http://localhost:"+srv.address().port+"/index.html#/";const b=await chromium.launch();
 for(const vw of [1280,390]){const c=await b.newContext({viewport:{width:vw,height:900}});await c.addInitScript(()=>{try{localStorage.setItem("cm-boot","1");sessionStorage.setItem("cm-boot","1")}catch(e){}});const p=await c.newPage();p.on("pageerror",e=>errs.push(e.message));
  await p.goto(base+"squabbles");await p.waitForTimeout(1000);
  ok(await p.evaluate(()=>document.querySelectorAll(".fa-bubs .cb").length>=2),"squabbles use character text boxes at "+vw+"px");
  ok(await p.evaluate(()=>{const s=document.querySelector(".fa-bubs");if(!s)return false;const t=[...s.querySelectorAll(".cb-t")];return t.length>=2&&t.every(x=>/cb-s-/.test(x.className))}),"each squabble line has a shape class");
  ok(await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),"squabbles has no sideways scroll at "+vw+"px");
  if(vw===1280){
   const r=await p.evaluate(()=>{const ids=Object.keys(CMBub.shapes),by={};ids.forEach(i=>{by[CMBub.shapes[i]]=(by[CMBub.shapes[i]]||[]).concat(i)});
    const d=document.createElement("div");d.id="bt";d.innerHTML=CMBub.stack(ids.slice(0,4).map(i=>[i,i,"Line.",""]))+CMBub.html("connie","Connie","Really?","")+CMBub.html("connie","Connie","Go!","")+CMBub.html("connie","Connie","Plain line.","");document.body.appendChild(d);
    const t=[...d.querySelectorAll(".cb-t")].map(x=>x.className.match(/cb-s-(\w+)/)[1]);
    const st=d.querySelectorAll(".cb-stack .cb");const bb=[...st].map(x=>x.getBoundingClientRect());
    return{dupe:Object.keys(by).filter(k=>by[k].length>1&&k!=="cloud"),flip:[...st].map(x=>x.classList.contains("cb-fl")),over:bb[1].top<bb[0].bottom,tail:t.slice(-3)}});
   ok(r.dupe.length===0,"every character except the thought-cloud pair has a shape of their own"+(r.dupe.length?": "+r.dupe:""));
   ok(JSON.stringify(r.flip)==="[false,true,false,true]","stacked boxes take turns left and right");
   ok(r.over,"stacked boxes overlap");
   ok(r.tail.join()==="cloud,burst,speech","a question becomes a thought cloud, a shout a burst");
  }
  if(vw===1280){
   const has=async(route,sel,what)=>{await p.goto(base+route);await p.waitForTimeout(900);ok(await p.evaluate(sel=>{const e=document.querySelector(sel);return !!e&&/cb-s-/.test(e.className)},sel),what)};
   await has("recap/nes","#rc-say .cb-t","the recap bench shows Connie in her own box");
   await has("repairs/amiga-clock-battery","#rc-say .cb-t","the repair guide shows Connie in her own box");
   await has("repairs",".rc-two .cb-t.cb-s-clip","Mom's caution on the repairs page is in her clipboard box");
   await has("family/emma","#fa-line .cb-t","a family profile line is in a character box");
   await p.evaluate(()=>document.querySelector("#fa-again").click());
   ok(await p.evaluate(()=>!!document.querySelector("#fa-line .cb-t")),"saying something else keeps the box");
   await has("memman",".mm-say .cb-t","the memory manager game shows Connie in her own box");
   await has("shop/connie",".sh-greet .cb-t","the mall shows Connie in her own box");
   await has("about",".cm-cameo .cb-t","a family cameo speaks in Connie's own box");
   await p.goto(base+"animations");await p.waitForTimeout(1000);
   await p.evaluate(()=>document.querySelector('[data-scene="kitchen"]').click());await p.waitForTimeout(800);
   ok(await p.evaluate(()=>!!document.querySelector("#anstage .stg-a")),"the stage scenes still run");
   await p.waitForTimeout(6500);
   ok(await p.evaluate(()=>{const b=[...document.querySelectorAll(".stg-b[data-sh]")];return b.length>0&&b.every(x=>x.style.getPropertyValue("--hh"))}),"stage speech bubbles take their character's box shape and color");
  }
  await c.close()}
 ok(errs.length===0,"no page errors"+(errs.length?": "+errs[0]:""));
 await b.close();srv.close();if(fails.length){console.error("FAILED "+fails.length);process.exit(1)}console.log("OK bubbles")})();
