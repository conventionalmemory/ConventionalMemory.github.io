/* Play pages for ConventionalMemory.io, loaded on demand:
   #/play        the games hub
   #/daily       Daily Dig: three questions a day from the timeline, with a streak and a share line
   #/build       Build Your Rig: spend a budget of points on a CPU, RAM, video and sound, then see which real games of the era it runs
   #/adlab       Ad Lab: make a retro tribute ad for any item and download it as a PNG
   Everything here runs in the browser. Progress is stored in localStorage on this device only.
   It uses the globals from the other scripts (TL, TLX, GX, ITEMS, CIMG, esc, fmtDate, hstr ...). */
(function(){
"use strict";
var app;
function $(s,r){return(r||app).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||app).querySelectorAll(s))}
function E(s){return esc(String(s==null?"":s))}
function ld(k,d){try{var v=JSON.parse(localStorage.getItem(k)||"null");return v&&typeof v==="object"?Object.assign({},d,v):d}catch(e){return d}}
function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function prng(seed){var a=seed>>>0;return function(){a=(a+0x6D2B79F5)|0;var t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296}}
function shuf(a,R){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(R()*(i+1)),t=a[i];a[i]=a[j];a[j]=t}return a}
function glyph(n,s){return typeof px==="function"?px(n,s||20):""}
function money(n){return"$"+Math.round(n).toLocaleString("en-US")}
function bk(){return'<p><a class="btn" href="#/play">All games</a></p>'}
function sharePanel(text){return'<div class="pl-share"><textarea readonly id="plsh" rows="4">'+E(text)+'</textarea><p><button class="btn pri" id="plcp" type="button">Copy to share</button> <span id="plcpo" class="tn" role="status"></span></p></div>'}
function wireShare(text){var b=$("#plcp");if(!b)return;b.onclick=function(){var o=$("#plcpo"),done=function(m){o.textContent=m},ta=$("#plsh");
 if(navigator.share&&/Mobi|Android|iPhone/.test(navigator.userAgent)){navigator.share({text:text}).then(function(){done("Shared.")},function(){});return}
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){done("Copied.")},function(){ta.select();done("Press Ctrl+C to copy.")})}else{ta.select();done("Press Ctrl+C to copy.")}}}
function artHtml(r){var h='<div class="ph pl-art">'+(typeof artFor==="function"?artFor(r,320,240,"pl"):"");if(typeof cimg==="function"&&typeof CIMG!=="undefined"&&CIMG[r[2]])h+=cimg(r[2],640);h+='</div>';return h+(typeof cimgCredit==="function"&&typeof CIMG!=="undefined"&&CIMG[r[2]]?cimgCredit(r[2]):"")}

/* ================= hub ================= */
function hub(){var d=ld("cm-daily",{streak:0}),t=today();
 var cards=[["#/daily","Daily Dig","Three questions a day from the timeline. Keep your streak alive.",d.streak?"Streak: "+d.streak+(d.hist&&d.hist[t]&&d.hist[t].length>=3?" (done today)":" (play today)"):"New: play today","bulb"],
  ["#/build","Build Your Rig","Pick a year, spend your points on a CPU, RAM and video card, and see which real games you can run.","","tower"],
  ["#/adlab","Ad Lab","Make a retro tribute ad for any item and download it as a picture.","","news"],
  ["#/maze","Memory Maze","The original: run the maze, grab the Ks, dodge the crashes.","","ghost"]];
 app.innerHTML='<section><h2>Play</h2><p>Small games built from the museum and the timeline.</p><div class="pl-grid">'+cards.map(function(c){return'<a class="hm-tile" href="'+c[0]+'"><i class="hm-ic">'+glyph(c[4],28)+'</i><b>'+E(c[1])+'</b><span>'+E(c[2])+(c[3]?' <em>'+E(c[3])+'</em>':"")+'</span></a>'}).join("")+'</div></section>'}

