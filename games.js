// Games on the timeline: release dates by system, system requirements, the Games tab and the Rig checker.
// Data lives in games-data.js (GX). Everything here is display code; all text goes through esc().
var GXFAM={DOS:"pc",Windows:"pc",Mac:"pc",Linux:"pc","PC-98":"pc","FM Towns":"pc","PC-88":"pc","FM-7":"pc","Sharp X1":"pc","Sharp X68000":"pc",Unix:"pc","Apple II":"micro","Apple IIgs":"micro","Commodore 64":"micro","VIC-20":"micro",Amiga:"micro","Atari ST":"micro","Atari 8-bit":"micro","ZX Spectrum":"micro","TRS-80":"micro","BBC Micro":"micro","Amstrad CPC":"micro",MSX:"micro",MSX2:"micro","Elektronika 60":"micro",
 NES:"con",Famicom:"con","Famicom Disk System":"con",SNES:"con",Genesis:"con","Sega CD":"con","32X":"con","Master System":"con","SG-1000":"con","TurboGrafx-16":"con","PC Engine":"con","TurboGrafx-CD":"con","Neo Geo":"con",Saturn:"con",PlayStation:"con",N64:"con",Dreamcast:"con",PS2:"con",GameCube:"con",Xbox:"con","Xbox 360":"con",PS3:"con",Wii:"con","Wii U":"con","Atari 2600":"con","Atari 5200":"con","Atari 7800":"con",ColecoVision:"con",Intellivision:"con","3DO":"con",Jaguar:"con","Jaguar CD":"con","CD-i":"con","Amiga CD32":"con","PC-FX":"con",Zeebo:"con",PS4:"con",PS5:"con","Xbox One":"con","Xbox Series X/S":"con",Switch:"con","Switch 2":"con","Stadia":"mob",
 "Game Boy":"hand","Game Boy Color":"hand","Game Boy Advance":"hand",DS:"hand","3DS":"hand",PSP:"hand","Game Gear":"hand","Atari Lynx":"hand","Virtual Boy":"hand","N-Gage":"hand",Vita:"hand","Game.com":"hand","Tapwave Zodiac":"hand",iOS:"mob",Android:"mob","Windows Phone":"mob",BlackBerry:"mob","Java ME":"mob",BREW:"mob",Browser:"mob","Facebook (browser)":"mob",Arcade:"arc"};
var GXFAMN={pc:"PC",micro:"Home computer",con:"Console",hand:"Handheld",arc:"Arcade",mob:"Mobile and web",oth:"Unlisted system"};
var GXREG={NA:"North America",JP:"Japan",EU:"Europe",AU:"Australia",WW:"Worldwide"};
var GXRIGS=[
 {n:"1981 IBM PC",y:1981,cls:1,mhz:4.77,ram:0.256,vram:0},{n:"1984 IBM PC/AT",y:1984,cls:2,mhz:8,ram:0.5,vram:0.128},{n:"1987 386 PC",y:1987,cls:3,mhz:20,ram:2,vram:0.256},
 {n:"1990 486 PC",y:1990,cls:4,mhz:33,ram:4,vram:0.5},{n:"1993 486DX2-66",y:1993,cls:4,mhz:66,ram:8,vram:1},{n:"1995 Pentium 133",y:1995,cls:5,mhz:133,ram:16,vram:2},
 {n:"1997 Pentium II 266",y:1997,cls:6,mhz:266,ram:64,vram:8},{n:"1998 Pentium II 400",y:1998,cls:6,mhz:400,ram:128,vram:16},{n:"1999 Pentium III 600",y:1999,cls:7,mhz:600,ram:128,vram:32},{n:"2000 Pentium III 1 GHz",y:2000,cls:7,mhz:1000,ram:256,vram:32}];
