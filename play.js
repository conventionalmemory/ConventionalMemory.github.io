/* Play pages for ConventionalMemory.io, loaded on demand:
   #/play        the games hub
   #/daily       Daily Dig: three questions a day from the timeline, with a streak and a share line
   #/build       Build Your Rig: spend a budget of points on a CPU, RAM, video and sound, then see which real games of the era it runs
   #/adlab       Ad Lab: make a retro tribute ad for any item and download it as a PNG
   Everything here runs in the browser. Progress is stored in localStorage on this device only.
   It uses the globals from the other scripts (TL, TLX, GX, ITEMS, CIMG, esc, fmtDate, hstr ...). */
(function(){
"use strict";
var TLXS=typeof TLX!=="undefined"?TLX:{};
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
function sharePanel(text){return'<div class="pl-share"><textarea readonly id="plsh" rows="4">'+E(text)+'</textarea><p><button class="btn pri" id="plcp" type="button">Copy to share</button> <button class="btn" id="plpng" type="button">Download picture</button> <span id="plcpo" class="tn" role="status"></span></p></div>'}
function wireShare(text){var b=$("#plcp");if(!b)return;var pg=$("#plpng");if(pg)pg.onclick=function(){var o=$("#plcpo");pngDownload(cardSvg(text),1200,630,"conventionalmemory-result.png",function(m){o.textContent=m})};b.onclick=function(){var o=$("#plcpo"),done=function(m){o.textContent=m},ta=$("#plsh");
 if(navigator.share&&/Mobi|Android|iPhone/.test(navigator.userAgent)){navigator.share({text:text}).then(function(){done("Shared.")},function(){});return}
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){done("Copied.")},function(){ta.select();done("Press Ctrl+C to copy.")})}else{ta.select();done("Press Ctrl+C to copy.")}}}
function artHtml(r){var h='<div class="ph pl-art">'+(typeof artFor==="function"?artFor(r,320,240,"pl"):"");if(typeof cimg==="function"&&typeof CIMG!=="undefined"&&CIMG[r[2]])h+=cimg(r[2],640);h+='</div>';return h+(typeof cimgCredit==="function"&&typeof CIMG!=="undefined"&&CIMG[r[2]]?cimgCredit(r[2]):"")}


/* ================= Style guide: every shared component in every theme ================= */
function boom(){var h='<div class="qboom" aria-hidden="true">';for(var i=0;i<26;i++)h+='<i style="--x:'+Math.round(Math.random()*100)+'%;--d:'+Math.round(Math.random()*500)+'ms;--c:'+["#ff5555","#55ff55","#ffff55","#55ffff","#ff55ff","#5555ff"][i%6]+'"></i>';return h+'</div>'}
function styleguide(){var T=[["default","Default"],["dark","Dark (system dark mode)"],["green","Green phosphor"],["amber","Amber"],["ega","EGA blue"],["clean","Clean"]],glyphs=["tower","laptop","console","handheld","cart","card","chip","floppy","ipod","mavica","trophy","star"],sample={id:ITEMS.length?ITEMS[0].id:"sample",name:"Sample item",maker:"Acme Computing",year:1993,score:520,type:"Computer",cat:"Computers",photos:[],status:"Display",text:"A sample card."};
 var out='<section><h2>Style guide</h2><p>Every shared component in every theme, side by side. If something is unreadable in one panel, it is a bug in the shared styles. Colors come from tokens (<code>--bg --panel --ink --mute --blue --line --lk</code>), so fixing a token fixes the whole site.</p><p class="tn"><a href="#/play">Back to Play</a></p>';
 T.forEach(function(t){var th=t[0];out+='<div class="sg" data-theme="'+th+'"><h3>'+E(t[1])+'</h3>'
  +'<div class="sg-sw"><i style="background:var(--bg);color:var(--ink)">bg</i><i style="background:var(--panel);color:var(--ink)">panel</i><i style="background:var(--ink);color:var(--bg)">ink</i><i style="background:var(--mute);color:var(--bg)">mute</i><i style="background:var(--blue);color:var(--blue-ink)">blue</i><i style="background:var(--lk);color:var(--bg)">link</i></div>'
  +'<div class="sg-row"><button class="btn" type="button">Button</button><button class="btn pri" type="button">Primary</button><button class="btn danger" type="button">Danger</button><a href="#/styleguide">A link</a><span class="tag">tag</span><span class="tag want">want</span></div>'
  +'<div class="sg-row"><span class="mbar"><i style="width:60%"></i></span> <small>60%</small> <span>★★☆</span><span class="qchip done">done</span><span class="qchip">blank</span><span class="qbd on">Badge</span><span class="qbd">?</span></div>'
  +'<div class="sg-row">'+[100,300,500,620].map(function(n){var tr=tier(n);return'<span class="ib" style="background:'+tr.c+';color:'+inkOn(tr.c)+';border-color:'+tr.c+'">'+glyph("trophy",16)+'<small>Score</small><b>'+n+'K '+E(tr.l)+'</b></span>'}).join("")+'<span class="ib">'+glyph("clock",16)+'<small>Released</small><b>1993</b></span></div>'
  +'<div class="sg-row">'+glyphs.map(function(g){return glyph(g,24)}).join("")+'</div>'
  +'<div class="msg ok">A success message.</div><div class="msg err">An error message.</div>'
  +'<div class="sg-row"><div style="max-width:260px">'+(function(){try{return card(sample)}catch(e){return""}})()+'</div><div class="cz" style="padding:8px;max-width:300px">'+(typeof czLogo==="function"?czLogo("Bargain Bytes Software"):"")+(typeof czFlag==="function"?czFlag({t:"$299",est:false}):"")+'</div></div></div>'});
 app.innerHTML=out+'</section>'}

/* ================= hub ================= */
function hub(){var d=ld("cm-daily",{streak:0}),t=today(),H=ld("cm-higher",{raw:0,adj:0}),p=pf();
 var cards=[["#/daily","Daily Dig","Three questions a day from the timeline. 50/50 hints, streak shields and a 14 day calendar.",d.streak?"Streak: "+d.streak+(d.hist&&d.hist[t]&&d.hist[t].length>=3?" (done today)":" (play today)"):"New: play today","bulb"],
  ["#/higher","Higher or Lower","Which launch price was bigger? Three lives, and a mode that adjusts for inflation.",H.raw||H.adj?"Best streak: "+Math.max(H.raw,H.adj):"New","coin"],
  ["#/sort","Timeline Sort","Put five finds in order, oldest first. Five rounds, and the years get closer together.",p.st.tsBest?"Best: "+p.st.tsBest+"/25":"New","clock"],
  ["#/mystery","Mystery Photo","A real photo starts blurry. Name it before it comes into focus.",p.st.msBest?"Best: "+p.st.msBest+"/24":"New","camera"],
  ["#/bingo","Retro Bingo","A daily bingo card of machines. Mark everything you owned or wanted.","","dice"],
  ["#/hangman","Disk Error Hangman","Guess the machine or game before the floppies run out.","","floppy"],
  ["#/today","Today's find","A ready-to-post card for one piece of history. Story, square and wide sizes.","","camera"],
  ["#/build","Build Your Rig","Pick a year, spend your points, and run the era's real games. Beat the Wanted list.","","tower"],
  ["#/adlab","Ad Lab","Make a retro tribute ad for any item, with stickers, and download it as a picture.","","news"],
  ["#/maze","Memory Maze","The original: run the maze, grab the Ks, dodge the crashes.","","ghost"],
  ["#/trophies","Trophy room","Your level, badges and records across every game.",Object.keys(p.badges).length+" of "+PB.length+" badges","trophy"]];
 app.innerHTML='<section><h2>Play</h2><p>Small games built from the museum and the timeline. One profile levels up across all of them.</p><div class="pl-grid">'+cards.map(function(c){return'<a class="hm-tile" href="'+c[0]+'"><i class="hm-ic">'+glyph(c[4],28)+'</i><b>'+E(c[1])+'</b><span>'+E(c[2])+(c[3]?' <em>'+E(c[3])+'</em>':"")+'</span></a>'}).join("")+'</div><p class="tn"><a href="#/styleguide">Style guide</a></p></section>'}

/* ================= Daily Dig ================= */
var DK="cm-daily";
function dpool(){return TL.filter(function(r){var y=+r[0].slice(0,4);return/^(hw|sw|gt|gn|gc)$/.test(r[1])&&y>=1975&&y<=2012&&r[2]&&((TLXS[r[2]]||{}).maker||r[3])})}
function yearOpts(y,R){var offs=shuf([-1,1,-2,2,-3,3,-4,4,-6,6,-9,9],R),o=[y];for(var i=0;i<offs.length&&o.length<4;i++){var v=y+offs[i];if(v>=TLMIN&&v<=2012&&o.indexOf(v)<0)o.push(v)}return o.sort(function(a,b){return a-b})}
function niceMoney(v){var m=v<100?5:v<1000?25:100;return Math.max(m,Math.round(v/m)*m)}
function buildDaily(seed){var R=prng(seed),P=dpool(),e=P[Math.floor(R()*P.length)],x=TLXS[e[2]]||{},y=+e[0].slice(0,4),Q=[];
 var yo=yearOpts(y,R);Q.push({p:"Which year did this come out?",o:yo.map(String),a:yo.indexOf(y),f:"It came out in "+fmtDate(e[0])+(e[5]?"":" (the exact date is not confirmed)")+"."});
 var pr=usdOf(e[3]);
 if(pr>0){var mult=shuf([.35,.5,.7,1.5,2.2,3.5],R).slice(0,3),vals=[pr].concat(mult.map(function(m){return niceMoney(pr*m)})),seen={},u=[];vals.forEach(function(v){var k=Math.round(v);if(!seen[k]){seen[k]=1;u.push(v)}});
  while(u.length<4)u.push(niceMoney(pr*(2+u.length)));u=u.slice(0,4).sort(function(a,b){return a-b});
  Q.push({p:"What did it cost at launch?",o:u.map(money),a:u.indexOf(pr)>=0?u.indexOf(pr):0,f:"Launch price: "+e[3].replace(/\*$/," (an estimate)")+"."+(inflNote(e[3],y)?" That is "+inflNote(e[3],y)+".":"")})}
 else if(x.maker){var mk=[],sm={};sm[x.maker]=1;shuf(P,R).forEach(function(r){var m=(TLXS[r[2]]||{}).maker;if(m&&!sm[m]&&mk.length<3){sm[m]=1;mk.push(m)}});var mo=shuf([x.maker].concat(mk),R);Q.push({p:"Who made it?",o:mo,a:mo.indexOf(x.maker),f:"Made by "+x.maker+"."})}
 else{Q.push({p:"Was it released before or after 1990?",o:["Before 1990","1990 or later"],a:y<1990?0:1,f:"It came out in "+y+"."})}
 var others=P.filter(function(r){return r[2]!==e[2]&&Math.abs(+r[0].slice(0,4)-y)>=2}),e2=others[Math.floor(R()*others.length)],pair=R()<.5?[e,e2]:[e2,e];
 Q.push({p:"Which came first?",o:[pair[0][2],pair[1][2]],a:+pair[0][0].slice(0,4)<+pair[1][0].slice(0,4)?0:1,f:pair[0][2]+" came out in "+pair[0][0].slice(0,4)+", "+pair[1][2]+" in "+pair[1][0].slice(0,4)+"."});
 return{e:e,x:x,y:y,Q:Q}}
