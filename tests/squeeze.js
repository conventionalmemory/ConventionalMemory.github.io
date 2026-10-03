/* No character text box may be squeezed into a thin vertical strip, on a phone or a desktop.   Run: node tests/squeeze.js */
const http=require("http"),fs=require("fs"),path=require("path");const {chromium}=require("playwright");
const root=path.join(__dirname,"..");const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml"};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith("/"))f+="index.html";fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});r.end(d)})});
const src=fs.readFileSync(path.join(__dirname,"smoke.js"),"utf8");
const routes=JSON.parse(src.match(/ROUTES=(\[[^\]]*\])/)[1]).filter(r=>r!=="admin"&&r!=="kiosk").concat(["recap","recap/nes","repairs","repairs/amiga-clock-battery","library","family","family/emma","squabbles","ipods/bench/g4","shop/ipods"]);
(async()=>{await new Promise(r=>srv.listen(0,r));const base="http://localhost:"+srv.address().port+"/index.html#/";const b=await chromium.launch();const fails=[];let seen=0;
 for(const vw of [390,1280]){const c=await b.newContext({viewport:{width:vw,height:900}});await c.addInitScript(()=>{try{localStorage.setItem("cm-boot","1");sessionStorage.setItem("cm-boot","1")}catch(e){}});const p=await c.newPage();await p.route(/^https?:\/\/(?!localhost)/,r=>r.abort());
  for(const rt of routes){await p.goto(base+rt);await p.waitForTimeout(500);
   const bad=await p.evaluate(()=>[...document.querySelectorAll(".cb-t")].filter(e=>e.offsetParent!==null).map(e=>{const r=e.getBoundingClientRect();return{w:Math.round(r.width),h:Math.round(r.height),t:(e.textContent||"").slice(0,30)}}).map(x=>(x.w<70||x.h>x.w*2.5+40)&&x.t.length>6?x:null).filter(Boolean));
   seen+=await p.evaluate(()=>document.querySelectorAll(".cb-t").length);
   bad.forEach(x=>fails.push(vw+"px #/"+rt+": squeezed box "+x.w+"x"+x.h+" \""+x.t+"\""))}
  await c.close()}
 await b.close();srv.close();
 if(fails.length){console.error("FAILED ("+fails.length+")\n"+fails.join("\n"));process.exit(1)}console.log("OK: "+seen+" text boxes checked, none squeezed")})();
