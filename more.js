/* More pages for ConventionalMemory.io, loaded on demand (see loadMore in app.js):
   #/tours  guided tours          #/explore  spec explorer and compare    #/era/1995  era mode
   #/zoom   zoomable timeline     #/day/1995-08-24  what was happening   #/mine  my collection
   #/jukebox chiptunes and sound cards    #/community  memories and corrections
   #/theater retro theater (your videos first, community links after)     #/shorts/<id>  fact cards
   #/install  offline, reminders, printing
   Everything runs in the browser. Progress lives in localStorage on this device. */
(function(){
"use strict";
var app,TLXS=typeof TLX!=="undefined"?TLX:{};
function $(s,r){return(r||app).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||app).querySelectorAll(s))}
function E(s){return esc(String(s==null?"":s))}
function ld(k,d){try{var v=JSON.parse(localStorage.getItem(k)||"null");return v&&typeof v==="object"?v:d}catch(e){return d}}
function sv(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function glyph(n,s){return typeof px==="function"?px(n,s||18):""}
function yr(r){return+String(r[0]).slice(0,4)}
function bk(){return'<p><a class="btn" href="#/play">Play</a> <a class="btn" href="#/">Home</a></p>'}
function money(n){return"$"+Math.round(n).toLocaleString("en-US")}
function slugT(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}
function tlRow(t){for(var i=0;i<TL.length;i++)if(TL[i][2]===t)return TL[i];return null}
function tlHref(r){return"#/timeline/"+yr(r)+"/"+encodeURIComponent(r[2])}
function itemFor(t){for(var i=0;i<ITEMS.length;i++)if(ITEMS[i].name===t)return ITEMS[i];return null}
function artBox(r){var h='<div class="ph pl-art">'+(typeof artFor==="function"?artFor(r,320,240,"mx"):"");if(typeof cimg==="function"&&typeof CIMG!=="undefined"&&CIMG[r[2]])h+=cimg(r[2],640);h+='</div>';return h+(typeof cimgCredit==="function"&&typeof CIMG!=="undefined"&&CIMG[r[2]]?cimgCredit(r[2]):"")}
function gift(key,xp){try{var p=ld("cm-play",{xp:0,badges:{},st:{}});p.st=p.st||{};p.st.more=p.st.more||{};if(p.st.more[key])return 0;p.st.more[key]=1;p.xp=(p.xp||0)+xp;sv("cm-play",p);return xp}catch(e){return 0}}
function dl(name,text,type){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([text],{type:type||"text/plain"}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},3000)}
function cpiNote(r){var p=usdOf(r[3]);return p?inflNote(r[3],yr(r)):""}

/* ================= Guided tours ================= */
var TOURS=[
 {id:"first-pc",t:"Your first PC, 1977 to 1995",b:"From the Apple II to Windows 95: the machines that put a computer on the desk.",s:[
  ["Apple II","One of the first mass-produced personal computers, and the one that made a lot of kitchen tables into workshops."],
  ["IBM PC (5150)","IBM used off-the-shelf parts and an outside operating system. That decision created the PC-compatible industry."],
  ["Commodore 64","Cheap, colorful and everywhere. For many people this was the first computer they ever touched."],
  ["Apple Macintosh","A graphical interface and a mouse in a small beige box. Computing started to look friendly."],
  ["Windows 3.0","The release that finally made Windows a thing people used on purpose."],
  ["Intel Pentium","Faster, hotter and more expensive. The Pentium name went from engineering to a household word."],
  ["Windows 95","The Start button arrives. A PC now boots to a desktop most people can use without a manual."]]},
 {id:"road-to-doom",t:"The road to Doom",b:"The hardware and games that made the 1990s shooter possible.",s:[
  ["Intel 80486DX","A built-in math unit and a big jump in speed. The kind of chip a fast 3D game needs."],
  ["Sound Blaster Pro","Stereo digital audio on a card, and a new baseline for PC game sound."],
  ["Doom","Doom ran fast on a 486, spread as shareware, and shaped what a PC game was supposed to feel like."],
  ["Doom II: Hell on Earth","The sequel arrived in stores and sold the way the original had on floppy and modem."],
  ["Quake","True 3D worlds and online play. It demanded a Pentium and rewarded a good graphics card."],
  ["3dfx Voodoo Graphics (Diamond Monster 3D)","A separate 3D card you plugged in next to your regular video card. Games suddenly looked smooth."],
  ["Quake III Arena","By the end of the decade a 3D card was no longer optional for this kind of game."]]},
 {id:"sound-cards",t:"Sound cards that mattered",b:"From beeps to FM synths to wavetable: how PCs learned to make noise.",s:[
  ["AdLib Music Synthesizer Card","FM synthesis for PCs. For many games this was the first music that sounded like music."],
  ["Roland MT-32","Expensive and brilliant. Games composed for it still have fans who track one down."],
  ["Sound Blaster (original)","Digital sound plus AdLib compatibility. That combination won the market."],
  ["Sound Blaster Pro","Stereo output and a faster mixer, still sold for years alongside newer cards."],
  ["Gravis UltraSound","Sample-based music with onboard memory. A favorite of the demo scene."],
  ["Sound Blaster 16","16-bit audio at a price people could pay. For a long stretch this was the card to own."]]},
 {id:"pocket",t:"Computers in your pocket",b:"Handhelds, pocket organizers and virtual pets before the smartphone.",s:[
  ["Game Boy (North America)","A gray brick with a tiny screen that outlasted fancier rivals on battery life alone."],
  ["PalmPilot","A calendar, contacts and a stylus you could write on. Simple, which is why it worked."],
  ["Tamagotchi arrives in the US","A pocket pet that needed feeding. A global craze about caring for 32 pixels."],
  ["Palm V","A thin metal handheld that made a PDA feel like jewelry."],
  ["Apple iPod","A thousand songs in your pocket. It changed what a music player was."]]},
 {id:"digital-photo",t:"Photography before phones",b:"The early digital cameras that made film optional.",s:[
  ["Kodak Sasson Prototype Digital Camera","A handheld prototype from Kodak's own engineer that recorded to cassette tape."],
  ["Sony Mavica prototype","Sony's early still-video camera, aimed at replacing the film camera."],
  ["Kodak DCS 200","Professional digital bodies built on regular film camera frames."],
  ["Sony ProMavica MVC-2000","A pro still-video camera storing images on small floppy-style disks."]]},
 {id:"console-wars",t:"Console wars",b:"Living-room hardware, 1977 to 2001.",s:[
  ["Atari 2600 (VCS)","Cartridges, a joystick and a wood-grain front. It brought arcade games home."],
  ["Nintendo Entertainment System (US nationwide)","After the crash, a toy-store launch rebuilt the home console business."],
  ["Sega Genesis (North America)","Faster, edgier marketing, and a real challenge to Nintendo."],
  ["Sony PlayStation (North America)","CD games and 3D graphics. Sony arrived and stayed."],
  ["Sega Dreamcast (North America)","Ahead of its time, with online play and a built-in modem, and gone too soon."],
  ["Microsoft Xbox","A PC company's console, with a hard drive and ethernet built in."]]},
 {id:"web",t:"The web arrives",b:"From a research browser to the first dot-com boom.",s:[
  ["NCSA Mosaic 1.0","The first browser many people saw, with images right in the page."],
  ["Netscape Navigator 1.0","A commercial browser that turned the web into a mainstream product."],
  ["Windows 95","Internet access started shipping on the desktop, though dial-up still ruled."],
  ["Netscape IPO","A company with a browser and a lot of promise went public to huge excitement."],
  ["Napster launches","Music files, peer to peer. It changed the industry and the law."]]}];
function tours(){var P=ld("cm-tours",{}),h='<section class="pl"><h2>Guided tours</h2><p>Short walks through the timeline, one stop at a time. Finish a tour for a bit of XP on your play profile.</p><div class="pl-grid">';
 TOURS.forEach(function(t){var n=t.s.filter(function(s){return tlRow(s[0])}).length,d=(P[t.id]||[]).length;h+='<a class="hm-tile" href="#/tour/'+t.id+'"><i class="hm-ic">'+glyph("flag",28)+'</i><b>'+E(t.t)+'</b><span>'+E(t.b)+' <em>'+n+' stops'+(d?", "+Math.min(d,n)+" visited":"")+'</em></span></a>'});
 app.innerHTML=h+'</div>'+bk()+'</section>'}