function dstr(off){var d=new Date();d.setDate(d.getDate()-off);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0")}
function hideSet(G,step,seed){var q=G.Q[step],w=[];q.o.forEach(function(_,i){if(i!==q.a)w.push(i)});return shuf(w,prng(seed+step*31)).slice(0,Math.min(2,w.length-1))}
function dayScore(day,D){var G=buildDaily(hstr("dig"+day)),an=D.hist[day],hn=(D.hint||{})[day]||[];if(!an||an.length<G.Q.length)return null;var good=0,clean=0;G.Q.forEach(function(q,i){if(an[i]===q.a){good+=hn[i]?.5:1;if(!hn[i])clean++}});return{good:good,perfect:clean===G.Q.length}}
function dClean(D){if(!D||typeof D!=="object"||Array.isArray(D))D={};["streak","best","total","shield","perfect","saved"].forEach(function(k){D[k]=nz(D[k])});D.last=typeof D.last==="string"?D.last.slice(0,10):"";["hist","hint"].forEach(function(k){if(!D[k]||typeof D[k]!=="object"||Array.isArray(D[k]))D[k]={}});return D}
function daily(arg){var practice=arg==="practice",t=today(),seed=practice?Math.floor(Math.random()*1e9):hstr("dig"+t),G=buildDaily(seed),D=dClean(ld(DK,{streak:0,best:0,last:"",total:0,hist:{},hint:{},shield:0,perfect:0,saved:0})),ans=practice?[]:(D.hist[t]||[]).slice(),hn=practice?[]:((D.hint=D.hint||{})[t]||[]).slice(),aw=null;
 function good(){var g=0;G.Q.forEach(function(q,i){if(ans[i]===q.a)g+=hn[i]?.5:1});return g}
 function draw(){var step=ans.length,done=step>=G.Q.length,h='<section class="pl"><h2>Daily Dig'+(practice?" (practice)":"")+'</h2>'
  +'<p class="pl-hud"><span>Streak <b>'+D.streak+'</b></span><span>Best <b>'+D.best+'</b></span><span>Dug up <b>'+D.total+'</b></span><span title="A shield saves your streak if you miss one day. You earn one every 7 days.">Shields <b>'+(D.shield||0)+'</b></span><span>'+(practice?"No streak in practice":E(t))+'</span></p>'
  +'<div class="pl-case">'+artHtml(G.e)+'<p class="tn">'+(done?"":"Today's mystery find. Look closely.")+'</p></div>';
  if(!done){var q=G.Q[step],hid=hn[step]?hideSet(G,step,seed):[];h+='<div class="pl-q"><p class="pl-step">Question '+(step+1)+' of '+G.Q.length+' '+G.Q.map(function(_,i){return'<i class="pl-pip'+(i<step?" on":i===step?" now":"")+'"></i>'}).join("")+'</p><h3>'+E(q.p)+'</h3><div class="pl-opts">'+q.o.map(function(o,i){return hid.indexOf(i)>=0?"":'<button class="btn" type="button" data-o="'+i+'">'+E(o)+'</button>'}).join("")+'</div>'
   +(hn[step]?'<p class="tn">50/50 used: two wrong answers removed. A right answer now counts half.</p>':'<p><button class="btn" id="plhint" type="button" title="Removes two wrong answers. A right answer then counts half.">50/50 hint (half credit)</button></p>')+'</div>'}
  else{var gd=good(),clean=G.Q.every(function(q,i){return ans[i]===q.a&&!hn[i]}),sq=G.Q.map(function(q,i){return ans[i]===q.a?(hn[i]?"◩":"■"):"□"}).join(""),txt="Daily Dig "+(practice?"practice":t)+" "+gd+"/"+G.Q.length+" "+sq+(practice?"":"  Streak "+D.streak)+"\n"+SITE_URL+"#/daily";
   h+=(clean?boom():"")+'<div class="pl-res"><h3>'+(clean?'<span class="pl-stars">★★★</span> ':"")+gd+' of '+G.Q.length+(clean?" — perfect dig!":gd?" — nice digging":" — better luck tomorrow")+'</h3>'+awardHtml(aw)+'<div class="pl-sq">'+G.Q.map(function(q,i){return'<i class="'+(ans[i]===q.a?(hn[i]?"half":"ok"):"no")+'"></i>'}).join("")+'</div>'
   +'<ul class="pl-fb">'+G.Q.map(function(q,i){return'<li class="'+(ans[i]===q.a?"ok":"no")+'"><b>'+E(q.p)+'</b> You said '+E(q.o[ans[i]])+(hn[i]?" (with a 50/50 hint)":"")+(ans[i]===q.a?"":". Answer: "+E(q.o[q.a]))+'. '+E(q.f)+'</li>'}).join("")+'</ul>'
   +'<div class="pl-about"><h4>About '+E(G.e[2])+'</h4><p>'+E(G.e[4]||"")+' '+E(((G.x.detail||"").slice(0,420))+((G.x.detail||"").length>420?"...":""))+'</p><p><a class="btn" href="#/timeline/'+G.y+'/'+encodeURIComponent(G.e[2])+'">See it on the timeline</a></p></div>'
   +sharePanel(txt)+'<p>'+(practice?'<a class="btn pri" href="#/daily/practice" id="again">Another practice dig</a> ':'<a class="btn" href="#/daily/practice">Practice dig</a> ')+'<a class="btn" href="#/play">All games</a></p></div>'}
  if(!practice){var cal="",avg=D.total?(D.pts||0)/D.total:0;for(var i=13;i>=0;i--){var d=dstr(i),sc=dayScore(d,D),cl=!sc?"":sc.perfect?"perfect":sc.good>0?"ok":"miss";cal+='<i class="pl-cd '+cl+'" title="'+E(d)+(sc?": "+sc.good+" of 3":": not played")+'"></i>'}
   h+='<div class="pl-stats"><h4>Your dig stats</h4><p>Played <b>'+D.total+'</b> days, <b>'+(D.perfect||0)+'</b> perfect, average <b>'+avg.toFixed(1)+'</b> of 3. Streak shields saved your streak <b>'+(D.saved||0)+'</b> time'+(D.saved===1?"":"s")+'.</p><p class="pl-cal" aria-label="Last 14 days">'+cal+'</p><p class="tn">Last 14 days, oldest first: gold is a perfect dig, green is a pass, red is a miss.</p></div>'}
  app.innerHTML=h+'</section>';
  var hb=$("#plhint");if(hb)hb.onclick=function(){hn[ans.length]=1;if(!practice){D.hint=D.hint||{};D.hint[t]=hn.slice();sv(DK,D)}draw()};
  $$("[data-o]").forEach(function(b){b.onclick=function(){ans.push(+b.dataset.o);var fin=ans.length>=G.Q.length;
   if(!practice){D.hist[t]=ans.slice();if(fin){D.streak=D.last===dstr(1)?D.streak+1:D.last&&D.last===dstr(2)&&D.shield>0&&D.last!==t?(D.shield--,D.saved=(D.saved||0)+1,D.streak+1):1;if(D.last!==t){if(D.streak%7===0&&D.streak>0)D.shield=Math.min(3,(D.shield||0)+1);D.total++;D.pts=(D.pts||0)+good();if(G.Q.every(function(q,i){return ans[i]===q.a&&!hn[i]}))D.perfect=(D.perfect||0)+1}D.best=Math.max(D.best,D.streak);D.last=t;
    var ks=Object.keys(D.hist).sort();while(ks.length>60){delete D.hist[ks[0]];delete(D.hint||{})[ks[0]];ks.shift()}}sv(DK,D)}
   if(fin){var cl=G.Q.every(function(q,i){return ans[i]===q.a&&!hn[i]});aw=pAdd("daily",practice?good()*3:good()*8+(cl?10:0),practice?null:function(st){st.digs=(st.digs||0)+1;if(cl)st.perfect=(st.perfect||0)+1;st.maxStreak=Math.max(st.maxStreak||0,D.streak)})}
   draw()}});
  if(done){var tx=$("#plsh");if(tx)wireShare(tx.value);var ag=$("#again");if(ag)ag.onclick=function(e){e.preventDefault();daily("practice")}}}
 draw()}

/* ================= Build Your Rig ================= */
var RK="cm-rig",RBUD=10;
function rigWindow(year){return GXRIGS.filter(function(r){return r.y<=year}).slice(-4)}
function rigOptions(year){var t=rigWindow(year);while(t.length<4)t.unshift(t[0]);
 var snd=[["PC speaker beeps",0,"Every PC had one. Every beep was a feature."]];
 var cards=TL.filter(function(r){var x=TLXS[r[2]]||{},y=+r[0].slice(0,4);return x.type==="Sound or MIDI"&&y<=year&&y>=year-6&&/blaster|adlib|ultrasound|spectrum|awe|sc-55|mt-32|sc-88/i.test(r[2])}).sort(function(a,b){return a[0]<b[0]?1:-1}).slice(0,2);
 cards.forEach(function(r,i){snd.push([r[2],i+1,(TLXS[r[2]]||{}).detail?String((TLXS[r[2]]||{}).detail).slice(0,110):"A real sound card of the era."])});
 return{cpu:t.map(function(r,i){return{k:r.n,c:i+1,v:{cls:r.cls,mhz:r.mhz},l:GXCLS[r.cls]+", "+r.mhz+" MHz"}}),ram:t.map(function(r,i){return{k:gxRam(r.ram),c:i+1,v:r.ram,l:gxRam(r.ram)}}),vid:t.map(function(r,i){return{k:gxRam(r.vram),c:i+1,v:r.vram,l:r.vram?gxRam(r.vram)+" video memory":"Basic video"}}),snd:snd.map(function(s,i){return{k:s[0],c:s[1],l:s[0],d:s[2]}})}}
function rigGames(year,seed){var R=prng(seed),out=[];Object.keys(GX).forEach(function(t){var x=GX[t];if(!x.n||(x.n.cls==null&&x.n.mhz==null&&x.n.ramMB==null))return;var pc=typeof gxPc==="function"?gxPc(x):null;if(!pc)return;var y=+pc[1].slice(0,4);if(y<year-1||y>year)return;out.push(t)});
 return shuf(out,R).slice(0,16)}
function rigEval(games,pick,O){var rig={cls:O.cpu[pick[0]].v.cls,mhz:O.cpu[pick[0]].v.mhz,ram:O.ram[pick[1]].v,vram:O.vid[pick[2]].v},ok=0,great=0,det=[];
 games.forEach(function(t){var x=GX[t],m=gxMeets(rig,x.n),g=x.m?gxMeets(rig,x.m):{ok:null};if(m.ok===true){ok++;if(g.ok===true)great++}det.push({t:t,ok:m.ok,great:g.ok===true,miss:m.miss})});
 return{ok:ok,great:great,score:ok*10+great*5,det:det}}
function rigBest(games,O){var best=0;for(var a=0;a<4;a++)for(var b=0;b<4;b++)for(var c=0;c<4;c++){if(O.cpu[a].c+O.ram[b].c+O.vid[c].c>RBUD)continue;var s=rigEval(games,[a,b,c],O).score;if(s>best)best=s}return best}
function rigBestPick(games,O){var best={s:-1,p:[0,0,0]};for(var a=0;a<4;a++)for(var b=0;b<4;b++)for(var c=0;c<4;c++){if(O.cpu[a].c+O.ram[b].c+O.vid[c].c>RBUD)continue;var sc=rigEval(games,[a,b,c],O).score;if(sc>best.s)best={s:sc,p:[a,b,c]}}return best}
function build(arg){var P=ld(RK,{best:{}}),year=+arg||1996;year=Math.max(1991,Math.min(2002,year));var O=rigOptions(year),seed=hstr("rig"+year+(P.reroll&&P.reroll[year]||"")),games=rigGames(year,seed),pick=[1,1,1,0],showRes=false,wanted=games.slice(0,3),hintTxt="",bestTxt="",aw=null;
 function cost(){return O.cpu[pick[0]].c+O.ram[pick[1]].c+O.vid[pick[2]].c+O.snd[pick[3]].c}
 function wantedHtml(res){if(games.length<6)return"";var ok=res?res.det.filter(function(d){return wanted.indexOf(d.t)>=0&&d.ok===true}).length:0;return'<div class="pl-wanted"><b>'+glyph("skull",18)+' WANTED: your customer needs these to run</b><ul>'+wanted.map(function(t){var d=res&&res.det.filter(function(x){return x.t===t})[0];return'<li class="'+(d?(d.ok===true?"ok":"no"):"")+'">'+E(t)+(d?(d.ok===true?" runs":" does not run"):"")+'</li>'}).join("")+'</ul>'+(res?'<p>'+(ok===3?'<b>Bounty collected!</b> All three run.':ok+' of 3 run. Run all three to collect the bounty.')+'</p>':'<p class="tn">Run all three for a bounty bonus.</p>')+'</div>'}
 function hintNext(){var base=rigEval(games,pick,O).score,used=cost(),best=null,names=["processor","memory","video card"],lists=[O.cpu,O.ram,O.vid];for(var k=0;k<3;k++){if(pick[k]>=3)continue;var np=pick.slice();np[k]++;if(used+1>RBUD&&lists[k][np[k]].c-lists[k][pick[k]].c>0&&used+(lists[k][np[k]].c-lists[k][pick[k]].c)>RBUD)continue;var d=rigEval(games,np,O).score-base;if(!best||d>best.d)best={d:d,k:k,t:lists[k][np[k]].l}}return best&&best.d>0?'Best next upgrade: your '+names[best.k]+' to '+best.t+' (+'+best.d+' score).':'No single upgrade within the budget helps. Try swapping points between parts.'}
 function draw(){var used=cost(),over=used>RBUD,res=showRes&&!over?rigEval(games,pick,O):null,best=games.length>=6?rigBest(games,O):0;
  var slot=function(key,label,ic,list,idx){return'<fieldset class="pl-slot"><legend>'+glyph(ic,18)+' '+label+'</legend>'+list.map(function(o,i){return'<label class="pl-opt'+(pick[idx]===i?" on":"")+'"><input type="radio" name="s'+idx+'" value="'+i+'"'+(pick[idx]===i?" checked":"")+'><span><b>'+E(o.l)+'</b><i class="pl-cost">'+o.c+' pt'+(o.c===1?"":"s")+'</i>'+(o.d?'<small>'+E(o.d)+'</small>':"")+'</span></label>'}).join("")+'</fieldset>'};
  var h='<section class="pl"><h2>Build Your Rig</h2><p>It is <b>'+year+'</b>. You have <b>'+RBUD+' points</b>. Spend them on a CPU, RAM, video and sound, then find out which of the era\'s real games it can run. The games are real, from the games data, and each one is checked against its minimum requirements.</p>'
   +'<p class="pl-yr"><label for="plyr">Year: <b id="plyv">'+year+'</b></label> <input id="plyr" type="range" min="1991" max="2002" value="'+year+'"> <button class="btn" id="plre" type="button">Different games</button></p>';
  if(games.length<6)return app.innerHTML=h+'<p class="empty">Only '+games.length+' games with requirements are on file for '+year+'. Pick another year.</p></section>';
  h+='<div class="pl-meter'+(over?" over":"")+'" role="status"><span class="mbar"><i style="width:'+Math.min(100,used*100/RBUD)+'%"></i></span> <b>'+used+' of '+RBUD+' points</b>'+(over?" — over budget! Pick something cheaper.":"")+'</div>'
   +wantedHtml(res)+'<div class="pl-slots">'+slot("cpu","Processor","chip",O.cpu,0)+slot("ram","Memory","ram",O.ram,1)+slot("vid","Video","card",O.vid,2)+slot("snd","Sound","speaker",O.snd,3)+'</div>'
   +'<p><button class="btn pri" id="plgo" type="button"'+(over?" disabled":"")+'>Boot it up!</button> <button class="btn" id="plhint" type="button"'+(over?" disabled":"")+'>Best next upgrade?</button> <button class="btn" id="plbest" type="button">Show the best build</button></p>'+(hintTxt?'<p class="pl-hint" role="status">'+E(hintTxt)+'</p>':"")+(bestTxt?'<p class="pl-hint" role="status">'+E(bestTxt)+'</p>':"");
  if(res){var pct=best?Math.round(res.score*100/best):100,stars=pct>=100?3:pct>=75?2:pct>=45?1:0,prev=P.best[year]||0;if(res.score>prev){P.best[year]=res.score;sv(RK,P)}
   var snd=pick[3]>0?" with "+O.snd[pick[3]].k:" with a PC speaker";
   var txt="Build Your Rig "+year+": "+res.ok+"/"+games.length+" games run "+"★".repeat(stars)+"☆".repeat(3-stars)+"\n"+O.cpu[pick[0]].l+", "+O.ram[pick[1]].l+", "+O.vid[pick[2]].l+snd+"\n"+SITE_URL+"#/build/"+year;
   h+=(stars===3?boom():"")+'<div class="pl-res">'+awardHtml(aw)+'<h3><span class="pl-stars">'+('★'.repeat(stars)+'☆'.repeat(3-stars))+'</span> '+res.ok+' of '+games.length+' games run</h3><p>'+res.great+' meet the recommended specs too. Score <b>'+res.score+'</b>'+(best?' of a best possible <b>'+best+'</b> for this budget':"")+'. Your best here: <b>'+Math.max(prev,res.score)+'</b>.'+(pct>=100?" That is the best build the budget allows!":"")+'</p>'
    +'<ul class="pl-games">'+res.det.sort(function(a,b){return(b.ok===true)-(a.ok===true)}).map(function(d){return'<li class="'+(d.ok===true?(d.great?"great":"ok"):d.ok===false?"no":"unk")+'"><b>'+E(d.t)+'</b> '+(d.ok===true?(d.great?"runs great":"runs"):d.ok===false?"needs: "+E(d.miss.join("; ")):"requirements unclear")+'</li>'}).join("")+'</ul>'+sharePanel(txt)+'</div>'}
  app.innerHTML=h+'</section>';
  $$("input[type=radio]").forEach(function(r){r.onchange=function(){pick[+r.name.slice(1)]=+r.value;showRes=false;hintTxt="";aw=null;draw()}});
  $("#plyr").oninput=function(){$("#plyv").textContent=this.value};$("#plyr").onchange=function(){location.hash="#/build/"+this.value};
  $("#plre").onclick=function(){P.reroll=P.reroll||{};P.reroll[year]=Math.floor(Math.random()*1e6);sv(RK,P);build(year)};
  $("#plhint").onclick=function(){hintTxt=hintNext();draw()};
  $("#plbest").onclick=function(){var b=rigBestPick(games,O);bestTxt="Best build for "+RBUD+" points: "+O.cpu[b.p[0]].l+", "+O.ram[b.p[1]].l+", "+O.vid[b.p[2]].l+" (score "+b.s+"). Sound is free of score, so pick your favorite.";draw()};
  $("#plgo").onclick=function(){var o=rigEval(games,pick,O),wk=o.det.filter(function(d){return wanted.indexOf(d.t)>=0&&d.ok===true}).length===3;aw=pAdd("build",o.ok*2+(wk?15:0),function(st){st.rigs=(st.rigs||0)+1;if(wk)st.bounty=(st.bounty||0)+1});showRes=true;draw();var r=$(".pl-res");if(r)r.scrollIntoView({behavior:"smooth",block:"start"})};
  if(res)wireShare($("#plsh").value)}
 draw()}

/* ================= Ad Lab ================= */
var STORES=["Bit Barn Computers","Bargain Bytes Software","Megabyte Mart","Floppy Depot","Cache Cash & Carry"],TAGS=["Prices good while supplies last.","Ask about our extended warranty!","Open late on Fridays.","No money down.*","Free mousepad with purchase!","See store for details."];
var HEADS=["Meet the {n}.","{n}: the one everybody is talking about!","Hurry! {n} while supplies last.","Get the {n} before your neighbor does.","{n}. Faster than your last one.","Plug in. Power up. {n}.","The {n} is here. Your move.","Why wait? {n} ships today.","{n}: now with more everything.","Your friends will want a {n}.","Don't get left behind. Get the {n}.","{n}: the future, in a beige box.","Everybody on your block has a {n}. Almost.","Turn it up. Turn it on. {n}.","Beat the rush: {n} is in stock!","{n}. It's not a toy. (It's a little bit a toy.)","One {n} per customer, please.","The {n}: because 640K was not enough.","Warning: {n} may be habit forming.","Say goodbye to the old way. Say hello to {n}."];
var STK=[["NEW!","#ffd400","#c4161c"],["SALE","#c4161c","#ffffff"],["486 INSIDE","#1b3f94","#ffffff"],["MULTIMEDIA!","#00a0a0","#ffffff"],["CD-ROM READY","#222222","#ffd400"],["TURBO","#e87800","#ffffff"],["Y2K OK","#008800","#ffffff"],["FREE SHIPPING*","#6a1b9a","#ffffff"]],AGK="cm-ads";
var AD={stk:[],src:null,style:"flyer",fmt:"land",store:0,head:"",tag:"",price:"",roll:0,q:""};
function adSources(q){q=q.toLowerCase().trim();var out=[];if(q.length<2)return out;ITEMS.forEach(function(it){if((it.name+" "+(it.maker||"")).toLowerCase().indexOf(q)>=0)out.push({kind:"item",it:it,t:it.name,sub:"in the museum"})});
 TL.forEach(function(r){if(out.length>=14||!/^(hw|pe|sw|gt|gn|gc)$/.test(r[1]))return;if(r[2].toLowerCase().indexOf(q)>=0&&!out.some(function(o){return o.t===r[2]}))out.push({kind:"tl",r:r,t:r[2],sub:"timeline "+r[0].slice(0,4)})});return out.slice(0,12)}
function adData(s){if(s.kind==="item"){var it=s.it,k=prodKind(it),sp=pickSpecs(it,k).slice(0,3).map(function(x){return x[0]+": "+String(x[1]).slice(0,26)}),p=priceOf(it);return{title:it.name,maker:it.maker||"",year:it.year,price:p.t||"",est:!!p.est,specs:sp,art:prodSvg(it,400,300,"al")}}
 var r=s.r,x=TLXS[r[2]]||{},p=guessPrice(r,+r[0].slice(0,4));return{title:r[2],maker:x.maker||"",year:+r[0].slice(0,4),price:p.t||"",est:!!p.est,specs:Object.keys(x.specs||{}).slice(0,3).map(function(k){return k+": "+String(x.specs[k]).slice(0,26)}),art:artFor(r,400,300,"al")}}
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
 var sw=Math.round(Math.min(artW,artH)*.3),sh=Math.round(sw*.3);(o.stk||[]).slice(0,4).forEach(function(k,i){var st=STK[k];if(!st)return;var bx=artX+10+i*(sw*.58),by=artY+artH-sh*1.6-i%2*sh*.3,rot=(i%2?6:-7);s+='<g transform="rotate('+rot+' '+(bx+sw/2)+' '+(by+sh/2)+')"><rect x="'+bx+'" y="'+by+'" width="'+sw+'" height="'+sh+'" rx="6" fill="'+st[1]+'" stroke="#1a1a1a" stroke-width="3"/><text x="'+(bx+sw/2)+'" y="'+(by+sh*.68)+'" text-anchor="middle" '+FS+' font-size="'+Math.round(sh*.55)+'" fill="'+st[2]+'">'+xesc(st[0])+'</text></g>'});
 s+='<text x="'+(W/2)+'" y="'+(H-pad*1.2)+'" text-anchor="middle" '+TS+' font-size="'+Math.round(Math.max(13,W*.014))+'" fill="'+P.ink+'" opacity=".8">Tribute ad. Made-up store, real timeline data. Nothing here can be ordered. Call 1-800-555-0142 (not a real number).</text></svg>';
 return s}
