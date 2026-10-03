/* Smoke test: loads every route, fails on any script error or console error,
   checks the themes, and checks for sideways scrolling on a phone.
   Run:  npm install && npx playwright install chromium && npm test          */
const http=require("http"),fs=require("fs"),path=require("path");
const {chromium}=require("playwright");
const root=path.join(__dirname,"..");
const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml"};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith("/"))f+="index.html";fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});r.end(d)})});
const ROUTES=["cards","animations","shop","shop/ipods","ipods/bench","ipods/bench/c6","shop/cart","shop/pins","books","","about","staff","catalog","timeline","timeline/1995","scale","wanted","follow","stats","changes","quotes","check","mem","random","play","daily","daily/practice","build/1996","adlab","higher","higher/adj","sort","mystery","bingo","hangman","trophies","more","hub/explore","hub/play","hub/watch","hub/stuff","hub/community","report","runs","bench","advisor","hunt","rigs","walk/1995","wish","prizes","maker","maker/IBM","manuals","labels","labels/toshiba-libretto-110ct","scan","t/1","t/9999","start","backup","kiosk","rigs/e30","catalog/cat/Laptops","tours","tour/first-pc","tour/road-to-doom/3","explore","era/1995","zoom","day/1995-08-24","mine","jukebox","community","theater","shorts/toshiba-libretto-110ct","install","styleguide","search/doom","today","maze","admin"];
const THEMES=["default","dark","green","amber","ega","clean"];
(async()=>{
 await new Promise(r=>srv.listen(0,r));const base="http://localhost:"+srv.address().port+"/index.html#/";
 const exe=process.env.PLAYWRIGHT_CHROMIUM||undefined;
 const b=await chromium.launch(exe?{executablePath:exe}:{});const fails=[];
 const ctx=await b.newContext({viewport:{width:1100,height:900}});await ctx.addInitScript(()=>{try{localStorage.setItem("cm-admin","1")}catch(e){}});const pg=await ctx.newPage();let cur="";
 pg.on("pageerror",e=>fails.push(cur+": PAGE ERROR "+e.message));
 pg.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource|net::ERR/.test(m.text()))fails.push(cur+": console "+m.text())});
 await pg.route(/^https?:\/\/(?!localhost)/,r=>r.abort());
 for(const rt of ROUTES){cur=rt||"home";await pg.goto(base+rt);await pg.waitForTimeout(350);const t=await pg.evaluate(()=>document.getElementById("app").innerText.length);if(t<20)fails.push(cur+": page is empty")}
 for(const th of THEMES){cur="theme "+th;await pg.evaluate(t=>document.documentElement.setAttribute("data-theme",t),th);for(const rt of ["catalog","play","timeline/1995"]){await pg.goto(base+rt);await pg.waitForTimeout(250)}}
 const mctx=await b.newContext({viewport:{width:390,height:800}});await mctx.addInitScript(()=>{try{localStorage.setItem("cm-admin","1")}catch(e){}});const m=await mctx.newPage();m.on("pageerror",e=>fails.push("mobile: "+e.message));await m.route(/^https?:\/\/(?!localhost)/,r=>r.abort());
 for(const rt of ["","catalog","timeline/1995","play","higher","sort","bingo","daily","search/sound","more","explore","era/1995","day/1995-08-24","mine","community","theater","tour/first-pc"]){await m.goto(base+rt);await m.waitForTimeout(350);const o=await m.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);if(o>2)fails.push("mobile "+(rt||"home")+": sideways scroll of "+o+"px")}
 await b.close();srv.close();
 if(fails.length){console.error("FAILED ("+fails.length+")\n"+fails.join("\n"));process.exit(1)}
 console.log("OK: "+ROUTES.length+" routes, "+THEMES.length+" themes, mobile width");
})();
