// Games on the timeline: release dates by system, system requirements, the Games tab and the Rig checker.
// Data lives in games-data.js (GX). Everything here is display code; all text goes through esc().
var GXFAM={DOS:"pc",Windows:"pc",Mac:"pc",Linux:"pc","PC-98":"pc","FM Towns":"pc","Apple II":"micro","Commodore 64":"micro",Amiga:"micro","Atari ST":"micro","Atari 8-bit":"micro","ZX Spectrum":"micro","TRS-80":"micro",
 NES:"con",SNES:"con",Genesis:"con","Master System":"con","TurboGrafx-16":"con",Saturn:"con",PlayStation:"con",N64:"con",Dreamcast:"con",PS2:"con",GameCube:"con",Xbox:"con","Xbox 360":"con",PS3:"con",Wii:"con","Atari 2600":"con",
 "Game Boy":"hand","Game Boy Color":"hand","Game Boy Advance":"hand",DS:"hand",PSP:"hand",iOS:"hand",Arcade:"arc",Other:"oth"};
var GXFAMN={pc:"PC",micro:"Home computer",con:"Console",hand:"Handheld",arc:"Arcade",oth:"Other"};
var GXREG={NA:"North America",JP:"Japan",EU:"Europe",AU:"Australia",WW:"Worldwide"};
var GXRIGS=[
 {n:"1981 IBM PC",y:1981,cls:1,mhz:4.77,ram:0.256,vram:0},{n:"1984 IBM PC/AT",y:1984,cls:2,mhz:8,ram:0.5,vram:0.128},{n:"1987 386 PC",y:1987,cls:3,mhz:20,ram:2,vram:0.256},
 {n:"1990 486 PC",y:1990,cls:4,mhz:33,ram:4,vram:0.5},{n:"1993 486DX2-66",y:1993,cls:4,mhz:66,ram:8,vram:1},{n:"1995 Pentium 133",y:1995,cls:5,mhz:133,ram:16,vram:2},
 {n:"1997 Pentium II 266",y:1997,cls:6,mhz:266,ram:64,vram:8},{n:"1998 Pentium II 400",y:1998,cls:6,mhz:400,ram:128,vram:16},{n:"1999 Pentium III 600",y:1999,cls:7,mhz:600,ram:128,vram:32},{n:"2000 Pentium III 1 GHz",y:2000,cls:7,mhz:1000,ram:256,vram:32}];
var GXCLS={1:"8088/8086",2:"80286",3:"80386",4:"80486",5:"Pentium class",6:"Pentium II class",7:"Pentium III / Athlon",8:"Pentium 4 or later"};
var GXS={q:"",p:"",f:"",g:"",dec:"",y:"",req:0,multi:0,sort:"date",rig:null,sub:"list"};
function gxok(){return typeof GX!=="undefined"}
function gxFam(p){return GXFAM[p]||"oth"}
function gxMo(d){var p=String(d).split("-");return(+p[0])*12+(p[1]?+p[1]-1:0)}
function gxFmt(d){return fmtDate(d)}
function gxDelay(d0,d){var m=gxMo(d)-gxMo(d0);if(m<=0)return"same time";if(m<12)return"+"+m+" mo";var y=Math.floor(m/12),r=m%12;return"+"+y+" yr"+(r?" "+r+" mo":"")}
function gxPlats(x){var s={},o=[];x.r.forEach(function(r){if(!s[r[0]]){s[r[0]]=1;o.push(r[0])}});return o}
function gxChip(p,btn){var f=gxFam(p);return'<'+(btn?'button type="button" data-gxp="'+esc(p)+'"':'span')+' class="pf pf-'+f+'" title="'+esc(GXFAMN[f])+'">'+esc(p==="Other"?"Other system":p)+'</'+(btn?'button':'span')+'>'}
function gxRam(v){return v==null?"":v<1?Math.round(v*1024)+" KB":v+" MB"}
function gxDisk(v){return v==null?"":v>=1024?(Math.round(v/102.4)/10)+" GB":v+" MB"}
function gxMaxDelay(x){if(!x||x.r.length<2)return 0;var f=x.r[0][1],mx=0;x.r.forEach(function(r){mx=Math.max(mx,gxMo(r[1])-gxMo(f))});return mx}
// Does a rig {cls,mhz,ram,vram} meet a requirement set? Returns {ok:boolean|null, miss:[...]}
function gxMeets(rig,q){if(!q)return{ok:null,miss:[]};var miss=[],known=0;
 if(q.cls!=null){known++;if(rig.cls<q.cls||(rig.cls===q.cls&&q.mhz!=null&&rig.mhz<q.mhz))miss.push("CPU: "+GXCLS[q.cls]+(q.mhz?", "+q.mhz+" MHz":""))}
 else if(q.mhz!=null){known++;if(rig.mhz<q.mhz)miss.push("CPU: "+q.mhz+" MHz")}
 if(q.ramMB!=null){known++;if(rig.ram<q.ramMB)miss.push("RAM: "+gxRam(q.ramMB))}
 if(q.vramMB!=null&&q.vramMB>0){known++;if(rig.vram<q.vramMB)miss.push("Video memory: "+gxRam(q.vramMB))}
 return{ok:known?!miss.length:null,miss:miss}}