function adFind(g){return adSources(g.t).filter(function(s){return s.t===g.t&&s.kind===g.kind})[0]||adSources(g.t)[0]}
function adlab(arg){if(arg&&!AD.src){var f=adSources(decodeURIComponent(arg))[0];if(f)pick(f)}
 function pick(s){AD.src=s;var d=adData(s);AD.head=headFor(d,AD.roll);AD.tag=TAGS[hstr(d.title)%TAGS.length];AD.price=d.price?String(d.price).replace(/\*$/,"").split(/[ ;(]/)[0]:"";AD.d=d}
 function draw(){var h='<section class="pl"><h2>Ad Lab</h2><p>Make a retro tribute ad for anything in the museum or on the timeline, then download it as a picture. The store is made up and the phone number is not real.</p>'
  +'<p><label for="adq">Find an item</label> <input id="adq" placeholder="Sound Blaster, Voodoo, Game Boy..." value="'+E(AD.q)+'"> <button class="btn" id="adsr" type="button">Search</button> <button class="btn" id="adrn" type="button">Surprise me</button></p><div id="adres"></div>';
  if(AD.src){var o={style:AD.style,fmt:AD.fmt,store:AD.store,head:AD.head,tag:AD.tag,price:AD.price,stk:AD.stk},svg=adSvg(AD.d,o);
   h+='<div class="pl-ctl"><fieldset><legend>Style</legend>'+[["flyer","Sunday flyer"],["mag","Magazine page"],["cat","Mail-order catalog"]].map(function(s){return'<label><input type="radio" name="ads" value="'+s[0]+'"'+(AD.style===s[0]?" checked":"")+'> '+s[1]+'</label>'}).join(" ")+'</fieldset>'
   +'<fieldset><legend>Size</legend>'+[["land","Wide (1200x630)"],["sq","Square (1080x1080)"],["tall","Tall (1080x1920)"]].map(function(s){return'<label><input type="radio" name="adf" value="'+s[0]+'"'+(AD.fmt===s[0]?" checked":"")+'> '+s[1]+'</label>'}).join(" ")+'</fieldset></div>'
   +'<p><label for="adst">Store</label> <select id="adst">'+STORES.map(function(s,i){return'<option value="'+i+'"'+(AD.store===i?" selected":"")+'>'+E(s)+'</option>'}).join("")+'</select></p>'
   +'<p><label for="adh">Headline</label> <input id="adh" value="'+E(AD.head)+'"> <button class="btn" id="adrl" type="button">Roll a new one</button></p><p><label for="adt">Tagline</label> <input id="adt" value="'+E(AD.tag)+'"></p><p><label for="adp">Price</label> <input id="adp" value="'+E(AD.price)+'" size="12"> <small class="tn">Leave blank for no price burst.</small></p>'
   +'<fieldset class="pl-stk"><legend>Stickers (up to 4)</legend>'+STK.map(function(k,i){return'<label><input type="checkbox" data-stk="'+i+'"'+(AD.stk.indexOf(i)>=0?" checked":"")+'> '+E(k[0])+'</label>'}).join(" ")+'</fieldset>'
   +'<div class="pl-prev" id="adprev">'+svg+'</div><p><button class="btn pri" id="addl" type="button">Download PNG</button> <button class="btn" id="adsv" type="button">Save to my gallery</button> <span class="tn" id="adnote" role="status"></span></p><p class="tn">The picture is the drawn art, not a photo, so the download is never blocked by another site.</p>'}
  var gal=ld(AGK,{l:[]}).l||[];if(gal.length)h+='<h3 class="sub">My ad gallery</h3><div class="pl-gal">'+gal.map(function(g,i){var src=adFind(g),th=src?adSvg(adData(src),g.o):"";return'<figure><div class="th">'+th+'</div><figcaption>'+E(g.t)+' <button class="btn" data-go="'+i+'" type="button">Open</button> <button class="btn" data-gx="'+i+'" type="button">Delete</button></figcaption></figure>'}).join("")+'</div>';
  app.innerHTML=h+'</section>';
  $$("[data-go]").forEach(function(b){b.onclick=function(){var g=gal[+b.dataset.go],src=adFind(g);if(!src)return;pick(src);AD.style=g.o.style;AD.fmt=g.o.fmt;AD.store=g.o.store;AD.head=g.o.head;AD.tag=g.o.tag;AD.price=g.o.price;AD.stk=(g.o.stk||[]).slice();draw();window.scrollTo(0,0)}});
  $$("[data-gx]").forEach(function(b){b.onclick=function(){gal.splice(+b.dataset.gx,1);sv(AGK,{l:gal});draw()}});
  var qq=$("#adq");qq.oninput=function(){AD.q=qq.value};var go=function(){AD.q=qq.value;var res=adSources(AD.q);$("#adres").innerHTML=res.length?res.map(function(s,i){return'<button class="btn" data-ap="'+i+'" type="button">'+E(s.t)+' <small>('+E(s.sub)+')</small></button>'}).join(" "):'<p class="tn">'+(AD.q.length<2?"Type at least two letters.":"Nothing found.")+'</p>';$$("[data-ap]",$("#adres")).forEach(function(b){b.onclick=function(){pick(res[+b.dataset.ap]);draw()}})};
  $("#adsr").onclick=go;qq.onkeydown=function(e){if(e.key==="Enter")go()};
  $("#adrn").onclick=function(){var pool=ITEMS.length&&Math.random()<.5?ITEMS.map(function(it){return{kind:"item",it:it,t:it.name}}):TL.filter(function(r){return/^(hw|pe|sw|gt)$/.test(r[1])}).map(function(r){return{kind:"tl",r:r,t:r[2]}});pick(pool[Math.floor(Math.random()*pool.length)]);draw()};
  if(!AD.src)return;
  var refresh=function(){AD.head=$("#adh").value;AD.tag=$("#adt").value;AD.price=$("#adp").value;$("#adprev").innerHTML=adSvg(AD.d,{style:AD.style,fmt:AD.fmt,store:AD.store,head:AD.head,tag:AD.tag,price:AD.price,stk:AD.stk})};
  ["#adh","#adt","#adp"].forEach(function(s){$(s).oninput=refresh});$("#adst").onchange=function(){AD.store=+this.value;refresh()};
  $$("input[name=ads]").forEach(function(r){r.onchange=function(){AD.style=r.value;refresh()}});$$("input[name=adf]").forEach(function(r){r.onchange=function(){AD.fmt=r.value;refresh()}});
  $$("[data-stk]").forEach(function(c){c.onchange=function(){var i=+c.dataset.stk,x=AD.stk.indexOf(i);if(x>=0)AD.stk.splice(x,1);else if(AD.stk.length<4)AD.stk.push(i);else c.checked=false;refresh()}});
  $("#adsv").onclick=function(){var l=ld(AGK,{l:[]}).l||[];l.unshift({t:AD.src.t,kind:AD.src.kind,o:{style:AD.style,fmt:AD.fmt,store:AD.store,head:AD.head,tag:AD.tag,price:AD.price,stk:AD.stk.slice()}});sv(AGK,{l:l.slice(0,8)});draw()};
  $("#adrl").onclick=function(){AD.roll++;AD.head=headFor(AD.d,AD.roll);$("#adh").value=AD.head;refresh()};
  $("#addl").onclick=function(){var svg=adSvg(AD.d,{style:AD.style,fmt:AD.fmt,store:AD.store,head:AD.head,tag:AD.tag,price:AD.price,stk:AD.stk}),wh=FMT[AD.fmt],n=$("#adnote"),im=new Image();
   im.onload=function(){var c=document.createElement("canvas");c.width=wh[0];c.height=wh[1];c.getContext("2d").drawImage(im,0,0,wh[0],wh[1]);c.toBlob(function(b){if(!b){n.textContent="Could not make the picture. Try another size.";return}var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=(AD.d.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"ad")+"-ad.png";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},3000);n.textContent="Downloaded.";var ar=pAdd("adlab",5,function(st){st.ads=(st.ads||0)+1});if(ar.nb.length||ar.up)n.textContent="Downloaded. +5 XP"+ar.nb.map(function(b){return" Badge: "+b[1]+"!"}).join("")},"image/png")};
   im.onerror=function(){n.textContent="Your browser could not render this ad to a picture."};im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg)}}
 draw()}