/* ================= Daily Dig ================= */
var DK="cm-daily";
function dpool(){return TL.filter(function(r){var y=+r[0].slice(0,4);return/^(hw|sw|gt|gn|gc)$/.test(r[1])&&y>=1975&&y<=2012&&r[2]&&((TLX[r[2]]||{}).maker||r[3])})}
function yearOpts(y,R){var offs=shuf([-1,1,-2,2,-3,3,-4,4,-6,6,-9,9],R),o=[y];for(var i=0;i<offs.length&&o.length<4;i++){var v=y+offs[i];if(v>=TLMIN&&v<=2012&&o.indexOf(v)<0)o.push(v)}return o.sort(function(a,b){return a-b})}
function niceMoney(v){var m=v<100?5:v<1000?25:100;return Math.max(m,Math.round(v/m)*m)}
function buildDaily(seed){var R=prng(seed),P=dpool(),e=P[Math.floor(R()*P.length)],x=TLX[e[2]]||{},y=+e[0].slice(0,4),Q=[];
 var yo=yearOpts(y,R);Q.push({p:"Which year did this come out?",o:yo.map(String),a:yo.indexOf(y),f:"It came out in "+fmtDate(e[0])+(e[5]?"":" (the exact date is not confirmed)")+"."});
 var pr=usdOf(e[3]);
 if(pr>0){var mult=shuf([.35,.5,.7,1.5,2.2,3.5],R).slice(0,3),vals=[pr].concat(mult.map(function(m){return niceMoney(pr*m)})),seen={},u=[];vals.forEach(function(v){var k=Math.round(v);if(!seen[k]){seen[k]=1;u.push(v)}});
  while(u.length<4)u.push(niceMoney(pr*(2+u.length)));u=u.slice(0,4).sort(function(a,b){return a-b});
  Q.push({p:"What did it cost at launch?",o:u.map(money),a:u.indexOf(pr)>=0?u.indexOf(pr):0,f:"Launch price: "+e[3].replace(/\*$/," (an estimate)")+"."+(inflNote(e[3],y)?" That is "+inflNote(e[3],y)+".":"")})}
 else if(x.maker){var mk=[],sm={};sm[x.maker]=1;shuf(P,R).forEach(function(r){var m=(TLX[r[2]]||{}).maker;if(m&&!sm[m]&&mk.length<3){sm[m]=1;mk.push(m)}});var mo=shuf([x.maker].concat(mk),R);Q.push({p:"Who made it?",o:mo,a:mo.indexOf(x.maker),f:"Made by "+x.maker+"."})}
 else{Q.push({p:"Was it released before or after 1990?",o:["Before 1990","1990 or later"],a:y<1990?0:1,f:"It came out in "+y+"."})}
 var others=P.filter(function(r){return r[2]!==e[2]&&Math.abs(+r[0].slice(0,4)-y)>=2}),e2=others[Math.floor(R()*others.length)],pair=R()<.5?[e,e2]:[e2,e];
 Q.push({p:"Which came first?",o:[pair[0][2],pair[1][2]],a:+pair[0][0].slice(0,4)<+pair[1][0].slice(0,4)?0:1,f:pair[0][2]+" came out in "+pair[0][0].slice(0,4)+", "+pair[1][2]+" in "+pair[1][0].slice(0,4)+"."});
 return{e:e,x:x,y:y,Q:Q}}
