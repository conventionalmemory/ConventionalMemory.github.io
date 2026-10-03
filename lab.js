/* Lab pages for ConventionalMemory.io, loaded on demand (loadLab in app.js).
   #/runs   Does it run?   #/bench  Benchmark wall   #/advisor  What next?   #/hunt  Swap-meet mode
   #/rigs and #/walk live in lab2.js (loaded from here). Everything runs in the browser. */
(function(){
"use strict";
var app;
function $(s,r){return(r||app).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||app).querySelectorAll(s))}
function E(s){return esc(String(s==null?"":s))}
function ld(k,d){try{var v=JSON.parse(localStorage.getItem(k)||"null");return v&&typeof v==="object"?v:d}catch(e){return d}}
function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function back(){return'<p class="noprint"><a class="btn" href="#/more">Site map</a> <a class="btn" href="#/">Home</a></p>'}
function tlHref(t){var r=TL.filter(function(z){return z[2]===t})[0];return r?"#/timeline/"+String(r[0]).slice(0,4)+"/"+encodeURIComponent(t):"#/timeline"}

/* ------------------------------------------------------------------ Does it run? */
var RN={mode:"machine",rig:null,q:"",genre:"",game:"",cust:{cls:5,mhz:200,ram:32,vram:4}};
function museumRigs(){return ITEMS.map(gxParseItemRig).filter(Boolean)}
function gameList(){var o=[];Object.keys(GX).forEach(function(t){var x=GX[t];if(x.n&&(x.n.cls!=null||x.n.mhz!=null||x.n.ramMB!=null))o.push({t:t,x:x})});return o}
function evalRig(R,games){var run=[],ok=[],no=[],nodata=0;games.forEach(function(g){var a=gxMeets(R,g.x.n);if(a.ok===null){nodata++;return}if(a.ok){var b=g.x.m?gxMeets(R,g.x.m):null;(b&&b.ok?run:ok).push(g)}else no.push({g:g,miss:a.miss})});return{run:run,ok:ok,no:no,nodata:nodata}}
function debutYear(g){var d=gxDebut(g.x);return d?String(d[1]).slice(0,4):""}
function savedRigs(){var l=[];try{l=(JSON.parse(localStorage.getItem("cm-rigs"))||{}).l||[]}catch(e){}return l.filter(function(x){return x&&x.r&&isFinite(x.r.cls)}).map(function(x){return{n:"Dream rig: "+String(x.n).slice(0,40),y:"",cls:+x.r.cls,mhz:+x.r.mhz,ram:+x.r.ram,vram:+x.r.vram}})}
function allRigs(){var mus=museumRigs(),c=RN.cust;return{pre:GXRIGS,mus:mus,sav:savedRigs(),cust:{n:"Custom rig",y:"",cls:+c.cls,mhz:+c.mhz,ram:+c.ram,vram:+c.vram}}}
function curRig(){var A=allRigs(),k=RN.rig;if(k==="c")return A.cust;if(k&&k.charAt(0)==="m"){var m=A.mus[+k.slice(1)];if(m)return m}if(k&&k.charAt(0)==="p"){var p=A.pre[+k.slice(1)];if(p)return p}if(k&&k.charAt(0)==="s"){var q=A.sav[+k.slice(1)];if(q)return q}return A.mus.length?A.mus[0]:A.pre[5]}
function verdict(R,g){var a=gxMeets(R,g.x.n);if(a.ok===null)return{k:"nodata",l:"No numbers on file",c:"nd"};if(!a.ok)return{k:"no",l:"Short: "+a.miss.join("; "),c:"no"};var b=g.x.m?gxMeets(R,g.x.m):null;return b&&b.ok?{k:"great",l:"Runs well",c:"ok"}:{k:"min",l:"Runs, minimum",c:"mid"}}
function runs(arg){
 if(arg&&/^[a-z0-9-]+$/.test(arg)){var mu=museumRigs();for(var i=0;i<mu.length;i++)if(mu[i].item===arg){RN.rig="m"+i;RN.mode="machine"}}
 var games=gameList();
 function genres(){var g={};games.forEach(function(x){if(x.x.g)g[x.x.g]=(g[x.x.g]||0)+1});return Object.keys(g).sort()}
 function tabs(){return'<div class="esw" role="tablist" aria-label="Mode">'+[["machine","Machine to games"],["game","Game to machines"],["matrix","Collection matrix"]].map(function(t){return'<button type="button" class="chip'+(RN.mode===t[0]?" on":"")+'" data-m="'+t[0]+'" role="tab" aria-selected="'+(RN.mode===t[0])+'">'+t[1]+'</button>'}).join("")+'</div>'}
 function rigSelect(R){var A=allRigs();return'<label>Machine <select id="rr">'+(A.mus.length?'<optgroup label="In the museum">'+A.mus.map(function(r,i){return'<option value="m'+i+'"'+(R===r?" selected":"")+'>'+E(r.n)+' ('+gxRam(r.ram)+', '+r.mhz+' MHz)</option>'}).join("")+'</optgroup>':"")+(A.sav.length?'<optgroup label="My dream rigs">'+A.sav.map(function(r,i){return'<option value="s'+i+'"'+(R===r?" selected":"")+'>'+E(r.n)+' ('+gxRam(r.ram)+', '+r.mhz+' MHz)</option>'}).join("")+'</optgroup>':"")+'<optgroup label="Typical high-end PC of the year">'+A.pre.map(function(r,i){return'<option value="p'+i+'"'+(R===r?" selected":"")+'>'+E(r.n)+'</option>'}).join("")+'</optgroup><option value="c"'+(R===A.cust?" selected":"")+'>Custom rig...</option></select></label>'}
 function custForm(){var c=RN.cust;return'<p class="gxrig"><label>CPU <select id="rc">'+Object.keys(GXCLS).map(function(k){return'<option value="'+k+'"'+(+c.cls===+k?" selected":"")+'>'+E(GXCLS[k])+'</option>'}).join("")+'</select></label> <label>MHz <input id="rm" type="number" min="4" max="3000" value="'+c.mhz+'" class="mx-n"></label> <label>RAM (MB) <input id="ra" type="number" min="0.25" max="1024" step="0.25" value="'+c.ram+'" class="mx-n"></label> <label>Video MB <input id="rv" type="number" min="0.25" max="256" step="0.25" value="'+c.vram+'" class="mx-n"></label></p>'}
 function machineView(){var R=curRig(),res=evalRig(R,games.filter(function(g){return(!RN.genre||g.x.g===RN.genre)&&(!RN.q||g.t.toLowerCase().indexOf(RN.q.toLowerCase())>=0)})),total=res.run.length+res.ok.length+res.no.length;
  var li=function(g,extra){return'<li><a href="'+tlHref(g.t)+'">'+E(g.t)+'</a> <small class="tn">'+E(debutYear(g))+(g.x.g?" &middot; "+E(g.x.g):"")+(extra?" &middot; "+E(extra):"")+'</small></li>'};
  var pct=total?Math.round((res.run.length+res.ok.length)*100/total):0;
  return'<div class="runs-top">'+rigSelect(R)+' <label>Genre <select id="rg"><option value="">Any</option>'+genres().map(function(g){return'<option'+(RN.genre===g?" selected":"")+'>'+E(g)+'</option>'}).join("")+'</select></label> <label>Search <input id="rq" type="search" value="'+E(RN.q)+'" placeholder="Doom, Myst..."></label></div>'+(R===allRigs().cust?custForm():"")
   +'<div class="runs-hero"><b>'+pct+'%</b><span>of the '+total+' games with numbers on file will run on <b>'+E(R.n)+'</b> ('+E(GXCLS[R.cls]||"")+', '+R.mhz+' MHz, '+E(gxRam(R.ram))+')</span>'+(res.run.length+res.ok.length?'<button class="btn pri noprint" id="rpick" type="button">Pick one for tonight</button>':"")+'</div><p id="rout" class="runs-pick" aria-live="polite"></p>'
   +'<div class="gxstats"><div><h4>Runs well ('+res.run.length+')</h4><p class="tn">Meets the recommended specs.</p><ol>'+res.run.map(function(g){return li(g)}).join("")+'</ol></div><div><h4>Runs, minimum ('+res.ok.length+')</h4><p class="tn">Meets the minimum only.</p><ol>'+res.ok.map(function(g){return li(g)}).join("")+'</ol></div><div><h4>Not yet ('+res.no.length+')</h4><p class="tn">What is short.</p><ol>'+res.no.map(function(x){return li(x.g,x.miss.join("; "))}).join("")+'</ol></div></div>'
   +'<p class="tn">'+res.nodata+' games have too little data to check. About half the requirements come from general knowledge, so treat this as a guide.</p>'}
 function gameView(){var dl='<datalist id="gdl">'+games.map(function(g){return'<option value="'+E(g.t)+'">'}).join("")+'</datalist>',cur=games.filter(function(g){return g.t===RN.game})[0];
  var h='<p><label>Game <input id="gq" list="gdl" value="'+E(RN.game)+'" placeholder="Start typing a game" size="34" autocomplete="off"></label> <button class="btn" id="grnd" type="button">Random game</button></p>'+dl;
  if(!cur)return h+'<p class="tn">Pick any of the '+games.length+' games with requirements on file to see which machines can run it.</p>';
  var A=allRigs(),rows=A.mus.map(function(r){return{r:r,v:verdict(r,cur),mus:1}}).concat(A.pre.map(function(r){return{r:r,v:verdict(r,cur)}})),first=gxFirstRig(cur.x.n);
  return h+'<div class="runs-hero"><b>'+E(cur.t)+'</b><span>'+E(cur.x.g||"")+(cur.x.n.os?' &middot; '+E(cur.x.n.os):"")+' &middot; first on PC '+E(debutYear(cur))+(first?'. The earliest typical PC that runs it: <b>'+E(first.n)+'</b>.':'.')+' <a href="'+tlHref(cur.t)+'">Open its timeline entry</a></span></div>'+(typeof gxReqTable==="function"?gxReqTable(cur.x):"")
   +'<div class="mx-wrap"><table class="ctab"><thead><tr><th>Machine</th><th>CPU / RAM</th><th>Verdict</th></tr></thead><tbody>'+rows.map(function(x){return'<tr class="rv-'+x.v.c+'"><td>'+(x.mus?'<a href="#/item/'+E(x.r.item)+'">'+E(x.r.n)+'</a> <small class="tn">museum</small>':E(x.r.n))+'</td><td>'+E(GXCLS[x.r.cls]||"")+', '+x.r.mhz+' MHz, '+E(gxRam(x.r.ram))+'</td><td><span class="gxfit '+(x.v.c==="ok"||x.v.c==="mid"?"ok":x.v.c==="no"?"no":"")+'">'+E(x.v.l)+'</span></td></tr>'}).join("")+'</tbody></table></div>'}
 function matrixView(){var mus=museumRigs();if(!mus.length)return'<p class="empty">No museum machine has a CPU speed and RAM on file yet. Add them to an item\'s specs and it appears here.</p>';
  return'<p class="tn">Every museum machine with a CPU and RAM on file, against every game with requirements.</p><div class="mx-wrap"><table class="ctab"><thead><tr><th>Machine</th><th>Runs well</th><th>Minimum</th><th>Not yet</th><th>Best match</th></tr></thead><tbody>'+mus.map(function(r){var e=evalRig(r,games),top=e.run.concat(e.ok).sort(function(a,b){return debutYear(b)-debutYear(a)}).slice(0,3);return'<tr><td><a href="#/item/'+E(r.item)+'">'+E(r.n)+'</a></td><td>'+e.run.length+'</td><td>'+e.ok.length+'</td><td>'+e.no.length+'</td><td>'+top.map(function(g){return'<a href="'+tlHref(g.t)+'">'+E(g.t)+'</a>'}).join(", ")+'</td></tr>'}).join("")+'</tbody></table></div>'}
 function draw(){app.innerHTML='<section class="runs"><h2>Does it run?</h2><p>Pick a machine and see which of the '+games.length+' games on file will run on it, or pick a game and see which machines can play it. Uses minimum and recommended CPU, RAM and video memory.</p>'+tabs()+(RN.mode==="machine"?machineView():RN.mode==="game"?gameView():matrixView())+back()+'</section>';wire()}
 function wire(){$$("[data-m]").forEach(function(b){b.onclick=function(){RN.mode=b.dataset.m;draw()}});
  var rr=$("#rr");if(rr)rr.onchange=function(){RN.rig=rr.value;draw()};var rg=$("#rg");if(rg)rg.onchange=function(){RN.genre=rg.value;draw()};
  var rq=$("#rq");if(rq)rq.oninput=function(){RN.q=rq.value;var p=rq.selectionStart;draw();var n=$("#rq");n.focus();try{n.setSelectionRange(p,p)}catch(e){}};
  ["rc:cls","rm:mhz","ra:ram","rv:vram"].forEach(function(s){var p=s.split(":"),el=$("#"+p[0]);if(el)el.onchange=function(){RN.cust[p[1]]=+el.value||RN.cust[p[1]];draw()}});
  var pk=$("#rpick");if(pk)pk.onclick=function(){var R=curRig(),e=evalRig(R,games.filter(function(g){return(!RN.genre||g.x.g===RN.genre)})),pool=e.run.length?e.run:e.ok;if(!pool.length)return;var g=pool[Math.floor(Math.random()*pool.length)];$("#rout").innerHTML='Tonight: <a href="'+tlHref(g.t)+'"><b>'+E(g.t)+'</b></a> <small class="tn">'+E(debutYear(g))+(g.x.g?" &middot; "+E(g.x.g):"")+(typeof gxQuip==="function"?" &middot; "+E(gxQuip(g.x.g)):"")+'</small>'};
  var gq=$("#gq");if(gq)gq.onchange=function(){RN.game=gq.value;draw()};var gr=$("#grnd");if(gr)gr.onclick=function(){RN.game=games[Math.floor(Math.random()*games.length)].t;draw()}}
 if(!RN.rig){var mu2=museumRigs();RN.rig=mu2.length?"m0":"p5"}
 draw()}