function tour(id,n){var T=TOURS.filter(function(t){return t.id===id})[0];if(!T)return tours();var S=T.s.filter(function(s){return tlRow(s[0])}),i=Math.max(0,Math.min(S.length-1,(+n||1)-1)),P=ld("cm-tours",{}),seen=P[id]||[];if(seen.indexOf(i)<0)seen.push(i);P[id]=seen;sv("cm-tours",P);
 var s=S[i],r=tlRow(s[0]),x=TLXS[r[2]]||{},it=itemFor(r[2]),done=seen.length>=S.length,g=0;if(done&&i===S.length-1)g=gift("tour-"+id,20);
 var pc=Math.round((i+1)*100/S.length);
 app.innerHTML='<section class="pl"><h2>'+E(T.t)+'</h2><p class="pl-hud"><span>Stop <b>'+(i+1)+'</b> of '+S.length+'</span><span class="mbar" aria-hidden="true" style="min-width:160px"><i style="width:'+pc+'%"></i></span></p>'
  +'<div class="pl-case">'+artBox(r)+'</div><h3>'+E(r[2])+'</h3><p class="tn">'+E(fmtDate(r[0]))+(r[3]?", launch price "+E(r[3].replace(/\*$/," (estimate)")):"")+(cpiNote(r)?" ("+E(cpiNote(r))+")":"")+(x.maker?", "+E(x.maker):"")+'</p>'
  +'<p class="tour-say">'+E(s[1])+'</p>'+(r[4]?'<p>'+E(r[4])+'</p>':"")+(x.detail?'<p class="tn">'+E(String(x.detail).slice(0,420))+(String(x.detail).length>420?"...":"")+'</p>':"")
  +'<p>'+(it?'<a class="btn" href="#/item/'+E(it.id)+'">See it in the museum</a> ':"")+'<a class="btn" href="'+tlHref(r)+'">Open on the timeline</a></p>'
  +(g?'<div class="pl-award" role="status"><b>Tour complete! +'+g+' XP</b></div>':"")
  +'<p class="abar">'+(i>0?'<a class="btn" href="#/tour/'+id+'/'+i+'">Previous</a> ':"")+(i<S.length-1?'<a class="btn pri" href="#/tour/'+id+'/'+(i+2)+'">Next stop</a>':'<a class="btn pri" href="#/tours">All tours</a>')+'</p></section>'}

/* ================= Spec Explorer and Compare 2.0 ================= */
var EX={q:"",type:"",maker:"",y0:"",y1:"",pmax:"",photo:false,sort:"y",dir:1,pick:[],lim:60,rows:null};
function exRows(){if(EX.rows)return EX.rows;var seen={},R=[];ITEMS.forEach(function(it){seen[it.name]=1;R.push({k:"i:"+it.id,n:it.name,y:+it.year||0,m:it.maker||"",t:it.type||"",p:usdOf(it.msrp),sc:it.score,ph:(it.photos&&it.photos.length)||(typeof CIMG!=="undefined"&&CIMG[it.name])?1:0,href:"#/item/"+it.id,sp:it.specs||{},own:1})});
 TL.forEach(function(r){if(!/^(hw|pe)$/.test(r[1])||seen[r[2]])return;var x=TLXS[r[2]]||{};R.push({k:"t:"+r[2],n:r[2],y:yr(r),m:x.maker||"",t:x.type||"",p:usdOf(r[3]),sc:null,ph:typeof CIMG!=="undefined"&&CIMG[r[2]]?1:0,href:tlHref(r),sp:x.specs||{},d:r[0],yp:r[3]})});
 return EX.rows=R}
function numOf(v){var m=String(v).replace(/,/g,"").match(/([\d.]+)\s*(GB|MB|KB|GHz|MHz|kHz|bytes?|B)?\b/i);if(!m)return null;var n=parseFloat(m[1]),u=(m[2]||"").toLowerCase(),k={gb:["m",1073741824],mb:["m",1048576],kb:["m",1024],byte:["m",1],bytes:["m",1],b:["m",1],ghz:["f",1e9],mhz:["f",1e6],khz:["f",1e3]}[u];return k?{v:n*k[1],c:k[0]}:{v:n,c:"n"}}
function exFilter(){var R=exRows(),q=EX.q.toLowerCase().trim().split(/\s+/).filter(Boolean);return R.filter(function(r){if(q.length){var t=(r.n+" "+r.m+" "+r.t+" "+r.y).toLowerCase();if(!q.every(function(w){return t.indexOf(w)>=0}))return false}
  if(EX.type&&r.t!==EX.type)return false;if(EX.maker&&r.m!==EX.maker)return false;if(EX.y0&&r.y<+EX.y0)return false;if(EX.y1&&r.y>+EX.y1)return false;if(EX.pmax&&(!r.p||r.p>+EX.pmax))return false;if(EX.photo&&!r.ph)return false;return true}).sort(function(a,b){var k=EX.sort,x=a[k],y=b[k];if(typeof x==="string"){x=x.toLowerCase();y=String(y).toLowerCase()}if(x==null||x===0&&k==="p")return 1;if(y==null||y===0&&k==="p")return-1;return(x<y?-1:x>y?1:0)*EX.dir})}
function exCompare(){var rows=exRows().filter(function(r){return EX.pick.indexOf(r.k)>=0});if(rows.length<2)return'<p class="tn">Tick two to four rows to compare them.</p>';
 var keys=[],seen={};rows.forEach(function(r){Object.keys(r.sp).forEach(function(k){if(!seen[k]){seen[k]=1;keys.push(k)}})});
 function bars(label,vals,fmt){var n=vals.filter(function(v){return v!=null}),mx=Math.max.apply(null,n);if(n.length<2||!(mx>0))return"";return'<tr><th scope="row">'+E(label)+'</th>'+vals.map(function(v){return'<td>'+(v==null?'<span class="tn">n/a</span>':'<span class="mx-bar"><i style="width:'+Math.max(3,Math.round(v*100/mx))+'%"></i></span> '+E(fmt(v)))+'</td>'}).join("")+'</tr>'}
 var h='<div class="mx-cmp"><table><thead><tr><th></th>'+rows.map(function(r){return'<th><a href="'+E(r.href)+'">'+E(r.n)+'</a></th>'}).join("")+'</tr></thead><tbody>'
  +'<tr><th scope="row">Year</th>'+rows.map(function(r){return'<td>'+(r.y||"")+'</td>'}).join("")+'</tr><tr><th scope="row">Maker</th>'+rows.map(function(r){return'<td>'+E(r.m)+'</td>'}).join("")+'</tr><tr><th scope="row">Type</th>'+rows.map(function(r){return'<td>'+E(r.t)+'</td>'}).join("")+'</tr>'
  +bars("Launch price",rows.map(function(r){return r.p||null}),money)+bars("Price in today\'s money",rows.map(function(r){return r.p&&CPI[r.y]?r.p*CPI_NOW/CPI[r.y]:null}),money)+bars("K score",rows.map(function(r){return r.sc==null?null:r.sc}),function(v){return v+"K"});
 keys.forEach(function(k){var vs=rows.map(function(r){return r.sp[k]}),ns=vs.map(numOf),ok=ns.filter(Boolean),same=ok.length>=2&&ok.every(function(z){return z.c===ok[0].c}),mx=same?Math.max.apply(null,ok.map(function(z){return z.v})):0;
  h+='<tr><th scope="row">'+E(k)+'</th>'+vs.map(function(v,i){return'<td>'+(same&&ns[i]&&mx>0?'<span class="mx-bar"><i style="width:'+Math.max(3,Math.round(ns[i].v*100/mx))+'%"></i></span> ':"")+E(v==null?"":v)+'</td>'}).join("")+'</tr>'});
 return h+'</tbody></table></div>'}
function explore(){var R=exRows(),types={},makers={};R.forEach(function(r){if(r.t)types[r.t]=(types[r.t]||0)+1;if(r.m)makers[r.m]=(makers[r.m]||0)+1});
 var tk=Object.keys(types).sort(),mk=Object.keys(makers).sort(function(a,b){return makers[b]-makers[a]}).slice(0,60).sort();
 function draw(keep){var L=exFilter(),sh=L.slice(0,EX.lim),col=function(k,l){return'<th scope="col"><button type="button" class="mx-sort" data-s="'+k+'" aria-label="Sort by '+l+'">'+l+(EX.sort===k?(EX.dir>0?" ▲":" ▼"):"")+'</button></th>'};
  var h='<section class="pl"><h2>Spec Explorer</h2><p>Every museum item and every hardware entry on the timeline, in one filterable table. Tick up to four rows to compare them side by side.</p>'
   +'<div class="mx-filters"><label>Search <input id="exq" type="search" value="'+E(EX.q)+'" placeholder="486, Creative, camera..."></label><label>Type <select id="ext"><option value="">Any</option>'+tk.map(function(t){return'<option'+(EX.type===t?" selected":"")+'>'+E(t)+'</option>'}).join("")+'</select></label><label>Maker <select id="exm"><option value="">Any</option>'+mk.map(function(t){return'<option'+(EX.maker===t?" selected":"")+'>'+E(t)+'</option>'}).join("")+'</select></label>'
   +'<label>From <input id="exy0" type="number" min="1970" max="2030" value="'+E(EX.y0)+'" class="mx-n"></label><label>To <input id="exy1" type="number" min="1970" max="2030" value="'+E(EX.y1)+'" class="mx-n"></label><label>Max launch price $ <input id="exp" type="number" min="0" value="'+E(EX.pmax)+'" class="mx-n"></label><label><input id="exph" type="checkbox"'+(EX.photo?" checked":"")+'> Has a photo</label></div>'
   +'<p class="pl-hud"><span><b>'+L.length+'</b> match</span><span>Comparing <b>'+EX.pick.length+'</b> of 4</span><button class="btn" id="exclr" type="button">Clear filters</button></p><div id="excmp">'+exCompare()+'</div>'
   +'<div class="mx-wrap"><table class="mx-t"><thead><tr><th scope="col">Pick</th>'+col("n","Name")+col("y","Year")+col("m","Maker")+col("t","Type")+col("p","Launch price")+col("sc","K score")+'</tr></thead><tbody>'
   +sh.map(function(r){var on=EX.pick.indexOf(r.k)>=0;return'<tr'+(on?' class="on"':"")+'><td><input type="checkbox" data-p="'+E(r.k)+'" aria-label="Compare '+E(r.n)+'"'+(on?" checked":"")+(!on&&EX.pick.length>=4?" disabled":"")+'></td><td><a href="'+E(r.href)+'">'+E(r.n)+'</a></td><td>'+(r.y||"")+'</td><td>'+E(r.m)+'</td><td>'+E(r.t)+'</td><td>'+(r.p?E(money(r.p)):"")+'</td><td>'+(r.sc==null?"":r.sc+"K")+'</td></tr>'}).join("")+'</tbody></table></div>'
   +(L.length>EX.lim?'<p><button class="btn" id="exmore" type="button">Show 60 more ('+(L.length-EX.lim)+' left)</button></p>':"")+bk()+'</section>';
  app.innerHTML=h;var f=function(id,k,num){var e=$("#"+id);e.onchange=e.oninput=function(){EX[k]=e.type==="checkbox"?e.checked:e.value;EX.lim=60;if(id==="exq"){clearTimeout(draw.t);draw.t=setTimeout(function(){draw("exq")},180)}else draw()}};
  f("exq","q");f("ext","type");f("exm","maker");f("exy0","y0");f("exy1","y1");f("exp","pmax");f("exph","photo");
  $("#exclr").onclick=function(){EX.q=EX.type=EX.maker=EX.y0=EX.y1=EX.pmax="";EX.photo=false;draw()};var mo=$("#exmore");if(mo)mo.onclick=function(){EX.lim+=60;draw()};
  $$(".mx-sort").forEach(function(b){b.onclick=function(){if(EX.sort===b.dataset.s)EX.dir=-EX.dir;else{EX.sort=b.dataset.s;EX.dir=1}draw()}});
  $$("[data-p]").forEach(function(c){c.onchange=function(){var k=c.dataset.p,i=EX.pick.indexOf(k);if(i>=0)EX.pick.splice(i,1);else if(EX.pick.length<4)EX.pick.push(k);draw()}});
  if(keep==="exq"){var q=$("#exq");q.focus();q.setSelectionRange(q.value.length,q.value.length)}}
 draw()}

