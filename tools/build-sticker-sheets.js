/* Prints the Connie sticker sheets and trading-card sheets: 8.5x11 in PNGs at 300 dpi, white background, thin dashed cut guides.
   Run: node tools/build-sticker-sheets.js [outdir]     (default: stickers/)
   The characters come straight from cast.js, so a new look or accessory shows up here after a rebuild. */
const fs=require("fs"),path=require("path"),vm=require("vm");const {chromium}=require("playwright");
const root=path.join(__dirname,"..");const out=path.resolve(process.argv[2]||path.join(root,"stickers"));fs.mkdirSync(out,{recursive:true});
const c={window:{},localStorage:{getItem(){return null},setItem(){}},document:{},console};vm.createContext(c);
vm.runInContext(fs.readFileSync(path.join(root,"cast.js"),"utf8")+";this.C=CMCast",c);const C=c.C;
const E=s=>String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
const BG=["#ffe3f0","#d9f0ff","#fff1c2","#e4dcff","#d7f7de","#ffe0cc"];
const css=`*{box-sizing:border-box}body{margin:0;background:#fff;font-family:"DejaVu Sans Mono","Liberation Mono",monospace}
.sheet{width:2550px;height:3300px;position:relative;background:#fff;overflow:hidden}
.hd{position:absolute;left:150px;right:150px;top:90px;display:flex;justify-content:space-between;align-items:flex-end;border-bottom:8px solid #000080;padding-bottom:18px}
.hd b{font-size:78px;color:#000080;letter-spacing:-2px}.hd span{font-size:40px;color:#444}
.ft{position:absolute;left:150px;right:150px;bottom:70px;display:flex;justify-content:space-between;font-size:34px;color:#666}
.grid{position:absolute;left:150px;right:150px;display:grid;gap:36px;justify-items:center;align-items:center}
.rd{position:relative;border-radius:50%;border:7px dashed #b8b8c8;padding:14px;background:#fff}
.rd .in{width:100%;height:100%;border-radius:50%;display:flex;align-items:center;justify-content:center;padding-bottom:7%;overflow:hidden;position:relative;border:10px solid #000080}
.rd svg{display:block}
.nm{position:absolute;left:50%;bottom:-6px;transform:translateX(-50%);background:#000080;color:#fff;font-weight:bold;white-space:nowrap;border:8px solid #fff;border-radius:14px;box-shadow:0 0 0 6px #b8b8c8}
.pill{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:7px dashed #b8b8c8;padding:16px;background:#fff;width:100%;height:100%}
.pill .in{width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px 18px;border:10px solid #000080}
.pill.hz{padding:0;background:repeating-linear-gradient(45deg,#ffd54a 0 26px,#111 26px 52px)}.pill.hz .in{border:none;margin:20px;width:calc(100% - 40px);height:calc(100% - 40px)}.pill b{display:block;line-height:1.02;font-weight:900}.pill small{display:block;margin-top:10px;line-height:1.15}`;
function sprite(id,w,o){return C.svg(id,w,Object.assign({tall:id!=="nibble"},o||{}))}
function round(d,id,o,name,bg,nameSize){const w=d*(o&&/tux|wizard|chef|grill|cowboy/.test(o.outfit||"")?.6:.7);return`<div class="rd" style="width:${d}px;height:${d}px"><div class="in" style="background:${bg}">${sprite(id,w,o)}</div><div class="nm" style="font-size:${nameSize||44}px;padding:6px 26px">${E(name)}</div></div>`}
function sheet(title,sub,body,gridCss){return`<div class="sheet"><div class="hd"><b>${E(title)}</b><span>${E(sub)}</span></div><div class="grid" style="${gridCss}">${body}</div><div class="ft"><span>C:\\&gt;ConventionalMemory.io_</span><span>Connie and her family are original characters. Cut along the dashes.</span></div></div>`}
const sheets={};
// 1. Connie's wardrobe
const pair={classic:["fl","green","happy"],punk:["shades","black","wink"],skate:["joy","blue","happy"],plaid:["hp","red","wow"],check:["prop","gold","love"],cyber:["headset","purple","wink"],prom:["crown","pink","love"],aerobics:["hp","pink","happy"],sysop:["headset","blue","wow"],hacker:["shades","green","wink"],explorer:["fl","gold","wow"],grunge:["hp","black","oops"]};
sheets["1-connie-looks"]=sheet("CONNIE: THE WARDROBE","12 looks, 1 memory chip",C.LOOK_ORDER.map((l,i)=>{const p=pair[l]||["none","green","happy"];return round(690,"connie",{look:l,acc:p[0],skin:p[1],mood:p[2]},C.LOOKS[l].n,BG[i%6],46)}).join(""),"top:300px;bottom:150px;grid-template-columns:repeat(3,690px);grid-template-rows:repeat(4,690px);align-content:space-between");
// 2. Family
const fam=[["connie","Connie","happy"],["emma","Emma 386","happy"],["hiram","Himmy","happy"],["ram","Raymond (Dad)","happy"],["rhoda","Mom (Read-Only)","happy"],["floyd","Grandpa Floyd","happy"],["winnie","Grandma Winnie","happy"],["augusta","Auntie Autoexec","happy"],["conrad","Uncle Conrad","happy"],["tess","Tessie (TSR)","happy"],["nibble","Nibble","happy"],["dot","Dot Matrix","happy"],["viv","Viv G. Adapter","happy"],["sandy","Sandy Blaster","happy"],["mo","Mo Dem","happy"],["zack","Zack (uninvited)","happy"]];
sheets["2-the-ventional-family"]=sheet("THE VENTIONAL FAMILY","all 16 (the pets have their own sheet)",fam.map((f,i)=>round(560,f[0],{mood:f[2]},f[1],BG[i%6],38)).join(""),"top:300px;bottom:150px;grid-template-columns:repeat(4,560px);grid-template-rows:repeat(4,560px);align-content:space-around;justify-content:space-between");
// 3. Museum jokes: lines from the site (marquee, mascot, About), in a mix of cute and tough
// [title, sub, bg, fg, accent, size(1|2), hazard?]
const SL=[
 ["C:\\>CONVENTIONAL MEMORY_","a museum of old computers","#000080","#fff","#ffd54a",2],
 ["640K IS PLENTY","(it was not)","#ffd54a","#000080","#000080",1],
 ["DOS=HIGH","Hiram says hi","#00a86b","#fff","#fff",1],
 ["PLEASE DO NOT BLOW ON THE CARTRIDGES","We checked. It never worked.","#1c1c22","#ffd54a","#fff",2,1],
 ["THE TURBO BUTTON IS NOT A REAL BUTTON","Press it anyway.","#c0392b","#fff","#ffd54a",2],
 ["BE KIND, REWIND","Be kinder, defrag.","#2f6fe0","#fff","#ffd54a",1],
 ["DID YOU SAVE?","You did not save.","#111","#ff5555","#fff",1],
 ["TRY A DIFFERENT IRQ","If that fails, try a different IRQ.","#556b2f","#fff","#ffd54a",2],
 ["NO DEFRAGMENTING DURING AN EARTHQUAKE","Posted in the aisles.","#e8892f","#111","#111",2,1],
 ["CAUTION: MAY CONTAIN TRACES OF CRT, DUST AND PURE NOSTALGIA","","#ffd54a","#111","#111",2,1],
 ["MIND THE GAP","between your RAM and your ambitions","#d9d9d9","#000080","#c0392b",2],
 ["INSERT DISK 2","Insert disk 3. Insert disk 4.","#d9d9d9","#000080","#000080",1],
 ["ABORT, RETRY, FAIL?","Connie says retry.","#222","#00ff66","#00ff66",2],
 ["WHAT\u2019S IN THE BOX? 640K.","One item cataloged per K.","#000080","#fff","#ffd54a",2],
 ["DOES IT RUN?","Find out.","#111","#fff","#ff9f1c",1],
 ["BASEMENT (STAFF ONLY)","Do not go down there.","#111","#ff9f1c","#ff9f1c",2,1],
 ["BEST VIEWED IN NETSCAPE 3.0","at 800 x 600. Bring a snack.","#1f3b73","#fff","#ffd54a",2],
 ["MODEM SCREAMING","You have 3 unread messages.","#2a2a33","#7fffa0","#fff",2],
 ["TOTALLY TUBULAR","and certified Y2K compliant","#7a4fd0","#fff","#ffd54a",2],
 ["REGISTER TODAY TO UNLOCK THE GOOD LEVELS","Shareware, 1993","#00a86b","#fff","#fff",2],
 ["SUSPICIOUSLY FULL OF \u201cUSEFUL\u201d MATERIAL","Tony\u2019s inventory","#2a1a4a","#ffd54a","#fff",2],
 ["IT WAS AN ACCIDENT","The quest NPC would like a word.","#111","#ff5555","#fff",2,1],
 ["SKIPPED THE TUTORIAL","MegaZeux, 1994","#e8892f","#fff","#111",2],
 ["PLAYER 1 & PLAYER 2: BROTHERS","still on the same team","#00a86b","#fff","#ffd54a",2],
 ["MEGAZEUX GAMES STILL ON DISK: 0","see: old hard drives","#222","#ffd54a","#fff",2],
 ["BROTHERS.SAV","playtime: since forever","#1c1c22","#00ff66","#00ff66",1],
 ["EMM386 WAS HERE","Emma 386 Ventional","#7a4fd0","#fff","#fff",1],
 ["READ-ONLY","Mom said so.","#ff3d9a","#fff","#fff",1],
 ["DO NOT TOUCH MY PINS","Thank you.","#c0392b","#fff","#fff",2],
 ["NOBODY INVITED ZACK","Zack came anyway.","#e8892f","#fff","#fff",2],
 ["TESSIE WAS HERE","And still is.","#2f6fe0","#fff","#ffd54a",1],
 ["CONFIG.SYS WAS HERE","Uncle Conrad approves.","#556b2f","#fff","#ffd54a",2]];