/* ------------------------------------------------------------------ Benchmark wall */
var BTESTS=[["Quake timedemo1, 640x480","fps",1],["Doom timedemo (demo3)","fps",1],["3DMark99 Max","marks",1],["3DMark2000","marks",1],["Winstone 98","score",1],["Norton SI (System Information)","index",1],["CDMark","KB/s",1],["Cold boot to desktop","seconds",0],["Disk read (CompactFlash or HDD)","MB/s",1],["Battery life","hours",1]];
function benchOf(it){return(it.bench||[]).filter(function(b){return b&&b.t&&isFinite(+b.v)})}
function benchGroups(){var g={};ITEMS.forEach(function(it){benchOf(it).forEach(function(b){var k=String(b.t).trim().toLowerCase(),o=g[k]||(g[k]={t:b.t,u:b.u||"",hi:b.hi!==false,rows:[]});o.rows.push({it:it,v:+b.v,n:b.n||""})})});Object.keys(g).forEach(function(k){g[k].rows.sort(function(a,b){return g[k].hi?b.v-a.v:a.v-b.v})});return g}
function benchBars(rows,u,hi,cur){var mx=Math.max.apply(null,rows.map(function(r){return r.v}))||1,mn=Math.min.apply(null,rows.map(function(r){return r.v}))||1;
 return'<div class="bw">'+rows.map(function(r,i){var w=hi?r.v/mx*100:(mn/r.v)*100;return'<a class="bw-r'+(cur&&r.it===cur?" me":"")+'" href="#/item/'+E(r.it.id)+'"><span class="bw-n"><b>'+(i+1)+'.</b> '+E(r.it.name)+'</span><i class="bw-b"><em style="width:'+Math.max(3,w).toFixed(1)+'%"></em></i><span class="bw-v">'+E(r.v)+(u?" "+E(u):"")+'</span></a>'}).join("")+'</div>'}