/* ================= Era Mode ================= */
function eraOn(y){try{sessionStorage.setItem("cm-era",String(y))}catch(e){}if(window.CMFun&&CMFun.era)CMFun.era()}
function era(arg){var y=Math.max(1977,Math.min(2012,+arg||1995)),pc=pcFor(y),g=gamesFor(y),hw=TL.filter(function(r){return/^(hw|pe)$/.test(r[1])&&yr(r)===y&&usdOf(r[3])>0}).slice(0,14),news=TL.filter(function(r){return/^(e|w|u)$/.test(r[1])&&yr(r)===y}).slice(0,8),mv=TL.filter(function(r){return r[1]==="m"&&yr(r)===y}).slice(0,6),ad=hw[0],on=false;try{on=sessionStorage.getItem("cm-era")===String(y)}catch(e){}
 var cp=CPI[y]?CPI_NOW/CPI[y]:0;
 app.innerHTML='<section class="pl era"><h2>It is '+y+'</h2><p class="pl-hud"><a class="btn" href="#/era/'+Math.max(1977,y-1)+'">&laquo; '+Math.max(1977,y-1)+'</a><label>Year <input id="eray" type="range" min="1977" max="2012" value="'+y+'"></label><a class="btn" href="#/era/'+Math.min(2012,y+1)+'">'+Math.min(2012,y+1)+' &raquo;</a></p>'
  +'<p>'+(on?'Era mode is on. The look of the site follows this year. ':'Step into the year: the site changes its look to match the era. ')+(on?'<button class="btn" id="eraoff" type="button">Leave era mode</button>':'<button class="btn pri" id="eraon" type="button">Enter era mode</button>')+'</p>'
  +(cp?'<p class="tn">$1 in '+y+' is about $'+cp.toFixed(2)+' today (approximate).</p>':"")
  +(pc?'<h3 class="sub">The PC of the year</h3><div class="mx-spec"><b>'+E(pc.ex)+'</b><ul><li>CPU: '+E(pc.cpu)+'</li><li>Memory: '+E(pc.ram)+'</li><li>Video: '+E(pc.video)+'</li><li>Sound: '+E(pc.sound)+'</li><li>Storage: '+E(pc.storage)+'</li></ul></div>':"")
  +(g?'<h3 class="sub">What people were playing'+(g.y!==y?" (latest on file, "+g.y+")":"")+'</h3><p class="chips">'+g.l.slice(0,10).map(function(r){return'<a class="btn" href="'+tlHref(r)+'">'+E(r[2])+'</a>'}).join(" ")+'</p>':"")
  +(hw.length?'<h3 class="sub">On the shelves: launch prices</h3><div class="mx-wrap"><table class="mx-t"><tbody>'+hw.map(function(r){return'<tr><td><a href="'+tlHref(r)+'">'+E(r[2])+'</a></td><td>'+E(r[3].replace(/\*$/," (est.)"))+'</td><td class="tn">'+E(cpiNote(r))+'</td></tr>'}).join("")+'</tbody></table></div></div>':"")
  +(ad?'<h3 class="sub">The ad of the year</h3><div class="pl-case">'+artBox(ad)+'<p><b>'+E(ad[2])+'</b>. '+E(ad[3])+(ad[4]?". "+E(ad[4]):"")+'</p></div>':"")
  +(news.length?'<h3 class="sub">In the news</h3><ul>'+news.map(function(r){return'<li><a href="'+tlHref(r)+'">'+E(r[2])+'</a> <small class="tn">'+E(fmtDate(r[0]))+'</small></li>'}).join("")+'</ul>':"")
  +(mv.length?'<h3 class="sub">At the movies</h3><p>'+mv.map(function(r){return E(r[2])}).join(", ")+'.</p>':"")
  +'<p><a class="btn" href="#/zoom/'+y+'">See '+y+' on the zoom timeline</a> <a class="btn" href="#/day/'+y+'-06-15">What was happening, day by day</a></p>'+bk()+'</section>';
 $("#eray").onchange=function(){location.hash="#/era/"+this.value};var a=$("#eraon");if(a)a.onclick=function(){eraOn(y);era(y)};var o=$("#eraoff");if(o)o.onclick=function(){if(window.CMFun&&CMFun.eraOff)CMFun.eraOff();era(y)}}

