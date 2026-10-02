/* Staff-only tools stay out of the public site: no menu entries, no buttons, and the pages show a "Staff only" note until the admin
   has been unlocked on that device.   Run: node tests/staff.js */
const http=require("http"),fs=require("fs"),path=require("path");const {chromium}=require("playwright");
const root=path.join(__dirname,"..");const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml"};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith("/"))f+="index.html";fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});r.end(d)})});
(async()=>{await new Promise(r=>srv.listen(0,r));const base="http://localhost:"+srv.address().port+"/index.html#/";
 const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM||undefined});const p=await b.newPage({viewport:{width:1100,height:900}});
 const fails=[],errs=[];p.on("pageerror",e=>errs.push(e.message));const ok=(c,m)=>{console.log((c?"ok   ":"FAIL ")+m);if(!c)fails.push(m)};const W=ms=>p.waitForTimeout(ms);
 const STAFF=["labels","scan","hunt","advisor","today","check","styleguide","staff"];
 await p.goto(base);await p.evaluate(()=>{localStorage.clear()});
 for(const r of STAFF){await p.goto(base+r);await W(250);ok(await p.evaluate(()=>/Staff only/.test(document.getElementById("app").innerText)&&!document.querySelector("#app canvas")),"public visitor sees the Staff only note on #/"+r)}
 // nothing public links to a staff tool
 const hrefs=new Set();
 for(const r of ["","catalog","hub/explore","hub/read","hub/play","hub/connie","hub/stuff","hub/community","more","play","start","about","stats","report","wish","mine","item/"+(await p.evaluate(()=>ITEMS[0].id)),"daily","backup","install"]){await p.goto(base+r);await W(250);(await p.evaluate(()=>[...document.querySelectorAll("a[href]")].filter(a=>a.offsetParent!==null).map(a=>a.getAttribute("href")))).forEach(h=>{if(/^#\/(labels|scan|hunt|advisor|today|check|styleguide|staff)\b/.test(h))hrefs.add(r+" -> "+h)})}
 ok(hrefs.size===0,"no public page links to a staff tool"+(hrefs.size?": "+[...hrefs].join(", "):""));
 await p.goto(base+"stats");await p.goto(base+"report");await W(250);ok(await p.evaluate(()=>!document.getElementById("rpd")),"public report has no 'include drafts' option");
 ok(await p.evaluate(()=>document.getElementById("stf").hidden),"footer has no Staff tools link for visitors");
 // after the admin was unlocked once
 await p.evaluate(()=>localStorage.setItem("cm-admin","1"));
 await p.goto(base+"staff");await W(250);ok(await p.evaluate(()=>document.querySelectorAll("#app .hm-tile").length>=7&&!document.getElementById("stf").hidden),"staff page lists the tools and the footer link appears");
 for(const r of ["labels","scan","hunt","advisor","today","check","styleguide"]){await p.goto(base+r);await W(500);ok(await p.evaluate(()=>!/Staff only/.test(document.getElementById("app").innerText)&&document.getElementById("app").innerText.length>40),"staff can open #/"+r)}
 await p.goto(base+"item/"+(await p.evaluate(()=>ITEMS[0].id)));await W(300);ok(await p.evaluate(()=>/Print label/.test(document.getElementById("app").innerText)),"Print label shows on item pages for staff");
 await p.evaluate(()=>localStorage.removeItem("cm-admin"));await p.reload();await W(300);ok(await p.evaluate(()=>!/Print label/.test(document.getElementById("app").innerText)),"Print label is hidden from visitors");
 await p.evaluate(()=>localStorage.setItem("cm-admin","1"));await p.goto(base+"staff");await W(300);await p.click("#stfx");await W(300);ok(await p.evaluate(()=>localStorage.getItem("cm-admin")===null&&document.getElementById("stf").hidden),"Hide staff tools clears the flag");
 ok(!errs.length,"no script errors"+(errs.length?": "+errs.join("|"):""));
 await b.close();srv.close();if(fails.length){console.error("FAILED "+fails.length);process.exit(1)}console.log("OK staff")})();
