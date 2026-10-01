/* Navigation and stuck-state test: catalog filters live in the address, the Catalog menu link always returns to the front,
   Back restores filters, unknown pages get a real not-found page, zoom stays light.   Run: node tests/nav.js */
const http=require("http"),fs=require("fs"),path=require("path");const {chromium}=require("playwright");
const root=path.join(__dirname,"..");const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml"};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith("/"))f+="index.html";fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});r.end(d)})});
(async()=>{await new Promise(r=>srv.listen(0,r));const base="http://localhost:"+srv.address().port+"/index.html#/";
 const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM||undefined});const p=await b.newPage({viewport:{width:1100,height:900}});
 const fails=[],errs=[];p.on("pageerror",e=>errs.push(e.message));
 const ok=(c,m)=>{console.log((c?"ok   ":"FAIL ")+m);if(!c)fails.push(m)};
 const front=()=>p.evaluate(()=>{const f=document.getElementById("fr");return !!f&&!f.hidden&&f.offsetHeight>0});
 const fresh=async()=>{await p.goto(base+"catalog");await p.evaluate(()=>{localStorage.clear();sessionStorage.clear()});await p.goto(base+"catalog");await p.reload();await p.waitForTimeout(500)};
 const menu=async()=>{await p.click('header.top nav a[href="#/catalog"]');await p.waitForTimeout(400)};
 await fresh();ok(await front(),"catalog opens on the front");
 const cases=[["department tile",async()=>p.click(".dept")],["MEM segment",async()=>p.click(".ms")],["browse all",async()=>p.click(".fall .btn")],["search",async()=>{await p.click("#q");await p.keyboard.type("sb")}],["decade chip",async()=>{await p.click("#fb");await p.click(".chip.dec")}],["shelf tile",async()=>p.click(".wt[data-go=shelf]")]];
 for(const [n,fn] of cases){await fresh();await fn();await p.waitForTimeout(300);const filtered=!(await front());const h=await p.evaluate(()=>location.hash);await menu();ok(filtered&&await front(),"Catalog menu link returns to the front after: "+n+" ("+h+")")}
 // Back restores filters
 await fresh();await p.click(".dept");await p.waitForTimeout(300);const url=await p.evaluate(()=>location.hash);await p.click(".card");await p.waitForTimeout(400);await p.goBack();await p.waitForTimeout(500);
 ok(/\?c=/.test(url)&&!(await front())&&await p.evaluate(()=>location.hash)===url,"filters are in the address and Back from an item restores them ("+url+")");
 // deep link
 await p.goto(base+"catalog?c=Laptops");await p.waitForTimeout(500);ok(!(await front())&&await p.evaluate(()=>[...document.querySelectorAll("#cc .chip.on")].map(c=>c.dataset.c).join())==="Laptops","a filtered address opens that filter directly");
 await p.goto(base+"catalog/cat/Computers");await p.waitForTimeout(500);ok(!(await front()),"old department address still works");
 // not found
 await p.goto(base+"timelime");await p.waitForTimeout(500);ok(/Page not found/.test(await p.evaluate(()=>document.getElementById("app").innerText))&&/timeline/.test(await p.evaluate(()=>document.getElementById("app").innerText)),"unknown address shows not-found with a suggestion");
 await p.goto(base+"timeline/9999");await p.waitForTimeout(500);ok(/not on it/.test(await p.evaluate(()=>document.getElementById("app").innerText)),"out-of-range year says so");
 // zoom stays light
 await p.goto(base+"zoom");await p.waitForTimeout(800);const nz=await p.evaluate(()=>document.querySelectorAll(".zn").length);ok(nz>10&&nz<700,"zoom timeline renders only nearby entries ("+nz+" buttons)");
 await p.click(".zn");await p.waitForTimeout(200);ok(await p.evaluate(()=>/Timeline page/.test(document.getElementById("zpop").innerText)),"zoom entry opens its details");
 // era mode leaves admin alone
 await p.goto(base+"era/1995");await p.waitForTimeout(400);await p.click("#eraon");await p.waitForTimeout(300);await p.goto(base+"admin");await p.waitForTimeout(500);
 ok(await p.evaluate(()=>document.documentElement.getAttribute("data-theme")!=="ega"),"era mode does not restyle Admin");
 ok(!errs.length,"no script errors"+(errs.length?": "+errs.join("|"):""));
 await b.close();srv.close();if(fails.length){console.error("FAILED "+fails.length);process.exit(1)}console.log("OK nav")})();