/* ================= Zoom timeline ================= */
var ZL=[["Computers"],["Consoles and handhelds"],["Add-ons and parts"],["Cameras, players, phones"],["Games and software"],["Events and culture"]];
function zlane(r){var k=r[1],t=(TLXS[r[2]]||{}).type||"";if(/^(gt|gn|gc|sw)$/.test(k))return 4;if(/^(e|w|u|m|p)$/.test(k))return 5;if(t==="Console or handheld")return 1;if(/^(Digital camera|Media player|Phone|E-reader|Tablet|Handheld computer)$/.test(t))return 3;if(k==="pe"||/^(Expansion card|Sound or MIDI|Peripheral|Processor|Printer|Storage|Monitor)$/.test(t))return 2;return 0}
var ZP=220,ZY0=1975,ZY1=2012,ZST={play:0};
function zfrac(d){var p=String(d).split("-"),m=p[1]?(+p[1]-1)/12:0;return +p[0]+m}
function zoom(arg){var P=ZP,W=(ZY1-ZY0+1)*P,lanes=ZL.map(function(){return{rows:[],items:[]}});
 TL.forEach(function(r,i){var y=yr(r);if(y<ZY0||y>ZY1)return;var L=lanes[zlane(r)],x=Math.round((zfrac(r[0])-ZY0)*P),w=Math.min(230,r[2].length*7+30),row=0;while(row<30&&L.rows[row]!==undefined&&L.rows[row]>x-4)row++;L.rows[row]=x+w;L.items.push({i:i,x:x,row:row,r:r})});
 var dec=[];for(var d=1970;d<=2010;d+=10){var c={1970:"rgba(190,120,40,.10)",1980:"rgba(60,160,60,.10)",1990:"rgba(40,90,200,.10)",2000:"rgba(160,60,180,.10)",2010:"rgba(200,60,60,.10)"}[d];dec.push(c+" "+((Math.max(d,ZY0)-ZY0)*P)+"px "+((Math.min(d+10,ZY1+1)-ZY0)*P)+"px")}
 var bg="linear-gradient(90deg,"+dec.map(function(s){var q=s.split(" ");return q[0]+" "+q[1]+","+q[0]+" "+q[2]}).join(",")+")";
 var h='<section class="pl zoomp"><h2>Zoom timeline</h2><p>Drag to scroll sideways, or use the arrow keys. Tap anything for details.</p><p class="pl-hud"><label>Jump to <select id="zj">'+function(){var o="";for(var y=ZY0;y<=ZY1;y+=1)o+='<option>'+y+'</option>';return o}()+'</select></label><button class="btn" id="zout" type="button">Zoom out</button><button class="btn" id="zin" type="button">Zoom in</button><button class="btn" id="zplay" type="button">Play the decades</button></p>'
  +'<div class="z-mini" id="zmini" aria-hidden="true"><i id="zview"></i></div><div class="z-scroll" id="zs" tabindex="0" role="region" aria-label="Zoomable timeline"><div class="z-inner" style="width:'+W+'px;background:'+bg+'">'
  +'<div class="z-axis">'+function(){var t="";for(var y=ZY0;y<=ZY1;y++)t+='<span style="left:'+(y-ZY0)*P+'px">'+y+'</span>';return t}()+'</div>';
 lanes.forEach(function(L,k){var hh=Math.max(1,L.rows.length)*22+26;h+='<div class="z-lane" style="height:'+hh+'px"><b class="z-lt">'+ZL[k][0]+'</b>'+L.items.map(function(n){return'<button type="button" class="zn z-'+n.r[1]+'" style="left:'+n.x+'px;top:'+(24+n.row*22)+'px" data-i="'+n.i+'" title="'+E(n.r[2]+" ("+fmtDate(n.r[0])+")")+'">'+(typeof pxRow==="function"?pxRow(n.r,12):"")+E(n.r[2])+'</button>'}).join("")+'</div>'});
 h+='</div></div><div id="zpop" class="z-pop" role="status" aria-live="polite"><span class="tn">Pick an entry to see its details.</span></div>'+bk()+'</section>';app.innerHTML=h;
 var sc=$("#zs"),vw=$("#zview"),mini=$("#zmini");function upd(){var f=sc.scrollLeft/sc.scrollWidth,w=sc.clientWidth/sc.scrollWidth;vw.style.left=(f*100)+"%";vw.style.width=Math.max(2,w*100)+"%";var y=Math.round(ZY0+(sc.scrollLeft+sc.clientWidth/2)/P);var s=$("#zj");if(s&&+s.value!==y&&document.activeElement!==s)s.value=Math.max(ZY0,Math.min(ZY1,y))}
 sc.onscroll=upd;var jump=function(y){sc.scrollLeft=(y-ZY0)*P-sc.clientWidth/2+P/2};
 $("#zj").onchange=function(){jump(+this.value)};mini.onclick=function(e){var b=mini.getBoundingClientRect();sc.scrollLeft=(e.clientX-b.left)/b.width*sc.scrollWidth-sc.clientWidth/2};
 $("#zin").onclick=function(){ZP=Math.min(420,ZP+80);zoom()};$("#zout").onclick=function(){ZP=Math.max(100,ZP-60);zoom()};
 var dn=false,sx=0,sl=0,moved=0;sc.onpointerdown=function(e){if(e.target.closest&&e.target.closest(".zn"))return;dn=true;moved=0;sx=e.clientX;sl=sc.scrollLeft;stopPlay()};sc.onpointermove=function(e){if(!dn)return;moved=1;sc.scrollLeft=sl-(e.clientX-sx)};addEventListener("pointerup",function(){dn=false});
 sc.onkeydown=function(e){if(e.key==="ArrowRight"){sc.scrollLeft+=P/2;e.preventDefault()}else if(e.key==="ArrowLeft"){sc.scrollLeft-=P/2;e.preventDefault()}};
 function stopPlay(){if(ZST.t){clearInterval(ZST.t);ZST.t=0;var b=$("#zplay");if(b)b.textContent="Play the decades"}}
 $("#zplay").onclick=function(){if(ZST.t){stopPlay();return}this.textContent="Stop";ZST.t=setInterval(function(){if(!document.getElementById("zs")){stopPlay();return}sc.scrollLeft+=3;if(sc.scrollLeft+sc.clientWidth>=sc.scrollWidth-4)stopPlay()},16)};
 $$(".zn").forEach(function(b){b.onclick=function(){stopPlay();var r=TL[+b.dataset.i],x=TLXS[r[2]]||{},it=itemFor(r[2]);$("#zpop").innerHTML='<b>'+E(r[2])+'</b> <span class="tn">'+E(fmtDate(r[0]))+(r[3]?", "+E(r[3].replace(/\*$/," (est.)")):"")+(x.maker?", "+E(x.maker):"")+'</span><br>'+E(r[4]||"")+'<br><a class="btn" href="'+tlHref(r)+'">Timeline page</a> <a class="btn" href="#/day/'+E(r[0].length>=10?r[0]:r[0].slice(0,4)+"-"+(r[0].length>=7?r[0].slice(5,7):"06")+"-15")+'">What else was happening</a>'+(it?' <a class="btn" href="#/item/'+E(it.id)+'">In the museum</a>':"")}});
 requestAnimationFrame(function(){jump(+arg||(arg==="now"?2010:1990));upd()})}
/* ================= What was happening when ================= */
function dparse(s){var m=/^(\d{4})-(\d\d)-(\d\d)$/.exec(s||"");if(!m)return null;var d=new Date(Date.UTC(+m[1],+m[2]-1,+m[3]));return isNaN(d)?null:d}
function dfmt(d){return d.getUTCFullYear()+"-"+String(d.getUTCMonth()+1).padStart(2,"0")+"-"+String(d.getUTCDate()).padStart(2,"0")}
function day(arg){var d=dparse(arg)||dparse("1995-08-24"),ds=dfmt(d),y=d.getUTCFullYear(),t=d.getTime(),near=TL.filter(function(r){if(r[0].length<7)return false;var p=r[0].length===7?r[0]+"-15":r[0],q=dparse(p);return q&&Math.abs(q.getTime()-t)<=45*864e5}).sort(function(a,b){return a[0]<b[0]?-1:1}).slice(0,24),md=ds.slice(5),same=TL.filter(function(r){return r[0].length>=10&&r[0].slice(5)===md&&yr(r)!==y}).slice(0,8),pc=pcFor(y),g=gamesFor(y),yi=ITEMS.filter(function(i){return+i.year===y}).slice(0,6),cp=CPI[y]?CPI_NOW/CPI[y]:0,pv=new Date(t-864e5),nx=new Date(t+864e5);
 app.innerHTML='<section class="pl"><h2>What was happening: '+E(fmtDate(ds))+'</h2><p class="pl-hud"><a class="btn" href="#/day/'+dfmt(pv)+'">&laquo; Day before</a><label>Date <input id="dayd" type="date" value="'+ds+'" min="1970-01-01" max="2026-12-31"></label><a class="btn" href="#/day/'+dfmt(nx)+'">Day after &raquo;</a><a class="btn" href="#/day/'+(1977+Math.floor(Math.random()*35))+'-'+String(1+Math.floor(Math.random()*12)).padStart(2,"0")+'-'+String(1+Math.floor(Math.random()*28)).padStart(2,"0")+'">Random day</a></p>'
  +(cp?'<p class="tn">A dollar then buys what about $'+cp.toFixed(2)+' buys now (approximate).</p>':"")
  +(near.length?'<h3 class="sub">Within six weeks of this date</h3><ul class="pl-sr">'+near.map(function(r){return'<li><span class="tn">'+E(fmtDate(r[0]))+'</span> <a href="'+tlHref(r)+'">'+E(r[2])+'</a> <small class="tn">'+E((TLK[r[1]]||["",""])[1])+(r[3]?", "+E(r[3].replace(/\*$/,"")):"")+'</small></li>'}).join("")+'</ul>':'<p class="empty">Nothing on file within six weeks of this date.</p>')
  +(same.length?'<h3 class="sub">On this day in other years</h3><ul>'+same.map(function(r){return'<li><b>'+yr(r)+'</b> <a href="'+tlHref(r)+'">'+E(r[2])+'</a></li>'}).join("")+'</ul>':"")
  +(pc?'<h3 class="sub">A typical PC that year</h3><p>'+E(pc.ex)+': '+E(pc.cpu)+', '+E(pc.ram)+' of memory, '+E(pc.video)+'.</p>':"")
  +(g?'<h3 class="sub">Games of '+g.y+'</h3><p>'+g.l.slice(0,8).map(function(r){return'<a href="'+tlHref(r)+'">'+E(r[2])+'</a>'}).join(", ")+'.</p>':"")
  +(yi.length?'<h3 class="sub">Museum items from '+y+'</h3><p>'+yi.map(function(i){return'<a href="#/item/'+E(i.id)+'">'+E(i.name)+'</a>'}).join(", ")+'.</p>':"")
  +'<p><a class="btn" href="#/era/'+Math.max(1977,Math.min(2012,y))+'">Era mode: '+y+'</a> <a class="btn" href="#/zoom/'+y+'">Zoom timeline</a></p>'+bk()+'</section>';
 $("#dayd").onchange=function(){if(this.value)location.hash="#/day/"+this.value}}