function daily(arg){var practice=arg==="practice",t=today(),seed=practice?Math.floor(Math.random()*1e9):hstr("dig"+t),G=buildDaily(seed),D=ld(DK,{streak:0,best:0,last:"",total:0,hist:{}}),ans=practice?[]:(D.hist[t]||[]).slice();
 function draw(){var step=ans.length,done=step>=G.Q.length,h='<section class="pl"><h2>Daily Dig'+(practice?" (practice)":"")+'</h2>'
  +'<p class="pl-hud"><span>Streak <b>'+(practice?D.streak:D.streak)+'</b></span><span>Best <b>'+D.best+'</b></span><span>Dug up <b>'+D.total+'</b></span><span>'+(practice?"No streak in practice":E(t))+'</span></p>'
  +'<div class="pl-case">'+artHtml(G.e)+'<p class="tn">'+(done?"":"Today's mystery find. Look closely.")+'</p></div>';
  if(!done){var q=G.Q[step];h+='<div class="pl-q"><p class="pl-step">Question '+(step+1)+' of '+G.Q.length+' '+G.Q.map(function(_,i){return'<i class="pl-pip'+(i<step?" on":i===step?" now":"")+'"></i>'}).join("")+'</p><h3>'+E(q.p)+'</h3><div class="pl-opts">'+q.o.map(function(o,i){return'<button class="btn" type="button" data-o="'+i+'">'+E(o)+'</button>'}).join("")+'</div></div>'}
  else{var good=G.Q.filter(function(q,i){return ans[i]===q.a}).length,sq=G.Q.map(function(q,i){return ans[i]===q.a?"■":"□"}).join(""),txt="Daily Dig "+(practice?"practice":t)+" "+good+"/"+G.Q.length+" "+sq+(practice?"":"  Streak "+D.streak)+"\nhttps://conventionalmemory.github.io/#/daily";
   h+='<div class="pl-res"><h3>'+good+' of '+G.Q.length+(good===G.Q.length?" — perfect dig!":good?" — nice digging":" — better luck tomorrow")+'</h3><div class="pl-sq">'+G.Q.map(function(q,i){return'<i class="'+(ans[i]===q.a?"ok":"no")+'"></i>'}).join("")+'</div>'
   +'<ul class="pl-fb">'+G.Q.map(function(q,i){return'<li class="'+(ans[i]===q.a?"ok":"no")+'"><b>'+E(q.p)+'</b> You said '+E(q.o[ans[i]])+(ans[i]===q.a?"":". Answer: "+E(q.o[q.a]))+'. '+E(q.f)+'</li>'}).join("")+'</ul>'
   +'<div class="pl-about"><h4>About '+E(G.e[2])+'</h4><p>'+E(G.e[4]||"")+' '+E(((G.x.detail||"").slice(0,420))+((G.x.detail||"").length>420?"...":""))+'</p><p><a class="btn" href="#/timeline/'+G.y+'/'+encodeURIComponent(G.e[2])+'">See it on the timeline</a></p></div>'
   +sharePanel(txt)+'<p>'+(practice?'<a class="btn pri" href="#/daily/practice" id="again">Another practice dig</a> ':'<a class="btn" href="#/daily/practice">Practice dig</a> ')+'<a class="btn" href="#/play">All games</a></p></div>'}
  app.innerHTML=h+'</section>';
  $$("[data-o]").forEach(function(b){b.onclick=function(){ans.push(+b.dataset.o);var fin=ans.length>=G.Q.length;
   if(!practice){D.hist[t]=ans.slice();if(fin){var y=new Date();y.setDate(y.getDate()-1);var ys=y.getFullYear()+"-"+String(y.getMonth()+1).padStart(2,"0")+"-"+String(y.getDate()).padStart(2,"0");D.streak=D.last===ys?D.streak+1:1;D.best=Math.max(D.best,D.streak);D.last=t;D.total++;
    var ks=Object.keys(D.hist).sort();while(ks.length>60)delete D.hist[ks.shift()]}sv(DK,D)}
   draw()}});
  if(done){var tx=$("#plsh");if(tx)wireShare(tx.value);var ag=$("#again");if(ag)ag.onclick=function(e){e.preventDefault();daily("practice")}}}
 draw()}

/* ================= Build Your Rig ================= */
var RK="cm-rig",RBUD=10;
function rigWindow(year){return GXRIGS.filter(function(r){return r.y<=year}).slice(-4)}
function rigOptions(year){var t=rigWindow(year);while(t.length<4)t.unshift(t[0]);
 var snd=[["PC speaker beeps",0,"Every PC had one. Every beep was a feature."]];
 var cards=TL.filter(function(r){var x=TLX[r[2]]||{},y=+r[0].slice(0,4);return x.type==="Sound or MIDI"&&y<=year&&y>=year-6&&/blaster|adlib|ultrasound|spectrum|awe|sc-55|mt-32|sc-88/i.test(r[2])}).sort(function(a,b){return a[0]<b[0]?1:-1}).slice(0,2);
 cards.forEach(function(r,i){snd.push([r[2],i+1,(TLX[r[2]]||{}).detail?String((TLX[r[2]]||{}).detail).slice(0,110):"A real sound card of the era."])});
 return{cpu:t.map(function(r,i){return{k:r.n,c:i+1,v:{cls:r.cls,mhz:r.mhz},l:GXCLS[r.cls]+", "+r.mhz+" MHz"}}),ram:t.map(function(r,i){return{k:gxRam(r.ram),c:i+1,v:r.ram,l:gxRam(r.ram)}}),vid:t.map(function(r,i){return{k:gxRam(r.vram),c:i+1,v:r.vram,l:r.vram?gxRam(r.vram)+" video memory":"Basic video"}}),snd:snd.map(function(s,i){return{k:s[0],c:s[1],l:s[0],d:s[2]}})}}
function rigGames(year,seed){var R=prng(seed),out=[];Object.keys(GX).forEach(function(t){var x=GX[t];if(!x.n||(x.n.cls==null&&x.n.mhz==null&&x.n.ramMB==null))return;var pc=typeof gxPc==="function"?gxPc(x):null;if(!pc)return;var y=+pc[1].slice(0,4);if(y<year-1||y>year)return;out.push(t)});
 return shuf(out,R).slice(0,16)}
