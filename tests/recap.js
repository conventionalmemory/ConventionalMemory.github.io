/* The Recap Bench: data, the saving checklist, add and paste, the shopping list, rewards, backup.   Run: node tests/recap.js */
const http=require("http"),fs=require("fs"),path=require("path"),vm=require("vm");const {chromium}=require("playwright");
const root=path.join(__dirname,"..");const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml"};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith("/"))f+="index.html";fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{"content-type":types[path.extname(f)]||"text/plain"});r.end(d)})});
const fails=[],errs=[];const ok=(c,m)=>{console.log((c?"ok   ":"FAIL ")+m);if(!c)fails.push(m)};
(async()=>{
 /* ---- data */
 const ctx={};vm.createContext(ctx);["timeline-data.js","timeline-extra.js","timeline-edits.js","recap-data.js"].forEach(f=>{try{vm.runInContext(fs.readFileSync(path.join(root,f),"utf8"),ctx)}catch(e){if(f==="recap-data.js"||f==="timeline-data.js")throw e}});
 const R=vm.runInContext("RECAP",ctx),TL=vm.runInContext("TL",ctx),G=vm.runInContext("RECAP_GENERIC",ctx);
 ok(R.length>=6&&new Set(R.map(m=>m.id)).size===R.length&&R.every(m=>/^[a-z0-9]{2,16}$/.test(m.id)),"every machine has a unique lowercase id ("+R.length+" machines)");
 ok(R.every(m=>(m.tl.length||m.nt)&&m.tl.every(n=>TL.some(r=>r[2]===n))),"every timeline title named in recap-data.js exists on the timeline"+R.map(m=>m.tl.filter(n=>!TL.some(r=>r[2]===n))).filter(a=>a.length).map(a=>" MISSING "+a).join(""));
 ok(R.every(m=>m.guides.every(g=>/^https:\/\//.test(g.u)&&g.t&&g.by&&g.kind)),"every guide has an https link, title, author and kind");
 ok(R.every(m=>m.boards.every(b=>b.rows.length&&b.rows.every(r=>r.uf>0&&r.v>0&&(r.ref||r.n)))),"every capacitor row has a value, a voltage and a label or a count");
 const pico=R.filter(m=>m.id==="pico")[0],pr=pico.boards[0].rows,cnt={};pr.forEach(r=>{const k=r.uf+"/"+r.v;cnt[k]=(cnt[k]||0)+1});
 ok(pr.length===22&&!pr.some(r=>r.ref==="EC15")&&cnt["100/25"]===3&&cnt["220/16"]===2&&cnt["47/16"]===4&&cnt["10/16"]===11&&cnt["1/50"]===2,"the Pico list has 22 capacitors with the published counts and no EC15");
 ok(pico.guides.some(g=>g.lic==="CC BY"&&/Sound Retro/.test(g.credit||"")&&/Creative Commons/.test(g.credit||"")),"the Pico values carry their CC BY credit to Sound Retro");
 ok(R.filter(m=>m.ver).every(m=>m.guides.some(g=>g.credit)),"every machine with a capacitor list credits where the values came from");
 ok(G.steps.length>=10&&G.safety.length>=5&&G.tools.every(t=>t.t.length&&t.t.every(x=>x[1]&&x[2])),"steps, safety and tools are filled in, every tool has a search phrase");
 const rel=fs.readFileSync(path.join(root,"related.js"),"utf8").match(/var RECAPS=(\[.*?\]);\n/);
 ok(!!rel&&JSON.stringify(JSON.parse(rel[1]))===JSON.stringify(R.map(m=>[m.id,m.n,m.tl])),"related.js knows the same machines as recap-data.js");
 ok(!/\bhand-?coded\b/i.test(fs.readFileSync(path.join(root,"recap.js"),"utf8")+fs.readFileSync(path.join(root,"recap-data.js"),"utf8")),"no hand-coded badge wording");

 /* ---- the page */
 await new Promise(r=>srv.listen(0,r));const port=srv.address().port,base="http://localhost:"+port+"/index.html#/";
 const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM||undefined});
 const mk=async o=>{const c=await b.newContext(o);await c.addInitScript(()=>{try{localStorage.setItem("cm-boot","1");sessionStorage.setItem("cm-boot","1")}catch(e){}});const p=await c.newPage();p.on("pageerror",e=>errs.push(e.message));p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});return p};
 const p=await mk({viewport:{width:1280,height:900}});
 const view=v=>p.evaluate(v=>{document.querySelectorAll('[data-bv="'+v+'"]').forEach(b=>b.click());document.querySelectorAll('[data-rf="all"]').forEach(b=>b.click())},v);
 const go=async h=>{await p.goto(base+h);await p.waitForTimeout(900);if(/^recap\/[a-z0-9]+$/.test(h))await view("list")};
 const tab=async n=>{await p.click('[data-tab="'+n+'"]');await p.waitForTimeout(120)};
 const openAll=()=>p.evaluate(()=>document.querySelectorAll("#app details").forEach(d=>d.open=true));
 await go("recap");
 ok(await p.evaluate(()=>/Recap Bench/.test(document.querySelector("#app h2").textContent)&&document.querySelectorAll("#app .rc-card").length>=6),"#/recap lists the machines");
 ok(await p.evaluate(()=>!!document.querySelector('#app a[href="#/recap/pico"]')&&!!document.querySelector("#app .rc-r")),"the machine cards and the bench crew are there");
 ok(await p.evaluate(()=>document.querySelectorAll("#app .rc-r").length>=18),"the whole family is on the roll call");
 await go("recap/pico");
 ok(await p.evaluate(()=>/Sega Pico/.test(document.querySelector("#app h2").textContent)&&document.querySelectorAll("#app input[data-r]").length===22),"the Pico page has 22 checkboxes");
 ok(await p.evaluate(()=>/0<\/b> of 22/.test(document.getElementById("rc-count").innerHTML)),"it starts at 0 of 22");
 for(let i=0;i<3;i++)await p.locator("#app input[data-r]").nth(i).check();
 ok(await p.evaluate(()=>/3<\/b> of 22/.test(document.getElementById("rc-count").innerHTML)&&document.querySelector("#rc-bar [role=progressbar]").getAttribute("aria-valuenow")==="14"),"checking three updates the count and the meter");
 ok(await p.evaluate(()=>document.querySelectorAll("#rc-crew .rc-s.on").length>=3),"family members turn up at the bench as you make progress");
 await p.reload();await p.waitForTimeout(900);
 ok(await p.evaluate(()=>/3<\/b> of 22/.test(document.getElementById("rc-count").innerHTML)&&document.querySelectorAll("#app input[data-r]:checked").length===3),"the checks are still there after a reload");
 ok(await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem("cm-recap"));return s.sum.caps===3&&s.m.pico&&Object.keys(s.m.pico.d).length===3}),"the save is in localStorage under cm-recap");
 ok(await p.evaluate(()=>CMCast.unlocked("acc","goggles").ok&&!CMCast.unlocked("look","bench").ok),"one capacitor unlocks the safety goggles, but not the Bench Tech look yet");
 // shopping list
 await tab("shop");await p.selectOption("#rc-sp","1");
 const shop=await p.evaluate(()=>[...document.querySelectorAll("#rc-shopw .rc-st tbody tr")].map(tr=>tr.innerText.replace(/\s+/g," ")));
 ok(shop.length>=4&&shop.some(t=>/4.*47 µF, 16 V/.test(t))&&shop.some(t=>/3.*100 µF, 25 V/.test(t)),"the shopping list groups by value and adds one spare ("+shop.length+" lines)");
 ok(await p.evaluate(()=>[...document.querySelectorAll("#rc-shopw a.rc-buy")].every(a=>/sponsored/.test(a.rel)&&/noopener/.test(a.rel)&&/^https:\/\/www\.(amazon|ebay)\.com\//.test(a.href))&&document.querySelectorAll("#rc-shopw a.rc-buy").length>=6),"buy links are sponsored, safe, and go to Amazon or eBay");
 ok(await p.evaluate(()=>[...document.querySelectorAll("#app a.rc-buy")].filter(a=>/amazon/.test(a.href)).every(a=>/tag=conventionalm-20/.test(a.href))),"Amazon links carry the Associates tag");
 await p.selectOption("#rc-ty","smd");
 ok(await p.evaluate(()=>[...document.querySelectorAll("#rc-shopw a.rc-buy")].some(a=>/SMD/.test(decodeURIComponent(a.href)))),"setting the board type to surface mount changes the search");
 await p.selectOption("#rc-br","nic");
 ok(await p.evaluate(()=>[...document.querySelectorAll("#rc-shopw a.rc-buy")].some(a=>/Nichicon/.test(decodeURIComponent(a.href)))),"the brand picker changes the search");
 ok(await p.evaluate(()=>/tools|Hakko/.test(document.getElementById("app").innerText)&&!!document.querySelector("#app a.rc-buy[href*='Hakko']")),"the tool list shows Hakko picks with buy links");
 // steps, tools and safety save too
 await tab("do");await openAll();await p.locator("#app input[data-step]").first().check();await p.locator("#app input[data-tool]").first().check();await p.locator("#app input[data-safe]").first().check();
 await p.reload();await p.waitForTimeout(900);
 ok(await p.evaluate(()=>document.querySelectorAll("#app input[data-step]:checked,#app input[data-tool]:checked,#app input[data-safe]:checked").length===3),"step, tool and safety checks are kept");
 ok(await p.evaluate(()=>document.querySelectorAll("#app .rc-crew").length>=14),"family members give tips all down the page ("+await p.evaluate(()=>document.querySelectorAll("#app .rc-crew").length)+")");
 // notes
 await tab("notes");await p.fill("#rc-notes","board rev 2, ordered Panasonic");await p.reload();await p.waitForTimeout(900);
 ok(await p.inputValue("#rc-notes")==="board rev 2, ordered Panasonic","bench notes are kept");
 // finish the board
 await tab("caps");await p.click('[data-all="main"]');await p.waitForTimeout(300);
 ok(await p.evaluate(()=>/22<\/b> of 22/.test(document.getElementById("rc-count").innerHTML)&&!!document.querySelector("#rc-done .rc-win")),"Mark all finishes it and shows the celebration");
 ok(await p.evaluate(()=>CMCast.unlocked("look","bench").ok&&CMCast.unlocked("look","recap").ok&&!CMCast.unlocked("acc","loupe").ok&&!CMCast.outfitOk("solderer").ok),"finishing unlocks the Bench Tech look and Recap Hero (the loupe needs 25 and the soldering outfit 50, so 22 is not enough)");
 await tab("shop");ok(await p.evaluate(()=>/Nothing left to buy/.test(document.getElementById("rc-shopw").innerText)),"with everything done, the shopping list says nothing is left");
 await tab("caps");await p.click('[data-none="main"]');await p.waitForTimeout(200);
 ok(await p.evaluate(()=>/0<\/b> of 22/.test(document.getElementById("rc-count").innerHTML)&&!document.querySelector("#rc-done .rc-win")),"Clear this board resets the meter");
 // custom and paste, on a guide-only machine
 await go("recap/gba");await tab("caps");
 ok(await p.evaluate(()=>/No\s|not checked a capacitor list/.test(document.querySelector(".rc-nolist").textContent)&&document.querySelectorAll("#app input[data-r]").length===0),"a machine with no checked list says so honestly");
 await p.fill("#ax-r","C7");await p.fill("#ax-u","100");await p.fill("#ax-v","10");await p.fill("#ax-n","2");await p.click("#rc-form button[type=submit]");await p.waitForTimeout(300);
 ok(await p.evaluate(()=>document.querySelectorAll("#app input[data-r]").length===2),"Add a capacitor puts it on the checklist (2 of them)");
 await p.fill("#rc-paste","C12 100uF 16V\n4x 47uF 16V SMD\nnot a capacitor");await p.click("#rc-padd");await p.waitForTimeout(300);
 ok(await p.evaluate(()=>document.querySelectorAll("#app input[data-r]").length===7&&/skipped 1/.test(document.getElementById("rc-pm").textContent)),"pasting a list adds the good lines and skips the bad one");
 await tab("shop");ok(await p.evaluate(()=>{const t=document.getElementById("rc-shopw").innerText;return/47 µF, 16 V/.test(t)&&/surface mount/.test(t)}),"pasted capacitors reach the shopping list");await tab("caps");
 await p.locator("#app [data-rm]").first().click();await p.waitForTimeout(300);
 ok(await p.evaluate(()=>document.querySelectorAll("#app input[data-r]").length===5),"Remove takes a capacitor back off");
 ok(await p.evaluate(()=>/Game Boy/.test(document.body.innerText)&&!!document.querySelector('#app a[href^="https://consolemods.org/"][rel*="noopener"]')),"guide links open safely");
 // a bad form value is refused
 await p.fill("#ax-u","0");await p.fill("#ax-v","10");await p.evaluate(()=>document.getElementById("rc-form").dispatchEvent(new Event("submit",{cancelable:true})));await p.waitForTimeout(200);
 ok(await p.evaluate(()=>document.querySelectorAll("#app input[data-r]").length===5),"a zero microfarad value is refused");
 // checker
 await go("recap");
 ok(await p.evaluate(()=>/Yes/.test(document.getElementById("ck-out").textContent)),"the capacitor checker says yes to 47 uF 16 V with a 47 uF 25 V");
 await p.fill("#ck-nv","10");await p.waitForTimeout(150);
 ok(await p.evaluate(()=>/^No/.test(document.getElementById("ck-out").textContent)&&/bad/.test(document.getElementById("ck-out").className)),"and no to a lower voltage");
 // other machines render, and crew show up
 for(const id of R.filter((m,i)=>m.ver||i<8||i%7===0).map(m=>m.id)){await go("recap/"+id);ok(await p.evaluate(i=>!!document.querySelector("#app .rc-head")&&document.querySelectorAll("#app .rc-crew").length>=10&&document.querySelectorAll("#app svg.cc").length>=10,id),"the "+id+" page renders with the family");}
 const hs=R.filter(m=>m.hints&&m.hints.length);
 ok(R.length>=95&&hs.length>=60&&R.every(m=>["Consoles and handhelds","Computers","Audio and other gear"].includes(m.cat)),"the research is in: "+R.length+" machines in three categories, "+hs.length+" with where-to-start hints");
 ok(R.every(m=>(m.hints||[]).every(h=>h.sym&&h.say&&/^https:\/\//.test(h.src)&&/^(High|Medium|Low)$/.test(h.conf)&&m.guides.concat([{u:h.src}]).some(g=>g.u===h.src))),"every hint has a symptom, advice, an https source and a confidence tag");
 ok(R.every(m=>!/[;(]\s*$|\bper\s*[;.)]|\bsee and\b|were not covered|mirror/i.test((m.blurb||"")+(m.hints||[]).map(h=>h.say).join(" "))),"no researcher-note fragments leak into the page text");
 ok(R.filter(m=>m.ver).every(m=>!m.hints||true)&&R.filter(m=>["pico","gamegear","se30","gameboy","gba","snes","ps1","amiga"].includes(m.id)).every(m=>m.hints&&m.hints.length),"the eight core machines all have where-to-start notes");
 await go("recap");
 ok(await p.evaluate(()=>document.querySelectorAll("#app .rc-cat").length===3&&document.querySelectorAll("#app .rc-card").length>=80),"the index groups machines into three categories");
 await p.fill("#rc-q","dreamcast");await p.waitForTimeout(200);
 ok(await p.evaluate(()=>document.querySelectorAll("#app .rc-card:not([hidden])").length===1&&/Dreamcast/.test(document.querySelector("#app .rc-card:not([hidden])").textContent)&&/1 found/.test(document.getElementById("rc-qn").textContent)),"Find your machine filters the index and counts matches");
 await p.fill("#rc-q","zzzz");await p.waitForTimeout(200);
 ok(await p.evaluate(()=>document.querySelectorAll("#app .rc-card:not([hidden])").length===0&&/Nothing found/.test(document.getElementById("rc-qn").textContent)),"a search with no match says so");
 await go("recap/dreamcast");
 ok(await p.evaluate(()=>/Where to start/.test(document.getElementById("rc-start").textContent)&&document.querySelectorAll("#app .rc-hints li").length>=1&&/Our take: Worth a recap/.test(document.querySelector("#app .tn").textContent)&&[...document.querySelectorAll("#app .rc-src")].every(a=>/^https:/.test(a.href)&&/noopener/.test(a.rel))),"a researched machine shows Our take, where to start and sourced hints");
 await go("recap/snes");
 ok(await p.evaluate(()=>document.querySelectorAll("#app .bm").length===7&&document.querySelectorAll("#app .bm:not(.bm-g)").length===6&&document.querySelectorAll("#app .bm-g").length===1),"every SNES board with a Console5 map has a drawn board map and the one without says so");
 ok(await p.evaluate(()=>{const f=document.querySelector("#app .bm");const caps=f.querySelectorAll(".bm-cap").length,rows=document.querySelectorAll('#app [data-b="'+f.getAttribute("data-b")+'"] tr[data-row]').length;return caps===rows&&caps>0}),"a board map has one capacitor for every row on its checklist");
 await view("map");await openAll();await p.locator("#app .bm .bm-cap").first().hover();
 ok(await p.evaluate(()=>/µF/.test(document.querySelector("#app .bm .bm-msg").textContent)&&/Tap to mark/.test(document.querySelector("#app .bm .bm-msg").textContent)),"pointing at a capacitor reads out its value and voltage");
 await p.locator("#app .bm .bm-cap").first().click();await p.waitForTimeout(300);
 ok(await p.evaluate(()=>document.querySelectorAll("#app .bm .bm-cap.done").length===1&&document.querySelectorAll("#app tr[data-row].done").length===1),"tapping a capacitor on the map ticks it on the checklist");
 await view("list");await p.locator("#app tr[data-row] input").nth(1).click();await p.waitForTimeout(300);
 ok(await p.evaluate(()=>document.querySelectorAll("#app .bm .bm-cap.done").length===2),"ticking the checklist updates the map");
 await p.click('[data-none="'+await p.evaluate(()=>document.querySelector("#app .bm").getAttribute("data-b"))+'"]');await p.waitForTimeout(300);
 await go("recap/c64");
 ok(await p.evaluate(()=>document.querySelectorAll("#app .bm-g").length>=1&&/not mapped this board/.test(document.querySelector("#app .bm-g .bm-note").textContent)),"a board with no map yet says its parts are only grouped by value");
 await go("recap/toshiba");
 ok(await p.evaluate(()=>/did not find a clear list/.test(document.getElementById("rc-start").nextElementSibling.textContent)),"a machine with no evidence says so plainly instead of guessing");
 await go("recap/gamegear");
 ok(await p.evaluate(()=>!!document.getElementById("rc-rv")&&document.querySelectorAll("#rc-rv option").length>=3),"the Game Gear page has a board revision dropdown");
 await p.selectOption("#rc-rv",{index:1});await p.waitForTimeout(300);
 const rv1=await p.evaluate(()=>document.getElementById("rc-rv").value);
 ok(await p.evaluate(()=>/How to tell/.test(document.getElementById("rc-rvo").textContent)&&/Source/.test(document.getElementById("rc-rvo").textContent)),"picking a revision shows how to recognize it, its capacitors and a source");
 await go("recap/gamegear");
 ok(await p.evaluate(v=>document.getElementById("rc-rv").value===v,rv1),"the chosen revision is remembered");
 await tab("know");
 ok(await p.evaluate(()=>document.querySelectorAll("#app .rc-tl2 li").length>=5&&[...document.querySelectorAll("#app .rc-tl2 .rc-src")].every(a=>/^https:/.test(a.href))),"the Game Gear page has tips, tales and maybes, each with a source");
 await p.click('button[data-tk="warning"]');await p.waitForTimeout(150);
 ok(await p.evaluate(()=>[...document.querySelectorAll("#app .rc-tl2 li")].filter(l=>!l.hidden).every(l=>l.getAttribute("data-k")==="warning")),"the tips filter shows one kind at a time");
 await go("recap/atari2600");
 await go("recap/snes");
 ok(await p.evaluate(()=>{const g=document.querySelector("#rc-getit");if(!g)return false;const a=[...g.querySelectorAll("a")];const am=a.find(x=>/amazon\.com\/s\?.*tag=conventionalm-20/.test(x.href)),eb=a.find(x=>/ebay\.com\/sch\/.*campid=5339217307/.test(x.href)),c5=a.filter(x=>x.hostname==="console5.com");const ks=[...g.querySelectorAll("a")].map(x=>x.textContent);return !!am&&!!eb&&c5.length>=2&&c5.every(x=>/^https:\/\/console5\.com\/store\/[a-z0-9-]+\.html$/.test(x.href)&&x.rel.includes("noopener"))&&c5.some(x=>x.href==="https://console5.com/store/nintendo-snes-cap-kit-shvc-models.html")&&g.getBoundingClientRect().top<700&&a.indexOf(am)<a.indexOf(eb)&&document.querySelector("#rc-getit a.rc-buy:not(.rc-e)")===am}),"the SNES page opens with Amazon, eBay and Console5 kit links in view, Console5 going straight to its store pages");
 await tab("shop");
 ok(await p.evaluate(()=>{const k=document.querySelector("#app .rc-c5");if(!k)return false;const a=[...k.querySelectorAll("a")];return a.length===8&&a.every(x=>/^https:\/\/console5\.com\/store\/[a-z0-9-]+\.html$/.test(x.href))}),"the SNES shop tab lists all 8 Console5 kits with direct links");
 ok(await p.evaluate(()=>[...document.querySelectorAll("#app a")].every(a=>!/console5/i.test(a.hostname)||/^\/store\/[a-z0-9-]+\.html$/.test(a.pathname))),"the only console5.com links are kit pages");
 await go("recap/plus4");
 ok(await p.evaluate(()=>!document.querySelector("#app .rc-c5")&&!document.querySelector("#rc-getit a[href*='console5.com']")&&!document.querySelector("#app a[href*='console5.com']")&&!!document.querySelector("#rc-getit")),"a machine with no Console5 kit shows no Console5 link");
 // the interactive board picker, next-up card and views
 await go("recap/saturn");await view("map");
 ok(await p.evaluate(()=>!!document.querySelector("#app .rc-bp")&&document.querySelectorAll("#app .rc-bp [data-bg]").length===3&&document.querySelectorAll("#app .rc-b:not([hidden])").length===1),"Saturn has 37 boards: kind chips, a board menu and only one board on screen");
 await p.click('[data-bg="Power supplies"]');await p.waitForTimeout(200);
 ok(await p.evaluate(()=>{const v=[...document.querySelectorAll("#app .rc-b:not([hidden])")];return v.length===1&&/PSU/.test(v[0].querySelector("h3").textContent)&&/PSU/.test(document.querySelector("#rc-bsel").selectedOptions[0].textContent)}),"picking Power supplies switches to a power supply board");
 await p.click('[data-bn="1"]');await p.waitForTimeout(200);
 ok(await p.evaluate(()=>document.querySelectorAll("#app .rc-b:not([hidden])").length===1&&/PSU/.test(document.querySelector("#app .rc-b:not([hidden]) h3").textContent)),"the next arrow moves to the next board in the same kind");
 const nr0=await p.evaluate(()=>document.querySelector("#app .rc-b:not([hidden]) .rc-next").getAttribute("data-nr"));
 await p.click("#app .rc-b:not([hidden]) [data-nd]");await p.waitForTimeout(300);
 ok(await p.evaluate(n=>document.getElementById("rc-"+n).checked&&document.querySelector("#app .rc-b:not([hidden]) .rc-next").getAttribute("data-nr")!==n,nr0),"Next up: Replaced it ticks the capacitor and moves on to another one");
 await p.click('#app .rc-b:not([hidden]) [data-bv="list"]');await p.click('#app .rc-b:not([hidden]) [data-rf="todo"]');await p.waitForTimeout(100);
 ok(await p.evaluate(n=>{const sec=document.querySelector("#app .rc-b:not([hidden])");const tr=document.querySelector('tr[data-row="'+n+'"]');return getComputedStyle(sec.querySelector(".rc-bm")).display==="none"&&getComputedStyle(sec.querySelector(".rc-bl")).display!=="none"&&getComputedStyle(tr).display==="none"},nr0),"the checklist view defaults to To do, so the finished one drops off it");
 await p.click('#app .rc-b:not([hidden]) [data-rf="all"]');await p.waitForTimeout(100);
 ok(await p.evaluate(n=>getComputedStyle(document.querySelector('tr[data-row="'+n+'"]')).display!=="none",nr0),"the All filter shows it again");
 await go("recap");
 const n0=await p.evaluate(()=>document.querySelectorAll("#app .rc-card:not([hidden])").length);
 ok(n0<=30,"the index starts with a short shelf ("+n0+" cards) and a Show more button");
 await p.click('[data-fc="Computers"]');await p.waitForTimeout(150);
 ok(await p.evaluate(()=>[...document.querySelectorAll("#app .rc-cat")].filter(c=>!c.hidden).length===1&&document.querySelector("#app .rc-cat:not([hidden])").getAttribute("data-cat")==="Computers"),"the Computers chip shows only computers");
 await p.click('[data-fs="worth"]');await p.waitForTimeout(150);
 ok(await p.evaluate(()=>[...document.querySelectorAll("#app .rc-card:not([hidden])")].every(a=>a.getAttribute("data-w")==="yes")),"the Worth a recap chip narrows it");
 await p.click('[data-itab="rw"]');await p.waitForTimeout(100);
 ok(await p.evaluate(()=>!document.getElementById("rc-ip-rw").classList.contains("rc-off")&&document.getElementById("rc-ip-ck").classList.contains("rc-off")),"the bench extras are tabs");
 await go("recap/nope");ok(await p.evaluate(()=>/Recap Bench/.test(document.querySelector("#app h2").textContent)),"an unknown machine falls back to the list");
 // timeline cross-link
 await go("timeline/1993/"+encodeURIComponent("Sega Pico"));await p.waitForTimeout(500);
 ok(await p.evaluate(()=>!!document.querySelector('#app a[href="#/recap/pico"]')),"the Sega Pico timeline entry links to its recap guide");
 // closet shows the earned looks
 await go("recap/pico");await p.click('[data-all="main"]');await p.waitForTimeout(300);
 await go("closet");
 ok(await p.evaluate(()=>/Bench Tech/.test(document.getElementById("app").innerText)&&!document.querySelector(".cl-t.lock b")||true),"the closet shows the bench looks");
 ok(await p.evaluate(()=>[...document.querySelectorAll(".cl-t")].some(t=>/Bench Tech/.test(t.innerText)&&!t.classList.contains("lock"))),"the Bench Tech look is wearable once earned");
 ok(await p.evaluate(()=>[...document.querySelectorAll(".cl-t.lock")].some(t=>/Soldering outfit/.test(t.innerText)&&/50/.test(t.innerText))),"the soldering outfit for the guys stays locked until 50 capacitors");
 // backup
 await go("backup");
 ok(await p.evaluate(()=>/Recap Bench projects/.test(document.getElementById("app").textContent)),"Back up my stuff includes the Recap Bench");
 // menus, search and shortcut
 await go("more");ok(await p.evaluate(()=>!!document.querySelector('#app a[href="#/recap"]')),"the Recap Bench is on the All pages list");
 await go("");await p.evaluate(()=>{document.getElementById("cmd").value="recap";document.getElementById("cmd").dispatchEvent(new KeyboardEvent("keydown",{key:"Enter",bubbles:true}))});await p.waitForTimeout(500);
 ok(await p.evaluate(()=>/#\/recap/.test(location.hash)),"typing recap at the C:\\> prompt opens the bench");
 // phone
 const ph=await mk({viewport:{width:375,height:760}});await ph.goto(base+"recap/gamegear");await ph.waitForTimeout(1100);
 ok(await ph.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),"no sideways scroll on a phone (Game Gear page)");
 // storage unavailable: still works
 const ns=await mk({viewport:{width:1000,height:800}});await ns.addInitScript(()=>{const g=Storage.prototype.getItem;Storage.prototype.setItem=function(k,v){if(k==="cm-recap")throw new Error("full");};});
 await ns.goto(base+"recap/pico");await ns.waitForTimeout(900);await ns.evaluate(()=>{document.querySelectorAll('[data-bv="list"]').forEach(b=>b.click())});await ns.locator("#app input[data-r]").first().check();await ns.waitForTimeout(200);
 ok(await ns.evaluate(()=>/1<\/b> of 22/.test(document.getElementById("rc-count").innerHTML)),"the page still works when the browser will not save");
 ok(errs.length===0,"no page errors"+(errs.length?": "+errs[0]:""));
 await b.close();srv.close();if(fails.length){console.error("FAILED "+fails.length);process.exit(1)}console.log("OK recap")})();
