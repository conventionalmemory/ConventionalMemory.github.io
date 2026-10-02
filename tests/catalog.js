/* Catalog page test: one search with suggestions, one department row, Show/Sort/View controls that live in the address,
   remembered view, "Not here yet" as a Show option, quick look, prev/next on item pages, Back keeps your place.   Run: node tests/catalog.js */
const http=require("http"),fs=require("fs"),path=require("path");const {chromium}=require("playwright");
const root=path.join(__dirname,"..");const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml"};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith("/"))f+="index.html";fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});r.end(d)})});
(async()=>{await new Promise(r=>srv.listen(0,r));const base="http://localhost:"+srv.address().port+"/index.html#/";
 const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM||undefined});const p=await b.newPage({viewport:{width:1100,height:900}});
 const fails=[],errs=[];p.on("pageerror",e=>errs.push(e.message));
 const ok=(c,m)=>{console.log((c?"ok   ":"FAIL ")+m);if(!c)fails.push(m)};
 const W=ms=>p.waitForTimeout(ms),H=()=>p.evaluate(()=>location.hash),N=sel=>p.evaluate(s=>document.querySelectorAll(s).length,sel);
 await p.goto(base+"catalog");await p.evaluate(()=>{localStorage.clear();sessionStorage.clear()});await p.goto(base+"catalog");await p.reload();await W(500);
 ok(await N("#g .card")>=1,"small museum opens straight on exhibits");
 ok(await N("#ch")===1,"first visit shows the hint");await p.click("#chx");await p.reload();await W(400);ok(await N("#ch")===0,"hint stays dismissed");
 // equal-height cards
 const hts=await p.evaluate(()=>[...document.querySelectorAll("#g .grid .cw")].slice(0,4).map(c=>Math.round(c.getBoundingClientRect().height)));ok(hts.length>1&&new Set(hts).size===1,"cards in a row are the same height ("+hts+")");
 ok(await N("#g .srcb")===0||await p.evaluate(()=>getComputedStyle(document.querySelector("#g .srcb")).display==="none"),"'Bought on' badge is hidden on catalog cards");
 // search suggestions
 await p.click("#q");await p.keyboard.type("sou");await W(200);ok(await N("#qs li")>=1&&/Sound Blaster/i.test(await p.evaluate(()=>document.getElementById("qs").innerText)),"typing shows grouped suggestions");
 ok(await p.evaluate(()=>/timeline/i.test(document.getElementById("qs").innerText)),"suggestions offer a timeline search");
 await p.keyboard.press("ArrowDown");await p.keyboard.press("Enter");await W(400);ok(/#\/item\//.test(await H()),"arrow + Enter opens the suggested exhibit");
 await p.goBack();await W(500);
 ok(/q=sou/.test(await H())&&await N("#g .card")>=1,"Back returns to the search with its results ("+await H()+")");
 // typo tolerance
 await p.fill("#q","libreto");await p.dispatchEvent("#q","input");await W(300);
 ok(await N("#dym")===1,"no results offers 'Did you mean'");await p.click("#dym");await W(300);ok(await N("#g .card")>=1,"Did you mean runs the corrected search");
 // label number search
 await p.fill("#q","cm-1");await p.dispatchEvent("#q","input");await W(300);ok(await N("#qs li")>=1,"label numbers show in suggestions");
 await p.fill("#q","");await p.dispatchEvent("#q","input");await W(200);
 // departments
 await p.click('#cc [data-c="Laptops"]');await W(300);ok(/c=Laptops/.test(await H())&&await N("#af [data-xx]")===1,"department chip filters and shows an active chip");
 ok(/Showing \d+ of \d+/.test(await p.innerText("#cn")),"result line says Showing X of Y");
 await p.click('#cc [data-c="Keyboards"]');await W(300);ok(await N("#af [data-xx]")===2&&await N("#clr")===1,"two departments, Clear all appears");
 await p.click("#clr");await W(300);ok(!/c=/.test(await H())&&await N("#af [data-xx]")===0,"Clear all clears everything");
 // views are remembered
 await p.click('[data-v="list"]');await W(300);ok(await N("#g .crw")>=1&&/v=list/.test(await H()),"List view");
 await p.goto(base+"catalog");await W(500);ok(await N("#g .crw")>=1,"the chosen view is remembered next visit");
 await p.evaluate(()=>{const v=document.getElementById("vw");v.value="table";v.dispatchEvent(new Event("change"))});await W(300);ok(await N("#g table.ctab")===1,"View menu switches to Table");
 await p.click('[data-v="cards"]');await W(300);
 // sort
 await p.selectOption("#s","name");await W(300);const names=await p.evaluate(()=>[...document.querySelectorAll("#g .card h3")].map(h=>h.textContent.trim()));ok(names.length>1&&names.join("|")===names.slice().sort((a,b)=>a.localeCompare(b)).join("|"),"Sort by name A to Z works");
 await p.selectOption("#s","");
 // Show: not here yet
 await p.click('[data-x="next"]');await W(300);ok(/x=next/.test(await H())&&await N("#g .nui")>=1&&await p.evaluate(()=>document.getElementById("s").disabled),"'Not here yet' is a Show option, and Sort is greyed out there");
 await p.click('[data-x="ex"]');await W(300);ok(await N("#g .card")>=1,"switching Show back brings the exhibits back");
 // more filters panel
 ok(await p.evaluate(()=>document.getElementById("fp").hidden),"More filters starts closed");await p.click("#fb");ok(await p.evaluate(()=>!document.getElementById("fp").hidden&&document.getElementById("fb").getAttribute("aria-expanded")==="true"),"More filters opens");
 await p.click("#cd .chip.dec");await W(300);ok(/d=\d{4}/.test(await H())&&/More filters \(1\)/.test(await p.innerText("#fb")),"decade filter counts on the button");await p.click("#clr").catch(()=>{});await p.click('#af [data-xx]');await W(300);
 // quick look
 await p.goto(base+"catalog");await W(400);await p.hover("#g .cw");await p.click("#g .cw .ql");await W(300);ok(await N("#qlk")===1,"Quick look opens");
 ok(await p.evaluate(()=>document.activeElement.id==="qlc"),"focus moves into quick look");
 await p.keyboard.press("Escape");await W(200);ok(await N("#qlk")===0,"Escape closes quick look");
 await p.click("#g .cw .ql");await p.click("#qln");await W(200);ok(await N("#qlk")===1,"Next in quick look stays in quick look");await p.click("#qlo");await W(400);ok(/#\/item\//.test(await H()),"Open the full page goes to the exhibit");
 // prev/next follows the catalog list
 ok(await p.evaluate(()=>/Back to the list \(\d+ of \d+\)/.test(document.querySelector(".pn").innerText)),"item page offers Back to the list");
 await p.goto(base+"timeline");await W(300);await p.goto(base+"item/"+(await p.evaluate(()=>ITEMS[0].id)));await W(400);ok(await p.evaluate(()=>!/Back to the list/.test(document.querySelector(".pn").innerText)),"the list is forgotten after leaving the catalog");
 // scroll position on Back (use a tall list at phone height)
 await p.setViewportSize({width:390,height:500});await p.goto(base+"catalog");await W(400);await p.evaluate(()=>window.scrollTo(0,900));await W(100);const y0=await p.evaluate(()=>window.scrollY);
 const lastCard=await p.evaluate(()=>{const a=[...document.querySelectorAll("#g .card")].filter(c=>c.getBoundingClientRect().top>0&&c.getBoundingClientRect().top<400)[0];a.click();return a.getAttribute("href")});await W(400);await p.goBack();await W(600);
 const y1=await p.evaluate(()=>window.scrollY);ok(y0>0&&Math.abs(y1-y0)<40,"Back puts you at the same scroll position ("+y0+" -> "+y1+")");
 // phone layout
 const ph=await p.evaluate(()=>({cols:getComputedStyle(document.querySelector("#g .grid")).gridTemplateColumns.split(" ").length,vw:getComputedStyle(document.querySelector(".cvsel")).display,vb:getComputedStyle(document.querySelector(".cviews")).display,sticky:getComputedStyle(document.getElementById("ct")).position,over:document.documentElement.scrollWidth>innerWidth}));
 ok(ph.cols===1&&ph.vw!=="none"&&ph.vb==="none"&&ph.sticky==="sticky"&&!ph.over,"phone: one column, View menu, sticky toolbar, no sideways scroll "+JSON.stringify(ph));
 ok(await p.evaluate(()=>[...document.querySelectorAll("#ct button,#ct select,#cc .chip")].filter(e=>e.offsetParent).every(e=>e.getBoundingClientRect().height>=34)),"phone: tap targets are at least 34px tall");
 ok(!errs.length,"no script errors"+(errs.length?": "+errs.join("|"):""));
 await b.close();srv.close();if(fails.length){console.error("FAILED "+fails.length);process.exit(1)}console.log("OK catalog")})();