function gxFirstRig(q){for(var i=0;i<GXRIGS.length;i++){var m=gxMeets(GXRIGS[i],q);if(m.ok)return GXRIGS[i]}return null}
function gxSrc(x){var s=x.s||"";var h=/knowledge|memory/i.test(s)?"from general knowledge, not checked against a source":/PCGamingWiki/i.test(s)?"PCGamingWiki":/Wikipedia/i.test(s)?"Wikipedia":s;
 return h+(x.c==="low"&&!/not checked/.test(h)?" (lightly sourced)":"")}
function gxReqTable(x){var n=x.n,m=x.m||{},rows=[["OS","os",function(v){return v}],["CPU","cpu",function(v){return v}],["RAM","ramMB",gxRam],["Video memory","vramMB",function(v){return v?gxRam(v):""}],["Video","video",function(v){return v}],["Sound","sound",function(v){return v}],["Disk space","diskMB",gxDisk],["Media","media",function(v){return v}],["Input","input",function(v){return v}]],h="";
 rows.forEach(function(r){var a=n[r[1]]!=null?r[2](n[r[1]]):"",b=m[r[1]]!=null?r[2](m[r[1]]):"";if(a||b)h+='<tr><th scope="row">'+r[0]+'</th><td>'+esc(a||"")+'</td>'+(x.m?'<td>'+esc(b||"")+'</td>':"")+'</tr>'});
 return h?'<table class="gxt gxreq"><thead><tr><th></th><th>Minimum</th>'+(x.m?'<th>Recommended</th>':"")+'</tr></thead><tbody>'+h+'</tbody></table>':""}
// The panel shown inside an open timeline card and on an item page.
function gxPanel(title){if(!gxok())return"";var x=GX[title];if(!x)return"";var pl=gxPlats(x),first=x.r[0],h='<div class="gx"><p class="gxchips">'+(x.g?'<span class="pf pf-g">'+esc(x.g)+'</span> ':"")+pl.map(function(p){return gxChip(p,true)}).join(" ")+'</p>';
 if(x.r.length>1||pl.length>1||true){h+='<table class="gxt"><caption>Release date by system</caption><thead><tr><th>System</th><th>Region</th><th>Released</th><th>After the first</th></tr></thead><tbody>'
  +x.r.map(function(r,i){return'<tr'+(i===0?' class="gx1"':"")+'><td>'+gxChip(r[0])+'</td><td><abbr title="'+esc(GXREG[r[2]]||r[2])+'">'+esc(r[2])+'</abbr></td><td>'+esc(gxFmt(r[1]))+'</td><td>'+(i===0?"first":esc(gxDelay(first[1],r[1])))+'</td></tr>'}).join("")+'</tbody></table>'}
 var row=null;for(var i=0;i<TL.length;i++)if(TL[i][2]===title){row=TL[i];break}
 if(row&&String(row[0]).slice(0,4)!==String(first[1]).slice(0,4))h+='<p class="tn">The date on this entry ('+esc(fmtDate(row[0]))+') differs from the earliest system date here ('+esc(gxFmt(first[1]))+', '+esc(first[0])+'). Sources disagree, or the entry follows a different release.</p>';
 else h+='<p class="tn">The date on this entry is the earliest release, on '+esc(first[0])+'. Dates are as listed by region and are not all verified.</p>';
 var pc=pl.some(function(p){return gxFam(p)==="pc"||gxFam(p)==="micro"});
 if(x.n){h+='<h4 class="gxh">System requirements</h4>'+gxReqTable(x);
  var f1=gxFirstRig(x.n),f2=x.m?gxFirstRig(x.m):null,t=[];
  if(f1)t.push("Earliest rig in the Rig checker that meets the minimum: <b>"+esc(f1.n)+"</b>");if(f2)t.push("meets the recommended: <b>"+esc(f2.n)+"</b>");
  if(t.length)h+='<p>'+t.join("; ")+'. <button class="btn" type="button" data-gxrig="'+esc(title)+'">Open the Rig checker</button></p>';
  h+='<p class="tn">Requirements source: '+esc(gxSrc(x))+'.</p>'}
 else if(pc)h+='<p class="tn">No system requirements on file for this one yet.</p>';
 else h+='<p class="tn">A console, handheld or arcade release ran on fixed hardware, so there are no requirements to list.</p>';
 var same=gxSimilar(title,x);if(same.length)h+='<p class="tle-rel"><b>More '+esc((x.g||"games").toLowerCase())+':</b> '+same.map(function(t){return'<a href="#/timeline" data-go="'+esc(t)+'">'+esc(t)+'</a>'}).join(" ")+'</p>';
 return h+'</div>'}