function rigEval(games,pick,O){var rig={cls:O.cpu[pick[0]].v.cls,mhz:O.cpu[pick[0]].v.mhz,ram:O.ram[pick[1]].v,vram:O.vid[pick[2]].v},ok=0,great=0,det=[];
 games.forEach(function(t){var x=GX[t],m=gxMeets(rig,x.n),g=x.m?gxMeets(rig,x.m):{ok:null};if(m.ok===true){ok++;if(g.ok===true)great++}det.push({t:t,ok:m.ok,great:g.ok===true,miss:m.miss})});
 return{ok:ok,great:great,score:ok*10+great*5,det:det}}
function rigBest(games,O){var best=0;for(var a=0;a<4;a++)for(var b=0;b<4;b++)for(var c=0;c<4;c++){if(O.cpu[a].c+O.ram[b].c+O.vid[c].c>RBUD)continue;var s=rigEval(games,[a,b,c],O).score;if(s>best)best=s}return best}
function build(arg){var P=ld(RK,{best:{}}),year=+arg||1996;year=Math.max(1991,Math.min(2002,year));var O=rigOptions(year),seed=hstr("rig"+year+(P.reroll&&P.reroll[year]||"")),games=rigGames(year,seed),pick=[1,1,1,0],showRes=false;
 function cost(){return O.cpu[pick[0]].c+O.ram[pick[1]].c+O.vid[pick[2]].c+O.snd[pick[3]].c}
 function draw(){var used=cost(),over=used>RBUD,res=showRes&&!over?rigEval(games,pick,O):null,best=games.length>=6?rigBest(games,O):0;
  var slot=function(key,label,ic,list,idx){return'<fieldset class="pl-slot"><legend>'+glyph(ic,18)+' '+label+'</legend>'+list.map(function(o,i){return'<label class="pl-opt'+(pick[idx]===i?" on":"")+'"><input type="radio" name="s'+idx+'" value="'+i+'"'+(pick[idx]===i?" checked":"")+'><span><b>'+E(o.l)+'</b><i class="pl-cost">'+o.c+' pt'+(o.c===1?"":"s")+'</i>'+(o.d?'<small>'+E(o.d)+'</small>':"")+'</span></label>'}).join("")+'</fieldset>'};
  var h='<section class="pl"><h2>Build Your Rig</h2><p>It is <b>'+year+'</b>. You have <b>'+RBUD+' points</b>. Spend them on a CPU, RAM, video and sound, then find out which of the era\'s real games it can run. The games are real, from the games data, and each one is checked against its minimum requirements.</p>'
   +'<p class="pl-yr"><label for="plyr">Year: <b id="plyv">'+year+'</b></label> <input id="plyr" type="range" min="1991" max="2002" value="'+year+'"> <button class="btn" id="plre" type="button">Different games</button></p>';
  if(games.length<6)return app.innerHTML=h+'<p class="empty">Only '+games.length+' games with requirements are on file for '+year+'. Pick another year.</p></section>';
  h+='<div class="pl-meter'+(over?" over":"")+'" role="status"><span class="mbar"><i style="width:'+Math.min(100,used*100/RBUD)+'%"></i></span> <b>'+used+' of '+RBUD+' points</b>'+(over?" — over budget! Pick something cheaper.":"")+'</div>'
   +'<div class="pl-slots">'+slot("cpu","Processor","chip",O.cpu,0)+slot("ram","Memory","ram",O.ram,1)+slot("vid","Video","card",O.vid,2)+slot("snd","Sound","speaker",O.snd,3)+'</div>'
   +'<p><button class="btn pri" id="plgo" type="button"'+(over?" disabled":"")+'>Boot it up!</button></p>';
  if(res){var pct=best?Math.round(res.score*100/best):100,stars=pct>=100?3:pct>=75?2:pct>=45?1:0,prev=P.best[year]||0;if(res.score>prev){P.best[year]=res.score;sv(RK,P)}
   var snd=pick[3]>0?" with "+O.snd[pick[3]].k:" with a PC speaker";
   var txt="Build Your Rig "+year+": "+res.ok+"/"+games.length+" games run "+"★".repeat(stars)+"☆".repeat(3-stars)+"\n"+O.cpu[pick[0]].l+", "+O.ram[pick[1]].l+", "+O.vid[pick[2]].l+snd+"\nhttps://conventionalmemory.github.io/#/build/"+year;
   h+='<div class="pl-res"><h3>'+('★'.repeat(stars)+'☆'.repeat(3-stars))+' '+res.ok+' of '+games.length+' games run</h3><p>'+res.great+' meet the recommended specs too. Score <b>'+res.score+'</b>'+(best?' of a best possible <b>'+best+'</b> for this budget':"")+'. Your best here: <b>'+Math.max(prev,res.score)+'</b>.'+(pct>=100?" That is the best build the budget allows!":"")+'</p>'
    +'<ul class="pl-games">'+res.det.sort(function(a,b){return(b.ok===true)-(a.ok===true)}).map(function(d){return'<li class="'+(d.ok===true?(d.great?"great":"ok"):d.ok===false?"no":"unk")+'"><b>'+E(d.t)+'</b> '+(d.ok===true?(d.great?"runs great":"runs"):d.ok===false?"needs: "+E(d.miss.join("; ")):"requirements unclear")+'</li>'}).join("")+'</ul>'+sharePanel(txt)+'</div>'}
  app.innerHTML=h+'</section>';
  $$("input[type=radio]").forEach(function(r){r.onchange=function(){pick[+r.name.slice(1)]=+r.value;showRes=false;draw()}});
  $("#plyr").oninput=function(){$("#plyv").textContent=this.value};$("#plyr").onchange=function(){location.hash="#/build/"+this.value};
  $("#plre").onclick=function(){P.reroll=P.reroll||{};P.reroll[year]=Math.floor(Math.random()*1e6);sv(RK,P);build(year)};
  $("#plgo").onclick=function(){showRes=true;draw();var r=$(".pl-res");if(r)r.scrollIntoView({behavior:"smooth",block:"start"})};
  if(res)wireShare($("#plsh").value)}
 draw()}