function pill(s){const [t,sub,bg,fg,ac,sz,hz]=s;const f=sz===2?(t.length>30?40:52):74;return`<div class="pill${hz?" hz":""}" style="grid-column:span ${sz===2?2:1}"><div class="in" style="background:${bg};color:${fg}"><b style="font-size:${f}px">${E(t)}</b>${sub?`<small style="font-size:30px;color:${ac}">${E(sub)}</small>`:""}</div></div>`}
function pillSheet(title,sub,list){return sheet(title,sub,list.map(pill).join(""),"top:300px;bottom:150px;grid-template-columns:repeat(4,1fr);grid-auto-flow:dense;grid-auto-rows:292px;align-content:space-between;gap:30px 30px")}
sheets["3-museum-jokes-1"]=pillSheet("MUSEUM JOKES","straight off the marquee",SL.slice(0,16));
sheets["3-museum-jokes-2"]=pillSheet("MORE MUSEUM JOKES","stick them where you pretend to be organized",SL.slice(16,32));
// 4. Big Connies for laptops
const big=[["classic","hp","green","happy","CONNIE"],["punk","shades","black","wink","PUNK CONNIE"],["skate","joy","blue","happy","SKATER"],["cyber","headset","purple","wink","CYBER"],["prom","crown","pink","love","PROM NIGHT"],["sysop","headset","blue","wow","BBS SYSOP"]];
sheets["4-laptop-size-connie"]=sheet("BIG CONNIE","laptop-lid sized (3 in across)",big.map((b,i)=>round(900,"connie",{look:b[0],acc:b[1],skin:b[2],mood:b[3]},b[4],BG[i%6],56)).join(""),"top:300px;bottom:150px;grid-template-columns:repeat(2,900px);grid-template-rows:repeat(3,900px);align-content:space-between;justify-content:space-around");
// 5-6. The guys
function guySheet(id,title,sub,full,textA,textB){const list=C.OUTFIT_ORDER.map((o,i)=>round(560,id,{outfit:o,mood:"happy"},C.OUTFITS[o].n,BG[i%6],42));
 const tb=(t,u,bg,fg)=>`<div class="rd" style="width:560px;height:560px"><div class="in" style="background:${bg};color:${fg};flex-direction:column;text-align:center;padding:40px"><b style="font-size:62px;line-height:1.05;display:block">${E(t)}</b><span style="font-size:32px;margin-top:14px;display:block">${E(u)}</span></div></div>`;
 return sheet(title,sub,list.join("")+tb(textA[0],textA[1],"#111","#ffd54a"),"top:300px;bottom:150px;grid-template-columns:repeat(4,560px);grid-template-rows:repeat(4,560px);align-content:space-around;justify-content:space-between")}