function gxSimilar(title,x){if(!x.g)return[];var out=[];Object.keys(GX).forEach(function(t){if(t!==title&&GX[t].g===x.g)out.push([t,Math.abs(gxMo(GX[t].r[0][1])-gxMo(x.r[0][1]))])});return out.sort(function(a,b){return a[1]-b[1]}).slice(0,4).map(function(a){return a[0]})}
// One-line hint for the header of a collapsed timeline card.
function gxHint(title){if(!gxok())return"";var x=GX[title];if(!x)return"";var pl=gxPlats(x);return' <small class="gxhint" title="'+esc(pl.join(", "))+'">'+esc(pl[0])+(pl.length>1?" +"+(pl.length-1):"")+'</small>'}
// Museum crossover: games for the platform an item belongs to, around its year.
var GXITEMMAP=[[/commodore 64|c64/i,"Commodore 64"],[/amiga/i,"Amiga"],[/atari st/i,"Atari ST"],[/apple ii|apple \]\[/i,"Apple II"],[/macintosh|\bmac\b|powerbook|imac/i,"Mac"],[/spectrum/i,"ZX Spectrum"],[/trs-80/i,"TRS-80"],[/nintendo 64|\bn64\b/i,"N64"],[/super nintendo|\bsnes\b|super famicom/i,"SNES"],[/\bnes\b|famicom/i,"NES"],[/genesis|mega drive/i,"Genesis"],[/dreamcast/i,"Dreamcast"],[/saturn/i,"Saturn"],[/playstation 2|\bps2\b/i,"PS2"],[/playstation|\bpsx\b/i,"PlayStation"],[/game boy advance/i,"Game Boy Advance"],[/game boy/i,"Game Boy"],[/xbox 360/i,"Xbox 360"],[/xbox/i,"Xbox"],[/gamecube/i,"GameCube"],[/atari 2600/i,"Atari 2600"],[/windows 9|windows|\bpc\b|ibm|toshiba|thinkpad|libretto|compaq|dell/i,"Windows"]];
function gxPlatOfItem(it){var s=it.name+" "+(it.maker||"")+" "+(it.model||"");for(var i=0;i<GXITEMMAP.length;i++)if(GXITEMMAP[i][0].test(s)){var p=GXITEMMAP[i][1];if(p==="Windows"&&it.year&&it.year<1995)return"DOS";return p}return""}
function gxItemSec(it){if(!gxok())return"";var h="",r=typeof tlMatch==="function"?tlMatch(it):null;
 if(r&&GX[r[2]])h+='<section class="wsec"><h2>Release dates and requirements</h2>'+gxPanel(r[2])+'</section>';
 if(/game or software/i.test(it.type||"")===false&&it.year){var p=gxPlatOfItem(it);if(p){var yr=it.year,L=[];Object.keys(GX).forEach(function(t){var x=GX[t];x.r.forEach(function(q){if(q[0]===p&&Math.abs(+q[1].slice(0,4)-yr)<=3)L.push([t,q[1]])})});
  L.sort(function(a,b){return a[1]<b[1]?-1:1});if(L.length)h+='<section class="wsec"><h2>Games from its era on '+esc(p)+'</h2><p class="tn">Games released for '+esc(p)+' within three years of this item ('+yr+'). Click one to see all its systems.</p><p class="tle-rel">'+L.slice(0,18).map(function(a){return'<a href="#/timeline" data-tl="'+esc(a[0])+'">'+esc(a[0])+'</a> <small>'+esc(a[1].slice(0,4))+'</small>'}).join(" ")+'</p></section>'}}
 return h}
