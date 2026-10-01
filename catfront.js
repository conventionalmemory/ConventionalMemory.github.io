/* Catalog front for the Pro style ("The Floor"). Shown when nothing is searched or filtered.
   MEM /C panel, department signs, exhibit of the day + mystery crate, scrollable aisles, other ways to browse.
   Exposes CMFront.html(items) and CMFront.wire(root, api). api = {dept(c), go(view), all(), tag?}. */
var CMFront=(function(){
 var PAL=["#0000aa","#aa0000","#00aa00","#aa5500","#aa00aa","#008888","#555599","#996600","#aa3377","#337744"];
 function col(c){return PAL[(typeof hstr==="function"?hstr(String(c)):0)%PAL.length]}
 function E(s){return esc(s==null?"":String(s))}
 function today(){var d=new Date();return d.getFullYear()*372+d.getMonth()*31+d.getDate()}
 function mini(it){var sc=it.score;return'<a class="mc" href="#/item/'+E(it.id)+'"><span class="mp">'+pic(it)+(typeof srcBadge==="function"?srcBadge(it):"")+'</span><b>'+E(it.name)+'</b><small>'+E((it.maker||"")+(it.year?(it.maker?" \u00b7 ":"")+it.year:""))+'</small>'+(sc!=null?'<span class="mb"><i style="width:'+(sc/640*100)+'%;background:'+tier(sc).c+'"></i></span>':'')+'</a>'}
 function mem(items,cats,names){
  var n=items.length,seg=names.map(function(c){return'<button type="button" class="ms" data-dept="'+E(c)+'" style="flex:'+Math.max(cats[c],n/14)+' 1 0;background:'+col(c)+'" aria-label="'+E(c)+', '+cats[c]+' exhibits" title="'+E(c)+' ('+cats[c]+')"><span>'+E(c)+'</span></button>'}).join("");
  var sc=items.filter(function(i){return i.score!=null}),avg=sc.length?sc.reduce(function(a,i){return a+i.score},0)/sc.length:null,pcs=items.reduce(function(a,i){return a+(i.qty||1)},0);
  return'<div class="memp"><div class="memh"><b>C:\\&gt; MEM /C</b><span>Memory resident in the museum</span></div><div class="memb" role="group" aria-label="Departments">'+seg+'</div>'
   +'<div class="memt"><span><b>'+n+'</b> exhibits</span><span><b>'+names.length+'</b> departments</span><span><b>'+pcs+'</b> pieces</span><span><b>'+(avg==null?"--":outOf10(avg))+'</b> avg /10</span><span class="memf">Largest free block: <b>640K</b></span></div></div>'}
 function dept(items,cats,names){
  return'<h3 class="fh">Pick a department</h3><div class="depts">'+names.map(function(c){var l=items.filter(function(i){return i.cat===c}),s=l.filter(function(i){return i.score!=null}),a=s.length?s.reduce(function(x,i){return x+i.score},0)/s.length:null;
   return'<button type="button" class="dept" data-dept="'+E(c)+'" style="--dc:'+col(c)+'"><i class="dr" aria-hidden="true"></i><span class="di">'+(typeof pxCat==="function"?pxCat(c,32):"")+'</span><b>'+E(c)+'</b><small>'+cats[c]+(cats[c]===1?" exhibit":" exhibits")+'</small>'+(a!=null?'<span class="mb"><i style="width:'+(a/640*100)+'%;background:'+tier(a).c+'"></i></span>':'')+'</button>'}).join("")+'</div>'}
 function spot(items){
  var pool=items.filter(function(i){return i.photos&&i.photos.length});if(!pool.length)pool=items;var it=pool[today()%pool.length];
  var t=String(it.text||"").replace(/\s+/g," ");if(t.length>230)t=t.slice(0,230).replace(/\s+\S*$/,"")+"\u2026";
  return'<div class="spot"><div class="sph"><span class="sbd">Exhibit of the day</span><a class="spp" href="#/item/'+E(it.id)+'">'+pic(it)+'</a></div><div class="spt"><h3><a href="#/item/'+E(it.id)+'">'+E(it.name)+'</a></h3><p class="tn">'+E((it.maker||"")+(it.year?(it.maker?" \u00b7 ":"")+it.year:"")+" \u00b7 "+it.cat)+'</p>'+(it.score!=null?'<p><span class="sc" style="background:'+tier(it.score).c+';color:'+inkOn(tier(it.score).c)+'">'+it.score+'K</span> '+E(tier(it.score).l)+'</p>':'')+(t?'<p>'+E(t)+'</p>':'')+'<a class="btn pri" href="#/item/'+E(it.id)+'">Open this exhibit</a></div></div>'}
 var CRATE='<svg viewBox="0 0 64 56" width="96" height="84" shape-rendering="crispEdges" aria-hidden="true"><g class="lid"><rect x="4" y="6" width="56" height="12" fill="#c8964a" stroke="#000" stroke-width="2"/><rect x="28" y="6" width="8" height="12" fill="#e8c070"/></g><rect x="6" y="18" width="52" height="34" fill="#a87432" stroke="#000" stroke-width="2"/><path d="M6 28h52M6 40h52" stroke="#6a4818" stroke-width="2"/><rect x="26" y="26" width="12" height="8" fill="#fff" stroke="#000" stroke-width="2"/><text x="32" y="33" font-size="8" text-anchor="middle" font-family="monospace" fill="#000">?</text></svg>';
 function crate(){return'<div class="crate"><h3>Mystery crate</h3><p class="tn">Pull one exhibit out at random.</p><button type="button" class="cbtn" id="crb" aria-label="Open a mystery crate">'+CRATE+'</button><div id="crx" class="crx" aria-live="polite"></div></div>'}
 function aisleHtml(a,i){return'<div class="aisle"><div class="ah"><h3 class="asign" style="--dc:'+a.c+'"><span>'+E(a.t)+'</span></h3><small>'+E(a.s)+'</small><span class="aa"><button type="button" class="btn" data-sc="-1" aria-label="Scroll left">\u25c4</button><button type="button" class="btn" data-sc="1" aria-label="Scroll right">\u25ba</button></span></div>'+(a.tabs?'<div class="atabs" role="group" aria-label="Decade">'+a.tabs+'</div>':'')+'<div class="arow" tabindex="0" aria-label="'+E(a.t)+'">'+a.list.map(mini).join("")+'</div></div>'}
 function aisles(items){
  var out=[],seen={};
  function add(t,s,c,list,tabs){if(list.length<3)return;var k=list.map(function(i){return i.id}).sort().join();if(seen[k])return;seen[k]=1;out.push({t:t,s:s,c:c,list:list,tabs:tabs})}
  add("Just in","The newest arrivals","#aa0000",items.slice().reverse().slice(0,14));
  add("Hall of fame","Highest scores in the museum","#aa5500",items.filter(function(i){return i.score!=null}).sort(function(a,b){return b.score-a.score}).slice(0,14));
  var dec={};items.forEach(function(i){if(i.year){var d=Math.floor(i.year/10)*10;(dec[d]=dec[d]||[]).push(i)}});
  var dk=Object.keys(dec).sort();if(dk.length>1){var d0=dk[dk.length-1];dk.forEach(function(d){if(dec[d].length>dec[d0].length)d0=d});
   add("Time capsule","Pick a decade","#0000aa",dec[d0],dk.map(function(d){return'<button type="button" class="chip'+(d===d0?" on":"")+'" data-dec="'+d+'" aria-pressed="'+(d===d0)+'">'+d+'s <b>'+dec[d].length+'</b></button>'}).join(""))}
  add("Found in the wild","From auctions and thrift shelves","#008800",items.filter(function(i){return i.src}).slice(0,14));
  return out}
 function health(items){if(!items.length)return"";var n=items.length;
  function pc(f){return Math.round(items.filter(f).length/n*100)}
  var R=[["Photos",pc(function(i){return(i.photos||[]).length})],["Specs",pc(function(i){return Object.keys(i.specs||{}).length>2})],["Description",pc(function(i){return i.text})],["Scored",pc(function(i){return i.score!=null})],["Sourced",pc(function(i){return(i.refs||[]).length||i.wiki})],["Story",pc(function(i){return i.story})]];
  var all=Math.round(R.reduce(function(a,r){return a+r[1]},0)/R.length);
  return'<h3 class="fh">Museum health</h3><div class="hlth"><div class="hl-top"><b>'+all+'%</b><span>of the published record is filled in</span></div>'+R.map(function(r){return'<div class="hl-r"><span>'+r[0]+'</span><i class="hl-b"><em style="width:'+r[1]+'%"></em></i><b>'+r[1]+'%</b></div>'}).join("")+'</div>'}
 function queue(){var d=typeof DRAFTS!=="undefined"?DRAFTS:[];if(!d.length)return"";var show=d.slice(0,30);
  return'<h3 class="fh">Coming soon</h3><div class="soon"><p>'+d.length+' more exhibit'+(d.length===1?" is":"s are")+' in the queue while I double-check the facts. Names only for now:</p><p class="sn">'+show.map(function(i){return'<span>'+(typeof pxCat==="function"?pxCat(i.cat,14):"")+E(i.name)+'</span>'}).join("")+(d.length>show.length?'<span class="sm">and '+(d.length-show.length)+' more</span>':"")+'</p></div>'}
 var TILES=[["cards","Browse everything","Every exhibit as cards","\u25a4"],["shelf","The shelf","Spines, tall = high score","\u2590"],["years","Time machine","Walk through the years","\u231a"],["next","Next up","What the collection is missing","\u2192"],["dir","DIR","A plain directory listing","C:"]];
 function html(items){
  var cats={},names=[];items.forEach(function(i){if(!cats[i.cat]){cats[i.cat]=0;names.push(i.cat)}cats[i.cat]++});
  var al=aisles(items);
  return'<div class="front">'+mem(items,cats,names)+dept(items,cats,names)+'<div class="fduo">'+spot(items)+crate()+'</div>'
   +al.map(aisleHtml).join("")+health(items)+queue()
   +'<h3 class="fh">Other ways to browse</h3><div class="wtiles">'+TILES.map(function(t){return'<button type="button" class="wt" data-go="'+t[0]+'"><i aria-hidden="true">'+t[3]+'</i><b>'+t[1]+'</b><small>'+t[2]+'</small></button>'}).join("")+'</div>'
   +'<p class="fall"><button type="button" class="btn pri" data-go="cards">Browse all '+items.length+' exhibits</button></p></div>'}
 function wire(root,items,api){
  var al=aisles(items);
  root.onclick=function(e){var t=e.target.closest("[data-dept]");if(t){api.dept(t.dataset.dept);return}
   t=e.target.closest("[data-go]");if(t){api.go(t.dataset.go);return}
   t=e.target.closest("[data-sc]");if(t){var r=t.closest(".aisle").querySelector(".arow");r.scrollBy({left:+t.dataset.sc*Math.max(220,r.clientWidth*.8),behavior:document.documentElement.getAttribute("data-motion")==="off"?"auto":"smooth"});return}
   t=e.target.closest("[data-dec]");if(t){var ai=t.closest(".aisle"),d=+t.dataset.dec,l=items.filter(function(i){return i.year&&Math.floor(i.year/10)*10===d});ai.querySelector(".arow").innerHTML=l.slice(0,14).map(mini).join("");ai.querySelector(".arow").scrollLeft=0;ai.querySelectorAll("[data-dec]").forEach(function(b){var on=b===t;b.classList.toggle("on",on);b.setAttribute("aria-pressed",on)});return}
   t=e.target.closest("#crb");if(t){var x=document.getElementById("crx"),it=items[Math.floor(Math.random()*items.length)];t.classList.remove("pop");void t.offsetWidth;t.classList.add("pop");x.innerHTML=mini(it)+'<p class="tn">Out of the crate: <a href="#/item/'+E(it.id)+'">open it</a>, or pull another.</p>'}}}
 return{html:html,wire:wire}})();
