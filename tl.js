/* tl.js - the timeline page (#/timeline and #/timeline/<year>).
   Everything on it is generated from the data files: timeline-data.js (TL), items.js (ITEMS) and PCS in app.js.
   Uses helpers from app.js (esc, fmtDate, dyear, pcFor, adArt, TLK, TLF, tlEntries, ITEMS, TL). */

/* Approximate US consumer price index (CPI-U annual averages), used only for the "in today's money" hint. */
var CPI={1974:49.3,1975:53.8,1976:56.9,1977:60.6,1978:65.2,1979:72.6,1980:82.4,1981:90.9,1982:96.5,1983:99.6,1984:103.9,1985:107.6,1986:109.6,1987:113.6,1988:118.3,1989:124.0,1990:130.7,1991:136.2,1992:140.3,1993:144.5,1994:148.2,1995:152.4,1996:156.9,1997:160.5,1998:163.0,1999:166.6,2000:172.2,2001:177.1,2002:179.9,2003:184.0,2004:188.9,2005:195.3,2006:201.6,2007:207.3,2008:215.3,2009:214.5,2010:218.1},CPI_NOW=322;
var TLGROUP={hw:"tech",sw:"tech",p:"tech",gt:"games",gn:"games",gc:"games",e:"ind",i:"mus",m:"cult",w:"cult",u:"cult"};
var TLGN={tech:["Tech","#0000aa"],games:["Games","#00aa00"],ind:["Industry","#aa0000"],mus:["Museum","#aa00aa"],cult:["Culture","#aa5500"]};
var TLY=0,TLOPEN={},TLQ2="";

function usdOf(p){var m=String(p||"").match(/\$\s?([\d,]+(?:\.\d+)?)/);return m?parseFloat(m[1].replace(/,/g,"")):0}
function inflNote(p,y){var a=usdOf(p),c=CPI[y];if(!a||!c||y>2010)return"";var v=a*CPI_NOW/c;return v<a*1.2?"":"about $"+Math.round(v).toLocaleString("en-US")+" in today's money (approximate)"}
function tlAllEntries(){var save={},q=TLQ;Object.keys(TLK).forEach(function(k){save[k]=TLF[k];TLF[k]=1});TLQ="";var e=tlEntries();Object.keys(save).forEach(function(k){TLF[k]=save[k]});TLQ=q;return e}
function tlRow(x){return x.k==="i"?[x.d,"i",x.i.name,x.i.msrp||"","",x.i.relx?"":"y"]:[x.d,x.k,x.t,x.p||"",x.n||"",x.s||""]}
function osOfYear(y){var best=null;TL.forEach(function(r){if(r[1]==="sw"&&dyear(r[0])<=y&&/^(MS-DOS \d|PC DOS|Windows (1\.|3\.|95|98|2000|Me|XP|Vista|7)|Windows NT|Mac OS X|OS\/2)/.test(r[2])&&(!best||r[0]>=best[0]))best=r});return best}
function nameKey(t){var w=String(t).replace(/[^A-Za-z0-9 ]/g," ").split(/\s+/).filter(Boolean);return w.length>1&&w[0].length>=4?(w[0]+" "+w[1]).toLowerCase():""}

function tlChart(all,cur,mx){var y0=1974,y1=2010,W=22,H=86,by={},o='<svg class="tlc" viewBox="0 0 '+((y1-y0+1)*W)+' '+(H+16)+'" role="img" aria-label="Number of timeline entries per year, 1974 to 2010. Choose a bar to open that year.">';
 all.forEach(function(x){var y=dyear(x.d);if(y<y0||y>y1)return;var g=TLGROUP[x.k]||"cult";by[y]=by[y]||{};by[y][g]=(by[y][g]||0)+1});
 for(var y=y0;y<=y1;y++){var g=by[y]||{},tot=0,yy=H,x0=(y-y0)*W;Object.keys(g).forEach(function(k){tot+=g[k]});
  o+='<g class="tlbar'+(y===cur?" on":"")+'" data-y="'+y+'" tabindex="0" role="button" aria-label="'+y+': '+tot+' entries"><rect class="hit" x="'+x0+'" y="0" width="'+W+'" height="'+(H+16)+'" fill="transparent"/>';
  ["tech","games","ind","mus","cult"].forEach(function(k){if(!g[k])return;var h=g[k]/mx*(H-6);yy-=h;o+='<rect x="'+(x0+3)+'" y="'+yy.toFixed(1)+'" width="'+(W-6)+'" height="'+h.toFixed(1)+'" fill="'+TLGN[k][1]+'"/>'});
  if(y%5===0||y===cur)o+='<text x="'+(x0+W/2)+'" y="'+(H+12)+'" text-anchor="middle" class="tly">'+String(y).slice(2)+'</text>';
  o+='</g>'}
 return o+'</svg>'}