/* ================= Play profile: XP, levels, badges, stats shared by every game ================= */
var PK="cm-play",PT=["Floppy Newbie","BBS Regular","Shareware Hunter","Overclocker","Sysop","Demoscener","Hardware Hacker","Museum Curator","Legend"];
function nz(x){x=Math.floor(+x);return isFinite(x)&&x>0?Math.min(x,1e9):0}
function pf(){var p=ld(PK,{xp:0,badges:{},st:{}});if(!p||typeof p!=="object"||Array.isArray(p))p={xp:0,badges:{},st:{}};p.xp=nz(p.xp);if(typeof p.badges!=="object"||Array.isArray(p.badges))p.badges=null;if(typeof p.st!=="object"||Array.isArray(p.st))p.st=null;p.badges=p.badges||{};p.st=p.st||{};p.st.played=p.st.played||{};return p}
function plvl(xp){return Math.floor(Math.sqrt(xp/30))+1}
var PB=[["dig1","First Dig","Finish a Daily Dig","bulb",function(p){return p.st.digs>=1}],["perf","Perfect Dig","Get 3 of 3 with no 50/50 hints","star",function(p){return p.st.perfect>=1}],["wk","Week Streak","Reach a 7 day Daily Dig streak","flag",function(p){return p.st.maxStreak>=7}],
 ["hl5","Price Sense","Streak of 5 in Higher or Lower","coin",function(p){return p.st.hlBest>=5}],["hl12","Price Wizard","Streak of 12 in Higher or Lower","crown",function(p){return p.st.hlBest>=12}],
 ["ts20","Historian","Score 20 of 25 in Timeline Sort","clock",function(p){return p.st.tsBest>=20}],["ms20","Eagle Eye","Score 20 of 24 in Mystery Photo","camera",function(p){return p.st.msBest>=20}],
 ["rig","Rig Builder","Boot up a rig","tower",function(p){return p.st.rigs>=1}],["bounty","Bounty Hunter","Run all 3 Wanted games in a rig","skull",function(p){return p.st.bounty>=1}],["ads","Ad Exec","Download 3 ads","news",function(p){return p.st.ads>=3}],
 ["all","Arcade Regular","Play every game once","gem",function(p){return["daily","build","adlab","higher","sort","mystery","bingo","hangman"].every(function(k){return p.st.played[k]})}],["l5","Cache Hit","Reach level 5","trophy",function(p){return plvl(p.xp)>=5}],["bingo","Bingo!","Get a line in Retro Bingo","dice",function(p){return p.st.bingos>=1}],["hm5","Word Nerd","Solve 5 Hangman words","book",function(p){return p.st.hmWins>=5}]];