window.benchSec=function(it){var mine=benchOf(it);if(!mine.length)return"";var G=benchGroups();
 return'<h3 class="sub">Benchmarks</h3>'+mine.map(function(b){var g=G[String(b.t).trim().toLowerCase()];if(!g)return"";var rank=g.rows.findIndex(function(r){return r.it===it})+1;return'<div class="bwc"><b>'+E(b.t)+'</b> <small class="tn">'+E(b.v)+(b.u?" "+E(b.u):"")+(g.rows.length>1?" &middot; #"+rank+" of "+g.rows.length+" in the museum":"")+(b.n?" &middot; "+E(b.n):"")+'</small>'+(g.rows.length>1?benchBars(g.rows,g.u,g.hi,it):"")+'</div>'}).join("")+'<p class="tn"><a href="#/bench">Open the benchmark wall</a></p>'};
function bench(arg){var G=benchGroups(),ks=Object.keys(G).sort(function(a,b){return G[b].rows.length-G[a].rows.length}),cur=arg&&G[decodeURIComponent(arg).toLowerCase()]?decodeURIComponent(arg).toLowerCase():ks[0];
 var h='<section class="bench"><h2>Benchmark wall</h2><p>Real results from the machines in the museum, ranked. Higher bars are better, except for tests where lower is better (the bar is flipped so a longer bar is still the winner).</p>';
 if(!ks.length)h+='<div class="empty"><p>No results recorded yet.</p><p class="tn">Add them in Admin: open an item, find <b>Benchmarks</b> and add lines like <code>Quake timedemo1, 640x480 | 23.4 | fps</code>. Add <code>| lower</code> for tests where a smaller number wins, and a note after that. Good starting tests: '+BTESTS.map(function(t){return E(t[0])}).join("; ")+'.</p></div>';
 else{h+='<div class="esw" role="tablist" aria-label="Test">'+ks.map(function(k){return'<button type="button" class="chip'+(k===cur?" on":"")+'" data-t="'+E(k)+'" role="tab" aria-selected="'+(k===cur)+'">'+E(G[k].t)+' <b>'+G[k].rows.length+'</b></button>'}).join("")+'</div>';
  var g=G[cur];h+='<h3 class="sub">'+E(g.t)+(g.u?' <small class="tn">'+E(g.u)+(g.hi?", higher is better":", lower is better")+'</small>':"")+'</h3>'+benchBars(g.rows,g.u,g.hi)+'<p class="tn">'+g.rows.length+' machine'+(g.rows.length===1?"":"s")+' tested. Measured on the real hardware; see each item for the test setup.</p>'}
 app.innerHTML=h+back()+'</section>';$$("[data-t]").forEach(function(b){b.onclick=function(){location.hash="#/bench/"+encodeURIComponent(b.dataset.t)}})}