/* ================= My collection ================= */
var MK="cm-mine";
function mineName(k){if(k.indexOf("i:")===0){var it=ITEMS.filter(function(i){return i.id===k.slice(2)})[0];return it?it.name:k.slice(2)}return k.slice(2)}
function mineRow(k){return k.indexOf("t:")===0?tlRow(k.slice(2)):null}
function famOf(n){var w=n.replace(/[()]/g," ").split(/\s+/).filter(Boolean);return w.slice(0,2).join(" ").toLowerCase()}
function mine(arg,key){var M=ld(MK,{}),tab="all";
 if(arg==="own"&&key){var k=decodeURIComponent(key);if(!M[k]){M[k]={s:"own"};sv(MK,M)}location.replace("#/mine");return}
 function save(){sv(MK,M)}
 function draw(){var ks=Object.keys(M),shown=ks.filter(function(k){return tab==="all"||M[k].s===tab}).sort(function(a,b){return mineName(a).localeCompare(mineName(b))}),own=ks.filter(function(k){return M[k].s==="own"}),paid=0,val=0;own.forEach(function(k){paid+=+M[k].paid||0;val+=+M[k].val||0});
  var h='<section class="pl"><h2>My collection</h2><p>Track what you own, want or would trade. It stays on this device. Use <a href="#/trophies">Save to floppy</a> to move it.</p><p class="pl-hud"><span>Owned <b>'+own.length+'</b></span><span>Wanted <b>'+ks.filter(function(k){return M[k].s==="want"}).length+'</b></span><span>Trade <b>'+ks.filter(function(k){return M[k].s==="trade"}).length+'</b></span><span>Paid <b>'+E(money(paid))+'</b></span><span>Value <b>'+E(money(val))+'</b></span></p>'
   +'<p><label for="mq">Add something</label> <input id="mq" type="search" placeholder="Sound Blaster, Libretto, Game Boy..." autocomplete="off"></p><div id="mres"></div>'
   +'<p class="chips">'+[["all","All"],["own","Own"],["want","Want"],["trade","Trade"]].map(function(t){return'<button class="chip'+(tab===t[0]?" on":"")+'" data-tab="'+t[0]+'" type="button">'+t[1]+'</button>'}).join(" ")+'</p>';
  if(!shown.length)h+='<p class="empty">Nothing here yet. Search above, or press "Add to my collection" on any item page.</p>';
  else{h+='<div class="mine-list">'+shown.map(function(k){var m=M[k],r=mineRow(k),it=k.indexOf("i:")===0?ITEMS.filter(function(i){return i.id===k.slice(2)})[0]:null;return'<div class="mine-row"><b>'+(it?'<a href="#/item/'+E(it.id)+'">'+E(it.name)+'</a>':r?'<a href="'+tlHref(r)+'">'+E(r[2])+'</a>':E(mineName(k)))+'</b> <select data-f="s" data-k="'+E(k)+'" aria-label="Status"><option value="own"'+(m.s==="own"?" selected":"")+'>Own</option><option value="want"'+(m.s==="want"?" selected":"")+'>Want</option><option value="trade"'+(m.s==="trade"?" selected":"")+'>Trade</option></select> <label>Condition <select data-f="cond" data-k="'+E(k)+'">'+["","Mint","Good","Fair","For parts"].map(function(c){return'<option'+(m.cond===c?" selected":"")+'>'+c+'</option>'}).join("")+'</select></label> <label>Paid $ <input class="mx-n" type="number" min="0" data-f="paid" data-k="'+E(k)+'" value="'+E(m.paid||"")+'"></label> <label>Worth $ <input class="mx-n" type="number" min="0" data-f="val" data-k="'+E(k)+'" value="'+E(m.val||"")+'"></label> <label>Note <input data-f="note" data-k="'+E(k)+'" value="'+E(m.note||"")+'" size="18"></label> <button class="btn" data-rm="'+E(k)+'" type="button">Remove</button></div>'}).join("")+'</div>'}
  var fam={};TL.forEach(function(r){if(/^(hw|pe)$/.test(r[1])){var f=famOf(r[2]);(fam[f]=fam[f]||[]).push(r[2])}});var rep=[];Object.keys(fam).forEach(function(f){if(fam[f].length<3)return;var have=fam[f].filter(function(n){return M["t:"+n]&&M["t:"+n].s==="own"||M["i:"+(itemFor(n)||{}).id]&&M["i:"+(itemFor(n)||{}).id].s==="own"}),miss=fam[f].filter(function(n){return have.indexOf(n)<0});if(have.length&&miss.length)rep.push([f,have.length,fam[f].length,miss])});
  if(rep.length)h+='<h3 class="sub">What is missing from your sets</h3>'+rep.slice(0,8).map(function(x){return'<details class="mine-set"><summary><b>'+E(x[0])+'</b>: you own '+x[1]+' of '+x[2]+'</summary><p>'+x[3].slice(0,24).map(function(n){return'<button class="btn" data-want="'+E(n)+'" type="button">Want: '+E(n)+'</button>'}).join(" ")+'</p></details>'}).join("");
  if(own.length)h+='<h3 class="sub">My shelf</h3><div class="mine-shelf">'+own.slice(0,60).map(function(k){var r=mineRow(k),it=k.indexOf("i:")===0?ITEMS.filter(function(i){return i.id===k.slice(2)})[0]:null;return'<a class="mine-it" href="'+(it?"#/item/"+E(it.id):r?tlHref(r):"#/mine")+'" title="'+E(mineName(k))+'">'+(r?artBox(r).replace(/<small[\s\S]*$/,""):it&&typeof pic==="function"?'<div class="ph">'+pic(it)+'</div>':"")+'<span>'+E(mineName(k))+'</span></a>'}).join("")+'</div>';
  app.innerHTML=h+bk()+'</section>';
  var q=$("#mq");q.oninput=function(){var s=q.value.toLowerCase().trim(),out=[];if(s.length<2){$("#mres").innerHTML="";return}
   ITEMS.forEach(function(it){if(out.length<12&&(it.name+" "+(it.maker||"")).toLowerCase().indexOf(s)>=0)out.push(["i:"+it.id,it.name])});TL.forEach(function(r){if(out.length<12&&/^(hw|pe)$/.test(r[1])&&r[2].toLowerCase().indexOf(s)>=0&&!itemFor(r[2]))out.push(["t:"+r[2],r[2]])});
   $("#mres").innerHTML=out.length?out.map(function(o){return'<span class="mine-add">'+E(o[1])+' <button class="btn" data-a="own" data-k="'+E(o[0])+'" type="button">Own</button> <button class="btn" data-a="want" data-k="'+E(o[0])+'" type="button">Want</button></span>'}).join(" "):'<p class="tn">No match.</p>';
   $$("[data-a]").forEach(function(b){b.onclick=function(){M[b.dataset.k]={s:b.dataset.a};save();draw()}})};
  $$("[data-tab]").forEach(function(b){b.onclick=function(){tab=b.dataset.tab;draw()}});
  $$("[data-f]").forEach(function(e){e.onchange=function(){var m=M[e.dataset.k];if(!m)return;m[e.dataset.f]=e.value;save();if(e.dataset.f==="s"||e.dataset.f==="paid"||e.dataset.f==="val")draw()}});
  $$("[data-rm]").forEach(function(b){b.onclick=function(){delete M[b.dataset.rm];save();draw()}});
  $$("[data-want]").forEach(function(b){b.onclick=function(){M["t:"+b.dataset.want]={s:"want"};save();draw()}})}
 draw()}

/* ================= Jukebox: chiptunes and sound-card showdown ================= */
var JT=[{id:"dial",t:"Dial-Up Dawn",bpm:132,ch:[[57,60,64],[55,59,62],[53,57,60],[52,56,59]],arp:[0,1,2,1,2,1,0,1],dr:"k.h.s.h."},
 {id:"sun",t:"Shareware Sunrise",bpm:150,ch:[[60,64,67],[59,62,67],[57,60,64],[57,60,65]],arp:[0,2,1,2,0,2,1,2],dr:"k.hhs.hh"},
 {id:"blues",t:"Floppy Blues",bpm:92,ch:[[62,65,69],[58,62,65],[55,58,62],[57,61,64]],arp:[0,0,1,0,2,0,1,0],dr:"k...s..h"}];