// ---- Games tab ----
function gxList(){var out=[];Object.keys(GX).forEach(function(t){var x=GX[t],row=null;for(var i=0;i<TL.length;i++)if(TL[i][2]===t){row=TL[i];break}out.push({t:t,x:x,row:row,first:x.r[0],pl:gxPlats(x),delay:gxMaxDelay(x)})});return out}
function gxFilter(L){var q=GXS.q.trim().toLowerCase();return L.filter(function(g){
 if(q&&(g.t+" "+(g.x.g||"")+" "+g.pl.join(" ")).toLowerCase().indexOf(q)<0)return false;
 if(GXS.p&&g.pl.indexOf(GXS.p)<0)return false;if(GXS.f&&!g.pl.some(function(p){return gxFam(p)===GXS.f}))return false;if(GXS.g&&g.x.g!==GXS.g)return false;
 var y=+g.first[1].slice(0,4);if(GXS.dec&&Math.floor(y/10)*10!==+GXS.dec)return false;if(GXS.y&&y!==+GXS.y)return false;
 if(GXS.req&&!g.x.n)return false;if(GXS.multi&&g.pl.length<3)return false;return true})}
function gxSort(L){var s=GXS.sort,c={date:function(a,b){return a.first[1]<b.first[1]?-1:a.first[1]>b.first[1]?1:0},title:function(a,b){return a.t<b.t?-1:1},most:function(a,b){return b.pl.length-a.pl.length},wait:function(a,b){return b.delay-a.delay},ram:function(a,b){return(a.x.n&&a.x.n.ramMB!=null?a.x.n.ramMB:1e9)-(b.x.n&&b.x.n.ramMB!=null?b.x.n.ramMB:1e9)}};return L.slice().sort(c[s]||c.date)}
function gxHeat(L){var P={},ys={};L.forEach(function(g){g.x.r.forEach(function(r){var y=+r[1].slice(0,4);P[r[0]]=P[r[0]]||{};P[r[0]][y]=(P[r[0]][y]||0)+1;ys[y]=1})});
 var plats=Object.keys(P).sort(function(a,b){var fa=["pc","micro","con","hand","arc","oth"].indexOf(gxFam(a)),fb=["pc","micro","con","hand","arc","oth"].indexOf(gxFam(b));if(fa!==fb)return fa-fb;var ta=0,tb=0;for(var k in P[a])ta+=P[a][k];for(var k2 in P[b])tb+=P[b][k2];return tb-ta});
 if(!plats.length)return"";var y0=1976,y1=2010,W=900,Lm=118,cw=(W-Lm-8)/(y1-y0+1),rh=15,H=plats.length*rh+26,mx=0;plats.forEach(function(p){for(var k in P[p])mx=Math.max(mx,P[p][k])});
 var o='<svg class="gxheat" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Games released per system per year. Click a cell to filter the list.">';
 for(var y=y0;y<=y1;y+=2)o+='<text x="'+(Lm+(y-y0)*cw+cw/2).toFixed(1)+'" y="11" text-anchor="middle">'+String(y).slice(2)+'</text>';
 plats.forEach(function(p,i){var yy=20+i*rh;o+='<text x="'+(Lm-5)+'" y="'+(yy+11)+'" text-anchor="end" class="gxpl'+(GXS.p===p?" on":"")+'" data-gxp="'+esc(p)+'">'+esc(p)+'</text>';
  for(var y=y0;y<=y1;y++){var n=P[p][y]||0;if(!n)continue;var a=.25+.75*Math.min(1,n/mx);o+='<rect class="gxc" data-gxp="'+esc(p)+'" data-gxy="'+y+'" x="'+(Lm+(y-y0)*cw+.5).toFixed(1)+'" y="'+yy+'" width="'+(cw-1).toFixed(1)+'" height="'+(rh-2)+'" fill="'+{pc:"#0000aa",micro:"#aa5500",con:"#00aa00",hand:"#aa00aa",arc:"#aa0000",oth:"#808080"}[gxFam(p)]+'" fill-opacity="'+a.toFixed(2)+'"><title>'+esc(p)+', '+y+': '+n+' release'+(n>1?"s":"")+'</title></rect>'}});
 return o+'</svg>'}