function tlKindLabel(k){return TLK[k]?TLK[k][1]:k}

var TLREV=null,TLREL={"sequel":"sequel","prequel":"prequel","successor":"successor","predecessor":"predecessor","requires":"requires","ran on":"ran on","same series":"same series","same studio":"same studio","competitor":"rival","based on":"based on","bundled with":"bundled with","upgrade of":"upgrade of","uses":"uses"};
var TLINV={"sequel":"prequel","prequel":"sequel","successor":"predecessor","predecessor":"successor","requires":"needed by","ran on":"ran this","same series":"same series","same studio":"same studio","competitor":"rival","based on":"inspired","bundled with":"bundled with","upgrade of":"upgraded by","uses":"used by"};
function tlLinks(title){if(typeof TLX==="undefined")return[];if(!TLREV){TLREV={};Object.keys(TLX).forEach(function(k){(TLX[k].links||[]).forEach(function(l){(TLREV[l[0]]=TLREV[l[0]]||[]).push([k,TLINV[l[1]]||l[1]])})})}
 var out=[],seen={};((TLX[title]||{}).links||[]).map(function(l){return[l[0],TLREL[l[1]]||l[1]]}).concat(TLREV[title]||[]).forEach(function(l){if(!seen[l[0]]){seen[l[0]]=1;out.push(l)}});return out}
function tlWeb(title,links){if(!links.length)return"";var n=Math.min(links.length,8),W=420,H=220,cx=W/2,cy=H/2,o='<svg class="tlweb" viewBox="0 0 '+W+' '+H+'" role="group" aria-label="Connections for '+esc(title)+'">';
 var pts=links.slice(0,n).map(function(l,i){var a=-Math.PI/2+i*2*Math.PI/n;return{x:cx+Math.cos(a)*160,y:cy+Math.sin(a)*78,l:l}});
 pts.forEach(function(p){o+='<line x1="'+cx+'" y1="'+cy+'" x2="'+p.x.toFixed(1)+'" y2="'+p.y.toFixed(1)+'"/>'});
 pts.forEach(function(p){var t=p.l[0].length>19?p.l[0].slice(0,18)+"…":p.l[0];o+='<g class="tlnode" data-go="'+esc(p.l[0])+'" tabindex="0" role="button" aria-label="'+esc(p.l[0])+', '+esc(p.l[1])+'"><rect x="'+(p.x-66).toFixed(1)+'" y="'+(p.y-15).toFixed(1)+'" width="132" height="30" rx="3"/><text x="'+p.x.toFixed(1)+'" y="'+(p.y-2).toFixed(1)+'" text-anchor="middle" class="n1" textLength="'+Math.min(124,t.length*6.6).toFixed(0)+'" lengthAdjust="spacingAndGlyphs">'+esc(t)+'</text><text x="'+p.x.toFixed(1)+'" y="'+(p.y+10).toFixed(1)+'" text-anchor="middle" class="n2" textLength="'+Math.min(110,p.l[1].length*5.6).toFixed(0)+'" lengthAdjust="spacingAndGlyphs">'+esc(p.l[1])+'</text></g>'});
 var c=title.length>21?title.slice(0,20)+"…":title;o+='<g class="tlhub"><rect x="'+(cx-70)+'" y="'+(cy-14)+'" width="140" height="28" rx="3"/><text x="'+cx+'" y="'+(cy+5)+'" text-anchor="middle" textLength="'+Math.min(128,c.length*7).toFixed(0)+'" lengthAdjust="spacingAndGlyphs">'+esc(c)+'</text></g></svg>';return o}