function pAdd(game,xp,upd){var p=pf(),lv=plvl(p.xp);p.xp+=Math.max(0,Math.round(xp));if(game)p.st.played[game]=1;if(upd)upd(p.st);var nb=[];PB.forEach(function(b){if(!p.badges[b[0]]&&b[4](p)){p.badges[b[0]]=1;nb.push(b)}});sv(PK,p);refreshBar();return{xp:Math.round(xp),up:plvl(p.xp)>lv?plvl(p.xp):0,nb:nb}}
function awardHtml(r){if(!r)return"";return'<div class="pl-award" role="status"><b>+'+r.xp+' XP</b>'+(r.up?' <span>Level up! Level '+r.up+': '+E(PT[Math.min(r.up-1,PT.length-1)])+'</span>':"")+r.nb.map(function(b){return' <span class="pl-nb">'+glyph(b[3],18)+' Badge: '+E(b[1])+'</span>'}).join("")+'</div>'}
function pbarHtml(){var p=pf(),lv=plvl(p.xp),base=30*(lv-1)*(lv-1),nx=30*lv*lv,pc=Math.round((p.xp-base)*100/(nx-base)),n=Object.keys(p.badges).length;return'<p class="pl-pbar"><b>Level '+lv+': '+E(PT[Math.min(lv-1,PT.length-1)])+'</b> <span class="mbar"><i style="width:'+pc+'%"></i></span> <small>'+p.xp+' XP, '+(nx-p.xp)+' to next</small> <a href="#/trophies">Trophy room ('+n+'/'+PB.length+')</a></p>'}
function refreshBar(){var b=document.getElementById("plbar");if(b)b.innerHTML=pbarHtml()}
function trophies(){var p=pf(),st=p.st,H=ld("cm-higher",{}),D=ld("cm-daily",{streak:0,best:0,total:0}),R=ld("cm-rig",{best:{}}),yrs=Object.keys(R.best||{}).length;
 var rows=[["Daily Dig","Streak "+D.streak+", best "+D.best+", "+(st.digs||0)+" digs, "+(st.perfect||0)+" perfect"],["Higher or Lower","Best streak "+(H.raw||0)+" (prices as listed), "+(H.adj||0)+" (today's money)"],["Timeline Sort","Best "+(st.tsBest||0)+" of 25"],["Mystery Photo","Best "+(st.msBest||0)+" of 24"],["Build Your Rig","Boots "+(st.rigs||0)+", "+yrs+" years played, "+(st.bounty||0)+" bounties"],["Ad Lab","Ads downloaded "+(st.ads||0)]];
 app.innerHTML='<section class="pl"><h2>Trophy room</h2><p>One profile for every game on this page, stored only on this device.</p>'
  +'<h3 class="sub">Badges</h3><div class="pl-badges">'+PB.map(function(b){var on=p.badges[b[0]];return'<div class="pl-bd'+(on?" on":"")+'">'+(on?glyph(b[3],32):'<span class="pl-q">?</span>')+'<b>'+E(on?b[1]:"Locked")+'</b><small>'+E(b[2])+'</small></div>'}).join("")+'</div>'
  +'<h3 class="sub">Records</h3><table class="pl-rec"><tbody>'+rows.map(function(r){return'<tr><th scope="row">'+E(r[0])+'</th><td>'+E(r[1])+'</td></tr>'}).join("")+'</tbody></table>'+'<h3 class="sub">Save to floppy</h3><p>Move your progress to another browser or device. Copy this code, then paste it into the box on the other device.</p><p><textarea readonly id="flo" rows="3" class="pl-flo">'+E(floppyOut())+'</textarea></p><p><label for="fli">Load a floppy code</label><br><textarea id="fli" rows="3" class="pl-flo"></textarea></p><p><button class="btn" id="flg" type="button">Load it</button> <span id="flm" class="tn" role="status"></span></p>'+bk()+'</section>';$("#flg").onclick=function(){var m=floppyIn($("#fli").value);$("#flm").textContent=m;refreshBar()}}