function gxStats(L){var most=L.slice().sort(function(a,b){return b.pl.length-a.pl.length}).slice(0,5),wait=L.filter(function(g){return g.delay>0}).sort(function(a,b){return b.delay-a.delay}).slice(0,5),
 day=L.filter(function(g){var f=gxMo(g.first[1]),n={};g.x.r.forEach(function(r){if(Math.abs(gxMo(r[1])-f)<=1)n[r[0]]=1});return Object.keys(n).length>=3}).slice(0,5),lnk=function(g,extra){return'<li><a href="#/timeline" data-go="'+esc(g.t)+'">'+esc(g.t)+'</a> <small>'+esc(extra)+'</small></li>'};
 return'<div class="gxstats"><div><h4>Most ported</h4><ol>'+most.map(function(g){return lnk(g,g.pl.length+" systems")}).join("")+'</ol></div><div><h4>Longest wait for a port</h4><ol>'+wait.map(function(g){return lnk(g,gxDelay(g.first[1],g.x.r[g.x.r.length-1][1]).replace("+","")+" later")}).join("")+'</ol></div><div><h4>Launched everywhere at once</h4><ol>'+(day.length?day.map(function(g){return lnk(g,"3+ systems in a month")}).join(""):"<li>none on file</li>")+'</ol></div></div>'}