var GXCLS={1:"8088/8086",2:"80286",3:"80386",4:"80486",5:"Pentium class",6:"Pentium II class",7:"Pentium III / Athlon",8:"Pentium 4 or later"};
var GXS={q:"",p:"",f:"pc",g:"",dec:"",y:"",req:0,multi:0,sort:"date",rig:null,sub:"list"};
function gxok(){return typeof GX!=="undefined"}
function gxFam(p){return GXFAM[p]||"oth"}
function gxMo(d){var p=String(d).split("-");return(+p[0])*12+(p[1]?+p[1]-1:0)}
function gxFmt(d){return fmtDate(d)}
function gxDelay(d0,d){var m=gxMo(d)-gxMo(d0);if(m<0)return"before";if(m===0)return"same time";if(m<12)return"+"+m+" mo";var y=Math.floor(m/12),r=m%12;return"+"+y+" yr"+(r?" "+r+" mo":"")}
var GXRANK={pc:0,micro:1,con:2,hand:3,arc:4,oth:5};
function gxPlats(x){var s={},o=[];x.r.forEach(function(r){if(!s[r[0]]){s[r[0]]=1;o.push(r[0])}});return o.map(function(p,i){return[p,i]}).sort(function(a,b){return GXRANK[gxFam(a[0])]-GXRANK[gxFam(b[0])]||a[1]-b[1]}).map(function(a){return a[0]})}
// First PC release (DOS, Windows, Mac, Linux, PC-98, FM Towns); PC is what this site cares about most.
function gxPc(x){for(var i=0;i<x.r.length;i++)if(gxFam(x.r[i][0])==="pc")return x.r[i];return null}
function gxDebut(x){return gxPc(x)||x.r[0]}
function gxChip(p,btn){var f=gxFam(p);return'<'+(btn?'button type="button" data-gxp="'+esc(p)+'"':'span')+' class="pf pf-'+f+'" title="'+esc(GXFAMN[f])+'">'+(typeof pxPlat==="function"?pxPlat(p,11):"")+esc(p)+'</'+(btn?'button':'span')+'>'}
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
function gxPanel(title){if(!gxok())return"";var x=GX[title];if(!x)return"";var pl=gxPlats(x),first=gxDebut(x),pcd=gxPc(x),h='<div class="gx"><p class="gxchips">'+(x.g?'<span class="pf pf-g">'+pxGenre(x.g,11)+esc(x.g)+'</span> ':"")+pl.map(function(p){return gxChip(p,true)}).join(" ")+'</p>';
 var rs=x.r.map(function(r,i){return[r,i]}).sort(function(a,b){return(gxFam(a[0][0])==="pc"?0:1)-(gxFam(b[0][0])==="pc"?0:1)||a[1]-b[1]}).map(function(a){return a[0]});
 h+='<table class="gxt"><caption>Release date by system'+(pcd?' (PC first)':'')+'</caption><thead><tr><th>System</th><th>Region</th><th>Released</th><th>'+(pcd?'Versus PC debut':'After the first')+'</th></tr></thead><tbody>'
  +rs.map(function(r,i){var pcr=gxFam(r[0])==="pc";return'<tr class="'+(r===first?'gx1 ':'')+(pcr?'gxpc':'')+'"><td>'+gxChip(r[0])+'</td><td><abbr title="'+esc(GXREG[r[2]]||r[2])+'">'+esc(r[2])+'</abbr></td><td>'+esc(gxFmt(r[1]))+'</td><td>'+(r===first?(pcd?"PC debut":"first"):esc(gxDelay(first[1],r[1])))+'</td></tr>'}).join("")+'</tbody></table>';
 var row=null;for(var i=0;i<TL.length;i++)if(TL[i][2]===title){row=TL[i];break}
 var ev=x.r[0];if(row&&String(row[0]).slice(0,4)!==String(ev[1]).slice(0,4)&&String(row[0]).slice(0,4)!==String(first[1]).slice(0,4))h+='<p class="tn">The date on this entry ('+esc(fmtDate(row[0]))+') differs from the dates listed here. Sources disagree, or the entry follows a different release.</p>';
 else h+='<p class="tn">'+(pcd&&ev!==pcd?'First release anywhere: '+esc(ev[0])+', '+esc(gxFmt(ev[1]))+'. ':'')+'Dates are as listed by region and are not all verified.</p>';
 var pc=pl.some(function(p){return gxFam(p)==="pc"||gxFam(p)==="micro"});
 if(x.n){h+='<h4 class="gxh">System requirements</h4>'+gxReqTable(x);
  var f1=gxFirstRig(x.n),f2=x.m?gxFirstRig(x.m):null,t=[];
  if(f1)t.push("Earliest rig in the Rig checker that meets the minimum: <b>"+esc(f1.n)+"</b>");if(f2)t.push("meets the recommended: <b>"+esc(f2.n)+"</b>");
  if(t.length)h+='<p>'+t.join("; ")+'. <button class="btn" type="button" data-gxrig="'+esc(title)+'">Open the Rig checker</button></p>';
  h+='<p class="tn">Requirements source: '+(x.u&&typeof safeUrl==="function"&&safeUrl(x.u)?'<a href="'+esc(safeUrl(x.u))+'" target="_blank" rel="noopener noreferrer">'+esc(gxSrc(x))+'</a>':esc(gxSrc(x)))+'.</p>'}
 else if(pc)h+='<p class="tn">No system requirements on file for this one yet.</p>';
 else h+='<p class="tn">No PC release on file; consoles, handhelds and arcades ran on fixed hardware, so there are no requirements to list.</p>';
 h+=gxPeriphFor(title);var same=gxSimilar(title,x);if(same.length)h+='<p class="tle-rel"><b>More '+esc((x.g||"games").toLowerCase())+':</b> '+same.map(function(t){return'<a href="#/timeline" data-go="'+esc(t)+'">'+esc(t)+'</a>'}).join(" ")+'</p>';
 return h+'</div>'}