/* ================= Higher or Lower: guess which launch price is bigger ================= */
function hpool(adj){return TL.filter(function(r){var y=+r[0].slice(0,4);return r[2]&&/^(hw|pe|sw|gt|gn|gc)$/.test(r[1])&&usdOf(r[3])>0&&(!adj||CPI[y])})}
function hval(r,adj){var v=usdOf(r[3]);if(adj){var c=CPI[+r[0].slice(0,4)];if(c)v=v*CPI_NOW/c}return v}
function higher(arg){var adj=arg==="adj",P=hpool(adj),HK="cm-higher",B=ld(HK,{raw:0,adj:0}),s;
 function nextR(not){for(var i=0;i<60;i++){var r=P[Math.floor(Math.random()*P.length)];if(!not||r[2]!==not[2]&&Math.abs(Math.log(hval(r,adj)/hval(not,adj)))>.06)return r}return P[0]}
 function init(){s={lives:3,streak:0,best:0,cur:null,nxt:null,rev:0,over:0,aw:null};s.cur=nextR();s.nxt=nextR(s.cur)}
 function card(r,show){return'<div class="pl-vsc">'+artHtml(r)+'<h3>'+E(r[2])+'</h3><p class="tn">'+E(fmtDate(r[0]))+'</p><p class="pl-price">'+(show?(adj?money(hval(r,adj))+' <small>in today\'s money</small><br><small class="tn">listed '+E(r[3].replace(/\*$/,""))+'</small>':E(r[3].replace(/\*$/," (estimate)"))):"?")+'</p></div>'}
 function draw(){var h='<section class="pl"><h2>Higher or Lower</h2><p>Which launch price was bigger? '+(adj?'Prices are adjusted to today\'s money, so a 1983 sticker price counts for more.':'Prices as they were listed at the time.')+' Three lives.</p>'
  +'<p class="pl-hud"><span>Lives <b>'+"♥".repeat(s.lives)+"♡".repeat(3-s.lives)+'</b></span><span>Streak <b>'+s.streak+'</b></span><span>Best <b>'+Math.max(B[adj?"adj":"raw"],s.best)+'</b></span><a class="btn" href="#/higher'+(adj?"":"/adj")+'">'+(adj?"Use listed prices":"Use today\'s money")+'</a></p>';
  if(s.over){var txt="Higher or Lower"+(adj?" (today's money)":"")+": streak of "+s.best+"\n"+SITE_URL+"#/higher"+(adj?"/adj":"");
   return app.innerHTML=h+(s.best>=8?boom():"")+'<div class="pl-res"><h3>Game over: best streak '+s.best+'</h3>'+awardHtml(s.aw)+sharePanel(txt)+'<p><button class="btn pri" id="hl-again" type="button">Play again</button> <a class="btn" href="#/play">All games</a></p></div></section>',wireShare(txt),$("#hl-again").onclick=function(){init();draw()};
  }
  h+='<div class="pl-vs">'+card(s.cur,1)+'<div class="pl-vsx">VS</div>'+card(s.nxt,s.rev)+'</div>';
  if(!s.rev)h+='<p class="abar"><button class="btn pri" id="hl-hi" type="button">Costs more</button> <button class="btn" id="hl-lo" type="button">Costs less</button></p>';
  else{var ok=s.rev===2;h+='<p class="pl-fb1 '+(ok?"ok":"no")+'" role="status"><b>'+(ok?"Right!":"Nope.")+'</b> '+E(s.nxt[2])+' cost '+(hval(s.nxt,adj)>hval(s.cur,adj)?"more":"less")+'.</p><p><button class="btn pri" id="hl-next" type="button">'+(s.lives?"Next":"See results")+'</button></p>'}
  app.innerHTML=h+'</section>';
  function guess(up){var truth=hval(s.nxt,adj)>hval(s.cur,adj);if(up===truth){s.streak++;s.best=Math.max(s.best,s.streak);s.rev=2}else{s.lives--;s.streak=0;s.rev=1}draw()}
  var a=$("#hl-hi");if(a)a.onclick=function(){guess(true)};var b=$("#hl-lo");if(b)b.onclick=function(){guess(false)};
  var n=$("#hl-next");if(n)n.onclick=function(){if(!s.lives){s.over=1;B[adj?"adj":"raw"]=Math.max(B[adj?"adj":"raw"],s.best);sv(HK,B);s.aw=pAdd("higher",s.best*3+2,function(st){st.hlBest=Math.max(st.hlBest||0,s.best)});draw();return}s.cur=s.nxt;s.nxt=nextR(s.cur);s.rev=0;draw()}}
 init();draw()}
/* ================= Timeline Sort: tap five finds from oldest to newest ================= */
var SGAP=[8,6,4,3,2];
function sortSet(round,P){var out=[],tries=0;while(out.length<5&&tries++<400){var r=P[Math.floor(Math.random()*P.length)],y=+r[0].slice(0,4);if(out.every(function(o){return o[2]!==r[2]&&Math.abs(+o[0].slice(0,4)-y)>=SGAP[round]}))out.push(r)}return out}
function tsort(){var P=dpool(),G;
 function init(){G={round:0,total:0,set:sortSet(0,P),pick:[],rev:0,over:0,aw:null};G.show=shuf(G.set,Math.random)}
 function draw(){var h='<section class="pl"><h2>Timeline Sort</h2><p>Tap the five finds in order, <b>oldest first</b>. Each round the years sit closer together.</p><p class="pl-hud"><span>Round <b>'+Math.min(G.round+1,5)+'</b> of 5</span><span>Score <b>'+G.total+'</b> of 25</span><span>Gap '+SGAP[Math.min(G.round,4)]+'+ years</span></p>';
  if(G.over){var txt="Timeline Sort: "+G.total+"/25\n"+SITE_URL+"#/sort";return app.innerHTML=h+(G.total>=20?boom():"")+'<div class="pl-res"><h3>'+G.total+' of 25 '+(G.total>=20?"— historian!":G.total>=12?"— solid":"— keep digging")+'</h3>'+awardHtml(G.aw)+sharePanel(txt)+'<p><button class="btn pri" id="so-again" type="button">Play again</button> <a class="btn" href="#/play">All games</a></p></div></section>',wireShare(txt),$("#so-again").onclick=function(){init();draw()}}
  var sorted=G.set.slice().sort(function(a,b){return a[0]<b[0]?-1:a[0]>b[0]?1:0});
  h+='<div class="pl-sort">'+G.show.map(function(r){var i=G.pick.indexOf(r[2]),x=TLXS[r[2]]||{},ok=G.rev&&sorted.indexOf(r)===i;return'<button class="pl-sc'+(i>=0?" on":"")+(G.rev?(ok?" ok":" no"):"")+'" type="button" data-s="'+E(r[2])+'"'+(i>=0||G.rev?" disabled":"")+'><i>'+(i>=0?i+1:"")+'</i><b>'+E(r[2])+'</b><small>'+E(x.type||"")+(G.rev?" · "+E(fmtDate(r[0])):"")+'</small></button>'}).join("")+'</div>';
  if(!G.rev)h+='<p class="abar"><button class="btn" id="so-undo" type="button"'+(G.pick.length?"":" disabled")+'>Undo</button> <span class="tn">'+G.pick.length+' of 5 placed</span></p>';
  else{var sc=G.pick.filter(function(t,i){return sorted[i][2]===t}).length;h+='<p class="pl-fb1 '+(sc===5?"ok":"no")+'" role="status"><b>'+sc+' of 5 in the right place.</b> Correct order: '+sorted.map(function(r){return E(r[2])+" ("+r[0].slice(0,4)+")"}).join(", then ")+'.</p><p><button class="btn pri" id="so-next" type="button">'+(G.round>=4?"See results":"Next round")+'</button></p>'}
  app.innerHTML=h+'</section>';
  $$("[data-s]").forEach(function(b){b.onclick=function(){G.pick.push(b.dataset.s);if(G.pick.length>=5){G.rev=1;G.total+=G.pick.filter(function(t,i){return sorted[i][2]===t}).length}draw()}});
  var u=$("#so-undo");if(u)u.onclick=function(){G.pick.pop();draw()};
  var n=$("#so-next");if(n)n.onclick=function(){if(G.round>=4){G.over=1;G.aw=pAdd("sort",G.total*2,function(st){st.tsBest=Math.max(st.tsBest||0,G.total)});draw();return}G.round++;G.set=sortSet(G.round,P);G.show=shuf(G.set,Math.random);G.pick=[];G.rev=0;draw()}}
 init();draw()}
