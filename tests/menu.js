/* Top menu, All pages finder, Search and the C:\> prompt all find every page.   Run: node tests/menu.js */
const http=require("http"),fs=require("fs"),path=require("path");const {chromium}=require("playwright");
const root=path.join(__dirname,"..");const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml"};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith("/"))f+="index.html";fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});r.end(d)})});
(async()=>{await new Promise(r=>srv.listen(0,r));const base="http://localhost:"+srv.address().port+"/index.html#/";
 const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM||undefined});
 const fails=[],errs=[];const ok=(c,m)=>{console.log((c?"ok   ":"FAIL ")+m);if(!c)fails.push(m)};
 const ctx=await b.newContext({viewport:{width:1280,height:800}});await ctx.addInitScript(()=>{try{localStorage.setItem("cm-boot","1");sessionStorage.setItem("cm-boot","1")}catch(e){}});
 const p=await ctx.newPage();p.on("pageerror",e=>errs.push(e.message));
 const go=async h=>{await p.goto(base+h);await p.waitForTimeout(700)};
 await go("");await p.waitForSelector("header.top nav .mn-i",{timeout:8000}).catch(()=>{});
 const labels=await p.evaluate(()=>[...document.querySelectorAll("header.top nav a[data-s]")].map(a=>a.textContent.trim()));
 ok(labels.join(",")==="Catalog,Timeline,Explore,Read,Play,Connie,My stuff,Community,Search","the menu has the nine sections ("+labels.join(",")+")");
 ok(await p.evaluate(()=>[...document.querySelectorAll("header.top nav a[data-s]")].every(a=>a.querySelector(".mn-i svg"))),"every section has an icon");
 ok(await p.evaluate(()=>document.querySelectorAll("header.top nav .mn-c").length===6),"six sections have a drop-down arrow");
 ok(await p.evaluate(()=>{const n=document.querySelector("header.top nav");return n.getBoundingClientRect().height<60}),"the menu fits on one row on a desktop");
 // hover opens, click goes
 await p.hover('header.top nav a[data-s="play"]');await p.waitForTimeout(500);
 ok(await p.evaluate(()=>{const m=document.getElementById("mnp");return !m.hidden&&!!m.querySelector('a[href="#/kiosk"]')&&!!m.querySelector('a[href="#/jukebox"]')}),"pointing at Play lists Demo kiosk and Jukebox");
 ok(await p.evaluate(()=>document.querySelector('header.top nav a[data-s="play"]+.mn-c').getAttribute("aria-expanded")==="true"),"the arrow says the menu is open");
 await p.click('#mnp a[href="#/kiosk"]');await p.waitForTimeout(600);
 ok(await p.evaluate(()=>location.hash==="#/kiosk"&&document.getElementById("mnp").hidden&&/Demo kiosk/.test(document.getElementById("app").innerText)),"clicking Demo kiosk goes there and closes the menu");
 ok(await p.evaluate(()=>document.querySelector("header.top nav [aria-current]").textContent==="Play"),"Play stays lit on the kiosk page");
 // keyboard
 await p.focus('header.top nav a[data-s="explore"]');await p.keyboard.press("ArrowDown");await p.waitForTimeout(300);
 ok(await p.evaluate(()=>!document.getElementById("mnp").hidden&&document.activeElement.closest("#mnp")!==null),"ArrowDown opens the menu and moves into it");
 await p.keyboard.press("Escape");await p.waitForTimeout(200);
 ok(await p.evaluate(()=>document.getElementById("mnp").hidden),"Escape closes it");
 await p.click('header.top nav a[data-s="read"]+.mn-c');await p.waitForTimeout(300);
 ok(await p.evaluate(()=>{const m=document.getElementById("mnp");return !m.hidden&&!!m.querySelector('a[href="#/books"]')&&!!m.querySelector('a[href="/guides/"]')}),"the arrow opens Read with Books and Guides");
 await p.keyboard.press("Escape");
 // skip link, home tiles, tab bars, not-found suggestions
 await go("");ok(await p.evaluate(()=>{const a=document.querySelector("a.skip");a.click();return location.hash==="#/"&&document.activeElement===document.getElementById("app")}),"the skip link moves focus to the page without changing the address");
 ok(await p.evaluate(()=>[...document.querySelectorAll(".hm-tiles a")].map(a=>a.getAttribute("href")).filter(h=>/#\/hub\/(read|explore)|#\/more|#\/play|#\/connie/.test(h)).length>=5),"the home page tiles lead to Explore, Read, Play, Connie and All pages");
 for(const [r,t] of [["books","Repair journal"],["jukebox","Demo kiosk"],["cards","The Funnies"],["prizes","Prize counter"],["higher","Mystery Photo"]]){await go(r);ok(await p.evaluate(t=>[...document.querySelectorAll(".tbar a")].some(a=>a.textContent===t),t),"the #/"+r+" page has a tab bar that includes "+t)}
 await go("kioks");ok(await p.evaluate(()=>/kiosk/i.test(document.getElementById("app").innerText)&&!!document.querySelector('#app a[href="#/kiosk"]')),"a misspelled address (kioks) suggests the Demo kiosk");
 // All pages
 await p.click("#allp");await p.waitForTimeout(600);
 ok(await p.evaluate(()=>location.hash==="#/more"&&/All pages/.test(document.getElementById("app").innerText)),"the All pages button opens the finder");
 await p.fill("#pgq","kiosk");await p.waitForTimeout(300);
 ok(await p.evaluate(()=>{const v=[...document.querySelectorAll("#pgall .hm-tile")].filter(t=>t.offsetParent!==null);return v.length>=1&&v.length<=4&&v.some(t=>/Demo kiosk/.test(t.innerText))}),"typing kiosk in the finder shows the Demo kiosk");
 // every real route can be found
 const miss=await p.evaluate(()=>{const R=ROUTE_NAMES.filter(r=>!/^(workbench|labels|ipods|advisor|hunt|today|scan|check|styleguide)$/.test(r)),hs=allPages().map(x=>x.h.replace(/^#\//,"").split("/")[0]);return R.filter(r=>hs.indexOf(r)<0)});
 ok(miss.length===0,"every visitor page is listed in the finder"+(miss.length?" (missing: "+miss.join(", ")+")":""));
 const dead=await p.evaluate(()=>allPages().filter(x=>/^#\//.test(x.h)).map(x=>x.h).filter((h,i,a)=>a.indexOf(h)===i));
 let bad=[];for(const h of dead){await p.goto(base+h.slice(2));await p.waitForTimeout(250);const t=await p.evaluate(()=>document.getElementById("app").innerText);if(/Page not found|Loading\s+One moment/.test(t)||t.length<40)bad.push(h)}
 ok(bad.length===0,"every page in the finder opens a real page ("+dead.length+" checked)"+(bad.length?" bad: "+bad.join(", "):""));
 // search and prompt
 await go("search/kiosk");ok(await p.evaluate(()=>/Pages and features/.test(document.getElementById("sr").innerText)&&!!document.querySelector('#sr a[href="#/kiosk"]')),"Search lists the Demo kiosk under Pages and features");
 await go("");await p.fill("#cmd","kiosk");await p.keyboard.press("Enter");await p.waitForTimeout(500);ok(await p.evaluate(()=>location.hash==="#/kiosk"),"the prompt takes kiosk to the Demo kiosk");
 await p.fill("#cmd","retro");await p.keyboard.press("Enter");await p.waitForTimeout(300);
 ok(await p.evaluate(()=>document.querySelectorAll("#cout a").length>=2),"the prompt suggests pages for a word it does not know");
 // phone
 const mc=await b.newContext({viewport:{width:375,height:700},hasTouch:true,isMobile:true});await mc.addInitScript(()=>{try{localStorage.setItem("cm-boot","1")}catch(e){}});const m=await mc.newPage();m.on("pageerror",e=>errs.push(e.message));
 await m.goto(base);await m.waitForTimeout(1500);await m.tap('header.top nav a[data-s="play"]');await m.waitForTimeout(500);
 ok(await m.evaluate(()=>{const e=document.getElementById("mnp");return !e.hidden&&location.hash!=="#/hub/play"&&e.getBoundingClientRect().width>340&&e.getBoundingClientRect().right<=375}),"on a phone, tapping Play opens its list instead of leaving the page");
 await m.tap('#mnp a[href="#/kiosk"]');await m.waitForTimeout(500);ok(await m.evaluate(()=>location.hash==="#/kiosk"&&document.getElementById("mnp").hidden),"and tapping a page in the list goes there");
 ok(await m.evaluate(()=>document.documentElement.scrollWidth<=376),"the phone page does not scroll sideways");
 // nothing on any page may sit on top of an open menu list
 {const covered=[];for(const r of ["","catalog","catalog/cat/Laptops","timeline","timeline/1995","play","books","wish","walk/1995","hub/read","cards","stats"]){await m.goto(base+r);await m.waitForTimeout(900);
   for(const sec of ["explore","connie"]){await m.evaluate(()=>window.scrollTo(0,0));await m.tap('header.top nav a[data-s="'+sec+'"]');await m.waitForTimeout(350);
    const bad=await m.evaluate(()=>{const e=document.getElementById("mnp");if(e.hidden)return"not open";const R=e.getBoundingClientRect(),o=new Set();for(let y=R.top+6;y<R.bottom-6&&y<innerHeight;y+=24)for(let x=R.left+8;x<R.right-8;x+=40){const t=document.elementFromPoint(x,y);if(t&&!t.closest("#mnp"))o.add(String(t.className||t.tagName))}return[...o].join(",")});
    if(bad)covered.push(r+"/"+sec+": "+bad);await m.evaluate(()=>document.dispatchEvent(new KeyboardEvent("keydown",{key:"Escape"})))}}
  ok(covered.length===0,"on a phone the menu list is never covered by other page parts"+(covered.length?" ("+covered.slice(0,3).join("; ")+")":""))}
 ok(errs.length===0,"no page errors"+(errs.length?": "+errs[0]:""));
 await b.close();srv.close();if(fails.length){console.error("FAILED "+fails.length);process.exit(1)}console.log("OK menu")})();