/* ------------------------------------------------------------------ What next? (advisor) */
function hay(it){return(it.name+" "+(it.maker||"")+" "+(it.model||"")+" "+(it.cat||"")+" "+(it.type||"")+" "+(it.tags||[]).join(" ")+" "+Object.keys(it.specs||{}).map(function(k){return it.specs[k]}).join(" ")).toLowerCase()}
var GAPS=[
 {id:"286",t:"A 286 or 386 desktop",why:"The first machines that could run a real multitasking OS. Fills the gap before the 486.",re:/\b(286|386)\b/,q:"386 desktop computer vintage",tip:"Check the CMOS battery for leakage and test the PSU before powering on."},
 {id:"486",t:"A 486 desktop",why:"The sweet spot for DOS gaming and early Windows 95.",re:/\b486\b/,not:/laptop|notebook|libretto|lte/,q:"486 desktop computer vintage",tip:"Look for the Barnacle-style battery corrosion near the keyboard connector."},
 {id:"p1",t:"A Pentium-class desktop",why:"Win95-era gaming, MMX and early 3D accelerators.",re:/pentium(?! (ii|iii|4|pro))|\bp5\b|mmx/,not:/laptop|notebook|libretto|lte|satellite/,q:"pentium mmx desktop vintage pc",tip:"Ask for photos of the inside; many have leaking capacitors."},
 {id:"p3",t:"A Pentium III or Athlon desktop",why:"The last great Win98 gaming generation.",re:/pentium (iii|3)|athlon|slot 1|socket a/,q:"pentium 3 desktop vintage pc",tip:"Slot 1 CPUs need their retention bracket."},
 {id:"crt",t:"A good CRT monitor",why:"Every machine here looks better on a real VGA CRT.",re:/crt|monitor|trinitron|multiscan/,cat:/monitor/,q:"vintage crt monitor vga",tip:"Heavy: local pickup beats shipping."},
 {id:"snd",t:"A Roland Sound Canvas or MT-32",why:"The sound General MIDI games were written for.",re:/sc-55|sc-88|sound canvas|mt-32|cm-32|tg100|tg300/,q:"roland sc-55 sound canvas",tip:"Check for the rear MIDI ports and a working display."},
 {id:"gus",t:"A Gravis UltraSound",why:"The demoscene's favourite wavetable card.",re:/ultrasound|\bgus\b/,q:"gravis ultrasound isa",tip:"Boxed cards with the manual are far more valuable."},
 {id:"adl",t:"An AdLib or Sound Blaster Pro",why:"The cards that defined PC game music before the SB16.",re:/adlib|sound blaster (pro|2)/,q:"adlib sound card isa",tip:"Look for the gold card edge being clean, not tarnished."},
 {id:"joy",t:"A joystick or gamepad for DOS",why:"Flight sims and arcade ports need one.",re:/joystick|flightstick|thrustmaster|gravis (gamepad|phoenix)|gamepad/,q:"ch flightstick joystick pc game port",tip:"Game port, 15-pin, not USB."},
 {id:"mod",t:"A dial-up modem",why:"The sound of the 90s, and BBS and early internet history.",re:/modem|56k|v\.90/,q:"us robotics sportster modem",tip:"External serial modems need a null-modem-free serial cable."},
 {id:"zip",t:"A Zip or Jaz drive",why:"The removable media everyone had in 1997.",re:/\bzip\b|\bjaz\b|iomega/,q:"iomega zip 100 drive",tip:"Click of death: ask whether it reads cartridges."},
 {id:"cdr",t:"A SCSI or early CD-ROM drive",why:"Where multimedia started.",re:/cd-rom|cdrom|scsi/,q:"vintage scsi cd-rom drive",tip:"Check for the tray belt: a common failure."},
 {id:"mac",t:"A classic Macintosh or PowerBook",why:"The main alternative platform of the era.",re:/macintosh|powerbook|imac|power mac/,q:"vintage macintosh powerbook",tip:"PowerBook batteries and backlights often fail."},
 {id:"ami",t:"A Commodore Amiga",why:"The demo and game machine that lost to the PC.",re:/amiga/,q:"commodore amiga 500 computer",tip:"Recap the board; check the Agnus and the keyboard."},
 {id:"c64",t:"A Commodore 64",why:"The best-selling single computer model of its time.",re:/commodore 64|\bc64\b/,q:"commodore 64 computer",tip:"Check the PSU brick; early ones are known to fail."},
 {id:"nes",t:"An NES or Famicom",why:"The console that restarted home gaming.",re:/\bnes\b|famicom|nintendo entertainment/,q:"nintendo nes console",tip:"The 72-pin connector is the usual fault."},
 {id:"snes",t:"A Super Nintendo",why:"The 16-bit generation's anchor.",re:/super nintendo|\bsnes\b|super famicom/,q:"super nintendo console",tip:"Yellowing plastic is cosmetic; test the CIC chip with a game."},
 {id:"gb",t:"A Game Boy (original or Color)",why:"The best-selling handheld line.",re:/game ?boy/,q:"nintendo game boy dmg",tip:"Screen lines are common; check the speaker and link port."},
 {id:"n64",t:"A Nintendo 64",why:"Early 3D console gaming.",re:/nintendo 64|\bn64\b/,q:"nintendo 64 console",tip:"Check the expansion pak and the controller stick wear."},
 {id:"ps1",t:"A PlayStation 1",why:"The disc-era console that took over.",re:/playstation(?! ?[2-5])|\bpsx\b|\bps1\b/,q:"sony playstation 1 console scph",tip:"Laser drift and disc read errors are the common fault."},
 {id:"dc",t:"A Sega Dreamcast",why:"The last Sega console, ahead of its time.",re:/dreamcast/,q:"sega dreamcast console",tip:"Check the GD-ROM drive and the VMU slot."},
 {id:"cam",t:"An early digital camera",why:"The 1990s turning point from film.",re:/mavica|quicktake|dc40|cyber-shot|digital camera/,q:"vintage digital camera 1990s",tip:"Check battery doors and card slots."},
 {id:"pda",t:"A palmtop or PDA",why:"Pocket computing before smartphones.",re:/palm|pda|palmtop|200lx|psion|newton|handheld pc/,q:"vintage palmtop pda",tip:"Check the hinge on clamshells."}];