/* ================= Mystery Photo: a blurred real photo comes into focus ================= */
var MBL=[16,8,3];
function mpool(){return TL.filter(function(r){return/^(hw|pe)$/.test(r[1])&&r[2]&&typeof CIMG!=="undefined"&&CIMG[r[2]]})}
function mystery(){var P=mpool(),G;
 function round(){var r=P[Math.floor(Math.random()*P.length)],ty=(TLXS[r[2]]||{}).type,same=P.filter(function(o){return o[2]!==r[2]&&(TLXS[o[2]]||{}).type===ty}),oth=P.filter(function(o){return o[2]!==r[2]}),pool=same.length>=3?same:oth,o=[r];shuf(pool,Math.random).forEach(function(x){if(o.length<4)o.push(x)});return{r:r,o:shuf(o,Math.random),step:0,ans:null}}
 function init(){G={n:0,total:0,cur:round(),over:0,aw:null,used:{}}}
 function draw(){var c=G.cur,h='<section class="pl"><h2>Mystery Photo</h2><p>A real photo from the timeline starts blurry. Name it before it gets clear. Fewer clears means more points: 3, 2 or 1.</p><p class="pl-hud"><span>Photo <b>'+Math.min(G.n+1,8)+'</b> of 8</span><span>Score <b>'+G.total+'</b> of 24</span></p>';
  if(G.over){var txt="Mystery Photo: "+G.total+"/24\n"+SITE_URL+"#/mystery";return app.innerHTML=h+(G.total>=18?boom():"")+'<div class="pl-res"><h3>'+G.total+' of 24 '+(G.total>=20?"— eagle eye!":G.total>=12?"— sharp":"— a bit blurry")+'</h3>'+awardHtml(G.aw)+sharePanel(txt)+'<p><button class="btn pri" id="my-again" type="button">Play again</button> <a class="btn" href="#/play">All games</a></p></div></section>',wireShare(txt),$("#my-again").onclick=function(){init();draw()}}
  var blur=c.ans!=null?0:MBL[c.step],img=cimg(c.r[2],640).replace(/alt="[^"]*"/,'alt="Mystery photo"');
  h+='<div class="pl-case pl-mys" style="--b:'+blur+'px"><div class="ph pl-art">'+img+'</div>'+(c.ans!=null&&typeof cimgCredit==="function"?cimgCredit(c.r[2]):"")+'</div>';
  h+='<div class="pl-opts">'+c.o.map(function(o,i){var cls=c.ans==null?"":o===c.r?" ok":i===c.ans?" no":"";return'<button class="btn'+cls+'" type="button" data-o="'+i+'"'+(c.ans!=null?" disabled":"")+'>'+E(o[2])+'</button>'}).join("")+'</div>';
  if(c.ans==null)h+='<p><button class="btn" id="my-clear" type="button"'+(c.step>=2?" disabled":"")+'>Clear it up a bit</button> <span class="tn">Worth '+(3-c.step)+' point'+(c.step<2?"s":"")+' now.</span></p>';
  else{var pts=c.o[c.ans]===c.r?3-c.step:0;h+='<p class="pl-fb1 '+(pts?"ok":"no")+'" role="status"><b>'+(pts?"+"+pts+" point"+(pts>1?"s":""):"Not quite.")+'</b> It was the '+E(c.r[2])+' ('+E(c.r[0].slice(0,4))+').</p><p><button class="btn pri" id="my-next" type="button">'+(G.n>=7?"See results":"Next photo")+'</button></p>'}
  app.innerHTML=h+'</section>';
  $$("[data-o]").forEach(function(b){b.onclick=function(){c.ans=+b.dataset.o;if(c.o[c.ans]===c.r)G.total+=3-c.step;draw()}});
  var cl=$("#my-clear");if(cl)cl.onclick=function(){c.step=Math.min(2,c.step+1);draw()};
  var n=$("#my-next");if(n)n.onclick=function(){if(G.n>=7){G.over=1;G.aw=pAdd("mystery",G.total*2,function(st){st.msBest=Math.max(st.msBest||0,G.total)});draw();return}G.n++;G.cur=round();draw()}}
 if(P.length<8)return app.innerHTML='<section class="pl"><h2>Mystery Photo</h2><p class="empty">Not enough real photos on the timeline yet.</p>'+bk()+'</section>';
 init();draw()}

