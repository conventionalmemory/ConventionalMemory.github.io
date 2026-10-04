/* Circuit drawings (schematic-data.js, schematic.js): data checks, the drawing appears on its machine page, parts light up, no sideways page scroll on a phone.   Run: node tests/schematic.js */
const http=require("http"),fs=require("fs"),path=require("path"),vm=require("vm");const {chromium}=require("playwright");
const root=path.join(__dirname,"..");const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml"};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith("/"))f+="index.html";fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});r.end(d)})});
const fails=[];const ok=(c,m)=>{console.log((c?"ok   ":"FAIL ")+m);if(!c)fails.push(m)};
(async()=>{
 const ctx={};vm.createContext(ctx);["recap-data.js","schematic-data.js"].forEach(f=>vm.runInContext(fs.readFileSync(path.join(root,f),"utf8"),ctx));
 const R=vm.runInContext("RECAP",ctx),S=vm.runInContext("SCH",ctx);
 const KNOWN="w j r c ce d z led f q coil sw g port box t".split(" ");
 ok(S.length>=1&&new Set(S.map(s=>s.id)).size===S.length&&S.every(s=>/^[a-z0-9-]{3,30}$/.test(s.id)),"every circuit has a unique id ("+S.length+" circuits)");
 ok(S.every(s=>s.m.length&&s.m.every(m=>R.some(x=>x.id===m))),"every circuit belongs to a recap machine that exists");
 ok(S.every(s=>s.t&&s.how&&s.alt&&s.by&&s.parts.length&&s.w>100&&s.h>100),"every circuit has a title, an explanation, alt text, a credit and a parts list");
 ok(S.every(s=>s.els.every(e=>KNOWN.indexOf(e[0])>=0)),"every shape in every drawing is one the renderer knows");
 const keys=s=>[...new Set(s.els.map(e=>e[e.length-1]).filter(o=>o&&typeof o==="object"&&!Array.isArray(o)&&o.k).map(o=>o.k))];
 ok(S.every(s=>keys(s).every(k=>s.parts.some(p=>p[0]===k))),"every part drawn with a key has a row in the parts list");
 ok(S.every(s=>s.parts.every(p=>p[1]&&p[2])),"every parts row has a quantity and a name");
 const nums=s=>s.els.filter(e=>["w","j","r","c","ce","d","z","led","f","q","coil","sw","g","port","t"].indexOf(e[0])>=0);
 ok(S.every(s=>nums(s).every(e=>{const xy=e[0]==="w"?e.slice(1).filter(v=>typeof v==="number"):[e[1],e[2]];return xy.every((v,i)=>v>=0&&v<=(e[0]==="w"?(i%2?s.h:s.w):(i%2?s.h:s.w)))})),"every point sits inside its drawing");
 ok(!/\b(ai|claude|anthropic|chatgpt)\b/i.test(fs.readFileSync(path.join(root,"schematic-data.js"),"utf8")+fs.readFileSync(path.join(root,"schematic.js"),"utf8")),"nothing in the circuit files mentions how it was made");
 await new Promise(r=>srv.listen(0,r));const base="http://localhost:"+srv.address().port+"/index.html#/";
 const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM||undefined});
 for(const w of [1000,390]){
  const c=await b.newContext({viewport:{width:w,height:900}});await c.addInitScript(()=>{try{localStorage.setItem("cm-boot","1");sessionStorage.setItem("cm-boot","1")}catch(e){}});
  const p=await c.newPage();const errs=[];p.on("pageerror",e=>errs.push(e.message));
  await p.goto(base+"recap/"+S[0].m[0]);await p.waitForTimeout(1500);await p.evaluate(()=>{document.querySelectorAll("[data-tab=docs]").forEach(b=>b.click())});await p.waitForTimeout(300);
  ok(await p.locator(".sch:visible .sch-svg").count()===1,"the circuit drawing shows on the Docs tab ("+w+" px)");
  ok(await p.evaluate(()=>document.querySelectorAll(".sch .sc-p").length>=15&&document.querySelectorAll(".sch .sc-w").length>=10),"the drawing has its parts and wires ("+w+" px)");
  const over=await p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);ok(over<=1,"the page does not scroll sideways ("+w+" px, "+over+" px over)");
  if(w===1000){await p.hover(".sch .sch-parts tr[data-p]");ok(await p.evaluate(()=>document.querySelectorAll(".sch .sc-p.hl").length>=1),"hovering a parts row lights the matching part in the drawing")}
  ok(errs.length===0,"no page errors ("+w+" px)"+(errs.length?" "+errs[0]:""));await c.close()}
 await b.close();srv.close();
 if(fails.length){console.log("\n"+fails.length+" FAILED");process.exit(1)}console.log("\nOK schematic")})();