function owned(rule,items){return items.filter(function(it){var h=hay(it);if(rule.cat&&rule.cat.test(String(it.cat||"").toLowerCase()))return true;return rule.re.test(h)&&!(rule.not&&rule.not.test(h))})}
function ebay(q){return"https://www.ebay.com/sch/i.html?_nkw="+encodeURIComponent(q)+"&LH_Sold=0"}
function sgw(q){return"https://shopgoodwill.com/categories/listing?st="+encodeURIComponent(q)}
function advisor(){var H=ld("cm-hunt",{want:[]}),all=ALLITEMS.slice();
 var gaps=GAPS.map(function(g){return{g:g,own:owned(g,all)}}),open=gaps.filter(function(x){return!x.own.length}),have=gaps.filter(function(x){return x.own.length});
 // timeline-linked next steps from live items
 var seen={},links=[];ITEMS.forEach(function(it){var r=typeof tlRowOfItem==="function"?tlRowOfItem(it):null;if(!r)return;tlLinks(r[2]).forEach(function(l){if(tlOwn(l[0])||seen[l[0]])return;var row=TL.filter(function(z){return z[2]===l[0]})[0];if(!row||!/^(hw|sw|gt|gn|gc|pe)$/.test(row[1]))return;seen[l[0]]=1;links.push({r:row,rel:l[1],from:it})})});
 // score: era proximity to owned items' years
 var yrs=all.map(function(i){return i.year}).filter(Boolean),mid=yrs.length?yrs.sort(function(a,b){return a-b})[Math.floor(yrs.length/2)]:1996;
 var eraOf={"286":1988,"486":1993,p1:1996,p3:1999,crt:1996,snd:1993,gus:1994,adl:1991,joy:1994,mod:1996,zip:1997,cdr:1994,mac:1994,ami:1988,c64:1984,nes:1987,snes:1993,gb:1992,n64:1997,ps1:1996,dc:1999,cam:1997,pda:1996,"386":1990};
 function wt(x){var y=eraOf[x.g.id]||1995;var b=100-Math.min(60,Math.abs(y-mid)*6);var s=0;all.forEach(function(it){var h=hay(it);if(x.g.q.split(" ").some(function(w){return w.length>3&&h.indexOf(w)>=0}))s+=5});return b+s}
 open.sort(function(a,b){return wt(b)-wt(a)});
 function card(x,i){var g=x.g,inl=H.want.indexOf(g.id)>=0;return'<div class="adv"><span class="adv-n">'+(i+1)+'</span><div><b>'+E(g.t)+'</b><p>'+E(g.why)+'</p><p class="tn"><b>Watch for:</b> '+E(g.tip)+'</p><p class="noprint"><a class="btn" href="'+E(ebay(g.q))+'" target="_blank" rel="noopener noreferrer">Search eBay</a> <a class="btn" href="'+E(sgw(g.q))+'" target="_blank" rel="noopener noreferrer">Search ShopGoodwill</a> <button class="btn'+(inl?" pri":"")+'" data-w="'+g.id+'" type="button">'+(inl?"On my hunt list":"Add to hunt list")+'</button></p></div></div>'}
 var we=wantedExtras();
 app.innerHTML='<section class="advp"><h2>What next?</h2><p>Reads the collection, finds the gaps, and suggests what to hunt for next. Three kinds of advice: milestones the collection does not have yet, accessories you already want, and what the timeline says goes with things you own. Searches open eBay and ShopGoodwill in a new tab; nothing is bought from here.</p>'
  +'<h3 class="sub">Top picks</h3>'+(open.length?open.slice(0,3).map(card).join(""):'<p class="empty">Every milestone on the list is covered. Nice.</p>')
  +(we.length?'<h3 class="sub">Completes what you have ('+we.length+')</h3>'+we.slice(0,8).map(function(w){return'<div class="adv"><span class="adv-n">+</span><div><b>'+E(w.x.n)+'</b> <small class="tn">for <a href="#/item/'+E(w.it.id)+'">'+E(w.it.name)+'</a>'+(w.x.note?" &middot; "+E(w.x.note):"")+'</small><p class="noprint"><a class="btn" href="'+E(ebay(w.x.n+" "+w.it.name))+'" target="_blank" rel="noopener noreferrer">Search eBay</a> <a class="btn" href="'+E(sgw(w.x.n+" "+w.it.name))+'" target="_blank" rel="noopener noreferrer">ShopGoodwill</a></p></div></div>'}).join(""):"")
  +(links.length?'<h3 class="sub">What the timeline connects to your items</h3><div class="evl">'+links.slice(0,10).map(function(x){return'<a class="evr" href="'+tlHref(x.r[2])+'"><i>'+(typeof pxRow==="function"?pxRow(x.r,16):"")+'</i><span class="evd">'+E(String(x.r[0]).slice(0,4))+'</span><b>'+E(x.r[2])+'</b><small>'+E(x.rel)+' of '+E(x.from.name)+'</small></a>'}).join("")+'</div>':"")
  +'<h3 class="sub">More milestones ('+Math.max(0,open.length-3)+' open, '+have.length+' covered)</h3>'+open.slice(3).map(card).join("")
  +(have.length?'<details class="dfold"><summary><b>Already covered</b> <small>'+have.length+' milestones</small></summary><ul>'+have.map(function(x){return'<li>'+E(x.g.t)+' <small class="tn">'+x.own.slice(0,2).map(function(i){return E(i.name)}).join(", ")+'</small></li>'}).join("")+'</ul></details>':"")
  +'<p class="tn">Milestones are a general guide to a well-rounded 1980s to early 2000s collection, not market advice. Watch-for tips are general; always ask a seller for photos and a test video.</p>'+back()+'</section>';
 $$("[data-w]").forEach(function(b){b.onclick=function(){var h=ld("cm-hunt",{want:[]}),i=h.want.indexOf(b.dataset.w);if(i>=0)h.want.splice(i,1);else h.want.push(b.dataset.w);sv("cm-hunt",h);advisor()}})}

