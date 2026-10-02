/* Hostile-input checks: values that could arrive through a restored backup, a floppy code or the address bar must never
   become HTML. Run: node tests/security.js */
const http=require("http"),fs=require("fs"),path=require("path");const {chromium}=require("playwright");
const root=path.join(__dirname,"..");const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml"};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith("/"))f+="index.html";fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});r.end(d)})});
(async()=>{await new Promise(r=>srv.listen(0,r));const base="http://localhost:"+srv.address().port+"/index.html#/";
 const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM||undefined});const ctx=await b.newContext({viewport:{width:1100,height:900}});await ctx.addInitScript(()=>{try{localStorage.setItem("cm-admin","1")}catch(e){}});const p=await ctx.newPage();
 const fails=[],errs=[];p.on("pageerror",e=>errs.push(e.message));
 const ok=(c,m)=>{console.log((c?"ok   ":"FAIL ")+m);if(!c)fails.push(m)};const go=async h=>{await p.goto(base+h);await p.waitForTimeout(700)};
 const PWN='"><img src=x data-pwn=1>';
 const inj=()=>p.evaluate(()=>document.querySelectorAll("[data-pwn],iframe[srcdoc]").length);
 await go("");
 // 1. hostile values already sitting in localStorage must be rendered inert
 await p.evaluate(P=>{localStorage.setItem("cm-play",JSON.stringify({xp:P,badges:{},st:{}}));localStorage.setItem("cm-daily",JSON.stringify({streak:P,best:P,total:P,shield:P,perfect:P,saved:P,hist:{},hint:{},last:P}));
  localStorage.setItem("cm-theater",JSON.stringify({l:[{id:'x" srcdoc="<b>phish</b>',t:"t"}]}));localStorage.setItem("cm-labelset",JSON.stringify({base:"https://evil.example/"}));sessionStorage.setItem("cm-era",P)},PWN);
 for(const r of ["play","daily","trophies","theater","theater/999","labels","","era/1995"]){await go(r);ok((await inj())===0,"no injected markup on #/"+r+" with hostile saved values")}
 ok(await p.evaluate(()=>CMLabel.load().base===SITE_URL||CMLabel.load().base==="https://evil.example/"),"label address setting loads (and the page warns when it differs)");
 await go("labels");ok(/not the museum's own address/.test(await p.innerText("#lbwarn")),"label page warns when the QR address is not the museum's");
 await p.click("#lbrb");ok(await p.inputValue("#lbbase")===await p.evaluate(()=>SITE_URL),"reset button restores the museum address");
 // 2. hostile restore file is cleaned on the way in
 await p.evaluate(()=>{localStorage.clear();sessionStorage.clear()});await go("backup");
 const f=path.join(__dirname,"_h.json");fs.writeFileSync(f,JSON.stringify({app:"conventionalmemory",v:1,data:{"cm-play":JSON.stringify({xp:PWN}),"cm-labelset":JSON.stringify({base:"https://evil.example/",dens:9}),"cm-theater":JSON.stringify({l:[{id:'x" srcdoc="y',t:"t"},{id:"dQw4w9WgXcQ",t:"ok"}]}),"cm-daily":JSON.stringify({streak:PWN})}}));
 await p.setInputFiles("#bfile",f);await p.waitForTimeout(400);await p.click("#brestore");await p.waitForTimeout(400);fs.unlinkSync(f);
 const st=await p.evaluate(()=>({play:JSON.parse(localStorage.getItem("cm-play")||"null"),lab:JSON.parse(localStorage.getItem("cm-labelset")||"null"),th:JSON.parse(localStorage.getItem("cm-theater")||"null"),d:JSON.parse(localStorage.getItem("cm-daily")||"null")}));
 ok(st.play&&st.play.xp===0,"restore turns a non-number xp into 0");ok(st.lab&&!("base" in st.lab)&&st.lab.dens===9,"restore drops the QR address but keeps printer settings");
 ok(st.th&&st.th.l.length===1&&st.th.l[0].id==="dQw4w9WgXcQ","restore keeps only valid video ids");ok(st.d&&st.d.streak===0,"restore turns a non-number streak into 0");
 // 3. address bar and share codes
 for(const r of ["catalog?q="+encodeURIComponent(PWN),"catalog?c="+encodeURIComponent(PWN)+"&d="+encodeURIComponent(PWN),"search/"+encodeURIComponent(PWN),"item/"+encodeURIComponent(PWN),"maker/"+encodeURIComponent(PWN),"t/"+encodeURIComponent(PWN),"tag/"+encodeURIComponent(PWN),"labels/"+encodeURIComponent(PWN),"wish/"+encodeURIComponent(PWN),"rigs/"+encodeURIComponent(PWN),"timeline/"+encodeURIComponent(PWN),PWN]){await go(r);ok((await inj())===0,"hostile address inert: #/"+r.slice(0,40))}
 ok(!errs.length,"no script errors"+(errs.length?": "+errs.join("|"):""));
 await b.close();srv.close();if(fails.length){console.error("FAILED "+fails.length);process.exit(1)}console.log("OK security")})();