/* ================= Share pictures, search, Today's find ================= */
function pngDownload(svg,w,h,name,note){var im=new Image();im.onload=function(){var c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(im,0,0,w,h);c.toBlob(function(b){if(!b){note("Could not make the picture.");return}var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},3000);note("Downloaded.")},"image/png")};im.onerror=function(){note("Your browser could not render this picture.")};im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg)}
function cardSvg(text){var L=text.split("\n"),title=L[0],url=(L.filter(function(l){return/^https?:/.test(l)})[0]||SITE_URL).replace(/^https?:\/\//,""),body=[];L.slice(1).forEach(function(l){if(!l||/^https?:/.test(l))return;wrap(l,34).forEach(function(x){body.push(x)})});body=body.slice(0,6);
 var M="font-family=\"'Courier New', monospace\"",s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630"><rect width="1200" height="630" fill="#0000aa"/><rect x="30" y="30" width="1140" height="570" fill="#c0c0c0" stroke="#fff" stroke-width="4"/><rect x="30" y="30" width="1140" height="64" fill="#000080"/><text x="56" y="73" '+M+' font-size="34" font-weight="bold" fill="#fff">C:\\CONVMEM\\RESULT.EXE</text>'
  +'<text x="70" y="180" '+M+' font-size="'+(title.length>30?46:60)+'" font-weight="bold" fill="#000080">'+xesc(title)+'</text>';
 body.forEach(function(l,i){s+='<text x="70" y="'+(262+i*62)+'" '+M+' font-size="'+(/[■□◩]/.test(l)?64:46)+'" fill="#111">'+xesc(l)+'</text>'});
 return s+'<rect x="30" y="520" width="1140" height="80" fill="#000080"/><text x="600" y="572" text-anchor="middle" '+M+' font-size="36" font-weight="bold" fill="#ffff55">'+xesc(url)+'</text></svg>'}
function search(arg){var q0=arg?decodeURIComponent(arg):"";
 app.innerHTML='<section class="pl"><h2>Search</h2><p><label for="sq">Search the catalog, the timeline and the games. Press / anywhere to get here.</label></p><p><input id="sq" type="search" autocomplete="off" placeholder="Voodoo, Sega, 1994, modem..." value="'+E(q0)+'"></p><div id="sr" aria-live="polite"></div>'+bk()+'</section>';
 function run(){var q=$("#sq").value.toLowerCase().trim(),h="";if(q.length<2){$("#sr").innerHTML='<p class="tn">Type at least two letters.</p>';return}
  var w=q.split(/\s+/),has=function(t){t=t.toLowerCase();return w.every(function(x){return t.indexOf(x)>=0})};
  var its=ITEMS.filter(function(it){return has([it.name,it.maker,it.model,(it.tags||[]).join(" "),it.year,it.text].join(" "))}),
   tl=TL.filter(function(r){return has([r[2],r[0],r[4],(TLXS[r[2]]||{}).maker].join(" "))});
  var tlg=tl.filter(function(r){return/^(gt|gn|gc|sw)$/.test(r[1])}),tlh=tl.filter(function(r){return!/^(gt|gn|gc|sw)$/.test(r[1])});
  function grp(t,n,list,fn){return list.length?'<h3 class="sub">'+t+' ('+list.length+')</h3><ul class="pl-sr">'+list.slice(0,n).map(fn).join("")+'</ul>'+(list.length>n?'<p class="tn">Showing the first '+n+'. Add a word to narrow it down.</p>':""):""}
  var rowf=function(r){return'<li><a href="#/timeline/'+r[0].slice(0,4)+'/'+encodeURIComponent(r[2])+'">'+E(r[2])+'</a> <small class="tn">'+E(fmtDate(r[0]))+(r[3]?", "+E(r[3].replace(/\*$/,"")):"")+'</small></li>'};
  h=grp("Museum items",20,its,function(it){return'<li><a href="#/item/'+E(it.id)+'">'+E(it.name)+'</a> <small class="tn">'+E(it.maker||"")+" "+E(it.year||"")+'</small></li>'})+grp("Timeline hardware and events",25,tlh,rowf)+grp("Games and software",25,tlg,rowf);
  $("#sr").innerHTML=h||'<p class="empty">Nothing found for "'+E(q)+'".</p>'}
 $("#sq").oninput=run;run();if(!q0)$("#sq").focus()}
function todayPage(){var P=dpool().filter(function(r){return/^(hw|pe)$/.test(r[1])&&typeof CIMG!=="undefined"&&CIMG[r[2]]}),pool=P.length?P:dpool().filter(function(r){return/^(hw|pe)$/.test(r[1])}),r=pool[hstr("today"+today())%pool.length],d=adData({kind:"tl",r:r,t:r[2]}),x=TLXS[r[2]]||{},it=ITEMS.filter(function(i){return i.name===r[2]})[0];
 d.specs=d.specs.slice(0,2);var tag=(r[4]||"").split(". ")[0].slice(0,64),o=function(f){return{style:"mag",fmt:f,store:0,head:"Today's find: "+d.title+".",tag:tag,price:d.price?String(d.price).replace(/\*$/,"").split(/[ ;(]/)[0]:"",stk:[0]}},name=d.title.toLowerCase().replace(/[^a-z0-9]+/g,"-");
 app.innerHTML='<section class="pl"><h2>Today\'s find</h2><p>One piece of computing history a day, ready to post. '+E(fmtDate(r[0]))+(x.maker?", "+E(x.maker):"")+'. Pick a size and download it for Stories, Shorts, Reels or a feed post.</p><div class="pl-prev" id="tdp">'+adSvg(d,o("sq"))+'</div>'
  +'<p><button class="btn pri" data-f="tall" type="button">Download Story (1080x1920)</button> <button class="btn" data-f="sq" type="button">Download square</button> <button class="btn" data-f="land" type="button">Download wide</button> <span class="tn" id="tdn" role="status"></span></p>'
  +'<p>'+(it?'<a class="btn" href="#/item/'+E(it.id)+'">See it in the museum</a> ':"")+'<a class="btn" href="#/timeline/'+r[0].slice(0,4)+'/'+encodeURIComponent(r[2])+'">See it on the timeline</a> <a class="btn" href="#/adlab/'+encodeURIComponent(r[2])+'">Customize in Ad Lab</a></p>'+bk()+'</section>';
 $$("[data-f]").forEach(function(b){b.onclick=function(){var f=b.dataset.f,wh=FMT[f];pngDownload(adSvg(d,o(f)),wh[0],wh[1],name+"-today-"+f+".png",function(m){$("#tdn").textContent=m;if(m==="Downloaded."){var a=pAdd("adlab",3,function(st){st.ads=(st.ads||0)+1})}})}})}
/* ================= Retro Bingo and Hangman ================= */
var BK="cm-bingo";
function bingoCard(seed){var R=prng(seed),P=dpool().filter(function(r){return/^(hw|pe)$/.test(r[1])&&r[2].length<=24&&+r[0].slice(0,4)>=1977&&+r[0].slice(0,4)<=2005}),c=shuf(P,R).slice(0,24).map(function(r){return r[2]});c.splice(12,0,"FREE SPACE");return c}
function bingoLines(m){var L=[],i;for(i=0;i<5;i++){L.push([0,1,2,3,4].map(function(j){return i*5+j}));L.push([0,1,2,3,4].map(function(j){return j*5+i}))}L.push([0,6,12,18,24]);L.push([4,8,12,16,20]);return L.filter(function(l){return l.every(function(k){return m[k]})})}
function bingo(arg){var rnd=arg==="random",day=today(),seed=rnd?Math.floor(Math.random()*1e9):hstr("bingo"+day),card=bingoCard(seed),B=ld(BK,{d:{}}),mk=rnd?{}:(B.d[day]||{});mk[12]=1;
 function draw(){var ln=bingoLines(mk),n=Object.keys(mk).length-1;var txt="Retro Bingo "+(rnd?"(random card)":day)+": "+ln.length+" line"+(ln.length===1?"":"s")+", "+n+" owned\n"+[0,1,2,3,4].map(function(r){return[0,1,2,3,4].map(function(c){return mk[r*5+c]?"■":"□"}).join("")}).join("\n")+"\n"+SITE_URL+"#/bingo";
  app.innerHTML='<section class="pl"><h2>Retro Bingo'+(rnd?" (random card)":"")+'</h2><p>Tap every machine or add-on you have <b>owned, used or begged your parents for</b>. Get five in a row. Everyone\'s card is the same each day.</p><p class="pl-hud"><span>Marked <b>'+n+'</b></span><span>Bingo lines <b>'+ln.length+'</b></span></p>'
   +'<div class="pl-bingo">'+card.map(function(t,i){var inl=ln.some(function(l){return l.indexOf(i)>=0});return'<button type="button" class="pl-bc'+(mk[i]?" on":"")+(inl?" win":"")+'" data-b="'+i+'" aria-pressed="'+(mk[i]?"true":"false")+'"'+(i===12?" disabled":"")+'>'+E(t)+'</button>'}).join("")+'</div>'
   +(ln.length?(boom())+'<div class="pl-res"><h3>BINGO! '+ln.length+' line'+(ln.length===1?"":"s")+'</h3>'+sharePanel(txt)+'</div>':'<p class="tn">'+sharePanel(txt)+'</p>')
   +'<p>'+(rnd?'<a class="btn" href="#/bingo">Today\'s card</a> ':'')+'<a class="btn" href="#/bingo/random">New random card</a> <a class="btn" href="#/play">All games</a></p></section>';
  wireShare(txt);$$("[data-b]").forEach(function(b){b.onclick=function(){var i=+b.dataset.b,had=bingoLines(mk).length;mk[i]=mk[i]?0:1;if(!mk[i])delete mk[i];if(!rnd){B.d[day]=mk;var ks=Object.keys(B.d).sort();while(ks.length>30)delete B.d[ks.shift()];sv(BK,B)}
   var now=bingoLines(mk).length;if(now>had){pAdd("bingo",8*(now-had),function(st){st.bingos=(st.bingos||0)+(now-had)})}else pAdd("bingo",0);draw()}})}
 draw()}
function hangman(){var P=dpool().filter(function(r){return/^(hw|pe|gt|gn|gc|sw)$/.test(r[1])&&r[2].length>=5&&r[2].length<=22&&/[A-Za-z]/.test(r[2])}),G;
 function init(){var r=P[Math.floor(Math.random()*P.length)];G={r:r,a:r[2].toUpperCase(),g:{},wrong:0,x:TLXS[r[2]]||{}}}
 function masked(){return G.a.split("").map(function(c){return/[A-Z0-9]/.test(c)?(G.g[c]||G.over?c:"_"):c}).join(" ")}
 function state(){var won=G.a.split("").every(function(c){return!/[A-Z0-9]/.test(c)||G.g[c]});return won?"won":G.wrong>=6?"lost":"play"}
 function draw(){var st=state();G.over=st==="lost";var kinds={hw:"hardware",pe:"add-on or peripheral",gt:"game",gn:"game",gc:"game",sw:"software"};
  var h='<section class="pl"><h2>Disk Error Hangman</h2><p>Guess the name of the machine or game before the disk errors run out. Six wrong guesses and the drive gives up.</p>'
   +'<p class="pl-hud"><span>Floppies <b>'+glyph("floppy",16).repeat(6-G.wrong)+(G.wrong?"✗".repeat(G.wrong):"")+'</b></span><span>'+E(kinds[G.r[1]]||"")+'</span></p>'
   +'<div class="pl-clue"><p><b>Clue:</b> '+(G.x.maker?"made by "+E(G.x.maker)+". ":"")+(G.wrong>=2?"Released "+G.r[0].slice(0,4)+". ":"")+(G.wrong>=4&&G.x.type?"Type: "+E(G.x.type)+".":"")+(!G.x.maker&&G.wrong<2?'<small class="tn">More clues appear as you miss.</small>':"")+'</p></div><p class="pl-word" aria-label="Word to guess">'+E(masked())+'</p>';
  if(st==="play"){h+='<div class="pl-keys">'+"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split("").map(function(c){return'<button type="button" class="btn" data-k="'+c+'"'+(G.g[c]!=null?" disabled":"")+'>'+c+'</button>'}).join("")+'</div><p class="tn">You can also type on the keyboard.</p><p><button class="btn" id="hm-new" type="button">Different word</button></p>'}
  else{var txt="Disk Error Hangman: "+(st==="won"?"solved with "+G.wrong+" miss"+(G.wrong===1?"":"es"):"the disk crashed")+"\n"+SITE_URL+"#/hangman";h+=(st==="won"?boom():"")+'<div class="pl-res"><h3>'+(st==="won"?"Solved! "+E(G.r[2]):"Disk error. It was "+E(G.r[2]))+'</h3>'+awardHtml(G.aw)+'<p>'+E(fmtDate(G.r[0]))+'. '+E(G.r[4]||"")+'</p>'+sharePanel(txt)+'<p><button class="btn pri" id="hm-new" type="button">Next word</button> <a class="btn" href="#/timeline/'+G.r[0].slice(0,4)+'/'+encodeURIComponent(G.r[2])+'">See it on the timeline</a> <a class="btn" href="#/play">All games</a></p></div>'}
  app.innerHTML=h+'</section>';if(st!=="play")wireShare($("#plsh").value);
  $$("[data-k]").forEach(function(b){b.onclick=function(){guess(b.dataset.k)}});var n=$("#hm-new");if(n)n.onclick=function(){init();draw()}}
 function guess(c){if(state()!=="play"||G.g[c]!=null)return;G.g[c]=G.a.indexOf(c)>=0;if(!G.g[c])G.wrong++;var st=state();if(st!=="play"){G.aw=pAdd("hangman",st==="won"?8+(6-G.wrong)*2:1,function(s){if(st==="won")s.hmWins=(s.hmWins||0)+1})}draw()}
 window.CMHM=function(e){if(!document.querySelector(".pl-keys")||e.ctrlKey||e.metaKey||e.altKey||/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))return;var c=e.key.toUpperCase();if(/^[A-Z0-9]$/.test(c))guess(c)};
 document.removeEventListener("keydown",window.CMHMold||function(){});window.CMHMold=window.CMHM;document.addEventListener("keydown",window.CMHM);
 init();draw()}
/* ================= Save to floppy: move your progress between devices ================= */
var FK=["cm-play","cm-daily","cm-rig","cm-higher","cm-ads","cm-bingo"];
function floppyOut(){var o={};FK.forEach(function(k){try{var v=localStorage.getItem(k);if(v)o[k]=JSON.parse(v)}catch(e){}});return"CMFLOPPY1:"+btoa(unescape(encodeURIComponent(JSON.stringify(o))))}
function floppyIn(t){t=String(t||"").trim();if(t.indexOf("CMFLOPPY1:")!==0)return"That is not a floppy code. It should start with CMFLOPPY1:";var o;try{o=JSON.parse(decodeURIComponent(escape(atob(t.slice(10)))))}catch(e){return"That code is damaged. Copy the whole thing."}
 var n=0;Object.keys(o).forEach(function(k){if(FK.indexOf(k)>=0&&o[k]&&typeof o[k]==="object"&&!Array.isArray(o[k])){try{var v=o[k];if(k===PK)v.xp=nz(v.xp);if(k===DK)v=dClean(v);localStorage.setItem(k,JSON.stringify(v));n++}catch(e){}}});return n?"Loaded "+n+" save file"+(n===1?"":"s")+". Open the Play page to see your progress.":"The floppy was empty."}

window.CMPlay={mount:function(el,page,args){el.innerHTML='<div id="plbar"></div><div id="plapp"></div>';app=el.querySelector("#plapp");if(page!=="styleguide")refreshBar();try{if(page==="daily")daily(args[0]);else if(page==="build")build(args[0]);else if(page==="adlab")adlab(args[0]);else if(page==="higher")higher(args[0]);else if(page==="sort")tsort();else if(page==="mystery")mystery();else if(page==="trophies")trophies();else if(page==="search")search(args[0]);else if(page==="today")todayPage();else if(page==="bingo")bingo(args[0]);else if(page==="hangman")hangman();else if(page==="styleguide")styleguide();else hub()}catch(e){app.innerHTML='<section><h2>Play</h2><p class="empty">Something went wrong loading this game ('+E(e.message)+').</p>'+bk()+'</section>'}},unmount:function(){}};
})();