function gxSimilar(title,x){if(!x.g)return[];var out=[];Object.keys(GX).forEach(function(t){if(t!==title&&GX[t].g===x.g)out.push([t,Math.abs(gxMo(GX[t].r[0][1])-gxMo(x.r[0][1]))])});return out.sort(function(a,b){return a[1]-b[1]}).slice(0,4).map(function(a){return a[0]})}
// One-line hint for the header of a collapsed timeline card.
function gxHint(title){if(!gxok())return"";var x=GX[title];if(!x)return"";var pl=gxPlats(x);if(!pl.length)return"";return' <small class="gxhint" title="'+esc(pl.join(", "))+'">'+esc(pl[0])+(pl.length>1?" +"+(pl.length-1):"")+'</small>'}
// Museum crossover: games for the platform an item belongs to, around its year.
var GXITEMMAP=[[/commodore 64|c64/i,"Commodore 64"],[/amiga/i,"Amiga"],[/atari st/i,"Atari ST"],[/apple ii|apple \]\[/i,"Apple II"],[/macintosh|\bmac\b|powerbook|imac/i,"Mac"],[/spectrum/i,"ZX Spectrum"],[/trs-80/i,"TRS-80"],[/nintendo 64|\bn64\b/i,"N64"],[/super nintendo|\bsnes\b|super famicom/i,"SNES"],[/\bnes\b|famicom/i,"NES"],[/genesis|mega drive/i,"Genesis"],[/dreamcast/i,"Dreamcast"],[/saturn/i,"Saturn"],[/playstation 2|\bps2\b/i,"PS2"],[/playstation|\bpsx\b/i,"PlayStation"],[/game boy advance/i,"Game Boy Advance"],[/game boy/i,"Game Boy"],[/xbox 360/i,"Xbox 360"],[/xbox/i,"Xbox"],[/gamecube/i,"GameCube"],[/atari 2600/i,"Atari 2600"],[/windows 9|windows|\bpc\b|ibm|toshiba|thinkpad|libretto|compaq|dell/i,"Windows"]];
function gxPlatOfItem(it){var s=it.name+" "+(it.maker||"")+" "+(it.model||"");for(var i=0;i<GXITEMMAP.length;i++)if(GXITEMMAP[i][0].test(s)){var p=GXITEMMAP[i][1];if(p==="Windows"&&it.year&&it.year<1995)return"DOS";return p}return""}
function gxItemSec(it){if(!gxok())return"";var h="",r=typeof tlMatch==="function"?tlMatch(it):null;
 if(r&&GX[r[2]])h+='<section class="wsec"><h2>Release dates and requirements</h2>'+gxPanel(r[2])+'</section>';
 return h}
// ---- Games tab ----
function gxList(){var out=[];Object.keys(GX).forEach(function(t){var x=GX[t],row=null;for(var i=0;i<TL.length;i++)if(TL[i][2]===t){row=TL[i];break}out.push({t:t,x:x,row:row,first:gxDebut(x),pc:!!gxPc(x),pl:gxPlats(x),delay:gxMaxDelay(x)})});return out}
function gxFilter(L){var q=GXS.q.trim().toLowerCase();return L.filter(function(g){
 if(q&&(g.t+" "+(g.x.g||"")+" "+g.pl.join(" ")).toLowerCase().indexOf(q)<0)return false;
 if(GXS.p&&g.pl.indexOf(GXS.p)<0)return false;if(GXS.f&&!g.pl.some(function(p){return gxFam(p)===GXS.f}))return false;if(GXS.g&&g.x.g!==GXS.g)return false;
 var y=+g.first[1].slice(0,4);if(GXS.dec&&Math.floor(y/10)*10!==+GXS.dec)return false;if(GXS.y&&y!==+GXS.y)return false;
 if(GXS.req&&!g.x.n)return false;if(GXS.multi&&g.pl.length<3)return false;return true})}