function gxView(){if(!gxok())return'<div class="tlsnap"><p>Game data is not loaded.</p></div>';var all=gxList(),L=gxFilter(all),S=gxSort(L),plats={},gens={},decs={};
 all.forEach(function(g){g.pl.forEach(function(p){plats[p]=(plats[p]||0)+1});if(g.x.g)gens[g.x.g]=(gens[g.x.g]||0)+1;decs[Math.floor(+g.first[1].slice(0,4)/10)*10]=1});
 var opt=function(v,t,sel){return'<option value="'+esc(v)+'"'+(sel?" selected":"")+'>'+esc(t)+'</option>'};
 var h='<div class="tlsnap"><h3>Games by system</h3><p class="tn">'+all.length+' games with a release date for each system they came out on. The date on the main timeline is the earliest one; here you can see which system it was for, and how long each port took. Brighter squares mean more releases. Click a system or a square to filter.</p>'
  +'<div class="gxsub"><button class="btn'+(GXS.sub==="list"?" pri":"")+'" type="button" data-gxsub="list">Browse games</button> <button class="btn'+(GXS.sub==="rig"?" pri":"")+'" type="button" data-gxsub="rig">Rig checker</button></div></div>';
 if(GXS.sub==="rig")return h+gxRigView(all);
 h+='<div class="tlsnap">'+gxHeat(all)+'</div><div class="tlsnap"><div class="gxfilters"><input id="gxq" type="search" placeholder="Search games, genres, systems" aria-label="Search games" value="'+esc(GXS.q)+'">'
  +'<select id="gxp" aria-label="System">'+opt("","Any system",!GXS.p)+Object.keys(plats).sort().map(function(p){return opt(p,p+" ("+plats[p]+")",GXS.p===p)}).join("")+'</select>'
  +'<select id="gxf" aria-label="Kind of system">'+opt("","Any kind",!GXS.f)+Object.keys(GXFAMN).map(function(k){return opt(k,GXFAMN[k],GXS.f===k)}).join("")+'</select>'
  +'<select id="gxg" aria-label="Genre">'+opt("","Any genre",!GXS.g)+Object.keys(gens).sort().map(function(k){return opt(k,k+" ("+gens[k]+")",GXS.g===k)}).join("")+'</select>'
  +'<select id="gxd" aria-label="Decade">'+opt("","Any decade",!GXS.dec)+Object.keys(decs).sort().map(function(k){return opt(k,k+"s",GXS.dec===k)}).join("")+'</select>'
  +'<select id="gxs" aria-label="Sort">'+[["date","Oldest first"],["title","Title"],["most","Most systems"],["wait","Longest port wait"],["ram","Lowest RAM needed"]].map(function(a){return opt(a[0],"Sort: "+a[1],GXS.sort===a[0])}).join("")+'</select></div>'
  +'<p class="tlflt"><label><input type="checkbox" id="gxr"'+(GXS.req?" checked":"")+'> Has requirements</label> <label><input type="checkbox" id="gxm"'+(GXS.multi?" checked":"")+'> On 3+ systems</label> '+(GXS.p||GXS.y||GXS.f||GXS.g||GXS.dec||GXS.q||GXS.req||GXS.multi?'<button class="btn" type="button" id="gxclr">Clear filters</button>':"")+'</p>'
  +'<p class="tn"><b>'+L.length+'</b> of '+all.length+' games'+(GXS.y?" first released in "+GXS.y:"")+(L.length>150?" (showing 150)":"")+'.</p>'
  +'<div class="gxwrap"><table class="gxt gxlist"><thead><tr><th>First released</th><th>Game</th><th>Systems</th><th>Genre</th><th>Needs</th></tr></thead><tbody>'
  +S.slice(0,150).map(function(g){var n=g.x.n,need=n?(n.cpu?n.cpu.replace(/^Intel\s+/,""):"")+(n.ramMB!=null?(n.cpu?", ":"")+gxRam(n.ramMB):""):"";
   return'<tr><td>'+esc(gxFmt(g.first[1]))+'<br><small>'+gxChip(g.first[0])+'</small></td><td><a href="#/timeline" data-go="'+esc(g.t)+'">'+esc(g.t)+'</a></td><td>'+g.pl.slice(0,6).map(function(p){return gxChip(p,true)}).join(" ")+(g.pl.length>6?' <small>+'+(g.pl.length-6)+' more</small>':"")+'</td><td>'+esc(g.x.g||"")+'</td><td>'+(need?esc(need):'<small class="tn">-</small>')+'</td></tr>'}).join("")+'</tbody></table></div></div>'
  +'<div class="tlsnap">'+gxStats(all)+'</div>';return h}
// ---- Rig checker ----
function gxParseItemRig(it){var sp=it.specs||{},cpu=(sp.CPU||"")+" "+(sp["CPU speed"]||"")+" "+it.name,mh=/(\d+(?:\.\d+)?)\s*(MHz|GHz)/i.exec(sp["CPU speed"]||sp.CPU||""),ram=/(\d+(?:\.\d+)?)\s*(KB|MB|GB)/i.exec(sp["RAM installed"]||sp.RAM||""),cls=0;
 if(/pentium (iii|3)|athlon/i.test(cpu))cls=7;else if(/pentium (ii|2)|celeron|k6-?(2|iii)/i.test(cpu))cls=6;else if(/pentium|k5|k6/i.test(cpu))cls=5;else if(/486/.test(cpu))cls=4;else if(/386/.test(cpu))cls=3;else if(/286/.test(cpu))cls=2;else if(/8088|8086/.test(cpu))cls=1;
 if(!cls||!mh||!ram)return null;var m=+mh[1]*(/ghz/i.test(mh[2])?1000:1),r=+ram[1]*(/kb/i.test(ram[2])?1/1024:/gb/i.test(ram[2])?1024:1);return{n:it.name,y:it.year,cls:cls,mhz:m,ram:r,vram:2,item:it.id}}