/* ================= Ad Lab ================= */
var STORES=["Bit Barn Computers","Bargain Bytes Software","Megabyte Mart","Floppy Depot","Cache Cash & Carry"],TAGS=["Prices good while supplies last.","Ask about our extended warranty!","Open late on Fridays.","No money down.*","Free mousepad with purchase!","See store for details."];
var HEADS=["Meet the {n}.","{n}: the one everybody is talking about!","Hurry! {n} while supplies last.","Get the {n} before your neighbor does.","{n}. Faster than your last one.","Plug in. Power up. {n}.","The {n} is here. Your move.","Why wait? {n} ships today.","{n}: now with more everything.","Your friends will want a {n}."];
var AD={src:null,style:"flyer",fmt:"land",store:0,head:"",tag:"",price:"",roll:0,q:""};
function adSources(q){q=q.toLowerCase().trim();var out=[];if(q.length<2)return out;ITEMS.forEach(function(it){if((it.name+" "+(it.maker||"")).toLowerCase().indexOf(q)>=0)out.push({kind:"item",it:it,t:it.name,sub:"in the museum"})});
 TL.forEach(function(r){if(out.length>=14||!/^(hw|pe|sw|gt|gn|gc)$/.test(r[1]))return;if(r[2].toLowerCase().indexOf(q)>=0&&!out.some(function(o){return o.t===r[2]}))out.push({kind:"tl",r:r,t:r[2],sub:"timeline "+r[0].slice(0,4)})});return out.slice(0,12)}
function adData(s){if(s.kind==="item"){var it=s.it,k=prodKind(it),sp=pickSpecs(it,k).slice(0,3).map(function(x){return x[0]+": "+String(x[1]).slice(0,26)}),p=priceOf(it);return{title:it.name,maker:it.maker||"",year:it.year,price:p.t||"",est:!!p.est,specs:sp,art:prodSvg(it,400,300,"al")}}
 var r=s.r,x=TLX[r[2]]||{},p=guessPrice(r,+r[0].slice(0,4));return{title:r[2],maker:x.maker||"",year:+r[0].slice(0,4),price:p.t||"",est:!!p.est,specs:Object.keys(x.specs||{}).slice(0,3).map(function(k){return k+": "+String(x.specs[k]).slice(0,26)}),art:artFor(r,400,300,"al")}}
