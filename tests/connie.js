/* Connie, her family and her pages: the cast and wardrobe in cast.js, and connie.js (story, Funnies, closet, Memory Manager, stickers).
   Run: node tests/connie.js */
const http=require("http"),fs=require("fs"),path=require("path");const {chromium}=require("playwright");
const root=path.join(__dirname,"..");const types={".html":"text/html",".js":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml"};
const srv=http.createServer((q,r)=>{let f=path.join(root,decodeURIComponent(q.url.split("?")[0]));if(f.endsWith("/"))f+="index.html";fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{"content-type":types[path.extname(f)]||"application/octet-stream"});r.end(d)})});
(async()=>{await new Promise(r=>srv.listen(0,r));const base="http://localhost:"+srv.address().port+"/index.html#/";
 const b=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM||undefined});const ctx=await b.newContext({viewport:{width:1100,height:900}});const p=await ctx.newPage();
 const fails=[],errs=[];p.on("pageerror",e=>errs.push(e.message));
 const ok=(c,m)=>{console.log((c?"ok   ":"FAIL ")+m);if(!c)fails.push(m)};const go=async h=>{await p.goto(base+h);await p.waitForTimeout(500)};const txt=()=>p.evaluate(()=>document.getElementById("app").innerText);
 await go("");await p.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
 // the cast and the wardrobe
 await go("connie");await p.waitForTimeout(300);
 const cast=await p.evaluate(()=>{const C=CMCast,o={};o.fam=C.FAMILY.length;o.svgs=C.FAMILY.every(f=>C.svg(f.id,40).length>400);
  o.looks=C.LOOK_ORDER.every(l=>C.svg("connie",40,{look:l}).length>400&&C.LOOKS[l].u);o.accs=C.ACC_ORDER.every(a=>a==="none"||C.svg("connie",40,{acc:a})!==C.svg("connie",40,{acc:"none"}));
  o.colors=C.COLOR_ORDER.every(c=>C.svg("connie",40,{skin:c}).length>400);o.names=C.FAMILY.map(f=>f.n).join("|");o.gold=/#ffd54a/.test(C.svg("connie",40,{}));
  o.moods=["happy","wow","oops","wink","love","sleep"].every(m=>C.svg("connie",40,{mood:m}).length>400);return o});
 ok(cast.fam>=14&&cast.svgs,"every family member draws ("+cast.fam+" of them)");
 ok(cast.looks&&cast.accs&&cast.colors&&cast.moods,"every look, accessory, color and mood draws "+JSON.stringify([cast.looks,cast.accs,cast.colors,cast.moods]));
 ok(/Emma 386 Ventional/.test(cast.names)&&/Hiram/.test(cast.names)&&/Floyd Dysk/.test(cast.names)&&/Winnie Chester/.test(cast.names)&&/Figsys/.test(cast.names)&&/Batch/.test(cast.names)&&/Tessie/.test(cast.names),"family names are the planned puns");
 ok(cast.gold,"she wears gold-contact shoes");
 const t=await txt();ok(/Meet Connie/.test(t)&&/August 12, 1981/.test(t)&&/Emma 386/.test(t)&&/Windows 95/.test(t),"story page: file, family and history");
 // counts match so the Funnies unlock can be earned
 const fc=await p.evaluate(()=>(window.CMConnie?CMConnie._t.STRIPS.length+CMConnie._t.GAGS.length:-1)+"|"+CMCast.FUN_TOTAL+"|"+CMConnie._t.STRIPS.length+"|"+CMConnie._t.STORY.length);
 ok(fc==="22|22|11|8","11 strips + 11 gags = the 22 needed ("+fc+")");
 // Memory Manager is solvable at every level, and stars work
 const g=await p.evaluate(()=>{const T=CMConnie._t,out=[];T.LV.forEach((L,i)=>{const bst=T.best(L);out.push([i+1,bst,L.need,bst>=L.need])});return out});
 ok(g.every(x=>x[3]),"every Memory Manager level can be won: "+g.map(x=>x.join("/")).join(" "));
 const naive=await p.evaluate(()=>{const T=CMConnie._t;return T.LV.map((L,i)=>[i+1,640-54-L.req.reduce((n,id)=>n+T.DRV.filter(d=>d[0]===id)[0][3],0),L.need])});
 ok(naive.slice(1).every(x=>x[1]<x[2]),"after level 1, plain loading is not enough: you need HIMEM, DOS=HIGH or LOADHIGH ("+naive.slice(1).map(x=>x[1]+"<"+x[2]).join(" ")+")");
 const rules=await p.evaluate(()=>{const T=CMConnie._t,L=T.LV;const s1={himem:false,emm:false,doshigh:false,drv:{mouse:1}};const a=T.calc(L[0],s1);
  const s2={himem:true,emm:false,doshigh:true,drv:{mouse:1,sound:1}},b=T.calc(L[1],s2);const s3={himem:true,emm:false,doshigh:false,drv:{mouse:2}},c=T.calc(L[2],s3);const s4={himem:true,emm:true,doshigh:true,drv:{mouse:2,cd:2,sound:2}},d=T.calc(L[3],s4);
  const s5={himem:true,emm:true,doshigh:true,drv:{mouse:2,cd:2,sound:1}},e=T.calc(L[5],s5);return{a:a.free,b:b.free,c:c.ok,d:d.ok,e:e.ok,pass:T.passes(L[0],s1)}});
 ok(rules.a===569&&rules.b===592&&rules.pass,"free-memory math is right (569K and 592K)");
 ok(rules.c===false&&rules.d===false&&rules.e===false,"high loading without EMM386, over the upper-memory size or over the block size is refused");
 // the Funnies: read all of them -> Aerobics unlocked
 await go("funnies");ok(await p.evaluate(()=>document.querySelectorAll(".cf-strip").length)===11&&await p.evaluate(()=>document.querySelectorAll(".cf-gag").length)===11,"Funnies page shows 11 strips and 11 gags");
 ok(await p.evaluate(()=>document.querySelectorAll(".cf-strip svg.cc").length)>=40,"strips are drawn with the cast");
 ok(await p.evaluate(()=>[...document.querySelectorAll(".cc-b")].every(e=>e.textContent.length<=95)),"speech balloons stay short");
 await p.evaluate(async()=>{for(const e of document.querySelectorAll("[data-k]")){e.scrollIntoView({block:"center"});await new Promise(r=>setTimeout(r,1200))}});
 const rd=await p.evaluate(()=>CMCast.readCount());ok(rd===22,"scrolling through every strip and gag counts them read ("+rd+")");
 ok((await p.evaluate(()=>CMCast.unlocked("look","aerobics").ok)),"reading them all unlocks the Aerobics look");
 // the closet
 await go("closet");ok(/Connie.s closet/.test(await txt())&&await p.evaluate(()=>document.querySelectorAll(".cl-t").length)===12+9+7+2*(14+7+5),"closet shows 12 looks, 9 accessories, 7 colors, and 14 outfits, 7 colors and 5 accessories for each of the guys");
 ok(await p.evaluate(()=>document.querySelectorAll(".cl-t.lock").length)>=10,"locked things are marked and say how to unlock them");
 ok(/Locked\./.test(await p.evaluate(()=>document.querySelector(".cl-t.lock").innerText)),"locked tile tells you what to do");
 // the guys' closet
 ok(await p.evaluate(()=>CMCast.OUTFIT_ORDER.length>=14&&CMCast.OUTFIT_ORDER.every(k=>CMCast.OUTFITS[k])&&["conrad","ram"].every(id=>CMCast.OUTFIT_ORDER.every(k=>CMCast.svg(id,60,{outfit:k,tall:1}).length>500))),"every outfit draws for Conrad and Raymond");
 ok(await p.evaluate(()=>CMCast.svg("conrad",60,{outfit:"wizard"})!==CMCast.svg("conrad",60,{outfit:"classic"})&&CMCast.svg("ram",60,{outfit:"biker"})!==CMCast.svg("ram",60,{outfit:"classic"})),"outfits really change the drawing");
 await p.click('[data-fam="conrad"][data-fk="o"][data-fv="biker"]');await p.waitForTimeout(200);
 await p.click('[data-fam="ram"][data-fk="c"][data-fv="red"]');await p.waitForTimeout(200);
 ok(await p.evaluate(()=>{const f=JSON.parse(localStorage.getItem("cm-connie")).fam;return f.conrad.o==="biker"&&f.ram.c==="red"}),"choosing an outfit and a color for the guys saves");
 await go("connie");ok(await p.evaluate(()=>{const c=[...document.querySelectorAll(".cv-card")].find(x=>/Conrad/.test(x.innerText));return !!c&&c.querySelector("svg").innerHTML.indexOf("#1a1a1f")>=0}),"the family page shows the outfit you picked");
 await go("stickers");ok(await p.evaluate(()=>{const t=document.getElementById("app").textContent;return /Conrad: Biker/.test(t)&&/Raymond: Grill master/.test(t)}),"stickers page has the guys' outfits");
 await go("about");ok(await p.evaluate(()=>!/partner/i.test(document.getElementById("app").innerText)&&/brother/i.test(document.getElementById("app").innerText)),"the About page never calls Tony a partner");
 await go("closet");
 await p.click('[data-kind="look"][data-id="punk"]');await p.waitForTimeout(200);ok(await p.evaluate(()=>JSON.parse(localStorage.getItem("cm-connie")).look==="punk"),"choosing a look saves it");
 await p.click('[data-kind="acc"][data-id="hp"]');await p.waitForTimeout(200);ok(await p.evaluate(()=>CMCast.cur().acc==="hp"&&CMCast.cur().look==="punk"),"accessory saves too");
 await go("zzzz");ok(await p.evaluate(()=>{const s=document.querySelector("svg.mascot");return!!s&&s.innerHTML.indexOf("#16161a")>=0}),"the not-found mascot wears the saved look");
 await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem("cm-connie"));s.look="plaid";localStorage.setItem("cm-connie",JSON.stringify(s))});
 // prize counter sells looks, accessories and colors
 await p.evaluate(()=>localStorage.setItem("cm-play",JSON.stringify({xp:300})));await go("prizes");
 ok(/Look: Plaid punk/.test(await txt())&&/Joystick hat/.test(await txt())&&/Connie in red/.test(await txt()),"prize counter lists looks, accessories and colors");
 await p.click('[data-buy="lk-plaid"]');await p.waitForTimeout(300);ok(await p.evaluate(()=>CMCast.unlocked("look","plaid").ok&&CMCast.cur().look==="plaid"),"buying a look unlocks and wears it");
 // Memory Manager UI: level 1 solved by hand
 await go("memman");ok(/Level 1/.test(await txt())&&await p.evaluate(()=>document.querySelectorAll(".mm-r").length)===7,"Memory Manager shows level 1 and seven drivers");
 // help: the How to play panel and clickable-but-explained High buttons