/* ------------------------------------------------------------------ Swap-meet mode */
function hunt(){var H=ld("cm-hunt",{want:[],ceil:{}}),M=ld("cm-mine",{});if(!H.want)H.want=[];if(!H.ceil)H.ceil={};
 var items=ALLITEMS;
 function mineHas(it){var m=M["i:"+it.id];return m?m.s:""}
 function find(q){q=q.toLowerCase().trim();if(q.length<2)return[];var w=q.split(/\s+/);return items.filter(function(it){var h=(hay(it)+" "+(it.upc||"")+" "+(it.partno||"")).toLowerCase();return w.every(function(x){return h.indexOf(x)>=0})}).slice(0,6)}
 function card(it){var qty=it.qty||1,mine=mineHas(it),acc=(it.extras||[]).filter(function(x){var s=exStat(x);return s==="Want"||s==="Missing"});
  return'<div class="hq-c yes"><b class="hq-y">YOU OWN THIS</b><h3>'+E(it.name)+'</h3><p>'+E((it.maker||"")+(it.year?" \u00b7 "+it.year:""))+' &middot; '+qty+' in the museum'+(it.draft?' <small class="tn">(unpublished)</small>':"")+(it.cond?" &middot; "+E(String(it.cond).slice(0,70)):"")+(it.works?" &middot; "+E(it.works):"")+'</p>'+(mine?'<p class="tn">Also on your own list as: '+E(mine)+'</p>':"")
   +(acc.length?'<p><b>Still wanted for it:</b> '+acc.map(function(x){return E(x.n)}).join(", ")+'</p>':"")+(it.draft?"":'<p><a href="#/item/'+E(it.id)+'">Open the page</a></p>')+'</div>'}
 function none(q){return'<div class="hq-c no"><b class="hq-n">NOT IN THE MUSEUM</b><h3>'+E(q)+'</h3><p>Looks new to the collection. Check the timeline and the price before buying.</p><p><a class="btn" href="#/search/'+encodeURIComponent(q)+'">Search the timeline</a> <button class="btn pri" id="hwant" type="button">Add to my hunt list</button></p></div>'}
 function draw(keep){var wants=H.want.filter(function(w){return w.indexOf&&w.charAt&&w.length>1});
  var wl=we2();
  app.innerHTML='<section class="hunt"><h2>Swap-meet mode</h2><p class="tn">Built for standing at a table with bad signal. Type a name, part number or barcode. It works offline once the museum has loaded once.</p>'
   +'<p><input id="hq" class="hq-in" type="search" inputmode="search" placeholder="What is on the table?" autocomplete="off" aria-label="Search" value="'+E(keep||"")+'"></p>'
   +'<p class="noprint"><label class="tn">Barcode <input id="hu" class="mx-n" inputmode="numeric" placeholder="UPC" size="14"></label> <button class="btn" id="hsc" type="button" hidden>Scan with camera</button> <span class="tn" id="hsm" role="status"></span></p><video id="hvid" playsinline muted hidden class="hq-v"></video>'
   +'<div id="hres" aria-live="polite"></div>'
   +'<h3 class="sub">Is the price OK?</h3><p><label>Asking $ <input id="hp" class="mx-n" type="number" min="0" step="0.01" inputmode="decimal"></label> <label>My ceiling $ <input id="hc" class="mx-n" type="number" min="0" step="0.01" inputmode="decimal"></label> <b id="hv" class="hq-v2" role="status"></b></p>'
   +'<h3 class="sub">My hunt list</h3>'+(wl.length?'<ul class="hq-l">'+wl.map(function(w){return'<li><b>'+E(w.n)+'</b> <small class="tn">'+E(w.s)+'</small> <label class="tn">max $<input data-c="'+E(w.k)+'" class="mx-n" type="number" min="0" step="1" inputmode="numeric" value="'+E(H.ceil[w.k]||"")+'"></label></li>'}).join("")+'</ul>':'<p class="tn">Nothing yet. Add things from <a href="#/advisor">What next?</a>, or from the museum wanted list below.</p>')+'<p class="tn">The list and ceilings stay on this device.</p>'+back()+'</section>';wire()}
 function we2(){var out=[];wantedExtras().forEach(function(w){out.push({k:"x:"+w.x.n,n:w.x.n,s:"for "+w.it.name})});(typeof WANTED!=="undefined"?WANTED:[]).filter(function(w){return!w.sample}).forEach(function(w){out.push({k:"w:"+w.name,n:w.name,s:w.priority||"wanted"})});H.want.forEach(function(id){var g=GAPS.filter(function(x){return x.id===id})[0];if(g)out.push({k:"g:"+id,n:g.t,s:"milestone"});else if(/^c:/.test(id))out.push({k:id,n:id.slice(2),s:"added by you"})});return out}
 function wire(){var hq=$("#hq"),hres=$("#hres");
  function go(){var q=hq.value;if(q.trim().length<2){hres.innerHTML="";return}var r=find(q);hres.innerHTML=r.length?r.map(card).join(""):none(q);var hw=$("#hwant");if(hw)hw.onclick=function(){var k="c:"+q.trim();if(H.want.indexOf(k)<0)H.want.push(k);sv("cm-hunt",H);draw(q);go()}}
  hq.oninput=go;if(hq.value)go();
  var hu=$("#hu");hu.onchange=function(){var v=hu.value.replace(/\D/g,"");if(!v)return;var r=items.filter(function(i){return i.upc&&String(i.upc).replace(/\D/g,"")===v});$("#hres").innerHTML=r.length?r.map(card).join(""):'<div class="hq-c no"><b class="hq-n">BARCODE NOT FOUND</b><p>No item has barcode '+E(v)+' on file. Try the name.</p></div>'};
  var hp=$("#hp"),hc=$("#hc"),hv=$("#hv");function price(){var a=parseFloat(hp.value),c=parseFloat(hc.value);if(!isFinite(a)||!isFinite(c)){hv.textContent="";hv.className="hq-v2";return}hv.textContent=a<=c?"GOOD: $"+(c-a).toFixed(2)+" under your ceiling":"TOO HIGH by $"+(a-c).toFixed(2);hv.className="hq-v2 "+(a<=c?"ok":"no")}hp.oninput=hc.oninput=price;
  $$("[data-c]").forEach(function(i){i.onchange=function(){if(i.value)H.ceil[i.dataset.c]=i.value;else delete H.ceil[i.dataset.c];sv("cm-hunt",H);hc.value=i.value;price()}});
  var sc=$("#hsc");if(window.BarcodeDetector&&navigator.mediaDevices&&navigator.mediaDevices.getUserMedia){sc.hidden=false;sc.onclick=function(){var v=$("#hvid"),det=new BarcodeDetector(),stop=false,st;navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}}).then(function(s){st=s;v.srcObject=s;v.hidden=false;v.play();(function tick(){if(stop)return;det.detect(v).then(function(b){if(b&&b.length){stop=true;st.getTracks().forEach(function(t){t.stop()});v.hidden=true;hu.value=b[0].rawValue;hu.onchange()}else setTimeout(tick,300)},function(){setTimeout(tick,500)})})()},function(){$("#hsm").textContent="Camera not available. Type the number instead."});window.addEventListener("hashchange",function(){stop=true;if(st)st.getTracks().forEach(function(t){t.stop()})},{once:true})}}
  hq.focus()}
 draw()}

/* ------------------------------------------------------------------ mount */
function need(src,cb){if(window.CMLab2){cb();return}var s=document.createElement("script");s.src=src;s.onload=cb;s.onerror=function(){app.innerHTML='<section><h2>Oops</h2><p class="empty">That page could not be loaded. Try again in a moment.</p></section>'};document.head.appendChild(s)}
window.CMLab={mount:function(el,page,args){app=el;try{
  if(page==="runs")runs(args[0]);else if(page==="bench")bench(args[0]);else if(page==="advisor")advisor();else if(page==="hunt")hunt();
  else if(page==="rigs"||page==="walk"){app.innerHTML='<section><h2>Loading</h2><p>One moment.</p></section>';need("lab2.js",function(){window.CMLab2.mount(app,page,args)})}
 }catch(e){app.innerHTML='<section><h2>Something broke</h2><p class="empty">This page could not load ('+E(e.message)+').</p>'+back()+'</section>'}}};
/* lets other pages (the wish list) show a milestone's name from its id */
window.CMLabGap=function(id){var g=GAPS.filter(function(x){return x.id===id})[0];return g?g.t:null};
})();