function headFor(d,n){var R=prng(hstr(d.title)+n*7919);return HEADS[Math.floor(R()*HEADS.length)].replace("{n}",d.title.replace(/\s*\(.*\)\s*/," ").trim())}
function wrap(t,n){var w=String(t).split(/\s+/),l=[],c="";w.forEach(function(x){if((c+" "+x).trim().length>n&&c){l.push(c);c=x}else c=(c+" "+x).trim()});if(c)l.push(c);return l}
function xesc(s){return String(s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function embed(svg,x,y,w,h){if(!/xmlns=/.test(svg))svg=svg.replace("<svg","<svg xmlns=\"http://www.w3.org/2000/svg\"");var doc=new DOMParser().parseFromString(svg,"image/svg+xml"),el=doc.documentElement;if(!el||el.nodeName!=="svg"||doc.querySelector("parsererror"))return"";
 if(!el.getAttribute("viewBox")){var W=parseFloat(el.getAttribute("width"))||400,H=parseFloat(el.getAttribute("height"))||300;el.setAttribute("viewBox","0 0 "+W+" "+H)}
 el.setAttribute("x",x);el.setAttribute("y",y);el.setAttribute("width",w);el.setAttribute("height",h);el.setAttribute("preserveAspectRatio","xMidYMid meet");el.removeAttribute("style");el.removeAttribute("class");el.setAttribute("overflow","hidden");el.removeAttribute("role");el.removeAttribute("aria-label");return new XMLSerializer().serializeToString(el)}
var PAL={flyer:{bg:"#f3ebd1",ink:"#1a1a1a",hi:"#c4161c",pl:"#c4161c",pk:"#ffffff",bd:"#1b3f94",sp:"#1b3f94"},mag:{bg:"#0b1030",ink:"#f2f2ff",hi:"#35e8ff",pl:"#ff3dcb",pk:"#0b1030",bd:"#35e8ff",sp:"#ffe14d"},cat:{bg:"#ffffff",ink:"#111111",hi:"#006b3c",pl:"#006b3c",pk:"#ffffff",bd:"#006b3c",sp:"#8a5a00"}};
var FMT={land:[1200,630],sq:[1080,1080],tall:[1080,1920]};
function adSvg(d,o){var wh=FMT[o.fmt],W=wh[0],H=wh[1],P=PAL[o.style],land=o.fmt==="land",pad=Math.round(W*.04),bh=Math.round(land?H*.15:H*.085),FS="font-family=\"Impact, 'Arial Black', Haettenschweiler, sans-serif\"",TS="font-family=\"'Courier New', monospace\"",
 s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'">';
 s+='<defs><linearGradient id="bgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+(o.style==="mag"?"#1a0f4d":P.bg)+'"/><stop offset="1" stop-color="'+(o.style==="mag"?"#07091f":P.bg)+'"/></linearGradient></defs>';
 s+='<rect width="'+W+'" height="'+H+'" fill="url(#bgg)"/>';
 if(o.style==="cat")for(var gx=0;gx<W;gx+=40)s+='<line x1="'+gx+'" y1="0" x2="'+gx+'" y2="'+H+'" stroke="#e6efe9"/>';
 if(o.style==="mag")for(var gy=0;gy<H;gy+=48)s+='<line x1="0" y1="'+gy+'" x2="'+W+'" y2="'+gy+'" stroke="#1d2a6b" stroke-width="2"/>';
 s+='<rect x="'+(pad/2)+'" y="'+(pad/2)+'" width="'+(W-pad)+'" height="'+(H-pad)+'" fill="none" stroke="'+P.bd+'" stroke-width="'+(o.style==="flyer"?6:4)+'"'+(o.style==="flyer"?' stroke-dasharray="18 10"':"")+'/>';
 s+='<rect x="'+pad+'" y="'+pad+'" width="'+(W-2*pad)+'" height="'+bh+'" fill="'+P.pl+'"/>';
 s+='<text x="'+(pad*1.6)+'" y="'+(pad+bh*.7)+'" '+FS+' font-size="'+Math.round(bh*.62)+'" fill="'+P.pk+'" letter-spacing="2">'+xesc(STORES[o.store].toUpperCase())+'</text>';
 s+='<text x="'+(W-pad*1.6)+'" y="'+(pad+bh*.66)+'" '+TS+' font-size="'+Math.round(bh*.3)+'" fill="'+P.pk+'" text-anchor="end" font-weight="bold">'+(o.style==="cat"?"CATALOG No. "+(1000+hstr(d.title)%9000):o.style==="mag"?"AS SEEN IN "+(d.year||"")+"!":"GRAND SALE")+'</text>';
 var top=pad+bh+pad,foot=Math.round(H*.07),artX,artY,artW,artH,tx,ty,tw;
 if(land){artX=pad*1.5;artY=top;artW=Math.round(W*.46);artH=H-top-foot-pad;tx=artX+artW+pad;ty=top;tw=W-tx-pad*1.5}
 else{artX=pad*1.5;artY=top;artW=W-pad*3;artH=Math.round(H*(o.fmt==="tall"?.42:.4));tx=pad*1.5;ty=artY+artH+pad*1.2;tw=W-pad*3}
 s+='<rect x="'+artX+'" y="'+artY+'" width="'+artW+'" height="'+artH+'" fill="'+(o.style==="mag"?"#0b1030":"#ffffff")+'" stroke="'+P.ink+'" stroke-width="3"/>';
 s+=embed(d.art,artX+6,artY+6,artW-12,artH-12);
 var fs=Math.round(land?H*.074:W*(o.fmt==="tall"?.09:.075)),lines=wrap(o.head,Math.floor(tw/(fs*.52))).slice(0,o.fmt==="tall"?5:4);
 lines.forEach(function(l,i){s+='<text x="'+tx+'" y="'+(ty+fs*(i+1))+'" '+FS+' font-size="'+fs+'" fill="'+(i===0?P.hi:P.ink)+'">'+xesc(l)+'</text>'});
 var y2=ty+fs*lines.length+fs*.5,tfs=Math.round(fs*.42);
 wrap(o.tag,Math.floor(tw/(tfs*.6))).slice(0,2).forEach(function(l,i){s+='<text x="'+tx+'" y="'+(y2+tfs*1.15*i)+'" '+TS+' font-size="'+tfs+'" fill="'+P.ink+'" font-weight="bold">'+xesc(l)+'</text>'});
 var y3=y2+tfs*2.3;d.specs.slice(0,land?2:3).forEach(function(sp,i){s+='<text x="'+tx+'" y="'+(y3+tfs*1.3*i)+'" '+TS+' font-size="'+Math.round(tfs*.85)+'" fill="'+P.sp+'">■ '+xesc(sp)+'</text>'});
 var r=Math.round(Math.min(artW,artH)*.24),cx=artX+artW-r*.7,cy=artY+r*.7,pts=[];for(var i=0;i<24;i++){var a=i*Math.PI/12,rr=i%2?r*.8:r;pts.push((cx+Math.cos(a)*rr).toFixed(1)+","+(cy+Math.sin(a)*rr).toFixed(1))}
 if(o.price){s+='<polygon points="'+pts.join(" ")+'" fill="#ffd400" stroke="#c4161c" stroke-width="4"/><text x="'+cx+'" y="'+(cy-r*.12)+'" text-anchor="middle" '+FS+' font-size="'+Math.round(r*.4)+'" fill="#c4161c">'+xesc(o.price.length>10?o.price.slice(0,10):o.price)+'</text><text x="'+cx+'" y="'+(cy+r*.3)+'" text-anchor="middle" '+TS+' font-size="'+Math.round(r*.17)+'" font-weight="bold" fill="#1a1a1a">'+(d.est?"EST. PRICE":"LAUNCH PRICE")+'</text>'}
 s+='<text x="'+(W/2)+'" y="'+(H-pad*1.2)+'" text-anchor="middle" '+TS+' font-size="'+Math.round(Math.max(13,W*.014))+'" fill="'+P.ink+'" opacity=".8">Tribute ad. Made-up store, real timeline data. Nothing here can be ordered. Call 1-800-555-0142 (not a real number).</text></svg>';
 return s}
function adlab(arg){if(arg&&!AD.src){var f=adSources(decodeURIComponent(arg))[0];if(f)pick(f)}
 function pick(s){AD.src=s;var d=adData(s);AD.head=headFor(d,AD.roll);AD.tag=TAGS[hstr(d.title)%TAGS.length];AD.price=d.price?String(d.price).replace(/\*$/,"").split(/[ ;(]/)[0]:"";AD.d=d}
 function draw(){var h='<section class="pl"><h2>Ad Lab</h2><p>Make a retro tribute ad for anything in the museum or on the timeline, then download it as a picture. The store is made up and the phone number is not real.</p>'
  +'<p><label for="adq">Find an item</label> <input id="adq" placeholder="Sound Blaster, Voodoo, Game Boy..." value="'+E(AD.q)+'"> <button class="btn" id="adsr" type="button">Search</button> <button class="btn" id="adrn" type="button">Surprise me</button></p><div id="adres"></div>';
  if(AD.src){var o={style:AD.style,fmt:AD.fmt,store:AD.store,head:AD.head,tag:AD.tag,price:AD.price},svg=adSvg(AD.d,o);
   h+='<div class="pl-ctl"><fieldset><legend>Style</legend>'+[["flyer","Sunday flyer"],["mag","Magazine page"],["cat","Mail-order catalog"]].map(function(s){return'<label><input type="radio" name="ads" value="'+s[0]+'"'+(AD.style===s[0]?" checked":"")+'> '+s[1]+'</label>'}).join(" ")+'</fieldset>'
   +'<fieldset><legend>Size</legend>'+[["land","Wide (1200x630)"],["sq","Square (1080x1080)"],["tall","Tall (1080x1920)"]].map(function(s){return'<label><input type="radio" name="adf" value="'+s[0]+'"'+(AD.fmt===s[0]?" checked":"")+'> '+s[1]+'</label>'}).join(" ")+'</fieldset></div>'
   +'<p><label for="adst">Store</label> <select id="adst">'+STORES.map(function(s,i){return'<option value="'+i+'"'+(AD.store===i?" selected":"")+'>'+E(s)+'</option>'}).join("")+'</select></p>'
   +'<p><label for="adh">Headline</label> <input id="adh" value="'+E(AD.head)+'"> <button class="btn" id="adrl" type="button">Roll a new one</button></p><p><label for="adt">Tagline</label> <input id="adt" value="'+E(AD.tag)+'"></p><p><label for="adp">Price</label> <input id="adp" value="'+E(AD.price)+'" size="12"> <small class="tn">Leave blank for no price burst.</small></p>'
   +'<div class="pl-prev" id="adprev">'+svg+'</div><p><button class="btn pri" id="addl" type="button">Download PNG</button> <span class="tn" id="adnote" role="status"></span></p><p class="tn">The picture is the drawn art, not a photo, so the download is never blocked by another site.</p>'}
  app.innerHTML=h+'</section>';
  var qq=$("#adq");qq.oninput=function(){AD.q=qq.value};var go=function(){AD.q=qq.value;var res=adSources(AD.q);$("#adres").innerHTML=res.length?res.map(function(s,i){return'<button class="btn" data-ap="'+i+'" type="button">'+E(s.t)+' <small>('+E(s.sub)+')</small></button>'}).join(" "):'<p class="tn">'+(AD.q.length<2?"Type at least two letters.":"Nothing found.")+'</p>';$$("[data-ap]",$("#adres")).forEach(function(b){b.onclick=function(){pick(res[+b.dataset.ap]);draw()}})};
  $("#adsr").onclick=go;qq.onkeydown=function(e){if(e.key==="Enter")go()};
  $("#adrn").onclick=function(){var pool=ITEMS.length&&Math.random()<.5?ITEMS.map(function(it){return{kind:"item",it:it,t:it.name}}):TL.filter(function(r){return/^(hw|pe|sw|gt)$/.test(r[1])}).map(function(r){return{kind:"tl",r:r,t:r[2]}});pick(pool[Math.floor(Math.random()*pool.length)]);draw()};
  if(!AD.src)return;
  var refresh=function(){AD.head=$("#adh").value;AD.tag=$("#adt").value;AD.price=$("#adp").value;$("#adprev").innerHTML=adSvg(AD.d,{style:AD.style,fmt:AD.fmt,store:AD.store,head:AD.head,tag:AD.tag,price:AD.price})};
  ["#adh","#adt","#adp"].forEach(function(s){$(s).oninput=refresh});$("#adst").onchange=function(){AD.store=+this.value;refresh()};
  $$("input[name=ads]").forEach(function(r){r.onchange=function(){AD.style=r.value;refresh()}});$$("input[name=adf]").forEach(function(r){r.onchange=function(){AD.fmt=r.value;refresh()}});
  $("#adrl").onclick=function(){AD.roll++;AD.head=headFor(AD.d,AD.roll);$("#adh").value=AD.head;refresh()};
  $("#addl").onclick=function(){var svg=adSvg(AD.d,{style:AD.style,fmt:AD.fmt,store:AD.store,head:AD.head,tag:AD.tag,price:AD.price}),wh=FMT[AD.fmt],n=$("#adnote"),im=new Image();
   im.onload=function(){var c=document.createElement("canvas");c.width=wh[0];c.height=wh[1];c.getContext("2d").drawImage(im,0,0,wh[0],wh[1]);c.toBlob(function(b){if(!b){n.textContent="Could not make the picture. Try another size.";return}var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=(AD.d.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"ad")+"-ad.png";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},3000);n.textContent="Downloaded."},"image/png")};
   im.onerror=function(){n.textContent="Your browser could not render this ad to a picture."};im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg)}}
 draw()}

window.CMPlay={mount:function(el,page,args){app=el;try{if(page==="daily")daily(args[0]);else if(page==="build")build(args[0]);else if(page==="adlab")adlab(args[0]);else hub()}catch(e){app.innerHTML='<section><h2>Play</h2><p class="empty">Something went wrong loading this game ('+E(e.message)+').</p>'+bk()+'</section>'}},unmount:function(){}};
})();