function gxSort(L){var s=GXS.sort,c={date:function(a,b){return a.first[1]<b.first[1]?-1:a.first[1]>b.first[1]?1:0},title:function(a,b){return a.t<b.t?-1:1},most:function(a,b){return b.pl.length-a.pl.length},wait:function(a,b){return b.delay-a.delay},ram:function(a,b){return(a.x.n&&a.x.n.ramMB!=null?a.x.n.ramMB:1e9)-(b.x.n&&b.x.n.ramMB!=null?b.x.n.ramMB:1e9)}};return L.slice().sort(c[s]||c.date)}
function gxHeat(L,fam){var P={},ys={};L.forEach(function(g){g.x.r.forEach(function(r){if(fam&&gxFam(r[0])!==fam)return;var y=+r[1].slice(0,4);P[r[0]]=P[r[0]]||{};P[r[0]][y]=(P[r[0]][y]||0)+1;ys[y]=1})});
 var plats=Object.keys(P).sort(function(a,b){var fa=["pc","micro","con","hand","arc","oth"].indexOf(gxFam(a)),fb=["pc","micro","con","hand","arc","oth"].indexOf(gxFam(b));if(fa!==fb)return fa-fb;var ta=0,tb=0;for(var k in P[a])ta+=P[a][k];for(var k2 in P[b])tb+=P[b][k2];return tb-ta});
 if(!plats.length)return"";var y0=1976,y1=2026,W=900,Lm=118,cw=(W-Lm-8)/(y1-y0+1),rh=15,H=plats.length*rh+26,mx=0;plats.forEach(function(p){for(var k in P[p])mx=Math.max(mx,P[p][k])});
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
 var h='<div class="tlsnap"><h3>Games by system</h3><p class="tn">'+all.length+' games with a release date for each system they came out on. The list starts with PC games, showing the PC debut of each; switch Kind of system to see consoles, handhelds and arcades too. Open a game to see every system and how long each port took. Brighter squares mean more releases. Click a system or a square to filter.</p>'
  +'<div class="gxsub"><button class="btn'+(GXS.sub==="list"?" pri":"")+'" type="button" data-gxsub="list">Browse games</button> <button class="btn'+(GXS.sub==="rig"?" pri":"")+'" type="button" data-gxsub="rig">Rig checker</button></div></div>';
 if(GXS.sub==="rig")return h+gxRigView(all);
 h+='<div class="tlsnap">'+gxHeat(all,GXS.f)+'</div><div class="tlsnap"><div class="gxfilters"><input id="gxq" type="search" placeholder="Search games, genres, systems" aria-label="Search games" value="'+esc(GXS.q)+'">'
  +'<select id="gxp" aria-label="System">'+opt("","Any system",!GXS.p)+Object.keys(plats).sort().map(function(p){return opt(p,p+" ("+plats[p]+")",GXS.p===p)}).join("")+'</select>'
  +'<select id="gxf" aria-label="Kind of system">'+opt("","Any kind (consoles too)",!GXS.f)+Object.keys(GXFAMN).map(function(k){return opt(k,GXFAMN[k]+(k==="pc"?" (default)":""),GXS.f===k)}).join("")+'</select>'
  +'<select id="gxg" aria-label="Genre">'+opt("","Any genre",!GXS.g)+Object.keys(gens).sort().map(function(k){return opt(k,k+" ("+gens[k]+")",GXS.g===k)}).join("")+'</select>'
  +'<select id="gxd" aria-label="Decade">'+opt("","Any decade",!GXS.dec)+Object.keys(decs).sort().map(function(k){return opt(k,k+"s",GXS.dec===k)}).join("")+'</select>'
  +'<select id="gxs" aria-label="Sort">'+[["date","Oldest first"],["title","Title"],["most","Most systems"],["wait","Longest port wait"],["ram","Lowest RAM needed"]].map(function(a){return opt(a[0],"Sort: "+a[1],GXS.sort===a[0])}).join("")+'</select></div>'
  +'<p class="tlflt"><label><input type="checkbox" id="gxr"'+(GXS.req?" checked":"")+'> Has requirements</label> <label><input type="checkbox" id="gxm"'+(GXS.multi?" checked":"")+'> On 3+ systems</label> '+(GXS.p||GXS.y||GXS.f!=="pc"||GXS.g||GXS.dec||GXS.q||GXS.req||GXS.multi?'<button class="btn" type="button" id="gxclr">Clear filters</button>':"")+'</p>'
  +'<p class="tn"><b>'+L.length+'</b> of '+all.length+' games'+(GXS.y?" first released in "+GXS.y:"")+(L.length>150?" (showing 150)":"")+'.</p>'
  +'<div class="gxwrap"><table class="gxt gxlist"><thead><tr><th>Debut</th><th>Game</th><th>Systems</th><th>Genre</th><th>Needs</th></tr></thead><tbody>'
  +S.slice(0,150).map(function(g){var n=g.x.n,need=n?(n.cpu?n.cpu.replace(/^Intel\s+/,""):"")+(n.ramMB!=null?(n.cpu?", ":"")+gxRam(n.ramMB):""):"";
   return'<tr><td>'+esc(gxFmt(g.first[1]))+'<br><small>'+gxChip(g.first[0])+'</small></td><td>'+pxGenre(g.x.g,14)+'<a href="#/timeline" data-go="'+esc(g.t)+'">'+esc(g.t)+'</a></td><td>'+g.pl.slice(0,6).map(function(p){return gxChip(p,true)}).join(" ")+(g.pl.length>6?' <small>+'+(g.pl.length-6)+' more</small>':"")+'</td><td>'+esc(g.x.g||"")+'</td><td>'+(need?esc(need):'<small class="tn">-</small>')+'</td></tr>'}).join("")+'</tbody></table></div></div>'
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

function gxRunPlats(it){var p=gxPlatOfItem(it);if(!p&&/laptop|desktop|computer|sound|keyboard|midi|card|monitor|mouse|modem|drive|joystick|printer|scanner|pc/i.test((it.cat||"")+" "+(it.type||"")))p=(it.year&&it.year<1995)?"DOS":"Windows";
 if(!p)return[];return p==="DOS"||p==="Windows"?["DOS","Windows"]:[p]}
function gxEra(it){if(!gxok()||!it.year)return"";var plats=gxRunPlats(it);if(!plats.length)return"";var a=gxMo(it.rel||String(it.year)),rig=gxParseItemRig(it),L=[],YO=[];
 if(rig)rig.vram=999;
 Object.keys(GX).forEach(function(t){var x=GX[t],best=null;x.r.forEach(function(q){if(plats.indexOf(q[0])>=0&&(!best||q[1]<best[1]))best=q});if(!best)return;var bd=best[1];if(bd.length===4){var tr=null;for(var z=0;z<TL.length;z++)if(TL[z][2]===t){tr=TL[z];break}if(tr&&String(tr[0]).length>=7&&tr[0].slice(0,4)===bd)bd=tr[0];else{if(+bd*12<=a+24&&+bd*12+11>=a-6)YO.push([t,best[0],bd]);return}}best=[best[0],bd,best[2]];var m=gxMo(bd);if(m<a-6||m>a+24)return;
  var fit="";if(rig&&x.n){var u=gxMeets(rig,x.n);if(u.ok===true){var w=x.m?gxMeets(rig,x.m):null;fit=w&&w.ok?"well":"ok"}else if(u.ok===false)fit="no:"+u.miss.join("; ")}
  var oth=gxPlats(x).filter(function(p){return p!==best[0]&&plats.indexOf(p)<0}).slice(0,4);L.push({t:t,x:x,d:best[1],p:best[0],m:m,fit:fit,oth:oth,days:m-a})});
 var P=[];TL.forEach(function(r){if(r[1]!=="pe")return;var m=gxMo(r[0]);if(m<a-6||m>a+24)return;var e=typeof TLX!=="undefined"?TLX[r[2]]:null,pl=e&&e.plat;if(pl&&!pl.some(function(q){return plats.indexOf(q)>=0}))return;P.push({r:r,e:e,m:m})});
 if(!L.length&&!P.length)return"";L.sort(function(p,q){return p.d<q.d?-1:p.d>q.d?1:0});P.sort(function(p,q){return p.m-q.m});
 var rel=function(m){return Math.abs(m)<=1?"launch window":m<0?(-m)+" mo before":m+" mo after"};
 var FAMC={pc:"#0a1fb4",micro:"#8a4b00",con:"#a01020",hand:"#067a2c",arc:"#6b2a9c",mob:"#00697f",oth:"#444"};
 var FITL={well:["Runs like a dream","ok"],ok:["Squeaks by","ok"],no:["Needs more iron","no"],"?":["",""]};
 var fitOf=function(f){return f==="well"?"well":f==="ok"?"ok":f?"no":"?"};
 var fitB=function(f){var k=fitOf(f);if(k==="?"||!rig)return"";return'<span class="gxfit '+FITL[k][1]+'"'+(k==="no"?' title="'+esc(String(f).slice(3))+'"':'')+'>'+FITL[k][0]+'</span>'};
 var gi=function(g){return typeof pxGenre==="function"?pxGenre(g.x.g,22):""};
 var card=function(g){return'<a class="gxcard" href="#/timeline" data-tl="'+esc(g.t)+'" data-fit="'+fitOf(g.fit)+'" style="--fc:'+(FAMC[gxFam(g.p)]||"#444")+'"><span class="gxci">'+gi(g)+'</span><span class="gxct"><b>'+esc(g.t)+'</b><small>'+(g.x.g?esc(g.x.g)+" &middot; ":"")+esc(gxFmt(g.d))+" &middot; "+esc(rel(g.days))+'</small><span class="gxcs">'+gxChip(g.p)+(g.oth.length?'<small class="tn">also '+g.oth.map(esc).join(", ")+'</small>':"")+fitB(g.fit)+'</span></span></a>'};
 var core=L.filter(function(g){return Math.abs(g.days)<=1}),before=L.filter(function(g){return g.days<-1}),after=L.filter(function(g){return g.days>1});
 var nf=rig?L.filter(function(g){return fitOf(g.fit)==="well"||fitOf(g.fit)==="ok"}).length:0;
 var h='<div class="gxera" data-n="'+L.length+'"><h3 class="sub">'+(typeof px==="function"?px("joystick",18)+" ":"")+'Press START: what was everyone playing?</h3><p class="tn">'+L.length+' game'+(L.length===1?"":"s")+' out for '+esc(plats.join(" or "))+' from six months before to two years after this item ('+esc(gxFmt(it.rel||String(it.year)))+').'+(rig?' <b>'+nf+'</b> of them should run on this exact machine.':'')+' Every game shows which system its date is for.</p>';
 if(L.length){
  h+='<div class="gxstrip" role="group" aria-label="Release timeline around the launch"><span class="gxpin" style="left:'+(6/30*100)+'%" title="This item"><i>&#9650;</i> this item</span>'+L.slice(0,60).map(function(g,i){return'<a class="gxdot" href="#/timeline" data-tl="'+esc(g.t)+'" style="left:'+((g.m-(a-6))/30*100).toFixed(1)+'%;top:'+(8+(i%4)*14)+'px;background:'+(FAMC[gxFam(g.p)]||"#444")+'" title="'+esc(g.t)+" ("+esc(g.p)+", "+esc(gxFmt(g.d))+')"><span class="sr">'+esc(g.t)+'</span></a>'}).join("")+'<span class="gxtk" style="left:0">-6 mo</span><span class="gxtk" style="left:20%">launch</span><span class="gxtk" style="left:60%">+1 yr</span><span class="gxtk" style="right:0">+2 yr</span></div>';
  h+='<p class="gxbtns"><button type="button" class="btn gxpickb">&#127922; Pick a game for me</button>'+(rig?' <label class="gxlab"><input type="checkbox" class="gxonly"> Only games this machine can run</label>':'')+'</p><div class="gxpick" aria-live="polite" hidden></div>';
  var sec=function(t,ic,arr,open){return arr.length?'<details class="gxsec"'+(open?" open":"")+'><summary>'+(typeof px==="function"?px(ic,16)+" ":"")+t+' <span class="gxn">'+arr.length+'</span></summary><div class="gxcards">'+arr.slice(0,24).map(card).join("")+'</div>'+(arr.length>24?'<p class="tn">+'+(arr.length-24)+' more in the timeline.</p>':"")+'</details>':""};
  h+=sec("Launch-week crew","star",core,true)+sec("Already on the shelf","floppy",before,!core.length)+sec("Coming up next","rocket",after,!core.length&&!before.length);
  window.__gxEraL=window.__gxEraL||{};window.__gxEraL[it.id||it.name]=L.map(function(g){return[g.t,g.p,g.d,g.x.g||"",fitOf(g.fit)]});h=h.replace('class="gxera"','class="gxera" data-k="'+esc(it.id||it.name)+'"')}
 if(YO.length)h+='<p class="tle-rel"><b>Dated only to the year:</b> '+YO.slice(0,24).map(function(q){return'<a href="#/timeline" data-tl="'+esc(q[0])+'">'+esc(q[0])+'</a> <small>'+esc(q[2])+'</small>'}).join(" ")+(YO.length>24?' <small class="tn">+'+(YO.length-24)+' more</small>':"")+'</p>';
 if(P.length){var byc={};P.forEach(function(p){var c=(p.e&&p.e.sub)||"Accessories";(byc[c]=byc[c]||[]).push(p)});
  h+='<h3 class="sub">'+(typeof px==="function"?px("gamepad",18)+" ":"")+'Accessory loot from the same window</h3><div class="gxloot">'+Object.keys(byc).sort().map(function(c){return'<div class="gxlc"><b>'+(typeof pxRow==="function"?"":"")+esc(c)+'</b>'+byc[c].slice(0,6).map(function(p){return'<a href="#/timeline" data-tl="'+esc(p.r[2])+'">'+esc(p.r[2])+' <small>'+esc(p.r[0].slice(0,4))+(p.r[3]?", "+esc(p.r[3].replace(/ \(.*$/,"")):"")+'</small></a>'}).join("")+'</div>'}).join("")+'</div>'}
 return h+'</div>'}
var GXQUIP={"Adventure":["Grab a snack, you are going to be here a while.","Save often. Think harder. Talk to everybody."],"Shooter":["Turn the lights off and the volume up.","Strafe first. Questions later."],"Strategy":["One more turn. It is already 3 a.m.","Plan the conquest. Then ruin the plan."],"Role":["Stat sheets at the ready.","Your party is waiting."],"Simulation":["Slow, glorious, and surprisingly absorbing.","Press play and stop trusting the clock."],"Puzzle":["Easy to learn. Hard to put down.","Think sideways."],"Racing":["Pedal down.","Mind the corners and the frame rate."],"Sports":["Instant replay not included.","Pick a team and trash talk."],"Platform":["Run, jump, repeat.","Precision timing required."],"Flight":["Chocks away.","Joystick strongly recommended."]};
function gxQuip(g){var k=Object.keys(GXQUIP).filter(function(x){return new RegExp(x,"i").test(g||"")})[0],l=k?GXQUIP[k]:["A solid pairing for the era.","Your next favorite, maybe.","Period-correct fun."];return l[Math.floor(Math.random()*l.length)]}
document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".gxpickb");if(!b)return;var w=b.closest(".gxera"),L=(window.__gxEraL||{})[w.getAttribute("data-k")]||[],only=w.classList.contains("onlyfit"),pool=L.filter(function(g){return!only||g[4]==="well"||g[4]==="ok"});if(!pool.length)pool=L;var g=pool[Math.floor(Math.random()*pool.length)],o=w.querySelector(".gxpick");if(!g||!o)return;o.hidden=false;o.innerHTML='<b>Tonight\'s pairing</b><a href="#/timeline" data-tl="'+esc(g[0])+'">'+esc(g[0])+'</a><span>'+esc(g[1])+", "+esc(gxFmt(g[2]))+(g[3]?" &middot; "+esc(g[3]):"")+'</span><i>'+esc(gxQuip(g[3]))+'</i>'});
document.addEventListener("change",function(e){var c=e.target;if(c&&c.classList&&c.classList.contains("gxonly")){var w=c.closest(".gxera");if(w)w.classList.toggle("onlyfit",c.checked)}});
// Peripherals that worked with a game (from links either way)
function gxPeriphFor(title){var out={},L=typeof TLX!=="undefined"?TLX:{};Object.keys(L).forEach(function(t){var e=L[t];if(e.type!=="Peripheral")return;(e.links||[]).forEach(function(l){if(l[0]===title)out[t]=l[1]})});
 var me=L[title];if(me&&me.links)me.links.forEach(function(l){var e=L[l[0]];if(e&&e.type==="Peripheral")out[l[0]]=out[l[0]]||l[1]});
 var k=Object.keys(out);return k.length?'<p class="tle-rel"><b>Peripherals that went with it:</b> '+k.slice(0,10).map(function(t){return'<a href="#/timeline" data-go="'+esc(t)+'">'+esc(t)+'</a> <small>'+esc(out[t])+'</small>'}).join(" ")+'</p>':""}