sheets["5-uncle-conrad"]=guySheet("conrad","UNCLE CONRAD FIGSYS","15 outfits, 1 very organized uncle",0,["CONFIG.SYS","has opinions"],["DEVICE=","HIMEM.SYS"]);
sheets["6-raymond"]=guySheet("ram","RAYMOND VENTIONAL","Dad. Reads the manual first.",0,["READ THE MANUAL","first."],["ASK YOUR","MOTHER (READ-ONLY)"]);
const bigGuys=[["conrad","biker","BIKER CONRAD"],["conrad","wizard","BIOS WIZARD"],["conrad","grill","GRILL MASTER"],["ram","garage","GARAGE DAD"],["ram","cowboy","COWPOKE RAY"],["ram","tux","FORMAL RAYMOND"]];
sheets["7-big-guys"]=sheet("BIG UNCLE AND DAD","laptop-lid sized (3 in across)",bigGuys.map((b,i)=>round(900,b[0],{outfit:b[1],mood:"happy"},b[2],BG[(i*2+1)%6],56)).join(""),"top:300px;bottom:150px;grid-template-columns:repeat(2,900px);grid-template-rows:repeat(3,900px);align-content:space-between;justify-content:space-around");
// 8. The pets
const petMoods=["happy","wink","wow","oops","love","sleep"];
const tb2=(t,u,bg,fg)=>`<div class="rd" style="width:560px;height:560px"><div class="in" style="background:${bg};color:${fg};flex-direction:column;text-align:center;padding:40px"><b style="font-size:62px;line-height:1.05;display:block">${E(t)}</b><span style="font-size:32px;margin-top:14px;display:block">${E(u)}</span></div></div>`;
const petList=[];petMoods.forEach((m,i)=>{petList.push(round(560,"mat",{mood:m,tall:0},"Mat the Mouse",BG[i%6],42));petList.push(round(560,"toner",{mood:m,tall:0},"Toner",BG[(i+3)%6],42))});
sheets["8-pets-mat-and-toner"]=sheet("MAT AND TONER","the family pets",petList.slice(0,12).join("")+tb2("CLICK.","(Mat, in full)","#d8cfae","#3a3320")+tb2("WOOF","(smudge)","#1a1a22","#ffd54a")+tb2("640K","no pets were harmed","#000080","#fff")+tb2("LOAD IT HIGH","ask Connie","#38b24a","#fff"),"top:300px;bottom:150px;grid-template-columns:repeat(4,560px);grid-template-rows:repeat(4,560px);align-content:space-around;justify-content:space-between");
// 9-11. Trading cards at 2.5 x 3.5 in (750 x 1050 px), nine to a page, cut on the dashes
const cardCss=fs.readFileSync(path.join(root,"style.css"),"utf8").split("/* trading cards")[1].split("*/").slice(1).join("*/").split(".ab-tcs")[0];
const cs={window:{},localStorage:{getItem(){return null},setItem(){}},document:{},console};vm.createContext(cs);
vm.runInContext(fs.readFileSync(path.join(root,"cast.js"),"utf8")+";window.CMCast=CMCast;this.CMCast=CMCast",cs);
vm.runInContext(fs.readFileSync(path.join(root,"connie.js"),"utf8")+";this.CT=window.CMConnie._t",cs);
const cardsHtml=cs.CT.CARDS.map((c,i)=>cs.CT.cardOf(c,i));
const img=n=>"data:image/png;base64,"+fs.readFileSync(path.join(root,"portraits",n+".png")).toString("base64");
const crew=[["matt","Matt","EXTRA","CREATOR · PLAYER 1",[["Repair",9],["Hoarding",10],["Patience",3],["Ham radio","AMATEUR EXTRA"]],["Soldering Iron","Fix one broken beige box. Then bring home two more."],"There is a cable for that.","No. 1 of 2","#2f6fe0"],["tony","Tony","MAX","MAKER · PLAYER 2",[["Selling",10],["Crafting",9],["Axe control",2],["Skill trees","ALL OF THEM"]],["Locker Black Market","Trade candy, yo-yos or beef jerky for anything."],"I can make that.","No. 2 of 2","#d6322a"]].map(c=>C&&cs.CMCast.card({id:c[0],n:c[1],hp:c[2],type:c[3],art:'<img src="'+img(c[0])+'" alt="">',stats:c[4],move:c[5],flavor:c[6],no:c[7],rar:"RARE",col:c[8]}));
const back=`<div class="tcb"><div class="tcb-in"><small>CONVENTIONAL MEMORY</small><div>${sprite("connie",330,{mood:"happy"})}</div><b>TRADING CARDS</b><small>There is always room for one more.</small></div></div>`;
const cardPage=cells=>`<div class="sheet cardsheet"><div class="cgrid">${cells.map(h=>`<div class="cell">${h}</div>`).join("")}</div></div>`;
const cardExtra=`.cardsheet .cgrid{position:absolute;left:150px;top:75px;display:grid;grid-template-columns:repeat(3,750px);grid-template-rows:repeat(3,1050px)}
.cell{width:750px;height:1050px;outline:2px dashed #b8b8c8;outline-offset:-1px;display:flex;align-items:center;justify-content:center;overflow:hidden;background:#fff}
.cell .tc{zoom:3;width:250px;height:350px;box-shadow:none;border-radius:10px;display:flex;flex-direction:column;border-width:7px}.cell .tc-art{height:auto;flex:1;min-height:0}.cell .tc-art svg{height:94%;width:auto;max-height:none}.cell .tc-art img{height:100%}
.tcb{width:750px;height:1050px;padding:45px;background:#fff}.tcb-in{width:100%;height:100%;border:18px solid #e0a526;border-radius:34px;background:radial-gradient(circle at 50% 38%,#4a4ac0,#000080);color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:space-around;text-align:center;padding:30px}.tcb-in small{font-size:34px;letter-spacing:.12em}.tcb-in b{font-size:84px;color:#ffd54a;letter-spacing:.05em}`;
const cardSheets={"9-trading-cards-1":cardPage(cardsHtml.slice(0,9)),"9-trading-cards-2":cardPage(cardsHtml.slice(9,18)),"9-trading-cards-3-creators-and-backs":cardPage(crew.concat([back,back,back,back,back,back,back]))};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:2550,height:3300}});
 for(const k of Object.keys(sheets).concat(Object.keys(cardSheets))){await p.setContent("<style>"+css+cardCss+cardExtra+"</style>"+(sheets[k]||cardSheets[k]));await p.waitForTimeout(150);await (await p.$(".sheet")).screenshot({path:path.join(out,"conventional-memory-stickers-"+k+".png")});console.log("wrote",k)}
 await b.close()})();