function tlPrice(x){var pr=x.k==="i"?x.i.msrp:x.p;if(pr)return{t:pr,est:/\*$/.test(pr)};if(x.k==="hw"||x.k==="sw"||x.k==="gt"||x.k==="gn"||x.k==="gc"){var g=guessPrice([x.d,x.k,x.t,"","",""],dyear(x.d));return g.t==="Price TBA*"?null:{t:g.t,est:true,typ:true}}return null}
function tlCard(x,id,open){var r=tlRow(x),yr=dyear(x.d),main=x.k==="i"?x.i.name:x.t,ds=String(x.d).length>=10?fmtDate(x.d).replace(/, \d{4}$/,""):String(x.d).length>=7?fmtDate(x.d).replace(/ \d{4}$/,""):"",pr=x.k==="i"?x.i.msrp:x.p,ast=astr(x),tp=tlPrice(x);
 var art=(x.k==="gt"||x.k==="gn"||x.k==="gc"||x.k==="hw"||x.k==="sw")?'<div class="tl-thumb">'+adArt(r,96,80,"t"+id)+'</div>':"";
 var body='';
 if(open){var nk=nameKey(main),rel=nk?TL.filter(function(z){return z[2]!==main&&nameKey(z[2])===nk}).slice(0,5):[],
   dn=String(x.d).length>=7?dnum(x.d,false):0,near=dn?TL.filter(function(z){return z[2]!==main&&String(z[0]).length>=7&&Math.abs(dnum(z[0],false)-dn)<=31&&(z[1]==="hw"||z[1]==="gt"||z[1]==="sw"||z[1]==="e")}).slice(0,4):[],
   inf=inflNote(pr,yr);
  body='<div class="tle-b">'+art+'<div class="tle-t2">'+(x.n?'<p>'+esc(x.n)+'</p>':"")
   +'<p class="tle-meta"><b>Date:</b> '+esc(fmtDate(x.d))+(ast?" (not confirmed against a source)":(x.k==="i"||x.k==="p"?"":" (confirmed)"))+(tp?' &middot; <b>'+(tp.typ?'Typical price then:':'MSRP:')+'</b> '+esc(tp.t)+(inf&&!tp.typ?' <span class="tle-inf">'+esc(inf)+'</span>':""):"")+'</p>'+tlFacts(main)
   +(x.k==="i"?'<p><a class="btn" href="#/item/'+esc(x.i.id)+'">Open in the museum</a></p>':"")
   +tlConn(main)+(rel.length?'<p class="tle-rel"><b>Same family:</b> '+rel.map(function(z){return'<a href="#/timeline/'+dyear(z[0])+'" data-y="'+dyear(z[0])+'">'+esc(z[2])+' ('+dyear(z[0])+')</a>'}).join(" ")+'</p>':"")
   +(near.length?'<p class="tle-rel"><b>That month:</b> '+near.map(function(z){return'<a href="#/timeline/'+dyear(z[0])+'" data-y="'+dyear(z[0])+'">'+esc(z[2])+'</a>'}).join(" ")+'</p>':"")
   +'</div></div>'}
 return'<article class="tle k-'+x.k+(open?" open":"")+'" data-id="'+id+'"><button class="tle-h" type="button" aria-expanded="'+(open?"true":"false")+'"><span class="tle-d">'+esc(ds||"")+'</span><span class="tle-k">'+esc(tlKindLabel(x.k))+'</span><span class="tle-t">'+esc(main)+ast+'</span>'+(pr?'<span class="tle-p" title="'+esc(pr)+'">'+esc(pr.replace(/ \(.*$/,"").replace(/\*$/,"")+(/\*$/.test(pr)?"*":""))+'</span>':tp&&tp.typ?'<span class="tle-p tle-est" title="Typical price for the era, not a confirmed MSRP">~</span>':"")+(x.k==="i"&&x.i.score!=null?'<span class="tle-p">'+x.i.score+'K</span>':"")+'<span class="tle-x" aria-hidden="true">'+(open?"−":"+")+'</span></button>'+body+'</article>'}


function tlFacts(title){var x=typeof TLX!=="undefined"?TLX[title]:null;if(!x)return"";var h="";
 if(x.detail)h+='<p>'+esc(x.detail)+'</p>';
 var m=[];if(x.maker)m.push("<b>Maker:</b> "+esc(x.maker));if(x.dev)m.push("<b>Developer:</b> "+esc(x.dev));if(m.length)h+='<p class="tle-meta">'+m.join(" &middot; ")+'</p>';
 var k=x.specs?Object.keys(x.specs):[];if(k.length)h+='<dl class="tle-sp">'+k.slice(0,10).map(function(a){return'<dt>'+esc(a)+'</dt><dd>'+esc(x.specs[a])+'</dd>'}).join("")+'</dl>';
 if(x.conf==="low")h+='<p class="tn">Details on this entry are lightly sourced.</p>';return h}
function tlConn(title){var l=tlLinks(title);if(!l.length)return"";return'<div class="tle-web"><b>Connections</b> <span class="tn">(click a box to jump there)</span>'+tlWeb(title,l)+(l.length>8?'<p class="tle-rel">'+l.slice(8).map(function(a){return'<a href="#/timeline" data-go="'+esc(a[0])+'">'+esc(a[0])+'</a> <small>'+esc(a[1])+'</small>'}).join(" ")+'</p>':"")+'</div>'}
function timeline(y){
 var all=tlAllEntries(),bym={};all.forEach(function(x){var yy=dyear(x.d);bym[yy]=(bym[yy]||0)+1});
 var mx=Math.max.apply(null,Object.keys(bym).map(function(k){return bym[k]}));
 var Y=+y;if(Y>=1970&&Y<=2010)TLY=Y;else if(!TLY)TLY=1993;TLY=Math.max(1974,Math.min(2010,TLY));
 var ORD={};all.forEach(function(x,i){x._id=i});
 app.innerHTML='<section class="tlw"><div class="tlwin"><div class="tlbar-t"><span>TIMELINE.EXE - <b id="tlt">'+TLY+'</b></span><span class="tlbtn" aria-hidden="true">_ &#9633; x</span></div>'
  +'<div class="tlbody"><p class="tlintro">The machines, the games, the movies, the industry and the world, side by side. Pick a year on the chart or drag the slider. Click any entry to open it. An asterisk (*) means I could not confirm the date or price against a source.</p>'
  +'<div class="tlchartw">'+tlChart(all,TLY,mx)+'</div>'
  +'<div class="tlkey">'+Object.keys(TLGN).map(function(k){return'<span><i style="background:'+TLGN[k][1]+'"></i>'+TLGN[k][0]+'</span>'}).join("")+'</div>'
  +'<div class="tlnav"><button class="btn" id="tlprev" type="button">&#9664; Prev</button><input id="tlr" type="range" min="1974" max="2010" step="1" value="'+TLY+'" aria-label="Year"><button class="btn" id="tlnext" type="button">Next &#9654;</button></div>'
  +'<div class="tlrow"><button class="btn" id="tlrand" type="button">Beam me to a random moment</button><button class="btn" id="tlotd" type="button">On this day</button><input id="tlq" type="search" placeholder="Search all years" aria-label="Search the timeline" value="'+esc(TLQ2)+'"></div>'
  +'<div id="tlotdbox" hidden></div><div id="tlmain"></div></div><div class="tlfoot"><span>Best viewed at 800 x 600 in 256 colors</span><span id="tlcount"></span></div></div></section>';
 var main=document.getElementById("tlmain");
 function snap(yr){var E=all.filter(function(x){return dyear(x.d)===yr}),cnt={};E.forEach(function(x){var g=TLGROUP[x.k]||"cult";cnt[g]=(cnt[g]||0)+1});
  var pc=pcFor(yr),os=osOfYear(yr),games=E.filter(function(x){return x.k==="gt"}).slice(0,3),priciest=null;
  E.forEach(function(x){var p=x.k==="i"?x.i.msrp:x.p,v=usdOf(p);if(v&&(!priciest||v>priciest.v))priciest={v:v,t:x.k==="i"?x.i.name:x.t,p:p}});
  var mus=E.filter(function(x){return x.k==="i"});
  return'<div class="tlsnap"><h3>'+yr+' at a glance</h3><div class="tlstats"><div><b>'+E.length+'</b>entries</div>'+["tech","games","ind","cult"].map(function(k){return'<div style="border-color:'+TLGN[k][1]+'"><b>'+(cnt[k]||0)+'</b>'+TLGN[k][0].toLowerCase()+'</div>'}).join("")+'</div>'
   +'<dl class="tlfacts">'+(os?'<dt>Popular OS</dt><dd>'+esc(os[2])+'</dd>':"")+(pc?'<dt>High-end PC</dt><dd>'+esc(pc.cpu)+', '+esc(pc.ram)+' RAM'+(pc.y!==yr?' <small>(as of '+pc.y+')</small>':"")+'</dd><dt>Video and sound</dt><dd>'+esc(pc.video)+'; '+esc(pc.sound)+'</dd>':"")
   +(games.length?'<dt>Top games</dt><dd>'+games.map(function(g){return esc(g.t)}).join(", ")+'</dd>':"")
   +(priciest?'<dt>Priciest listed</dt><dd>'+esc(priciest.t)+', '+esc(priciest.p)+(inflNote(priciest.p,yr)?' <small>('+esc(inflNote(priciest.p,yr))+')</small>':"")+'</dd>':"")
   +(mus.length?'<dt>In the museum</dt><dd>'+mus.map(function(x){return'<a href="#/item/'+esc(x.i.id)+'">'+esc(x.i.name)+'</a>'}).join(", ")+'</dd>':"")+'</dl></div>'}
 function chips(E){var c={};E.forEach(function(x){c[x.k]=(c[x.k]||0)+1});return'<p class="tlpills">'+Object.keys(TLK).filter(function(k){return c[k]}).map(function(k){return'<label class="tlpill k-'+k+'"><input type="checkbox" data-f="'+k+'"'+(TLF[k]?" checked":"")+'> '+esc(TLK[k][0])+' <b>'+c[k]+'</b></label>'}).join("")+'</p>'}
 function feed(E){var h="",lastM=null;E.forEach(function(x){var mo=String(x.d).length>=7?MON[+String(x.d).slice(5,7)-1]:"";if(mo!==lastM){lastM=mo;h+='<h4 class="tlmon">'+(mo||"Sometime that year")+'</h4>'}h+=tlCard(x,x._id,!!TLOPEN[x._id])});return h||'<div class="empty">Nothing matches. Turn a filter back on.</div>'}
 function draw(){var q=TLQ2.trim().toLowerCase(),html;
  document.getElementById("tlt").textContent=q?"search":TLY;
  if(q){var R=all.filter(function(x){return TLF[x.k]&&((x.i?x.i.name+" "+x.i.maker:x.t+" "+(x.n||"")).toLowerCase().indexOf(q)>=0)}),shown=R.slice(0,250),lastY=0,h='';
   shown.forEach(function(x){var yy=dyear(x.d);if(yy!==lastY){lastY=yy;h+='<h4 class="tlmon"><a href="#/timeline/'+yy+'" data-y="'+yy+'">'+yy+'</a></h4>'}h+=tlCard(x,x._id,!!TLOPEN[x._id])});
   html=chips(all)+'<p class="tn">'+R.length+' match'+(R.length===1?"":"es")+(R.length>250?" (showing the first 250)":"")+'.</p>'+(h||'<div class="empty">Nothing matches.</div>');document.getElementById("tlcount").textContent=R.length+" results"}
  else{var E=all.filter(function(x){return dyear(x.d)===TLY}),F=E.filter(function(x){return TLF[x.k]});html=snap(TLY)+chips(E)+feed(F);document.getElementById("tlcount").textContent=F.length+" of "+E.length+" entries in "+TLY}
  main.innerHTML=html;
  main.querySelectorAll("input[data-f]").forEach(function(c){c.onchange=function(){TLF[c.dataset.f]=c.checked?1:0;draw()}});
  document.querySelectorAll(".tlbar").forEach(function(g){g.classList.toggle("on",+g.dataset.y===TLY&&!q)});
  document.getElementById("tlr").value=TLY}
 function setYear(v,keepQ){TLY=Math.max(1974,Math.min(2010,v));if(!keepQ){TLQ2="";document.getElementById("tlq").value=""}try{history.replaceState(null,"","#/timeline/"+TLY)}catch(e){}draw();window.scrollTo(0,document.querySelector(".tlw").offsetTop)}
 document.querySelector(".tlchartw").addEventListener("click",function(e){var g=e.target.closest(".tlbar");if(g)setYear(+g.dataset.y)});
 document.querySelector(".tlchartw").addEventListener("keydown",function(e){var g=e.target.closest&&e.target.closest(".tlbar");if(g&&(e.key==="Enter"||e.key===" ")){e.preventDefault();setYear(+g.dataset.y)}});
 document.getElementById("tlprev").onclick=function(){setYear(TLY-1)};document.getElementById("tlnext").onclick=function(){setYear(TLY+1)};
 document.getElementById("tlr").oninput=function(){setYear(+this.value)};
 document.getElementById("tlq").oninput=function(){TLQ2=this.value;draw()};
 document.getElementById("tlrand").onclick=function(){var pool=all.filter(function(x){return x.k!=="p"&&(x.k==="gt"||x.k==="hw"||x.k==="e"||x.k==="sw"||x.k==="i")}),x=pool[Math.floor(Math.random()*pool.length)];TLOPEN[x._id]=1;setYear(dyear(x.d));var el=main.querySelector('[data-id="'+x._id+'"]');if(el){el.scrollIntoView({block:"center"});el.classList.add("flash")}};
 document.getElementById("tlotd").onclick=function(){var box=document.getElementById("tlotdbox"),d=new Date(),k="-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  var l=all.filter(function(x){return String(x.d).length===10&&String(x.d).slice(4)===k&&x.k!=="p"});
  box.hidden=false;box.innerHTML='<div class="tlotd"><b>On this day ('+MON[d.getMonth()]+' '+d.getDate()+')</b>'+(l.length?l.map(function(x){return'<p><a href="#/timeline/'+dyear(x.d)+'" data-y="'+dyear(x.d)+'">'+dyear(x.d)+'</a> <span class="tag">'+esc(tlKindLabel(x.k))+'</span> '+esc(x.k==="i"?x.i.name:x.t)+'</p>'}).join(""):'<p>Nothing dated to this exact day yet. Try the random button.</p>')+'</div>';box.querySelectorAll("a[data-y]").forEach(function(a){a.onclick=function(e){e.preventDefault();setYear(+a.dataset.y)}})};
 function jump(title){var x=all.filter(function(z){return z.k!=="i"&&z.t===title})[0]||all.filter(function(z){return z.k==="i"&&z.i.name===title})[0];if(!x)return;TLF[x.k]=1;TLOPEN[x._id]=1;setYear(dyear(x.d));var el=main.querySelector('[data-id="'+x._id+'"]');if(el){el.scrollIntoView({block:"center"});el.classList.add("flash")}}
 main.addEventListener("keydown",function(e){var n=e.target.closest&&e.target.closest("[data-go]");if(n&&(e.key==="Enter"||e.key===" ")){e.preventDefault();jump(n.dataset.go)}});
 main.addEventListener("click",function(e){var gn=e.target.closest("[data-go]");if(gn){e.preventDefault();jump(gn.dataset.go);return}var a=e.target.closest("a[data-y]");if(a){e.preventDefault();setYear(+a.dataset.y);return}
  var h=e.target.closest(".tle-h");if(!h)return;var art=h.parentNode,id=art.dataset.id;TLOPEN[id]=!TLOPEN[id];var x=all[+id];art.outerHTML=tlCard(x,+id,!!TLOPEN[id]);});
 draw()}