// ---- Peripherals tab ----
var GXP={q:"",cat:"",plat:"",dec:"",price:0,sort:"date"};
function gxPerList(){var out=[];TL.forEach(function(r){if(r[1]!=="pe")return;var e=typeof TLX!=="undefined"?TLX[r[2]]||{}:{};out.push({r:r,e:e})});return out}
function gxPerView(){var all=gxPerList(),cats={},plats={},decs={};all.forEach(function(p){var c=p.e.sub||"Other";cats[c]=(cats[c]||0)+1;(p.e.plat||[]).forEach(function(q){plats[q]=(plats[q]||0)+1});decs[Math.floor(+p.r[0].slice(0,4)/10)*10]=1});
 var q=GXP.q.trim().toLowerCase(),L=all.filter(function(p){var c=p.e.sub||"Other";if(GXP.cat&&c!==GXP.cat)return false;if(GXP.plat&&(p.e.plat||[]).indexOf(GXP.plat)<0)return false;if(GXP.dec&&Math.floor(+p.r[0].slice(0,4)/10)*10!==+GXP.dec)return false;if(GXP.price&&!p.r[3])return false;
  if(q&&(p.r[2]+" "+(p.e.maker||"")+" "+c+" "+(p.e.detail||"")+" "+(p.r[4]||"")).toLowerCase().indexOf(q)<0)return false;return true});
 if(GXP.sort==="title")L.sort(function(a,b){return a.r[2]<b.r[2]?-1:1});
 var opt=function(v,t,sel){return'<option value="'+esc(v)+'"'+(sel?" selected":"")+'>'+esc(t)+'</option>'};
 return'<div class="tlsnap"><h3>Peripherals</h3><p class="tn">'+all.length+' mice, keyboards, controllers, sound cards, graphics cards, drives, modems and other add-ons, with the systems each one worked with. Open one to see what it was paired with.</p>'
 +'<div class="gxfilters"><input id="gpq" type="search" placeholder="Search peripherals" aria-label="Search peripherals" value="'+esc(GXP.q)+'">'
 +'<select id="gpc" aria-label="Category">'+opt("","Any category",!GXP.cat)+Object.keys(cats).sort().map(function(k){return opt(k,k+" ("+cats[k]+")",GXP.cat===k)}).join("")+'</select>'
 +'<select id="gpp" aria-label="Works with">'+opt("","Works with anything",!GXP.plat)+Object.keys(plats).sort().map(function(k){return opt(k,k+" ("+plats[k]+")",GXP.plat===k)}).join("")+'</select>'
 +'<select id="gpd" aria-label="Decade">'+opt("","Any decade",!GXP.dec)+Object.keys(decs).sort().map(function(k){return opt(k,k+"s",GXP.dec===k)}).join("")+'</select>'
 +'<select id="gps" aria-label="Sort">'+opt("date","Sort: oldest first",GXP.sort==="date")+opt("title","Sort: title",GXP.sort==="title")+'</select></div>'
 +'<p class="tlflt"><label><input type="checkbox" id="gpr"'+(GXP.price?" checked":"")+'> Has a price</label></p><p class="tn"><b>'+L.length+'</b> of '+all.length+(L.length>200?" (showing 200)":"")+'.</p>'
 +'<div class="gxwrap"><table class="gxt gxlist"><thead><tr><th>Released</th><th>Peripheral</th><th>Kind</th><th>Connects by</th><th>Price</th><th>Works with</th></tr></thead><tbody>'
 +L.slice(0,200).map(function(p){var pl=p.e.plat||[],sp=p.e.specs||{};return'<tr><td>'+esc(gxFmt(p.r[0]))+(p.r[5]?'':'*')+'</td><td>'+pxRow(p.r,16)+'<a href="#/timeline" data-go="'+esc(p.r[2])+'">'+esc(p.r[2])+'</a></td><td>'+esc(p.e.sub||"")+'</td><td>'+esc(sp.Connection||"")+'</td><td>'+esc((p.r[3]||"").replace(/ \(.*$/,""))+'</td><td>'+pl.slice(0,5).map(function(x){return gxChip(x)}).join(" ")+(pl.length>5?' <small>+'+(pl.length-5)+'</small>':"")+'</td></tr>'}).join("")+'</tbody></table></div></div>'}
function gxWire(main,redraw,jump){
 main.addEventListener("input",function(e){if(e.target.id==="gxq"){GXS.q=e.target.value;redraw(true,"gxq")}else if(e.target.id==="gpq"){GXP.q=e.target.value;redraw(true,"gpq")}});
 main.addEventListener("change",function(e){var t=e.target,id=t.id;if(id==="gxp")GXS.p=t.value;else if(id==="gxf")GXS.f=t.value;else if(id==="gxg")GXS.g=t.value;else if(id==="gxd"){GXS.dec=t.value;GXS.y=""}else if(id==="gxs")GXS.sort=t.value;else if(id==="gxr")GXS.req=t.checked?1:0;else if(id==="gxm")GXS.multi=t.checked?1:0;
  else if(id==="gpc")GXP.cat=t.value;else if(id==="gpp")GXP.plat=t.value;else if(id==="gpd")GXP.dec=t.value;else if(id==="gps")GXP.sort=t.value;else if(id==="gpr")GXP.price=t.checked?1:0;else if(id==="gxrp"){var v=t.value;GXS.rig=v[0]==="p"?GXRIGS[+v.slice(1)]:(window.__gxmus||[])[+v.slice(1)]}else return;redraw()});
 main.addEventListener("click",function(e){var s=e.target.closest("[data-gxsub]");if(s){GXS.sub=s.dataset.gxsub;redraw();return}
  var c=e.target.closest("[data-gxp]");if(c&&e.target.closest(".gxheat,.gxlist,.gxt")){GXS.sub="list";GXS.p=c.dataset.gxp;GXS.y=c.dataset.gxy||"";GXS.dec="";redraw();return}
  if(e.target.id==="gxclr"){GXS={q:"",p:"",f:"pc",g:"",dec:"",y:"",req:0,multi:0,sort:"date",rig:GXS.rig,sub:"list"};redraw()}});}