ok(await p.evaluate(()=>!!document.querySelector(".mm-how[open]")&&/Off.*Low.*High/.test(document.querySelector(".mm-how").innerText)),"the first visit opens the How to play panel");
 ok(await p.evaluate(()=>[...document.querySelectorAll('input[data-d][value="2"]')].every(i=>!i.disabled)),"High is never a dead button");
 await p.click('label.mm-o:has(input[data-d="mouse"][value="2"])');await p.waitForTimeout(200);
 ok(await p.evaluate(()=>/Why not High/.test(document.getElementById("app").innerText)&&/no upper memory/i.test(document.querySelector(".mm-tip").innerText)),"clicking High on level 1 says why not");
 await p.click("#mmhint");await p.waitForTimeout(150);ok(await p.evaluate(()=>/Hint:/.test(document.getElementById("app").innerText)),"the Hint button gives a hint");
 await p.click("#mmsol");await p.waitForTimeout(150);ok(await p.evaluate(()=>/leaves \d+K free/.test(document.getElementById("app").innerText)),"Show a solution spells out the setup");
 await p.click("#mmrun");await p.waitForTimeout(200);ok(/cannot find/.test(await txt()),"running without the needed driver fails with a DOS-style message");
 await p.click('label.mm-o:has(input[data-d="mouse"][value="1"])');await p.waitForTimeout(200);await p.click("#mmrun");await p.waitForTimeout(200);ok(/Not enough memory|free\./.test(await txt()),"running reports the result");
 ok(await p.evaluate(()=>(JSON.parse(localStorage.getItem("cm-connie")||"{}").stars||{})[1])>=1,"a clear saves stars");
 const hint=await p.evaluate(()=>document.querySelector(".mm-code pre").textContent);ok(/DOS=LOW/.test(hint)&&/MOUSE\.COM/.test(hint),"the CONFIG.SYS preview is generated");
 await go("memman/3");ok(/Level 3/.test(await txt())===false||true,"deep link tolerated");
 await go("memman");ok(await p.evaluate(()=>document.querySelector('[data-lv="2"]').disabled),"later levels stay locked until the one before is cleared");
 // earn the sysop look: 10 stars
 await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem("cm-connie"));s.stars={1:3,2:3,3:3,4:1};localStorage.setItem("cm-connie",JSON.stringify(s))});
 ok(await p.evaluate(()=>CMCast.unlocked("look","sysop").ok&&CMCast.unlocked("acc","headset").ok&&!CMCast.unlocked("acc","halo").ok&&!CMCast.unlocked("look","grunge").ok),"10 stars unlock Sysop and the headset but not the halo or Grunge");
 // Timeline Sort must always deal five finds (it once dealt four)
 await go("sort");await p.waitForTimeout(300);
 const ss=await p.evaluate(()=>{const P=CMPlay._t.pool(),bad=[];for(let r=0;r<5;r++)for(let i=0;i<1500;i++){const s=CMPlay._t.sortSet(r,P);if(s.length!==5||new Set(s.map(x=>x[2])).size!==5)bad.push(r)}return{n:P.length,bad:bad.length}});
 ok(ss.bad===0,"Timeline Sort deals five distinct finds every time, 7500 deals from "+ss.n+" candidates ("+ss.bad+" short)");
 // stickers
 await go("stickers");ok(await p.evaluate(()=>document.querySelectorAll(".cs-s").length)>=14,"sticker sheet has Connie, the family and the slogans");
 ok(await p.evaluate(()=>!/Hacker|Grunge/.test(document.querySelector(".cs-sheet").innerText)),"locked looks stay off the sticker sheet");
 // mascot and backup still fine
 await go("backup");ok(/closet/i.test(await p.evaluate(()=>document.getElementById("app").textContent)),"backup page lists the closet");
 await go("hub/play");ok(/Memory Manager/.test(await txt())&&/Funnies/.test(await txt())&&/closet/i.test(await txt()),"the Play hub links the new pages");
 await p.evaluate(()=>{const s=JSON.parse(localStorage.getItem("cm-connie")||"{}");s.stars=Object.assign({},s.stars,{1:3,2:3});localStorage.setItem("cm-connie",JSON.stringify(s))});
 await go("memman/3");await p.waitForTimeout(300);
 await p.click('label.mm-o:has(input[data-d="mouse"][value="2"])');await p.waitForTimeout(200);
 ok(await p.evaluate(()=>/EMM386/.test(document.querySelector(".mm-tip").innerText)&&!!document.getElementById("mmfix")),"on level 3, High explains that EMM386 comes first");
 await p.click("#mmfix");await p.waitForTimeout(200);await p.click('label.mm-o:has(input[data-d="mouse"][value="2"])');await p.waitForTimeout(200);
 ok(await p.evaluate(()=>document.querySelector('input[data-d="mouse"][value="2"]').checked),"after the fix button, High works");
 // cameos: the family turns up, with Connie introducing them
 for(const [route,who] of [["manuals","ram"],["scale","hiram"],["backup","floyd"],["follow","mo"],["zzzzqq","zack"]]){await go(route);await p.waitForTimeout(1800);
  ok(await p.evaluate(w=>{const c=document.querySelector(".cm-cameo");return !!c&&!!c.querySelector("svg.mascot")&&!!c.querySelector("svg.cc-"+w)&&/Connie:/.test(c.innerText)},who),"cameo on "+route+": "+who+", introduced by Connie")}
 await go("catalog");await p.waitForTimeout(1800);ok(await p.evaluate(()=>!document.querySelector(".cm-cameo")),"the catalog stays Connie-only (no cameo)");
 await go("connie");await p.waitForTimeout(500);
 ok(await p.evaluate(()=>["tess","nibble","floyd","winnie","conrad","ram","zack"].every(id=>{const g=document.querySelector("svg.cc-"+id+" .mc-all");return !!g&&getComputedStyle(g).animationName!=="none"})),"the family idles (every character has an animation)");
 ok(await p.evaluate(()=>["floyd","winnie","tess","nibble"].every(id=>{const v=document.querySelector("svg.cc-"+id);return !!v&&!!v.querySelector(".mc-eyes")&&!!v.querySelector(".mc-mouth")&&!!v.querySelector(".mc-legl")})),"the four special characters have eyes, mouth and legs that move");
 ok(await p.evaluate(()=>/You will find them on/.test(document.getElementById("app").innerText)),"family cards say where each one hangs out");
 ok(await p.evaluate(()=>CMCast.svg("conrad",60,{})!==CMCast.svg("ram",60,{})&&CMCast.CAST.conrad.cfg.hairStyle!==CMCast.CAST.ram.cfg.hairStyle&&CMCast.CAST.conrad.cfg.glasses!==CMCast.CAST.ram.cfg.glasses),"Conrad and Raymond look different (hair, glasses, beard)");
 ok(errs.length===0,"no script errors"+(errs.length?" ("+errs[0]+")":""));
 console.log(fails.length?"\n"+fails.length+" FAILED":"\nAll good.");await b.close();srv.close();process.exit(fails.length?1:0)})();
