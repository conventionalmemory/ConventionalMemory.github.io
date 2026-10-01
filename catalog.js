/* Interactive catalog (#/catalog): filter chips, score slider, four ways to look at the collection. */
var CATST={q:"",cats:{},dec:"",min:0,sort:"",view:"cards",status:""};
function catalog(){
 var S=CATST,cats={},decs={},sts={};
 ITEMS.forEach(function(i){cats[i.cat]=(cats[i.cat]||0)+1;var d=i.year?Math.floor(i.year/10)*10:0;if(d)decs[d]=(decs[d]||0)+1;if(i.status)sts[i.status]=(sts[i.status]||0)+1});
 var scored=ITEMS.filter(function(i){return i.score!=null}),avg=scored.length?scored.reduce(function(a,i){return a+i.score},0)/scored.length:null;
 var VIEWS=[["cards","Cards"],["shelf","Shelf"],["years","Time machine"],["next","Next up"],["dir","DIR"]];
 app.innerHTML='<section class="catw"><h2>Catalog</h2>'
  +'<div class="cstat"><div><b>'+ITEMS.length+'</b>exhibits</div><div><b>'+Object.keys(cats).length+'</b>categories</div><div><b>'+(avg==null?"--":outOf10(avg))+'</b>average out of 10</div><div><b>'+ITEMS.reduce(function(a,i){return a+(i.qty||1)},0)+'</b>pieces on the shelves</div></div>'
  +tagChips()
  +'<div class="tools"><input id="q" type="search" placeholder="Search names, makers, years, specs (press / to jump here)" aria-label="Search" value="'+esc(S.q)+'"><select id="s" aria-label="Sort"><option value="">Catalog order</option><option value="score">Highest score</option><option value="old">Oldest first</option><option value="new">Newest first</option><option value="name">Name A to Z</option></select><button class="btn" id="sur" type="button">Surprise me</button></div>'
  +'<div class="cchips" id="cc" role="group" aria-label="Categories">'+Object.keys(cats).map(function(c){return'<button type="button" class="chip" data-c="'+esc(c)+'" aria-pressed="false">'+(typeof pxCat==="function"?pxCat(c,14):"")+esc(c)+' <b>'+cats[c]+'</b></button>'}).join("")+'</div>'
  +'<div class="cchips" id="cd" role="group" aria-label="Decades">'+Object.keys(decs).sort().map(function(d){return'<button type="button" class="chip dec" data-d="'+d+'" aria-pressed="false">'+d+'s <b>'+decs[d]+'</b></button>'}).join("")+Object.keys(sts).map(function(t){return'<button type="button" class="chip st" data-t="'+esc(t)+'" aria-pressed="false">'+esc(t)+' <b>'+sts[t]+'</b></button>'}).join("")+'</div>'
  +'<div class="crow"><label class="cmin">Minimum score: <b id="mv">0</b>K <input id="mn" type="range" min="0" max="600" step="50" value="'+S.min+'" aria-label="Minimum score"></label><span class="cviews" role="group" aria-label="View">'+VIEWS.map(function(v){return'<button type="button" class="btn" data-v="'+v[0]+'" aria-pressed="false">'+v[1]+'</button>'}).join("")+'</span></div>'
  +'<p id="cn" class="tn" role="status"></p><div id="g"></div></section>';
 var q=document.getElementById("q"),so=document.getElementById("s"),g=document.getElementById("g"),mn=document.getElementById("mn");so.value=S.sort;
 function match(i){var t=(i.name+" "+i.maker+" "+i.year+" "+i.cat+" "+(i.acc||"")+" "+(i.tags||[]).join(" ")+" "+(i.text||"")+" "+Object.keys(i.specs||{}).map(function(k){return i.specs[k]}).join(" ")).toLowerCase();var okc=Object.keys(S.cats).filter(function(k){return S.cats[k]});
  return t.indexOf(S.q.toLowerCase())>=0&&(!okc.length||okc.indexOf(i.cat)>=0)&&(!S.dec||(i.year&&Math.floor(i.year/10)*10===+S.dec))&&(!S.status||i.status===S.status)&&(S.min<=0||(i.score!=null&&i.score>=S.min))}
 function shelf(l){var h='<p class="tn">Every spine is an exhibit. Taller means a higher score. Hover or tab to a spine to pull it off the shelf.</p><div class="shelf">'+l.map(function(i,n){var sc=i.score==null?200:i.score,ht=110+sc/640*130,c=i.score!=null?tier(i.score).c:"#808080",w=38+((hstr?hstr(i.name):n)%3)*8;return'<a class="spine" href="#/item/'+esc(i.id)+'" style="height:'+ht.toFixed(0)+'px;width:'+w+'px;background:'+c+'" title="'+esc(i.name)+'"><span>'+esc(i.name.slice(0,30))+'</span><i class="spx">'+(typeof pxCat==="function"?pxCat(i.cat,16):"")+'</i><small>'+(i.year||"")+'</small><em>'+esc(i.name)+(i.score!=null?" - "+esc(tier(i.score).l):"")+'</em></a>'}).join("")+'</div>';return h}
 function years(l){var by={};l.forEach(function(i){var y=i.year||0;(by[y]=by[y]||[]).push(i)});return'<div class="tm">'+Object.keys(by).sort().map(function(y){return'<div class="tmy"><a class="tmh" href="#/timeline/'+y+'">'+(+y||"Undated")+'</a>'+by[y].map(function(i){return'<a class="tmi" href="#/item/'+esc(i.id)+'"><span class="tmd"></span>'+esc(i.name)+(i.score!=null?' <small>'+i.score+'K</small>':'')+'</a>'}).join("")+'</div>'}).join("")+'</div>'}
 function nextUp(){var seen={},rows=[];ITEMS.forEach(function(it){var r=typeof tlRowOfItem==="function"?tlRowOfItem(it):null;if(!r)return;tlLinks(r[2]).forEach(function(l){if(tlOwn(l[0])||seen[l[0]])return;var row=TL.filter(function(z){return z[2]===l[0]})[0];if(!row||!/^(hw|sw|gt|gn|gc)$/.test(row[1]))return;seen[l[0]]=1;rows.push({r:row,rel:l[1],from:it})})});
  rows.sort(function(a,b){return a.r[0]<b.r[0]?-1:1});
  return'<p class="tn">Timeline entries connected to the collection that are not in it yet: sequels, rivals, upgrades and the things that ran on what is here. Click one to read about it.</p>'+(rows.length?'<div class="nu">'+rows.map(function(x){return'<a class="nui" href="#/timeline" data-tl="'+esc(x.r[2])+'"><b>'+esc(x.r[2])+'</b><span>'+esc(String(x.r[0]).slice(0,4))+(x.r[3]?" &middot; "+esc(x.r[3].replace(/ \(.*$/,"")):"")+'</span><small>'+esc(x.rel)+' of '+esc(x.from.name)+'</small></a>'}).join("")+'</div>':'<div class="empty">Nothing connected yet.</div>')}
 function run(){var r=ITEMS.filter(match);
  if(S.sort==="score")r.sort(function(a,b){return(b.score||0)-(a.score||0)});else if(S.sort==="old")r.sort(function(a,b){return a.year-b.year});else if(S.sort==="new")r.sort(function(a,b){return b.year-a.year});else if(S.sort==="name")r.sort(function(a,b){return a.name.localeCompare(b.name)});
  document.getElementById("mv").textContent=S.min;
  document.querySelectorAll("[data-c]").forEach(function(b){var on=!!S.cats[b.dataset.c];b.classList.toggle("on",on);b.setAttribute("aria-pressed",on)});
  document.querySelectorAll("[data-d]").forEach(function(b){var on=S.dec===b.dataset.d;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on)});
  document.querySelectorAll("[data-t]").forEach(function(b){var on=S.status===b.dataset.t;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on)});
  document.querySelectorAll("[data-v]").forEach(function(b){var on=S.view===b.dataset.v;b.classList.toggle("pri",on);b.setAttribute("aria-pressed",on)});
  var filt=S.q||S.dec||S.status||S.min>0||Object.keys(S.cats).some(function(k){return S.cats[k]});
  document.getElementById("cn").innerHTML='Showing '+r.length+' of '+ITEMS.length+(filt?' <button class="btn" id="clr" type="button">Clear filters</button>':'');
  var cl=document.getElementById("clr");if(cl)cl.onclick=function(){S.q="";S.cats={};S.dec="";S.status="";S.min=0;q.value="";mn.value=0;run()};
  g.className=S.view==="cards"?"grid":"";
  g.innerHTML=!r.length?'<div class="empty">No items match. Clear a filter or two.</div>':S.view==="dir"?dir(r):S.view==="shelf"?shelf(r):S.view==="years"?years(r):S.view==="next"?nextUp():r.map(card).join("")}
 q.oninput=function(){S.q=q.value;run()};so.onchange=function(){S.sort=so.value;run()};mn.oninput=function(){S.min=+mn.value;run()};
 document.getElementById("cc").onclick=function(e){var b=e.target.closest("[data-c]");if(b){S.cats[b.dataset.c]=!S.cats[b.dataset.c];run()}};
 document.getElementById("cd").onclick=function(e){var b=e.target.closest("[data-d]");if(b){S.dec=S.dec===b.dataset.d?"":b.dataset.d;run();return}b=e.target.closest("[data-t]");if(b){S.status=S.status===b.dataset.t?"":b.dataset.t;run()}};
 document.querySelector(".cviews").onclick=function(e){var b=e.target.closest("[data-v]");if(b){S.view=b.dataset.v;run()}};
 document.getElementById("sur").onclick=function(){var l=ITEMS.filter(match);if(!l.length)l=ITEMS;location.hash="#/item/"+l[Math.floor(Math.random()*l.length)].id};
 g.addEventListener("click",function(e){var n=e.target.closest("[data-tl]");if(n){e.preventDefault();var r=TL.filter(function(z){return z[2]===n.dataset.tl})[0];if(r){window.TLJUMP=r[2];location.hash="#/timeline/"+String(r[0]).slice(0,4)}}});
 run()}
document.addEventListener("keydown",function(e){if(e.key==="/"&&!/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement||{}).tagName||"")&&location.hash.indexOf("#/catalog")===0){var q=document.getElementById("q");if(q){e.preventDefault();q.focus()}}});