function gxRigNow(){return GXS.rig||GXRIGS[5]}
function gxRigView(all){var R=gxRigNow(),mus=(typeof ITEMS!=="undefined"?ITEMS:[]).map(gxParseItemRig).filter(Boolean),
 sel='<select id="gxrp" aria-label="Pick a rig">'+GXRIGS.map(function(r,i){return'<option value="p'+i+'"'+(R.n===r.n?" selected":"")+'>'+esc(r.n)+'</option>'}).join("")+mus.map(function(r,i){return'<option value="m'+i+'"'+(R.item===r.item?" selected":"")+'>Museum: '+esc(r.n)+'</option>'}).join("")+'</select>';
 window.__gxmus=mus;
 var run=[],ok=[],no=[],nodata=0;all.forEach(function(g){if(!g.x.n)return;var a=gxMeets(R,g.x.n);if(a.ok===null){nodata++;return}if(a.ok){var b=g.x.m?gxMeets(R,g.x.m):null;(b&&b.ok?run:ok).push(g)}else no.push([g,a.miss])});
 var lk=function(g){return'<a href="#/timeline" data-go="'+esc(g.t)+'">'+esc(g.t)+'</a>'};
 return'<div class="tlsnap"><h3>Rig checker</h3><p class="tn">Pick a PC and see which games on file would run on it, using the minimum and recommended requirements. Only games with numbers on file count, and about half of those are from general knowledge, so treat it as a guide. Presets are typical high-end PCs of their year. Choosing a museum machine uses its listed CPU and RAM.</p>'
 +'<p class="gxrig"><label>Rig: '+sel+'</label></p><dl class="tle-sp"><dt>CPU</dt><dd>'+esc(GXCLS[R.cls]||"")+', '+R.mhz+' MHz</dd><dt>RAM</dt><dd>'+esc(gxRam(R.ram))+'</dd><dt>Video memory</dt><dd>'+esc(gxRam(R.vram))+(R.item?' (assumed)':"")+'</dd></dl>'
 +'<div class="gxstats"><div><h4>Runs well ('+run.length+')</h4><p class="tn">Meets the recommended specs.</p><ol>'+run.map(function(g){return'<li>'+lk(g)+'</li>'}).join("")+'</ol></div><div><h4>Runs, minimum ('+ok.length+')</h4><p class="tn">Meets the minimum; no recommended specs on file, or below them.</p><ol>'+ok.map(function(g){return'<li>'+lk(g)+'</li>'}).join("")+'</ol></div><div><h4>Not yet ('+no.length+')</h4><p class="tn">What is short.</p><ol>'+no.map(function(a){return'<li>'+lk(a[0])+' <small>'+esc(a[1].join("; "))+'</small></li>'}).join("")+'</ol></div></div>'
 +'<p class="tn">'+(all.length-run.length-ok.length-no.length-nodata)+' games have no requirements on file'+(nodata?', and '+nodata+' have too little data to check':"")+'.</p></div>'}
function gxWire(main,redraw,jump){
 main.addEventListener("input",function(e){if(e.target.id==="gxq"){GXS.q=e.target.value;redraw(true)}});
 main.addEventListener("change",function(e){var t=e.target,id=t.id;if(id==="gxp")GXS.p=t.value;else if(id==="gxf")GXS.f=t.value;else if(id==="gxg")GXS.g=t.value;else if(id==="gxd"){GXS.dec=t.value;GXS.y=""}else if(id==="gxs")GXS.sort=t.value;else if(id==="gxr")GXS.req=t.checked?1:0;else if(id==="gxm")GXS.multi=t.checked?1:0;
  else if(id==="gxrp"){var v=t.value;GXS.rig=v[0]==="p"?GXRIGS[+v.slice(1)]:(window.__gxmus||[])[+v.slice(1)]}else return;redraw()});
 main.addEventListener("click",function(e){var s=e.target.closest("[data-gxsub]");if(s){GXS.sub=s.dataset.gxsub;redraw();return}
  var c=e.target.closest("[data-gxp]");if(c&&e.target.closest(".gxheat,.gxlist,.gxt")){GXS.sub="list";GXS.p=c.dataset.gxp;GXS.y=c.dataset.gxy||"";GXS.dec="";redraw();return}
  if(e.target.id==="gxclr"){GXS={q:"",p:"",f:"",g:"",dec:"",y:"",req:0,multi:0,sort:"date",rig:GXS.rig,sub:"list"};redraw()}});}
