/* Toy-store features: wish list (add, share link, Dear Santa letter, Circle it in the catalog book), backup and restore,
   prize counter, demo kiosk, related-page tab bars, mascot.   Run: node tests/toys.js */
const http=require("http"),fs=require("fs"),path=require("path");const {chromium}=require("playwright");
const root=path.join(__dirname,"..");const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml"};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith("/"))f+="index.html";fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});r.end(d)})});
(async()=>{await new Promise(r=>srv.listen(0,r));const base="http://localhost:"+srv.address().port+"/index.html#/";
 const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM||undefined});const ctx=await b.newContext({viewport:{width:1100,height:900},acceptDownloads:true});const p=await ctx.newPage();
 const fails=[],errs=[];p.on("pageerror",e=>errs.push(e.message));
 const ok=(c,m)=>{console.log((c?"ok   ":"FAIL ")+m);if(!c)fails.push(m)};const go=async h=>{await p.goto(base+h);await p.waitForTimeout(600)};const txt=()=>p.evaluate(()=>document.getElementById("app").innerText);
 await go("");await p.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
 // wish list
 await go("wish");ok(/My wish list/.test(await txt()),"wish page renders");
 await p.fill("#wq","Sound Blaster");await p.waitForTimeout(300);await p.click("#wres [data-add]");await p.waitForTimeout(300);
 await p.fill("#wq","Game Boy");await p.waitForTimeout(300);await p.click('#wres [data-add^="c:"]');await p.waitForTimeout(300);
 ok(await p.evaluate(()=>document.querySelectorAll(".wsh-l li").length)===2,"two things on the wish list");
 await p.fill('[data-max]',"40");await p.dispatchEvent('[data-max]',"change");ok(await p.evaluate(()=>JSON.parse(localStorage.getItem("cm-wish")).some(w=>w.max==="40")),"price ceiling saved");
 await p.click("#wsan");await p.waitForTimeout(200);ok(/Dear Santa/.test(await p.evaluate(()=>document.getElementById("wsanta").innerText)),"Dear Santa letter is written");
 const code=await p.evaluate(()=>{const k=wishLoad().map(w=>w.k);return location.origin+location.pathname+"#/wish/"+(function(){return btoa(unescape(encodeURIComponent(JSON.stringify(k)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")})()});
 await p.goto(code);await p.waitForTimeout(600);ok(/A wish list from a friend/.test(await txt())&&await p.evaluate(()=>document.querySelectorAll(".wsh-l li").length)===2,"shared list link opens a friend's list");
 await p.goto(base+"wish/!!notacode");await p.waitForTimeout(500);ok(/damaged/.test(await txt()),"a bad shared link is rejected");
 await go("wish");await p.click("[data-rm]");await p.waitForTimeout(200);ok(await p.evaluate(()=>document.querySelectorAll(".wsh-l li").length)===1,"remove works");
 // item page button
 await go("");const id=await p.evaluate(()=>ITEMS[0].id);await go("item/"+id);await p.click("#wishb");ok(await p.evaluate(id=>wishHas("i:"+id),id),"item page adds to wish list");
 // Wish Book circle
 await go("catalog");await p.evaluate(()=>localStorage.setItem("cm-catmode","book"));await p.reload();await p.waitForTimeout(1000);
 for(let i=0;i<6&&!(await p.$(".bk-wish"));i++){const n=await p.$("#bkn");if(!n)break;await n.click();await p.waitForTimeout(900)}const circ=await p.$(".bk-wish");if(circ){await circ.click({force:true});await p.waitForTimeout(200);ok(await p.evaluate(()=>/#\/catalog/.test(location.hash)&&!!document.querySelector(".bk-wish.on")),"Circle it marks the item and stays on the catalog")}else ok(false,"book has a Circle it button");
 await p.evaluate(()=>localStorage.removeItem("cm-catmode"));
 // prizes
 await go("prizes");ok(/Prize counter/.test(await txt()),"prize counter renders");await p.click("#pzfree");await p.waitForTimeout(200);ok(/\b1\s*\n?\s*tickets/.test(await txt())&&/claimed/i.test(await txt()),"free daily ticket");
 await p.evaluate(()=>localStorage.setItem("cm-play",JSON.stringify({xp:60,badges:{},st:{}})));await go("backup");await go("prizes");await p.click('[data-buy="st-star"]');await p.waitForTimeout(200);ok(/Gold star sticker/.test(await p.evaluate(()=>document.querySelector(".pz-shelf")?.innerText||"")),"redeeming a prize puts it on the shelf");
 // backup
 await go("backup");const [dlf]=await Promise.all([p.waitForEvent("download"),p.click("#bsave")]);const fp=await dlf.path();const saved=JSON.parse(fs.readFileSync(fp,"utf8"));
 ok(saved.app==="conventionalmemory"&&saved.data["cm-wish"]&&saved.data["cm-prizes"]&&!Object.keys(saved.data).some(k=>/admin|vault/.test(k)),"backup file has the saved stuff and never admin data");
 const bad=path.join(__dirname,"_bad.json");fs.writeFileSync(bad,JSON.stringify({app:"conventionalmemory",v:1,data:{"cm-admin":"x","cm-wish":"[]","evil":"1"}}));await p.setInputFiles("#bfile",bad);await p.waitForTimeout(400);
 ok(/1 items found/.test(await p.evaluate(()=>document.getElementById("bprev").innerText))&&/2 skipped/.test(await p.evaluate(()=>document.getElementById("bprev").innerText)),"restore skips keys that are not allowed");fs.unlinkSync(bad);
 await p.setInputFiles("#bfile",{name:"x.json",mimeType:"application/json",buffer:Buffer.from("not json")});await p.waitForTimeout(300);ok(/not a backup/.test(await p.evaluate(()=>document.getElementById("bprev").innerText)),"garbage file is rejected");
 // kiosk
 await go("kiosk");await p.click("#kgo");await p.waitForTimeout(400);ok(await p.evaluate(()=>!!document.getElementById("kiosk")&&document.getElementById("kscr").innerText.length>5),"kiosk shows a slide");
 await p.keyboard.press("a");await p.waitForTimeout(200);ok(await p.evaluate(()=>document.querySelectorAll(".k-menu a").length>=5),"any key opens the big-button menu");
 await p.keyboard.press("Escape");await p.waitForTimeout(300);ok(await p.evaluate(()=>!document.getElementById("kiosk")),"Escape leaves the kiosk");
 await go("kiosk/go");await p.waitForTimeout(300);await p.keyboard.press("x");await p.click('.k-menu a[href="#/daily"]');await p.waitForTimeout(500);ok(await p.evaluate(()=>!document.getElementById("kiosk")&&/#\/daily/.test(location.hash)),"kiosk menu button navigates and closes the kiosk");
 // tab bars + mascot
 for(const [r,t] of [["stats","Collection report"],["daily","Retro Bingo"],["changes","Follow"],["runs","Dream rig"],["mine","Wish list"]]){await go(r);ok(await p.evaluate(t=>[...document.querySelectorAll(".tbar a")].some(a=>a.textContent===t),t),"tab bar on #/"+r+" links to "+t)}
 await go("nowhere");ok(await p.evaluate(()=>!!document.querySelector(".nf svg.mascot")),"not-found page shows Connie");
 // makers, manuals, labels, start here
 await go("maker");ok(/Makers/.test(await txt())&&await p.evaluate(()=>document.querySelectorAll("#app .chips a").length)>3,"makers index lists companies");
 await p.click("#app .chips a.pri");await p.waitForTimeout(400);ok(await p.evaluate(()=>/#\/maker\//.test(location.hash)&&document.querySelectorAll("#app .card").length>0),"a maker page shows its exhibits");
 await go("item/"+await p.evaluate(()=>ITEMS.filter(i=>i.maker&&i.maker!=="Unknown")[0].id));ok(await p.evaluate(()=>!!document.querySelector('.ihero a.ib[href^="#/maker/"]')),"item page links the maker");
 await go("manuals");ok(/Manuals and references/.test(await txt()),"manuals page renders");
 await go("about");ok(await p.evaluate(()=>document.querySelectorAll(".ab-card").length===2&&[...document.querySelectorAll(".ab-pt img")].every(i=>i.complete&&i.naturalWidth>100)),"about page shows both portraits");
 await p.click('[data-talk="matt"]');ok(await p.evaluate(()=>document.querySelector('[data-k="matt"] .ab-q').textContent.length>10),"Press START makes a character talk");
 await p.click('[data-room="2"]');ok(await p.evaluate(()=>/LOOK AT LAVA LAMP/.test(document.getElementById("abs").innerText)),"workstation hotspots answer like a text adventure");
 ok(await p.evaluate(()=>document.querySelectorAll("[data-room]").length>=10&&document.querySelectorAll(".ab-log li").length>=5&&[...document.querySelectorAll(".ab-rp img")].every(i=>i.complete&&i.naturalWidth>500)),"about page has the workstation picture, hotspots and the save file chapters");
 await p.evaluate(()=>{});ok(await p.evaluate(()=>{var t=document.querySelector(".ab").innerText;return /Zack/.test(t)&&/Star Wars MUDs/.test(t)&&/Torin/.test(t)&&[...document.querySelectorAll("[data-room]")].some(b=>/PC Gamer/i.test(b.getAttribute("aria-label")||b.title||b.textContent))}),"about mentions Zack, the MUDs, favorites and the real objects");
 ok(await p.evaluate(()=>!!document.querySelector('footer a[href="#/about"]')&&!!document.querySelector('footer a[href="#/start"]')),"footer links to About and Start here");
 await go("start");ok(await p.evaluate(()=>document.querySelectorAll(".st .hm-tile").length===7&&!!document.querySelector(".st svg.mascot")),"start here page has seven paths and Connie");
 await go("about");await p.waitForTimeout(300);ok(await p.evaluate(()=>/Connie Ventional/.test(document.querySelector(".ab .mc-cap")?.innerText||"")&&/RAM/i.test(document.querySelector(".ab .mc-cap")?.innerText||"")),"Connie wears a name badge on the About page");
 await p.evaluate(()=>{var b=document.getElementById("mcsay");if(b)b.remove()});await p.click(".ab svg.mascot");await p.waitForTimeout(300);
 ok(await p.evaluate(()=>{var b=document.getElementById("mcsay");return !!b&&/Connie Ventional/i.test(b.innerText)&&b.querySelectorAll("button").length===4}),"clicking Connie opens a speech bubble with her name and four buttons");
 await p.click("#mcsay button:last-child");ok(await p.evaluate(()=>!document.getElementById("mcsay")),"Thanks, Connie closes the bubble");
 await go("about");await p.click(".ab svg.mascot");await p.waitForTimeout(300);await p.click("#mcsay button:nth-of-type(1)");await p.waitForTimeout(2500);ok(await p.evaluate(()=>{var b=document.getElementById("mcsay");return !!b&&b.querySelector("p").innerText.length>20}),"Connie answers What is this?");
 await p.click("#mcsay button:nth-of-type(2)");await p.waitForTimeout(500);ok(await p.evaluate(()=>/Tour stop/.test(document.getElementById("mcsay").innerText)),"Connie announces a tour stop");await p.waitForFunction(()=>/^#\/(item|timeline)\//.test(location.hash),null,{timeout:6000}).then(()=>ok(true,"Surprise tour takes you to an item or timeline entry"),()=>ok(false,"Surprise tour takes you to an item or timeline entry"));
 await go("journal");await p.waitForTimeout(400);ok(await p.evaluate(()=>/Repair journal/.test(document.getElementById("app").innerText)&&!!document.querySelector(".stats")),"Repair journal page renders");
 await go("item/toshiba-libretto-110ct");await p.waitForTimeout(400);ok(await p.evaluate(()=>{var t=[...document.querySelectorAll(".ftab")].find(b=>/Links/.test(b.innerText));if(t)t.click();return /Manuals and ads/.test(document.getElementById("app").innerText)&&!!document.querySelector(".dfind a[href^=\"https://archive.org/search\"]")}),"item page offers manual and ad searches");

 await go("item/toshiba-libretto-110ct");await p.evaluate(()=>{var it=ITEMS.find(i=>i.id==="toshiba-libretto-110ct");it.log=(it.log||[]).concat([{d:"2026-10-01",t:"Repair",n:"Test job",sym:"No power",fix:"New battery"}])});await go("journal");await p.waitForTimeout(300);ok(await p.evaluate(()=>/Symptom/.test(document.getElementById("app").innerText)&&/New battery/.test(document.getElementById("app").innerText)),"repair journal shows symptom and fix");
 await go("item/toshiba-libretto-110ct");await p.waitForTimeout(300);
 ok(await p.evaluate(()=>{window.__aff=[AFF.amazon,AFF.ebay];AFF.amazon="";AFF.ebay="";return affBox("Sound Blaster 16","Creative")===""&&affInline("x","")===""}),"no affiliate links are built until an ID is set");
 ok(await p.evaluate(()=>{AFF.amazon="conventionalm-20";AFF.ebay="5338123456";var h=affBox("Toshiba Libretto 110CT","Toshiba");var d=document.createElement("div");d.innerHTML=h;var a=[...d.querySelectorAll("a")];return a.length===2&&a.every(x=>/sponsored/.test(x.rel)&&/noopener/.test(x.rel))&&/amazon\.com\/s\?k=Toshiba%20Libretto%20110CT&tag=conventionalm-20/.test(a[1].href)&&/ebay\.com\/sch\/i\.html\?_nkw=Toshiba%20Libretto%20110CT.*campid=5338123456/.test(a[0].href)&&/Amazon Associate/.test(d.innerText)}),"affiliate box builds eBay and Amazon search links with the disclosure");
 ok(await p.evaluate(()=>{AFF.amazon="bad id";AFF.ebay="12";var r=affBox("X","")==="";AFF.amazon=window.__aff[0];AFF.ebay=window.__aff[1];return r}),"bad affiliate IDs switch the links off");
 await p.evaluate(()=>localStorage.removeItem("cm-admin"));await go("workbench");await p.waitForTimeout(300);ok(await p.evaluate(()=>/workbench/i.test(document.getElementById("app").innerText)&&!document.querySelector(".wbt")&&!!document.querySelector(".empty")),"workbench shows no tools to visitors while they are all drafts");
 await p.evaluate(()=>localStorage.setItem("cm-admin","1"));await go("about");await go("workbench");await p.waitForTimeout(300);ok(await p.evaluate(()=>document.querySelectorAll(".wbt").length>5&&/draft/.test(document.getElementById("app").innerText)&&!!document.querySelector(".wbt a[href*=\"amazon.com\"][rel~=sponsored]")),"staff see the draft tools with Amazon links");await p.evaluate(()=>localStorage.removeItem("cm-admin"));
 await go("item/toshiba-libretto-110ct");await p.waitForTimeout(300);ok(await p.evaluate(()=>{var t=[...document.querySelectorAll(".ftab")].find(b=>/Links/.test(b.innerText));if(t)t.click();var h=document.getElementById("app").innerHTML;return /Keep it running/.test(h)&&/Disclosure|Details/.test(h)&&/CMOS%20battery/.test(h)&&/tag=conventionalm-20/.test(h)}),"item page suggests a CMOS battery and other repair parts");
 await go("about");await p.waitForTimeout(300);await p.focus(".ab svg.mascot");await p.keyboard.press("Enter");await p.waitForTimeout(200);ok(await p.evaluate(()=>!!document.getElementById("mcsay")),"Connie opens from the keyboard");await p.keyboard.press("Escape");ok(await p.evaluate(()=>!document.getElementById("mcsay")),"Escape closes her bubble");
 await go("catalog?q="+encodeURIComponent("zzzzqqqq"));await p.waitForTimeout(500);ok(await p.evaluate(()=>!!document.querySelector(".mc-empty svg.mascot")),"Connie shows up on an empty catalog search");
 await go("staff");await p.evaluate(()=>{localStorage.removeItem("cm-admin")});await go("staff");ok(await p.evaluate(()=>!!document.querySelector("svg.mascot")&&/guarding/.test(document.getElementById("app").innerText)),"Connie guards the staff-only door");
 await go("about");ok(await p.evaluate(()=>{var h=[...document.querySelectorAll("[data-room]")].find(b=>/Blockbuster/.test(b.getAttribute("aria-label")));return !!h&&parseFloat(h.style.left)>50&&parseFloat(h.style.top)<62}),"Blockbuster card hotspot sits at the right of the monitor base");
 // trading cards for Matt and Tony, trimmed bios
 await go("about");await p.waitForTimeout(300);
 ok(await p.evaluate(()=>{const c=document.querySelectorAll(".ab-tcs .tc");return c.length===2&&[...c].map(x=>x.dataset.card).join()==="matt,tony"&&[...c].every(x=>x.querySelector("img")&&x.querySelectorAll(".tc-st dd").length===4)&&/AMATEUR EXTRA/.test(c[0].textContent)&&!document.querySelector(".ab-tcs .holo")}),"About has trading cards for Matt (with the ham license as a stat) and Tony; only Connie is holofoil");
 ok(await p.evaluate(()=>{const m=document.querySelector('.ab-card[data-k="matt"]'),t=document.querySelector('.ab-card[data-k="tony"]'),b=m.querySelectorAll("p")[3].textContent;return !/Minecraft/.test(m.textContent)&&!/Minecraft/.test(t.textContent)&&!/ham radio operator/.test(b)&&b.split(" ").length<190&&/younger brother/.test(t.textContent)}),"Matt's bio is short, the ham license is only a stat, Minecraft lives only in the shared story, and Tony is the younger brother");
 ok(await p.evaluate(()=>/Minecraft/.test(document.querySelector(".ab-log").textContent)),"the shared story still has Minecraft");
 // the kiosk stage
 await go("kiosk");await p.click("#kgo");await p.waitForTimeout(1200);
 ok(await p.evaluate(()=>{const s=document.getElementById("kstage");return !!s&&s.querySelectorAll(".stg-a").length>=2&&!!s.querySelector(".stg-a.star svg.cc-connie")}),"the kiosk has a stage with Connie and others working");
 ok(await p.evaluate(()=>{const c=document.querySelector("#kstage .stg-a.star"),w=parseFloat(c.querySelector("svg").getAttribute("width"));return [...document.querySelectorAll("#kstage .stg-a:not(.star) svg")].every(v=>parseFloat(v.getAttribute("width"))<w)}),"Connie is the biggest one on the stage");
 await p.keyboard.press("x");await p.waitForTimeout(600);ok(await p.evaluate(()=>document.querySelectorAll("#kstage .stg-a").length>=5&&/Touch/.test(document.querySelector("#kstage").textContent)),"the menu brings everybody out to wave at the visitor");
 await p.keyboard.press("Escape");await p.waitForTimeout(300);ok(await p.evaluate(()=>!document.getElementById("kiosk")),"leaving the kiosk stops the stage");
 ok(!errs.length,"no script errors"+(errs.length?": "+errs.join("|"):""));
 await b.close();srv.close();if(fails.length){console.error("FAILED "+fails.length);process.exit(1)}console.log("OK toys")})();