var JC=[["pc","PC speaker","One square-wave voice, no volume control. Games made chords by flipping between notes very fast."],["adlib","AdLib (FM)","Two-operator FM synthesis: bright, buzzy and unmistakable."],["sb","Sound Blaster","FM plus digital drums and a warmer filtered tone."],["wt","Wavetable","Sampled-instrument style: rounder tones with a little room echo."]];
var JS={ctx:null,on:0,step:0,t:0,card:"adlib",track:"dial",vol:.6};
function jmid(m){return 440*Math.pow(2,(m-69)/12)}
function jplay(){var A=JS.ctx=JS.ctx||new(window.AudioContext||window.webkitAudioContext)();if(A.state==="suspended")A.resume();var out=JS.out=JS.out||A.createGain(),an=JS.an=JS.an||A.createAnalyser();if(!JS.wired){an.fftSize=128;out.connect(an);an.connect(A.destination);JS.wired=1}out.gain.value=JS.vol*.35;
 var T=JT.filter(function(t){return t.id===JS.track})[0],spb=60/T.bpm/2,next=A.currentTime+.08;JS.step=0;JS.on=1;
 var nb=A.createBuffer(1,A.sampleRate*.2,A.sampleRate),nd=nb.getChannelData(0);for(var i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;
 function note(f,t,d,type,g,att){var o=A.createOscillator(),v=A.createGain();o.type=type;o.frequency.value=f;v.gain.setValueAtTime(g,t);if(att)v.gain.exponentialRampToValueAtTime(.001,t+d);else v.gain.setValueAtTime(0,t+d);o.connect(v);v.connect(out);o.start(t);o.stop(t+d+.02)}
 function fm(f,t,d,g){var c=A.createOscillator(),m=A.createOscillator(),mg=A.createGain(),v=A.createGain();c.frequency.value=f;m.frequency.value=f*2;mg.gain.setValueAtTime(f*1.4,t);mg.gain.exponentialRampToValueAtTime(f*.2,t+d);m.connect(mg);mg.connect(c.frequency);v.gain.setValueAtTime(g,t);v.gain.exponentialRampToValueAtTime(.001,t+d);c.connect(v);v.connect(out);c.start(t);m.start(t);c.stop(t+d+.02);m.stop(t+d+.02)}
 function wt(f,t,d,g){[1,2,3,4].forEach(function(h,i){var o=A.createOscillator(),v=A.createGain();o.frequency.value=f*h;v.gain.setValueAtTime(g/(h*1.6),t);v.gain.exponentialRampToValueAtTime(.001,t+d*(1.2-i*.15));o.connect(v);v.connect(out);o.start(t);o.stop(t+d*1.3)})}
 function drum(ch,t){var s=A.createBufferSource(),v=A.createGain(),f=A.createBiquadFilter();s.buffer=nb;f.type=ch==="k"?"lowpass":"highpass";f.frequency.value=ch==="k"?160:ch==="s"?1800:6000;v.gain.setValueAtTime(ch==="k"?.9:ch==="s"?.5:.18,t);v.gain.exponentialRampToValueAtTime(.001,t+(ch==="h"?.04:.14));s.connect(f);f.connect(v);v.connect(out);s.start(t);s.stop(t+.2)}
 function tick(){if(!JS.on)return;while(next<A.currentTime+.25){var s=JS.step,bar=Math.floor(s/8)%4,st=s%8,cd=T.ch[bar],lead=jmid(cd[T.arp[st]]+(st===4?12:0)+12),bass=jmid(cd[0]-24),dr=T.dr[st],card=JS.card;
   if(card==="pc"){if(st%2===0||T.id!=="blues")note(lead,next,spb*.9,"square",.5,0)}
   else if(card==="adlib"){fm(lead,next,spb*1.4,.5);if(st%2===0)fm(bass,next,spb*1.8,.55)}
   else if(card==="sb"){fm(lead,next,spb*1.2,.35);if(st%2===0)note(bass,next,spb*1.6,"triangle",.7,1);if(dr&&dr!==".")drum(dr,next)}
   else{wt(lead,next,spb*1.8,.5);if(st%2===0)wt(bass,next,spb*2.2,.6)}
   next+=spb;JS.step=(s+1)%32}}
 clearInterval(JS.t);JS.t=setInterval(tick,60);tick();jdraw()}
function jstop(){JS.on=0;clearInterval(JS.t);JS.t=0}
function jdraw(){var c=document.getElementById("jv");if(!c||!JS.an)return;var g=c.getContext("2d"),d=new Uint8Array(JS.an.frequencyBinCount);(function f(){var c2=document.getElementById("jv");if(!c2||!JS.on){if(c2)g.clearRect(0,0,c2.width,c2.height);return}JS.an.getByteFrequencyData(d);g.fillStyle="#000";g.fillRect(0,0,c2.width,c2.height);var w=c2.width/d.length;d.forEach(function(v,i){g.fillStyle=["#55ffff","#55ff55","#ffff55","#ff55ff"][i%4];g.fillRect(i*w,c2.height-v/255*c2.height,w-1,v/255*c2.height)});requestAnimationFrame(f)})()}
function jukebox(){var sfx=false;try{sfx=localStorage.getItem("cm-sfx")==="1"}catch(e){}
 app.innerHTML='<section class="pl"><h2>Jukebox</h2><p>Three original loops, played through four imitations of what a PC could do with sound. The voices are approximations built in your browser, not recordings of real hardware.</p>'
  +'<p><b>Track</b> '+JT.map(function(t){return'<label class="mx-r"><input type="radio" name="jt" value="'+t.id+'"'+(JS.track===t.id?" checked":"")+'> '+E(t.t)+'</label>'}).join(" ")+'</p>'
  +'<fieldset class="pl-ctl"><legend>Sound card</legend>'+JC.map(function(c){return'<label class="mx-r"><input type="radio" name="jc" value="'+c[0]+'"'+(JS.card===c[0]?" checked":"")+'> <b>'+E(c[1])+'</b> <small class="tn">'+E(c[2])+'</small></label>'}).join("<br>")+'</fieldset>'
  +'<p><button class="btn pri" id="jp" type="button">'+(JS.on?"Stop":"Play")+'</button> <label>Volume <input id="jvol" type="range" min="0" max="100" value="'+Math.round(JS.vol*100)+'"></label></p><canvas id="jv" width="640" height="120" class="mx-vis" aria-label="Sound visualizer"></canvas>'
  +'<h3 class="sub">Site sounds</h3><p><label><input type="checkbox" id="jsfx"'+(sfx?" checked":"")+'> Click sounds on buttons and links (off by default)</label></p>'+bk()+'</section>';
 var rd=function(n,k){$$("input[name="+n+"]").forEach(function(r){r.onchange=function(){JS[k]=r.value;if(JS.on)jplay()}})};rd("jt","track");rd("jc","card");
 $("#jp").onclick=function(){if(JS.on){jstop();this.textContent="Play"}else{jplay();this.textContent="Stop"}};$("#jvol").oninput=function(){JS.vol=this.value/100;if(JS.out)JS.out.gain.value=JS.vol*.35};
 $("#jsfx").onchange=function(){try{localStorage.setItem("cm-sfx",this.checked?"1":"0")}catch(e){}if(window.CMFun&&CMFun.sfx)CMFun.sfx()};
 if(JS.on)jdraw()}

/* ================= Community: memories, corrections, first-computer wall ================= */
var GH="https://github.com/"+(typeof REPO!=="undefined"?REPO.owner+"/"+REPO.repo:"conventionalmemory/ConventionalMemory.github.io");
function issueUrl(title,body,label){return GH+"/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body)+(label?"&labels="+encodeURIComponent(label):"")}
function community(arg,id){var MEM=typeof MEMORIES!=="undefined"?MEMORIES:[],FX=typeof FIXES!=="undefined"?FIXES:[],fix=arg==="fix"&&id?ITEMS.filter(function(i){return i.id===id})[0]:null;
 app.innerHTML='<section class="pl"><h2>Community</h2><p>This is a museum you can add to. Memories and corrections go in as public GitHub issues, so you need a free GitHub account. Nothing is posted until I read it and add it here. Please do not include your email, address or anything private.</p>'
  +'<div class="mx-forms"><form id="fm" class="mx-form"><h3>Share a memory: my first computer</h3><label>Name or handle (shown on the wall) <input name="n" maxlength="40"></label><label>Which computer or console? <input name="c" maxlength="80" required></label><label>Year <input name="y" type="number" min="1970" max="2012"></label><label>Your story, a few sentences <textarea name="s" rows="4" maxlength="800" required></textarea></label><button class="btn pri" type="submit">Open on GitHub</button></form>'
  +'<form id="ff" class="mx-form"'+(fix?' data-open="1"':"")+'><h3>Suggest a correction</h3><label>Which page or item? <input name="p" maxlength="160" value="'+E(fix?fix.name+" ("+location.origin+location.pathname+"#/item/"+fix.id+")":"")+'" required></label><label>What is wrong, and what is right? <textarea name="s" rows="4" maxlength="800" required></textarea></label><label>A source, if you have one <input name="u" maxlength="200" placeholder="https://..."></label><button class="btn pri" type="submit">Open on GitHub</button></form></div>'
  +'<h3 class="sub">My first computer wall</h3>'+(MEM.length?'<div class="mx-wall">'+MEM.map(function(m){return'<figure class="mx-mem"><b>'+E(m.c)+(m.y?' <small>('+E(m.y)+')</small>':"")+'</b><blockquote>'+E(m.t)+'</blockquote><figcaption>'+E(m.n||"Anonymous")+'</figcaption></figure>'}).join("")+'</div>':'<p class="empty">The wall is empty. Yours could be first.</p>')
  +'<h3 class="sub">Accepted fixes</h3>'+(FX.length?'<ul>'+FX.map(function(f){return'<li><b>'+E(f.d)+'</b> '+E(f.t)+(f.by?' <small class="tn">thanks, '+E(f.by)+'</small>':"")+'</li>'}).join("")+'</ul>':'<p class="empty">No accepted fixes yet.</p>')
  +'<p class="tn">Videos suggested by the community show up in the <a href="#/theater">Retro Theater</a>, but videos from the museum\'s own channels always come first.</p>'+bk()+'</section>';
 $("#fm").onsubmit=function(e){e.preventDefault();var f=e.target,v=function(n){return f.elements[n].value.trim()};window.open(issueUrl("Memory: "+v("c"),"**Name or handle:** "+(v("n")||"anonymous")+"\n**Computer:** "+v("c")+"\n**Year:** "+v("y")+"\n\n"+v("s")+"\n\n_I am happy for this to appear on the first-computer wall._","memory"),"_blank","noopener")};
 $("#ff").onsubmit=function(e){e.preventDefault();var f=e.target,v=function(n){return f.elements[n].value.trim()};window.open(issueUrl("Correction: "+v("p").slice(0,60),"**Page or item:** "+v("p")+"\n\n"+v("s")+"\n\n**Source:** "+(v("u")||"none"),"correction"),"_blank","noopener")};
 if(fix)$("#ff").scrollIntoView()}

/* ================= Retro Theater ================= */
var THQ="cm-theater";
function ytId(u){var m=String(u||"").match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);return m?m[1]:null}
function theaterList(){var L=[],seen={};
 ITEMS.forEach(function(it){(it.videos||[]).forEach(function(v){var id=ytId(v.u);var k=id||v.u;if(seen[k])return;seen[k]=1;L.push({id:id,u:safeUrl(v.u,"link"),t:v.t||it.name,by:"Conventional Memory",own:1,item:it.id,y:it.year})})});
 (typeof THEATER!=="undefined"?THEATER:[]).forEach(function(v){var id=v.id||ytId(v.u);var k=id||v.u;if(seen[k])return;seen[k]=1;L.push({id:id,u:v.u||(id?"https://www.youtube.com/watch?v="+id:""),t:v.t,by:v.by||"",own:!!v.own,y:v.y})});
 var q=ld(THQ,{l:[]}).l||[];q.forEach(function(v){if(!seen[v.id]){seen[v.id]=1;L.push({id:v.id,u:"https://www.youtube.com/watch?v="+v.id,t:v.t||"My queue",by:"My queue",mine:1})}});
 return L.sort(function(a,b){return(b.own?2:b.mine?0:1)-(a.own?2:a.mine?0:1)})}
var THG=[["Computer Chronicles, full episodes","https://archive.org/search?query=%22computer+chronicles%22","Internet Archive"],["Console Living Room","https://archive.org/search?query=console+living+room","Internet Archive"],["Retro PC repair and restoration","https://www.youtube.com/results?search_query=retro+pc+restoration","YouTube search"],["Sound Blaster and AdLib history","https://www.youtube.com/results?search_query=sound+blaster+history","YouTube search"],["Early digital cameras","https://www.youtube.com/results?search_query=early+digital+cameras+history","YouTube search"],["Doom engine explained","https://www.youtube.com/results?search_query=doom+engine+explained","YouTube search"]];
function theater(arg){var L=theaterList(),emb=L.filter(function(v){return v.id}),cur=Math.max(0,Math.min(emb.length-1,+arg||0));
 function draw(){var v=emb[cur];
  var scr=v?'<iframe title="'+E(v.t)+'" src="https://www.youtube-nocookie.com/embed/'+v.id+'?rel=0" loading="lazy" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>':'<div class="tv-nosig"><b>NO SIGNAL</b><span>Nothing to play yet.</span></div>';
  var h='<section class="pl"><h2>Retro Theater</h2><p>Videos from the museum\'s own channels play first. Community picks come after, and you can add your own to the queue. Videos play from YouTube; nothing is hosted here.</p>'
   +'<div class="tv"><div class="tv-bezel"><div class="tv-screen" id="tvs">'+scr+'<div class="tv-static" id="tvst" aria-hidden="true"></div></div></div><div class="tv-ctl"><span class="tv-ch">CH '+String(v?cur+1:0).padStart(2,"0")+'</span><b>'+(v?E(v.t):"")+'</b><small>'+(v?(v.own?"From the museum":v.mine?"My queue":"Community")+(v.by&&!v.own?", "+E(v.by):""):"")+'</small><span class="tv-btns"><button class="btn" id="tvp" type="button"'+(emb.length>1?"":" disabled")+'>&laquo; CH</button><button class="btn" id="tvn" type="button"'+(emb.length>1?"":" disabled")+'>CH &raquo;</button></span></div></div>'
   +'<h3 class="sub">Channel guide</h3>'+(emb.length?'<ol class="tv-guide">'+emb.map(function(e,i){return'<li><button class="tv-g'+(i===cur?" on":"")+'" data-c="'+i+'" type="button"><b>'+String(i+1).padStart(2,"0")+'</b> '+E(e.t)+' <small>'+(e.own?"★ Museum":e.mine?"Mine":"Community")+'</small></button></li>'}).join("")+'</ol>':'<p class="empty">The guide is empty. Videos linked on museum items appear here automatically, and you can add one below.</p>')
   +(L.filter(function(v){return!v.id&&v.u}).length?'<p>Also from the museum: '+L.filter(function(v){return!v.id&&v.u}).map(function(v){return'<a class="btn" href="'+E(v.u)+'" target="_blank" rel="noopener noreferrer">'+E(v.t)+'</a>'}).join(" ")+'</p>':"")
   +'<h3 class="sub">Add to my queue</h3><p><label for="tvu">Paste a YouTube link</label> <input id="tvu" size="40" placeholder="https://www.youtube.com/watch?v=..."> <button class="btn" id="tva" type="button">Add</button> <span class="tn" id="tvm" role="status"></span></p>'
   +'<h3 class="sub">Community picks to search</h3><p class="tn">These are search links, not embedded videos. Find one you like and paste it above.</p><ul>'+THG.map(function(g){return'<li><a href="'+E(g[1])+'" target="_blank" rel="noopener noreferrer">'+E(g[0])+'</a> <small class="tn">'+E(g[2])+'</small></li>'}).join("")+'</ul>'+bk()+'</section>';
  app.innerHTML=h;
  var go=function(i){cur=(i+emb.length)%emb.length;draw();var s=$("#tvst");if(s){s.classList.add("on");setTimeout(function(){s.classList.remove("on")},350)}};
  var p=$("#tvp"),n=$("#tvn");if(p)p.onclick=function(){go(cur-1)};if(n)n.onclick=function(){go(cur+1)};$$("[data-c]").forEach(function(b){b.onclick=function(){go(+b.dataset.c)}});
  $("#tva").onclick=function(){var id=ytId($("#tvu").value);if(!id){$("#tvm").textContent="That does not look like a YouTube link.";return}var q=ld(THQ,{l:[]});q.l=(q.l||[]).filter(function(x){return x.id!==id});q.l.unshift({id:id,t:"My video "+id});sv(THQ,q);theater(String(L.length))}}
 draw()}

/* ================= Shorts mode: fact cards for any item ================= */
function shortCards(it){var c=[],sp=typeof pickSpecs==="function"?pickSpecs(it,it.type).slice(0,5):[],cp=it.msrp&&it.year&&CPI[it.year]?inflNote(it.msrp,+it.year):"";
 c.push({h:it.name,l:[(it.maker||"")+(it.year?" · "+it.year:""),it.type||""].filter(Boolean)});
 var f=[];if(it.rel||it.year)f.push("Released: "+(it.rel?fmtDate(it.rel):it.year));if(it.msrp)f.push("Launch price: "+it.msrp);if(cp)f.push(cp.replace(/^about /,"Today: about "));if(it.country)f.push("Made in "+it.country);if(f.length)c.push({h:"The basics",l:f});
 if(sp.length)c.push({h:"Under the hood",l:sp.map(function(s){return s[0]+": "+String(s[1]).slice(0,40)})});
 var tx=it.text||it.thoughts;if(tx)c.push({h:it.thoughts?"My take":"The story",l:[String(it.thoughts||it.text).slice(0,260)]});
 if(it.score!=null){var t=tier(it.score);c.push({h:"Score on the 640K scale",l:[it.score+"K out of 640K",t.l]})}
 c.push({h:"Follow for more",l:["conventionalmemory.github.io","@"+HANDLE]});return c}
function wrapT(t,n){var w=String(t).split(/\s+/),l=[],c="";w.forEach(function(x){if((c+" "+x).trim().length>n&&c){l.push(c);c=x}else c=(c+" "+x).trim()});if(c)l.push(c);return l}
function cardPng(c,i,n,name,note){var M="font-family=\"'Courier New', monospace\"",xe=function(s){return String(s).replace(/[&<>"]/g,function(q){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[q]})},y=330,s='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" width="1080" height="1920"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1030"/><stop offset="1" stop-color="#000"/></linearGradient></defs><rect width="1080" height="1920" fill="url(#g)"/><rect x="40" y="40" width="1000" height="1840" fill="none" stroke="#55ffff" stroke-width="6"/><rect x="40" y="40" width="1000" height="90" fill="#000080"/><text x="70" y="102" '+M+' font-size="42" font-weight="bold" fill="#fff">C:\\MUSEUM\\CARD'+(i+1)+'.EXE</text>';
 wrapT(c.h,16).forEach(function(l){s+='<text x="80" y="'+y+'" '+M+' font-size="92" font-weight="bold" fill="#ffff55">'+xe(l)+'</text>';y+=108});y+=50;
 c.l.forEach(function(t){wrapT(t,i===0?30:26).forEach(function(l){s+='<text x="80" y="'+y+'" '+M+' font-size="'+(i===0?56:50)+'" fill="#ffffff">'+xe(l)+'</text>';y+=70});y+=26});
 s+='<text x="540" y="1840" text-anchor="middle" '+M+' font-size="36" fill="#55ffff">'+(i+1)+' / '+n+'</text></svg>';pngDownload(s,1080,1920,name,note)}
function pngDownload(svg,w,h,name,note){var im=new Image();im.onload=function(){var c=document.createElement("canvas");c.width=w;c.height=h;c.getContext("2d").drawImage(im,0,0,w,h);c.toBlob(function(b){if(!b){note("Could not make the picture.");return}var a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href)},3000);note("Downloaded "+name)},"image/png")};im.onerror=function(){note("Your browser could not render the card.")};im.src="data:image/svg+xml;charset=utf-8,"+encodeURIComponent(svg)}
function shorts(id){var it=ITEMS.filter(function(i){return i.id===id})[0];if(!it){app.innerHTML='<section class="pl"><h2>Shorts mode</h2><p>Pick an item first.</p><p><a class="btn" href="#/catalog">Catalog</a></p></section>';return}
 var C=shortCards(it),script=C.map(function(c,i){return(i+1)+". "+c.h+"\n   "+c.l.join("\n   ")}).join("\n\n");
 app.innerHTML='<section class="pl"><h2>Shorts mode: '+E(it.name)+'</h2><p>Vertical fact cards for Shorts, Reels and TikTok. Scroll through them, download any card as a 1080x1920 picture, or copy the script.</p><div class="mx-cards">'+C.map(function(c,i){return'<article class="mx-card"><div class="mx-ch">C:\\MUSEUM\\CARD'+(i+1)+'.EXE</div><h3>'+E(c.h)+'</h3>'+c.l.map(function(l){return'<p>'+E(l)+'</p>'}).join("")+'<small>'+(i+1)+' / '+C.length+'</small><button class="btn" data-d="'+i+'" type="button">Download PNG</button></article>'}).join("")+'</div>'
  +'<p><button class="btn pri" id="shall" type="button">Download all cards</button> <button class="btn" id="shcp" type="button">Copy script</button> <span class="tn" id="shm" role="status"></span></p><textarea id="shs" readonly rows="8" class="pl-flo">'+E(script)+'</textarea><p><a class="btn" href="#/item/'+E(it.id)+'">Back to the item</a></p></section>';
 var m=function(t){$("#shm").textContent=t},nm=function(i){return slugT(it.name)+"-card-"+(i+1)+".png"};
 $$("[data-d]").forEach(function(b){b.onclick=function(){var i=+b.dataset.d;cardPng(C[i],i,C.length,nm(i),m)}});
 $("#shall").onclick=function(){C.forEach(function(c,i){setTimeout(function(){cardPng(c,i,C.length,nm(i),m)},i*400)})};
 $("#shcp").onclick=function(){var t=$("#shs");t.select();if(navigator.clipboard)navigator.clipboard.writeText(t.value).then(function(){m("Copied.")},function(){m("Press Ctrl+C.")});else m("Press Ctrl+C.")}}

/* ================= Install, offline, reminders, printing ================= */
function ics(){var n=new Date(),p=function(x){return String(x).padStart(2,"0")},d=n.getFullYear()+p(n.getMonth()+1)+p(n.getDate());return["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//ConventionalMemory.io//Daily Dig//EN","BEGIN:VEVENT","UID:daily-dig@conventionalmemory.github.io","DTSTAMP:"+d+"T120000Z","DTSTART:"+d+"T090000","RRULE:FREQ=DAILY","SUMMARY:Daily Dig on ConventionalMemory.io","DESCRIPTION:Three questions from the timeline. Keep the streak alive.","URL:https://conventionalmemory.github.io/#/daily","BEGIN:VALARM","TRIGGER:PT0M","ACTION:DISPLAY","DESCRIPTION:Daily Dig","END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n")}
function install(){var sw=!!(navigator.serviceWorker&&navigator.serviceWorker.controller),can=!!window.CMInstallEvt;
 app.innerHTML='<section class="pl"><h2>Install and offline</h2><p>The museum can live on your device. Once installed it opens like an app, and pages you have already seen keep working with no connection.</p>'
  +'<p class="pl-hud"><span>Offline cache <b id="swst">'+(sw?"active":"not active yet")+'</b></span><span>Installable <b>'+(can?"yes":"see your browser menu")+'</b></span></p><p>'+(can?'<button class="btn pri" id="inst" type="button">Install the museum</button> ':'')+'<span class="tn">If there is no button, use your browser\'s menu: "Install app" or "Add to Home Screen".</span></p>'
  +'<h3 class="sub">Daily Dig reminder</h3><p>Download a repeating calendar event for 9:00 every morning. Open it with any calendar app. Nothing is sent from this site.</p><p><button class="btn" id="icsb" type="button">Download reminder (.ics)</button></p>'
  +'<h3 class="sub">Printing</h3><p>Every item page prints cleanly as a spec sheet: press the Print spec sheet button on the item page, or use your browser\'s print command. Menus and effects are hidden on paper.</p>'+bk()+'</section>';
 var b=$("#inst");if(b)b.onclick=function(){window.CMInstallEvt.prompt()};$("#icsb").onclick=function(){dl("daily-dig-reminder.ics",ics(),"text/calendar")};
 if(navigator.storage&&navigator.storage.estimate)navigator.storage.estimate().then(function(e){var el=$("#swst");if(el&&e.usage)el.textContent+=", "+Math.round(e.usage/1024)+" KB stored"})}

var SITE=[
 {id:"explore",t:"Explore",d:"Learn your way around 1975 to 2012.",i:[["#/tours","Guided tours","Walk the timeline one stop at a time.","flag"],["#/explore","Spec Explorer","Filter everything, then compare up to four.","chip"],["#/era/1995","Era mode","Pick a year and the site changes its look.","clock"],["#/zoom","Zoom timeline","Drag across 1975 to 2012 in six lanes.","globe"],["#/day","What was happening","Any date: the news, the hardware, the games.","sun"],["#/mem","Memory map","The museum laid out like a MEM listing.","chip"],["#/scale","The 640K scale","How exhibits are scored and what the tiers mean.","star"],["#/stats","The numbers","Decades, makers, condition and completion.","bulb"],["#/quotes","Quotes","Things people said about computers, then.","heart"]]},
 {id:"play",t:"Play",d:"Games, puzzles and a daily habit.",i:[["#/play","Games","Trivia, Higher or Lower, Timeline Sort, Mystery Photo.","ghost"],["#/bingo","Retro Bingo","Cross off the squares.","star"],["#/hangman","Disk Error Hangman","Guess the machine.","ghost"],["#/daily","Daily Dig","A new puzzle every morning.","bulb"],["#/today","Today's find","A ready-to-post daily card.","bulb"],["#/maze","The Basement","Staff only. Find your way out.","floppy"]]},
 {id:"watch",t:"Theater",d:"Sit back. Video and sound.",i:[["#/theater","Retro Theater","A little CRT TV for videos.","tv"],["#/jukebox","Jukebox","Chiptunes through four kinds of sound card.","speaker"]]},
 {id:"stuff",t:"My stuff",d:"Things saved on this device.",i:[["#/mine","My collection","Own, want and trade lists, with value.","box"],["#/trophies","Trophy room","Your XP, level and badges.","star"],["#/install","Install and offline","Keep the museum on your device, add a daily reminder, print spec sheets.","floppy"]]},
 {id:"community",t:"Community",d:"Help the museum and follow along.",i:[["#/community","Share or fix","Share a memory or report a mistake.","heart"],["#/wanted","Wanted","Hardware and software the museum is hunting for.","flag"],["#/follow","Follow","New items and videos on four platforms.","tv"],["#/changes","Recent changes","What was added or corrected, and when.","clock"]]}];
function hubTiles(g){return'<div class="pl-grid">'+g.i.map(function(x){return'<a class="hm-tile" href="'+x[0]+'"><i class="hm-ic">'+glyph(x[3],28)+'</i><b>'+E(x[1])+'</b><span>'+E(x[2])+'</span></a>'}).join("")+'</div>'}
function hub(id){var g=SITE.filter(function(x){return x.id===id})[0];if(!g){morehub();return}
 app.innerHTML='<section><h2>'+E(g.t)+'</h2><p class="tn">'+E(g.d)+'</p>'+hubTiles(g)+'<p class="tn">Looking for something else? <a href="#/more">Site map</a></p></section>'}
function morehub(){var top=[["#/catalog","Catalog","Every exhibit: departments, aisles, shelf and search.","box"],["#/timeline","Timeline","1975 to 2012, hardware, software and games.","clock"],["#/search","Search","Items, hardware and games. Press / anywhere.","chip"]];
 app.innerHTML='<section><h2>Site map</h2><p class="tn">Every page in the museum, by section.</p><h3 class="sub">The collection</h3>'+hubTiles({i:top})+SITE.map(function(g){return'<h3 class="sub"><a href="#/hub/'+g.id+'">'+E(g.t)+'</a></h3>'+hubTiles(g)}).join("")+'</section>'}
window.CMMore={mount:function(el,page,args){app=el;if(page!=="jukebox")jstop();try{
  if(page==="more")morehub();else if(page==="hub")hub(args[0]);else if(page==="tours")tours();else if(page==="tour")tour(args[0],args[1]);else if(page==="explore")explore();else if(page==="era")era(args[0]);else if(page==="zoom")zoom(args[0]);else if(page==="day")day(args[0]);else if(page==="mine")mine(args[0],args[1]);else if(page==="jukebox")jukebox();else if(page==="community")community(args[0],args[1]);else if(page==="theater")theater(args[0]);else if(page==="shorts")shorts(args[0]);else if(page==="install")install();
 }catch(e){app.innerHTML='<section><h2>Something broke</h2><p class="empty">This page could not load ('+E(e.message)+').</p>'+bk()+'</section>'}},unmount:function(){jstop()}};
})();
