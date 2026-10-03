/* The long pages stay short: each opens on a screenful or two and lets you dig.   Run: node tests/short.js */
const http=require("http"),fs=require("fs"),path=require("path");const {chromium}=require("playwright");
const root=path.join(__dirname,"..");const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml"};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith("/"))f+="index.html";fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});r.end(d)})});
const fails=[],errs=[];const ok=(c,m)=>{console.log((c?"ok   ":"FAIL ")+m);if(!c)fails.push(m)};
const LIMITS={quotes:3000,squabbles:5000,album:6000,books:5000,repairs:4500,recap:5000,family:9000};
(async()=>{await new Promise(r=>srv.listen(0,r));const base="http://localhost:"+srv.address().port+"/index.html#/";const b=await chromium.launch();
 for(const [vw,mult] of [[1280,1],[390,2.2]]){const c=await b.newContext({viewport:{width:vw,height:900}});await c.addInitScript(()=>{try{localStorage.setItem("cm-boot","1");sessionStorage.setItem("cm-boot","1")}catch(e){}});const p=await c.newPage();p.on("pageerror",e=>errs.push(e.message));
  for(const r of Object.keys(LIMITS)){await p.goto(base+r);await p.waitForTimeout(1100);const h=await p.evaluate(()=>document.documentElement.scrollHeight);ok(h<=LIMITS[r]*mult,"#/"+r+" at "+vw+"px is "+h+"px (limit "+Math.round(LIMITS[r]*mult)+")");
   ok(await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),"#/"+r+" at "+vw+"px has no sideways scroll")}
  if(vw===1280){await p.goto(base+"books");await p.waitForTimeout(900);
   const n=await p.evaluate(()=>document.querySelectorAll(".bks-sec:not([hidden])").length);ok(n===1,"Books opens on one shelf");
   await p.click('[data-sh=""]');await p.waitForTimeout(100);ok(await p.evaluate(()=>document.querySelectorAll(".bks-sec:not([hidden])").length>=5),"Every shelf shows them all");
   await p.click('[data-sh]:nth-of-type(3)');await p.waitForTimeout(100);const first=await p.evaluate(()=>document.querySelector(".bks-sec:not([hidden])").getAttribute("data-shelf"));
   await p.evaluate(()=>{document.querySelector('[data-sh]:nth-of-type(2)').click()});await p.waitForTimeout(100);
   await p.evaluate(()=>{const s=[...document.querySelectorAll(".bks-sec")].find(x=>x.hidden);const id=s.getAttribute("data-shelf");window.__t=id;const sp=[...document.querySelectorAll(".spine")].find(x=>{const t=x.getAttribute("data-b");return s.querySelector("#bk-"+(typeof hstr==="function"?hstr(t):""))});if(sp)sp.click()});await p.waitForTimeout(300);
   ok(await p.evaluate(()=>{const v=[...document.querySelectorAll(".bks-sec:not([hidden])")];return v.length===1}),"clicking a spine opens its shelf")}
 }
 ok(errs.length===0,"no page errors"+(errs.length?": "+errs[0]:""));
 await b.close();srv.close();if(fails.length){console.error("FAILED "+fails.length);process.exit(1)}console.log("OK short")})();
