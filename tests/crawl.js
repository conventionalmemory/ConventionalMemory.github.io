/* Link crawler: visits every page, collects every in-site link and clickable button, follows each link once,
   and fails on not-found pages, empty pages, script errors, or a page that traps the keyboard.   Run: node tests/crawl.js */
const http=require("http"),fs=require("fs"),path=require("path");const {chromium}=require("playwright");
const root=path.join(__dirname,"..");const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml"};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith("/"))f+="index.html";fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});r.end(d)})});
(async()=>{await new Promise(r=>srv.listen(0,r));const base="http://localhost:"+srv.address().port+"/index.html";
 const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM||undefined});const p=await b.newPage({viewport:{width:1100,height:900}});
 const fails=[];let errs=[];p.on("pageerror",e=>errs.push(e.message));p.on("dialog",d=>d.dismiss());
 const seen=new Set(),queue=["#/"],from={};const SKIP=/^#\/(admin|maze|random|t\/|kiosk)/;let n=0;
 while(queue.length&&n<400){const h=queue.shift();if(seen.has(h))continue;seen.add(h);n++;errs=[];
  await p.goto(base+h);await p.waitForTimeout(250);
  const r=await p.evaluate(()=>({txt:document.getElementById("app").innerText,links:[...document.querySelectorAll("#app a[href^='#/'],header a[href^='#/'],footer a[href^='#/']")].map(a=>a.getAttribute("href"))}));
  if(r.txt.length<20)fails.push(h+": empty page");if(/Page not found|Item not found/.test(r.txt)&&!/not-found/.test(h))fails.push(h+": not found (linked from "+(from[h]||"?")+")");
  if(errs.length)fails.push(h+": script error "+errs[0]);
  r.links.forEach(l=>{const k=l.split("?")[0].replace(/\/$/,"");if(!SKIP.test(l)&&!seen.has(l)&&!queue.includes(l)&&queue.length<500){const root=l.replace(/^#\/([^/?]*).*/,"$1");const cnt=[...seen,...queue].filter(x=>x.replace(/^#\/([^/?]*).*/,"$1")===root).length;if(cnt<8)queue.push(l);from[l]=h}})}
 console.log("crawled "+n+" pages");
 // every button on a few busy pages must do something harmless: click each, page must still be alive
 for(const h of ["#/catalog","#/start","#/about","#/labels","#/scan","#/backup","#/wish"]){errs=[];await p.goto(base+h);await p.waitForTimeout(300);
  const nb=await p.evaluate(()=>document.querySelectorAll("#app button:not([disabled])").length);
  for(let i=0;i<nb&&i<40;i++){await p.goto(base+h);await p.waitForTimeout(150);const ok=await p.evaluate(i=>{const bt=[...document.querySelectorAll("#app button:not([disabled])")][i];if(!bt)return true;const t=(bt.textContent||"").trim();if(/delete|erase|reset|restore|clear|import|print|connect|share|copy|download|camera/i.test(t))return true;bt.click();return true},i);await p.waitForTimeout(80)}
  if(errs.length)fails.push(h+": a button threw "+errs[0]);
  const alive=await p.evaluate(()=>document.getElementById("app").innerText.length>10);if(!alive)fails.push(h+": page died after clicking buttons")}
 // Tab never gets trapped on the catalog
 await p.goto(base+"#/catalog");await p.waitForTimeout(300);const tags=new Set();for(let i=0;i<60;i++){await p.keyboard.press("Tab");tags.add(await p.evaluate(()=>document.activeElement.outerHTML.slice(0,60)))}
 if(tags.size<15)fails.push("catalog: keyboard focus looks trapped ("+tags.size+" distinct stops in 60 tabs)");
 await b.close();srv.close();if(fails.length){console.error("FAILED:\n"+fails.join("\n"));process.exit(1)}console.log("OK crawl")})();
